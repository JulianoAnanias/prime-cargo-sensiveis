import { getDB, Vistoria, Operacao, Item, Midia, Assinatura, NaoConformidade, Reconferencia, SyncQueueItem, UsuarioData, PrimeCargoDB } from './db';
import { StoreNames, IndexNames } from 'idb';

type StoreName = StoreNames<PrimeCargoDB>;

async function saveEntity<T extends StoreName>(storeName: T, data: PrimeCargoDB[T]['value']) {
  const db = await getDB();
  return db.put(storeName, data);
}

async function getEntity<T extends StoreName>(storeName: T, id: PrimeCargoDB[T]['key']) {
  const db = await getDB();
  return db.get(storeName, id);
}

async function getAllEntity<T extends StoreName>(
  storeName: T,
  indexName?: IndexNames<PrimeCargoDB, T>,
  value?: any
) {
  const db = await getDB();
  if (indexName && value !== undefined) {
    return db.getAllFromIndex(storeName, indexName, value);
  }
  return db.getAll(storeName);
}

async function deleteEntity<T extends StoreName>(storeName: T, id: PrimeCargoDB[T]['key']) {
  const db = await getDB();
  return db.delete(storeName, id);
}

async function countEntity<T extends StoreName>(
  storeName: T,
  indexName?: IndexNames<PrimeCargoDB, T>,
  value?: any
) {
  const db = await getDB();
  if (indexName && value !== undefined) {
    return db.countFromIndex(storeName, indexName, value);
  }
  return db.count(storeName);
}

// Vistorias
export const saveVistoria = (data: Vistoria) => saveEntity('vistorias', data);
export const getVistoria = (id: string) => getEntity('vistorias', id);
export const getAllVistorias = (index?: any, value?: any) => getAllEntity('vistorias', index, value);
export const deleteVistoria = (id: string) => deleteEntity('vistorias', id);
export const countVistorias = (index?: any, value?: any) => countEntity('vistorias', index, value);

// Operacoes
export const saveOperacao = (data: Operacao) => saveEntity('operacoes', data);
export const getOperacao = (id: string) => getEntity('operacoes', id);
export const getAllOperacoes = (index?: any, value?: any) => getAllEntity('operacoes', index, value);
export const deleteOperacao = (id: string) => deleteEntity('operacoes', id);
export const countOperacoes = (index?: any, value?: any) => countEntity('operacoes', index, value);

// Itens
export const saveItem = (data: Item) => saveEntity('itens', data);
export const getItem = (id: string) => getEntity('itens', id);
export const getAllItens = (index?: any, value?: any) => getAllEntity('itens', index, value);
export const deleteItem = (id: string) => deleteEntity('itens', id);
export const countItens = (index?: any, value?: any) => countEntity('itens', index, value);

// Midias
export const saveMidia = (data: Midia) => saveEntity('midias', data);
export const getMidia = (id: string) => getEntity('midias', id);
export const getAllMidias = (index?: any, value?: any) => getAllEntity('midias', index, value);
export const deleteMidia = (id: string) => deleteEntity('midias', id);
export const countMidias = (index?: any, value?: any) => countEntity('midias', index, value);

// Assinaturas
export const saveAssinatura = (data: Assinatura) => saveEntity('assinaturas', data);
export const getAssinatura = (id: string) => getEntity('assinaturas', id);
export const getAllAssinaturas = (index?: any, value?: any) => getAllEntity('assinaturas', index, value);
export const deleteAssinatura = (id: string) => deleteEntity('assinaturas', id);
export const countAssinaturas = (index?: any, value?: any) => countEntity('assinaturas', index, value);

// Nao Conformidades
export const saveNaoConformidade = (data: NaoConformidade) => saveEntity('nao_conformidades', data);
export const getNaoConformidade = (id: string) => getEntity('nao_conformidades', id);
export const getAllNaoConformidades = (index?: any, value?: any) => getAllEntity('nao_conformidades', index, value);
export const deleteNaoConformidade = (id: string) => deleteEntity('nao_conformidades', id);
export const countNaoConformidades = (index?: any, value?: any) => countEntity('nao_conformidades', index, value);

// Reconferencias
export const saveReconferencia = (data: Reconferencia) => saveEntity('reconferencias', data);
export const getReconferencia = (id: string) => getEntity('reconferencias', id);
export const getAllReconferencias = (index?: any, value?: any) => getAllEntity('reconferencias', index, value);
export const deleteReconferencia = (id: string) => deleteEntity('reconferencias', id);
export const countReconferencias = (index?: any, value?: any) => countEntity('reconferencias', index, value);

// Usuario Data
export const saveUsuarioData = (data: UsuarioData) => saveEntity('user_data', data);
export const getUsuarioData = (key: string) => getEntity('user_data', key);
export const getAllUsuarioData = () => getAllEntity('user_data');
export const deleteUsuarioData = (key: string) => deleteEntity('user_data', key);

// Sync Queue Operacaos
export async function addToSyncQueue(tipo: string, data: any, referencia: string, userId: string = 'system') {
  const db = await getDB();
  const item: SyncQueueItem = {
    tipo,
    status: 'pending',
    criadoEm: Date.now(),
    data,
    referencia,
    userId,
  };
  return db.put('sync_queue', item);
}

export async function getNextSyncItem(): Promise<SyncQueueItem | undefined> {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readonly');
  const index = tx.store.index('status');
  const pendingItems = await index.getAll('pending');
  if (pendingItems.length > 0) {
    // Return oldest pending item
    return pendingItems.sort((a, b) => a.criadoEm - b.criadoEm)[0];
  }
  return undefined;
}

export async function markSyncComplete(id: number) {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.status = 'completed';
    return db.put('sync_queue', item);
  }
}

export async function markSyncFailed(id: number, error: string) {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.status = 'failed';
    item.erro = error;
    return db.put('sync_queue', item);
  }
}

export async function markSyncing(id: number) {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.status = 'syncing';
    return db.put('sync_queue', item);
  }
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  const index = db.transaction('sync_queue').store.index('status');
  return index.count('pending');
}

export async function getFailedCount(): Promise<number> {
  const db = await getDB();
  const index = db.transaction('sync_queue').store.index('status');
  return index.count('failed');
}

export async function clearCompleted() {
  const db = await getDB();
  const index = db.transaction('sync_queue', 'readwrite').store.index('status');
  let cursor = await index.openCursor('completed');
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
}
