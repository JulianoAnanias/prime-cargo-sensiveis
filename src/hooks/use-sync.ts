'use client';

import { useState, useEffect } from 'react';
import { syncManager } from '@/lib/offline/sync-manager';

export function useSync() {
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    failed: 0,
    isSyncing: false,
    lastSync: new Date().toISOString()
  });

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const startSync = async () => {
    await syncManager.startSync();
  };

  const retryFailed = async () => {
    await syncManager.retryFailed();
  };

  return {
    syncStatus,
    pendingCount: syncStatus.pending,
    isSyncing: syncStatus.isSyncing,
    lastSyncTime: syncStatus.lastSync,
    startSync,
    retryFailed
  };
}
