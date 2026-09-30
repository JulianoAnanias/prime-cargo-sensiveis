import {
  getNextSyncItem,
  markSyncComplete,
  markSyncFailed,
  markSyncing,
  getPendingCount,
  getFailedCount,
  clearCompleted,
  saveVistoria,
  getVistoria
} from './store';

export class SyncManager {
  private isSyncing: boolean = false;
  private listeners: Set<(status: any) => void> = new Set();
  
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.onOnline());
      window.addEventListener('offline', () => this.onOffline());
      this.registerSync();
    }
  }

  public isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  public subscribe(listener: (status: any) => void) {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners() {
    const status = await this.getSyncStatus();
    this.listeners.forEach(listener => listener(status));
  }

  public async startSync() {
    if (this.isSyncing || !this.isOnline()) return;

    this.isSyncing = true;
    this.notifyListeners();

    try {
      let nextItem = await getNextSyncItem();
      while (nextItem) {
        if (!nextItem.id) break;
        
        await markSyncing(nextItem.id);
        
        try {
          await this.syncItem(nextItem);
          await markSyncComplete(nextItem.id);
        } catch (error: any) {
          console.error(`Erro ao sincronizar item ${nextItem.id}:`, error);
          await markSyncFailed(nextItem.id, error.message || 'Erro desconhecido');
        }
        
        nextItem = await getNextSyncItem();
        this.notifyListeners();
      }
      
      await clearCompleted();
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async syncItem(item: any) {
    // Utiliza idempotency keys para prevenir duplicidade de operações (ex. x-idempotency-key = item.referencia)
    switch (item.tipo) {
      case 'vistoria':
        return this.syncVistoria(item.data, item.referencia);
      case 'midia':
        return this.syncMidia(item.data, item.referencia);
      case 'assinatura':
        return this.syncAssinatura(item.data, item.referencia);
      default:
        throw new Error(`Tipo de sincronização não suportado: ${item.tipo}`);
    }
  }

  private async syncVistoria(data: any, referencia: string) {
    const response = await fetch('/api/vistorias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': referencia,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Conflito, tentar resolver
        const serverData = await response.json();
        const localData = await getVistoria(referencia);
        if (localData) {
          const resolved = this.handleConflict(localData, serverData);
          await saveVistoria(resolved);
          // Opcional: Re-enfileirar para sync se o conflito exigir atualização do servidor
        }
        return;
      }
      throw new Error(`Falha no sync da vistoria: ${response.statusText}`);
    }
  }

  private async syncMidia(data: any, referencia: string) {
    const formData = new FormData();
    formData.append('file', data.blob);
    formData.append('metadata', JSON.stringify(data.metadata));

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'x-idempotency-key': referencia,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Falha no sync da mídia: ${response.statusText}`);
    }
  }

  private async syncAssinatura(data: any, referencia: string) {
    const response = await fetch('/api/assinaturas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': referencia,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Falha no sync da assinatura: ${response.statusText}`);
    }
  }

  public handleConflict(local: any, remote: any) {
    // Nunca sobrescrever informações assinadas ou concluídas sem confirmação
    if (local.hasAssinatura || remote.hasAssinatura) {
      // Regra de negócio de exemplo: manter ambas ou preferir a assinada
      return { ...remote, ...local, conflitoResolvido: true };
    }
    // Preferir a versão mais recente em caso geral
    return local.atualizadoEm > remote.atualizadoEm ? local : remote;
  }

  private registerSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return (registration as any).sync.register('prime-cargo-sync');
      }).catch(err => {
        console.log('Background Sync não suportado ou erro ao registrar', err);
      });
    }
  }

  private onOnline() {
    this.startSync();
  }

  private onOffline() {
    this.notifyListeners();
  }

  public async getSyncStatus() {
    const pending = await getPendingCount();
    const failed = await getFailedCount();
    return {
      pending,
      failed,
      isSyncing: this.isSyncing,
      lastSync: new Date().toISOString() // Simplificação
    };
  }

  public async retryFailed() {
    const db = await (await import('./db')).getDB();
    const index = db.transaction('sync_queue', 'readwrite').store.index('status');
    let cursor = await index.openCursor('failed');
    
    while (cursor) {
      const item = cursor.value;
      item.status = 'pending';
      delete item.erro;
      await cursor.update(item);
      cursor = await cursor.continue();
    }
    
    this.startSync();
  }
}

export const syncManager = new SyncManager();
