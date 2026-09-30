const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');

const tenantId = process.env.GRAPH_TENANT_ID || process.env.AZURE_AD_TENANT_ID;
const clientId = process.env.GRAPH_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID;
const clientSecret = process.env.GRAPH_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET;
const siteId = process.env.SHAREPOINT_SITE_ID;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const client = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const res = await credential.getToken('https://graph.microsoft.com/.default');
      return res.token;
    }
  }
});

const listsToCreate = [
  {
    displayName: 'PrimeCargo_Usuarios',
    columns: [
      { name: 'EmailUsuario', text: {} },
      { name: 'NomeUsuario', text: {} },
      { name: 'Perfil', text: {} },
      { name: 'Situacao', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_Operacoes',
    columns: [
      { name: 'OperacaoId', text: {} },
      { name: 'Cliente', text: {} },
      { name: 'Documento', text: {} },
      { name: 'TipoDocumento', text: {} },
      { name: 'Procedimento', text: {} },
      { name: 'MotoristaId', text: {} },
      { name: 'MotoristaNome', text: {} },
      { name: 'VeiculoPlaca', text: {} },
      { name: 'Situacao', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_Itens',
    columns: [
      { name: 'ItemId', text: {} },
      { name: 'OperacaoId', text: {} },
      { name: 'Descricao', text: {} },
      { name: 'NumeroSerie', text: {} },
      { name: 'EtapaAtual', text: {} },
      { name: 'Situacao', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_Vistorias',
    columns: [
      { name: 'VistoriaId', text: {} },
      { name: 'OperacaoId', text: {} },
      { name: 'ItemId', text: {} },
      { name: 'Procedimento', text: {} },
      { name: 'Etapa', text: {} },
      { name: 'Situacao', text: {} },
      { name: 'Latitude', text: {} },
      { name: 'Longitude', text: {} },
      { name: 'PrecisaoGPS', text: {} },
      { name: 'CadastradoPorEmail', text: {} },
      { name: 'CadastradoPorNome', text: {} },
      { name: 'BaixaRealizada', text: {} },
      { name: 'DadosJSON', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_NaoConformidades',
    columns: [
      { name: 'NcId', text: {} },
      { name: 'VistoriaId', text: {} },
      { name: 'ItemId', text: {} },
      { name: 'Tipo', text: {} },
      { name: 'Descricao', text: {} },
      { name: 'EtapaIdentificada', text: {} },
      { name: 'Situacao', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_Reconferencias',
    columns: [
      { name: 'ReconferenciaId', text: {} },
      { name: 'VistoriaId', text: {} },
      { name: 'ItemId', text: {} },
      { name: 'NcId', text: {} },
      { name: 'Situacao', text: {} },
      { name: 'Justificativa', text: {} },
      { name: 'ResponsavelNome', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_Assinaturas',
    columns: [
      { name: 'AssinaturaId', text: {} },
      { name: 'VistoriaId', text: {} },
      { name: 'ItemId', text: {} },
      { name: 'Finalidade', text: {} },
      { name: 'NomeSignatario', text: {} },
      { name: 'DocumentoSignatario', text: {} },
      { name: 'CaminhoArquivo', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_Midias',
    columns: [
      { name: 'MidiaId', text: {} },
      { name: 'VistoriaId', text: {} },
      { name: 'ItemId', text: {} },
      { name: 'Tipo', text: {} },
      { name: 'Origem', text: {} },
      { name: 'CaminhoArquivo', text: {} },
      { name: 'NomeArquivo', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_Pesquisas',
    columns: [
      { name: 'PesquisaId', text: {} },
      { name: 'Token', text: {} },
      { name: 'Documento', text: {} },
      { name: 'Cliente', text: {} },
      { name: 'RespostaAtendimento', text: {} },
      { name: 'RespostaVeiculos', text: {} },
      { name: 'RespostaPrazos', text: {} },
      { name: 'RespostaGeral', text: {} },
      { name: 'Sugestoes', text: {} },
      { name: 'RespondidoPor', text: {} },
      { name: 'DataResposta', text: {} },
      { name: 'Situacao', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_AnaliseIA',
    columns: [
      { name: 'AnaliseId', text: {} },
      { name: 'PesquisaId', text: {} },
      { name: 'Resumo', text: {} },
      { name: 'TemasJSON', text: {} },
      { name: 'PontosAtencaoJSON', text: {} },
      { name: 'AcoesSugeridasJSON', text: {} },
      { name: 'Sentimento', text: {} },
      { name: 'Provedor', text: {} }
    ]
  },
  {
    displayName: 'PrimeCargo_ConfigEmail',
    columns: [
      { name: 'EmailDestinatario', text: {} },
      { name: 'NomeDestinatario', text: {} },
      { name: 'TipoNotificacao', text: {} },
      { name: 'Ativo', text: {} }
    ]
  }
];

async function provision() {
  console.log('--- INICIANDO PROVISIONAMENTO DAS LISTAS NO SHAREPOINT CLOUDLOG ---');
  
  // Obter listas existentes
  const existingRes = await client.api(`/sites/${siteId}/lists`).get();
  const existingNames = new Set(existingRes.value.map(l => l.displayName));
  console.log(`Listas já existentes no site (${existingNames.size}):`, Array.from(existingNames).join(', '));

  for (const listDef of listsToCreate) {
    if (existingNames.has(listDef.displayName)) {
      console.log(`[OK] Lista "${listDef.displayName}" já existe.`);
      continue;
    }

    try {
      console.log(`Criando lista "${listDef.displayName}"...`);
      const payload = {
        displayName: listDef.displayName,
        columns: listDef.columns,
        list: { template: 'genericList' }
      };
      const created = await client.api(`/sites/${siteId}/lists`).post(payload);
      console.log(`-> SUCESSO: Lista "${created.displayName}" criada com ID: ${created.id}`);
    } catch (err) {
      console.error(`-> ERRO ao criar lista "${listDef.displayName}":`, err.message);
    }
  }

  console.log('--- PROVISIONAMENTO CONCLUÍDO COM SUCESSO! ---');
}

provision().catch(console.error);
