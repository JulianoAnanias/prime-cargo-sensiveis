import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TIMEZONE } from './constants';
import {
  createSharePointFolder,
  uploadFileToSharePoint,
  getFileDownloadUrl,
} from './graph';

// ============================================================
// SharePoint - Helpers para organização de arquivos
// Estrutura: Data > Veículo > Mídias > etapa > itemId > tipo
// ============================================================

const getSiteId = () => process.env.SHAREPOINT_SITE_ID || '';
const getDriveId = () => process.env.SHAREPOINT_DRIVE_ID || '';
const getBasePath = () => process.env.SHAREPOINT_BASE_PATH || 'PrimeCargo/Vistorias';

/**
 * Gera o caminho da pasta no SharePoint seguindo a estrutura:
 * BasePath/YYYY-MM-DD/PLACA/Midias/etapa/itemId
 *
 * @param data - Data da ocorrência (local, America/Sao_Paulo)
 * @param veiculo - Placa do veículo
 * @param etapa - coleta | transferencia | entrega
 * @param itemId - ID do item/equipamento
 * @param subpasta - Subpasta técnica (fotos, assinaturas, nc)
 */
export function buildFolderPath(
  data: Date | string,
  veiculo: string,
  etapa: string,
  itemId: string,
  subpasta?: string
): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  const dataLocal = toZonedTime(dataObj, TIMEZONE);
  const dataFormatada = format(dataLocal, 'yyyy-MM-dd');
  const placaLimpa = veiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  let path = `${getBasePath()}/${dataFormatada}/${placaLimpa}/Midias/${etapa}/${itemId}`;

  if (subpasta) {
    path += `/${subpasta}`;
  }

  return path;
}

/**
 * Gera o caminho para fotos de vistoria.
 */
export function buildFotoPath(
  data: Date | string,
  veiculo: string,
  etapa: string,
  itemId: string
): string {
  return buildFolderPath(data, veiculo, etapa, itemId, 'fotos');
}

/**
 * Gera o caminho para assinaturas.
 */
export function buildAssinaturaPath(
  data: Date | string,
  veiculo: string,
  etapa: string,
  itemId: string
): string {
  return buildFolderPath(data, veiculo, etapa, itemId, 'assinaturas');
}

/**
 * Gera o caminho para evidências de não conformidade.
 */
export function buildNCPath(
  data: Date | string,
  veiculo: string,
  etapa: string,
  itemId: string,
  ncId: string
): string {
  return buildFolderPath(data, veiculo, etapa, itemId, `nc/${ncId}`);
}

/**
 * Para transferência: gera caminho incluindo veículo de destino.
 */
export function buildTransferenciaPath(
  data: Date | string,
  veiculoOrigem: string,
  veiculoDestino: string,
  itemId: string,
  subpasta?: string
): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  const dataLocal = toZonedTime(dataObj, TIMEZONE);
  const dataFormatada = format(dataLocal, 'yyyy-MM-dd');
  const placaOrigem = veiculoOrigem.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const placaDestino = veiculoDestino.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  let path = `${getBasePath()}/${dataFormatada}/${placaOrigem}/Midias/transferencia/${placaDestino}/${itemId}`;

  if (subpasta) {
    path += `/${subpasta}`;
  }

  return path;
}

/**
 * Gera um nome de arquivo único preservando a extensão.
 */
export function generateFileName(
  originalName: string,
  prefix: string,
  timestamp?: Date
): string {
  const ts = timestamp || new Date();
  const dataLocal = toZonedTime(ts, TIMEZONE);
  const timestampStr = format(dataLocal, 'yyyyMMdd_HHmmss');
  const ext = originalName.includes('.')
    ? originalName.substring(originalName.lastIndexOf('.'))
    : '.jpg';
  const nomeLimpo = prefix.replace(/[^A-Za-z0-9_-]/g, '_');
  return `${nomeLimpo}_${timestampStr}${ext}`;
}

/**
 * Upload de foto para o SharePoint.
 */
export async function uploadFoto(
  data: Date | string,
  veiculo: string,
  etapa: string,
  itemId: string,
  fileName: string,
  content: Buffer | ArrayBuffer,
  contentType: string = 'image/jpeg'
) {
  const folderPath = buildFotoPath(data, veiculo, etapa, itemId);
  return uploadFileToSharePoint(
    getSiteId(),
    getDriveId(),
    folderPath,
    fileName,
    content,
    contentType
  );
}

/**
 * Upload de assinatura para o SharePoint.
 */
export async function uploadAssinatura(
  data: Date | string,
  veiculo: string,
  etapa: string,
  itemId: string,
  finalidade: string,
  content: Buffer | ArrayBuffer
) {
  const folderPath = buildAssinaturaPath(data, veiculo, etapa, itemId);
  const fileName = generateFileName(`${finalidade}.png`, `assinatura_${finalidade}`);
  return uploadFileToSharePoint(
    getSiteId(),
    getDriveId(),
    folderPath,
    fileName,
    content,
    'image/png'
  );
}

/**
 * Upload de evidência de não conformidade.
 */
export async function uploadEvidenciaNC(
  data: Date | string,
  veiculo: string,
  etapa: string,
  itemId: string,
  ncId: string,
  fileName: string,
  content: Buffer | ArrayBuffer,
  contentType: string = 'image/jpeg'
) {
  const folderPath = buildNCPath(data, veiculo, etapa, itemId, ncId);
  return uploadFileToSharePoint(
    getSiteId(),
    getDriveId(),
    folderPath,
    fileName,
    content,
    contentType
  );
}

/**
 * Obter URL segura de download de um arquivo.
 */
export async function getFileUrl(filePath: string): Promise<string> {
  return getFileDownloadUrl(getSiteId(), getDriveId(), filePath);
}
