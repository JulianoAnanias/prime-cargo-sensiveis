import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

// ============================================================
// Microsoft Graph Client - Acesso ao SharePoint
// Usa credenciais de aplicação (client credentials flow)
// para que motoristas com login Google não precisem
// de conta Microsoft adicional.
// ============================================================

let graphClient: Client | undefined;
let tokenCache: { token: string; expiresOn: number } | undefined;

function getCredential() {
  return new ClientSecretCredential(
    process.env.GRAPH_TENANT_ID || process.env.AZURE_AD_TENANT_ID || '',
    process.env.GRAPH_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID || '',
    process.env.GRAPH_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET || ''
  );
}

export function getGraphClient(): Client {
  if (graphClient) return graphClient;

  const credential = getCredential();

  graphClient = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        // Reutilizar token em cache se ainda válido (margem de 5 min)
        if (tokenCache && tokenCache.expiresOn > Date.now() + 5 * 60 * 1000) {
          return tokenCache.token;
        }

        const tokenResponse = await credential.getToken(
          'https://graph.microsoft.com/.default'
        );
        tokenCache = {
          token: tokenResponse.token,
          expiresOn: tokenResponse.expiresOnTimestamp,
        };
        return tokenResponse.token;
      },
    },
  });

  return graphClient;
}

// ============================================================
// SharePoint Lists - CRUD
// ============================================================

const getSiteId = () => process.env.SHAREPOINT_SITE_ID || '';

interface ListQueryOptions {
  filter?: string;
  select?: string[];
  expand?: string[];
  orderBy?: string;
  top?: number;
  skip?: number;
}

/**
 * Obter itens de uma lista do SharePoint com filtros e paginação.
 */
export async function getSharePointListItems(
  siteId: string,
  listName: string,
  options?: ListQueryOptions
) {
  const client = getGraphClient();
  let apiPath = `/sites/${siteId}/lists/${listName}/items`;
  const queryParams: string[] = [];

  // Sempre expandir fields
  queryParams.push('$expand=fields');

  if (options?.filter) {
    queryParams.push(`$filter=${options.filter}`);
  }
  if (options?.select && options.select.length > 0) {
    queryParams.push(`$select=${options.select.join(',')}`);
  }
  if (options?.orderBy) {
    queryParams.push(`$orderby=${options.orderBy}`);
  }
  if (options?.top) {
    queryParams.push(`$top=${options.top}`);
  }
  if (options?.skip) {
    queryParams.push(`$skip=${options.skip}`);
  }

  if (queryParams.length > 0) {
    apiPath += `?${queryParams.join('&')}`;
  }

  try {
    const response = await client.api(apiPath).get();
    return response.value || [];
  } catch (error: any) {
    console.error(`Erro ao buscar itens da lista ${listName}:`, error?.message);
    throw new Error(`Falha ao acessar lista ${listName}: ${error?.message}`);
  }
}

/**
 * Obter um item específico de uma lista.
 */
export async function getSharePointListItem(
  siteId: string,
  listName: string,
  itemId: string
) {
  const client = getGraphClient();
  try {
    const response = await client
      .api(`/sites/${siteId}/lists/${listName}/items/${itemId}?$expand=fields`)
      .get();
    return response;
  } catch (error: any) {
    console.error(`Erro ao buscar item ${itemId} da lista ${listName}:`, error?.message);
    throw new Error(`Item não encontrado: ${error?.message}`);
  }
}

/**
 * Criar um item em uma lista do SharePoint.
 */
export async function createSharePointListItem(
  siteId: string,
  listName: string,
  fields: Record<string, unknown>
) {
  const client = getGraphClient();
  try {
    const response = await client
      .api(`/sites/${siteId}/lists/${listName}/items`)
      .post({ fields });
    return response;
  } catch (error: any) {
    console.error(`Erro ao criar item na lista ${listName}:`, error?.message);
    throw new Error(`Falha ao criar registro: ${error?.message}`);
  }
}

/**
 * Atualizar um item em uma lista do SharePoint.
 */
export async function updateSharePointListItem(
  siteId: string,
  listName: string,
  itemId: string,
  fields: Record<string, unknown>
) {
  const client = getGraphClient();
  try {
    const response = await client
      .api(`/sites/${siteId}/lists/${listName}/items/${itemId}/fields`)
      .patch(fields);
    return response;
  } catch (error: any) {
    console.error(`Erro ao atualizar item ${itemId} da lista ${listName}:`, error?.message);
    throw new Error(`Falha ao atualizar registro: ${error?.message}`);
  }
}

/**
 * Excluir um item de uma lista do SharePoint.
 */
export async function deleteSharePointListItem(
  siteId: string,
  listName: string,
  itemId: string
) {
  const client = getGraphClient();
  try {
    await client
      .api(`/sites/${siteId}/lists/${listName}/items/${itemId}`)
      .delete();
    return true;
  } catch (error: any) {
    console.error(`Erro ao excluir item ${itemId} da lista ${listName}:`, error?.message);
    throw new Error(`Falha ao excluir registro: ${error?.message}`);
  }
}

/**
 * Verificar se um item já existe por um campo específico (para idempotência).
 */
export async function checkItemExists(
  siteId: string,
  listName: string,
  fieldName: string,
  fieldValue: string
): Promise<boolean> {
  try {
    const items = await getSharePointListItems(siteId, listName, {
      filter: `fields/${fieldName} eq '${fieldValue}'`,
      top: 1,
    });
    return items.length > 0;
  } catch {
    return false;
  }
}

/**
 * Buscar item por campo único.
 */
export async function findItemByField(
  siteId: string,
  listName: string,
  fieldName: string,
  fieldValue: string
) {
  const items = await getSharePointListItems(siteId, listName, {
    filter: `fields/${fieldName} eq '${fieldValue}'`,
    top: 1,
  });
  return items.length > 0 ? items[0] : null;
}

// ============================================================
// SharePoint Drive - Upload de arquivos
// ============================================================

const getDriveId = () => process.env.SHAREPOINT_DRIVE_ID || '';

/**
 * Criar pasta no SharePoint se não existir.
 */
export async function createSharePointFolder(
  siteId: string,
  driveId: string,
  folderPath: string
) {
  const client = getGraphClient();
  const parts = folderPath.split('/').filter(Boolean);
  let currentPath = '';

  for (const part of parts) {
    const parentPath = currentPath || 'root';
    const apiPath =
      parentPath === 'root'
        ? `/sites/${siteId}/drives/${driveId}/root/children`
        : `/sites/${siteId}/drives/${driveId}/root:/${currentPath}:/children`;

    try {
      await client.api(apiPath).post({
        name: part,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'fail',
      });
    } catch (error: any) {
      // Ignorar erro se a pasta já existe (409 Conflict)
      if (error?.statusCode !== 409) {
        console.warn(`Aviso ao criar pasta ${part}:`, error?.message);
      }
    }
    currentPath = currentPath ? `${currentPath}/${part}` : part;
  }
}

/**
 * Upload de arquivo para o SharePoint.
 * Para arquivos grandes (>4MB), usa upload session.
 */
export async function uploadFileToSharePoint(
  siteId: string,
  driveId: string,
  folderPath: string,
  fileName: string,
  content: Buffer | ArrayBuffer,
  contentType?: string
) {
  const client = getGraphClient();
  const fullPath = `${folderPath}/${fileName}`;

  try {
    // Criar pasta se necessário
    await createSharePointFolder(siteId, driveId, folderPath);

    const size = content instanceof Buffer ? content.length : content.byteLength;

    if (size > 4 * 1024 * 1024) {
      // Upload em sessão para arquivos grandes
      return await uploadLargeFile(siteId, driveId, fullPath, content);
    }

    // Upload direto para arquivos pequenos
    const response = await client
      .api(`/sites/${siteId}/drives/${driveId}/root:/${fullPath}:/content`)
      .header('Content-Type', contentType || 'application/octet-stream')
      .put(content);

    return {
      id: response.id,
      name: response.name,
      webUrl: response.webUrl,
      size: response.size,
      path: fullPath,
    };
  } catch (error: any) {
    console.error(`Erro ao fazer upload de ${fileName}:`, error?.message);
    throw new Error(`Falha no upload: ${error?.message}`);
  }
}

/**
 * Upload de arquivo grande via sessão (>4MB).
 */
async function uploadLargeFile(
  siteId: string,
  driveId: string,
  filePath: string,
  content: Buffer | ArrayBuffer
) {
  const client = getGraphClient();

  // Criar sessão de upload
  const session = await client
    .api(`/sites/${siteId}/drives/${driveId}/root:/${filePath}:/createUploadSession`)
    .post({
      item: {
        '@microsoft.graph.conflictBehavior': 'rename',
      },
    });

  const uploadUrl = session.uploadUrl;
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content as ArrayBuffer);
  const fileSize = buffer.length;
  const chunkSize = 320 * 1024 * 10; // ~3.2MB chunks

  let offset = 0;
  let response;

  while (offset < fileSize) {
    const end = Math.min(offset + chunkSize, fileSize);
    const chunk = buffer.subarray(offset, end);

    response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': `${chunk.length}`,
        'Content-Range': `bytes ${offset}-${end - 1}/${fileSize}`,
      },
      body: new Uint8Array(chunk),
    });

    if (!response.ok && response.status !== 202) {
      throw new Error(`Upload chunk falhou: ${response.statusText}`);
    }

    offset = end;
  }

  const result = await response?.json();
  return {
    id: result?.id,
    name: result?.name,
    webUrl: result?.webUrl,
    size: result?.size,
    path: filePath,
  };
}

/**
 * Obter URL de download de um arquivo.
 */
export async function getFileDownloadUrl(
  siteId: string,
  driveId: string,
  filePath: string
): Promise<string> {
  const client = getGraphClient();
  try {
    const response = await client
      .api(`/sites/${siteId}/drives/${driveId}/root:/${filePath}`)
      .select('id,@microsoft.graph.downloadUrl')
      .get();
    return response['@microsoft.graph.downloadUrl'] || '';
  } catch (error: any) {
    console.error(`Erro ao obter URL do arquivo ${filePath}:`, error?.message);
    throw new Error(`Arquivo não encontrado: ${error?.message}`);
  }
}

/**
 * Obter conteúdo de um arquivo.
 */
export async function getFileContent(
  siteId: string,
  driveId: string,
  filePath: string
): Promise<ArrayBuffer> {
  const client = getGraphClient();
  try {
    const response = await client
      .api(`/sites/${siteId}/drives/${driveId}/root:/${filePath}:/content`)
      .get();
    return response;
  } catch (error: any) {
    console.error(`Erro ao baixar arquivo ${filePath}:`, error?.message);
    throw new Error(`Falha ao baixar arquivo: ${error?.message}`);
  }
}
