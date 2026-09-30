import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Vistoria {
  vistoriaId: string;
  operacaoId: string;
  itemId: string;
  userId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  criadoEm: number;
  dados: any;
}

export interface Operacao {
  operacaoId: string;
  situacao: string;
  motorista: string;
  userId: string;
  dados: any;
}

export interface Item {
  itemId: string;
  operacaoId: string;
  userId: string;
  dados: any;
}

export interface Midia {
  midiaId: string;
  vistoriaId: string;
  userId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  blob: Blob;
  metadata: any;
}

export interface Assinatura {
  assinaturaId: string;
  vistoriaId: string;
  userId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  dados: any;
}

export interface NaoConformidade {
  ncId: string;
  vistoriaId: string;
  userId: string;
  dados: any;
}

export interface Reconferencia {
  reconferenciaId: string;
  vistoriaId: string;
  userId: string;
  dados: any;
}

export interface SyncQueueItem {
  id?: number;
  tipo: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  criadoEm: number;
  data: any;
  referencia: string;
  userId: string;
  erro?: string;
}

export interface UsuarioData {
  key: string;
  value: any;
}

export interface PrimeCargoDB extends DBSchema {
  vistorias: {
    key: string;
    value: Vistoria;
    indexes: { operacaoId: string; itemId: string; syncStatus: string; criadoEm: number };
  };
  operacoes: {
    key: string;
    value: Operacao;
    indexes: { situacao: string; motorista: string };
  };
  itens: {
    key: string;
    value: Item;
    indexes: { operacaoId: string };
  };
  midias: {
    key: string;
    value: Midia;
    indexes: { vistoriaId: string; syncStatus: string };
  };
  assinaturas: {
    key: string;
    value: Assinatura;
    indexes: { vistoriaId: string; syncStatus: string };
  };
  nao_conformidades: {
    key: string;
    value: NaoConformidade;
    indexes: { vistoriaId: string };
  };
  reconferencias: {
    key: string;
    value: Reconferencia;
    indexes: { vistoriaId: string };
  };
  sync_queue: {
    key: number;
    value: SyncQueueItem;
    indexes: { tipo: string; status: string; criadoEm: number };
  };
  user_data: {
    key: string;
    value: UsuarioData;
  };
}

const DB_NAME = 'prime-cargo-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PrimeCargoDB>> | null = null;

export async function initDB(): Promise<IDBPDatabase<PrimeCargoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PrimeCargoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vistorias')) {
          const store = db.createObjectStore('vistorias', { keyPath: 'vistoriaId' });
          store.createIndex('operacaoId', 'operacaoId');
          store.createIndex('itemId', 'itemId');
          store.createIndex('syncStatus', 'syncStatus');
          store.createIndex('criadoEm', 'criadoEm');
        }
        if (!db.objectStoreNames.contains('operacoes')) {
          const store = db.createObjectStore('operacoes', { keyPath: 'operacaoId' });
          store.createIndex('situacao', 'situacao');
          store.createIndex('motorista', 'motorista');
        }
        if (!db.objectStoreNames.contains('itens')) {
          const store = db.createObjectStore('itens', { keyPath: 'itemId' });
          store.createIndex('operacaoId', 'operacaoId');
        }
        if (!db.objectStoreNames.contains('midias')) {
          const store = db.createObjectStore('midias', { keyPath: 'midiaId' });
          store.createIndex('vistoriaId', 'vistoriaId');
          store.createIndex('syncStatus', 'syncStatus');
        }
        if (!db.objectStoreNames.contains('assinaturas')) {
          const store = db.createObjectStore('assinaturas', { keyPath: 'assinaturaId' });
          store.createIndex('vistoriaId', 'vistoriaId');
          store.createIndex('syncStatus', 'syncStatus');
        }
        if (!db.objectStoreNames.contains('nao_conformidades')) {
          const store = db.createObjectStore('nao_conformidades', { keyPath: 'ncId' });
          store.createIndex('vistoriaId', 'vistoriaId');
        }
        if (!db.objectStoreNames.contains('reconferencias')) {
          const store = db.createObjectStore('reconferencias', { keyPath: 'reconferenciaId' });
          store.createIndex('vistoriaId', 'vistoriaId');
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          const store = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('tipo', 'tipo');
          store.createIndex('status', 'status');
          store.createIndex('criadoEm', 'criadoEm');
        }
        if (!db.objectStoreNames.contains('user_data')) {
          db.createObjectStore('user_data', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getDB(): Promise<IDBPDatabase<PrimeCargoDB>> {
  return initDB();
}
