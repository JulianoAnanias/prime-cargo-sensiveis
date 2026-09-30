'use client';

import React, { createContext, useContext } from 'react';
import { useSync } from '@/hooks/use-sync';

const SyncContext = createContext<ReturnType<typeof useSync> | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const syncState = useSync();

  return (
    <SyncContext.Provider value={syncState}>
      {children}
      {/* Barra de Status de Sincronização Opcional */}
      {syncState.pendingCount > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-[#F47920] text-white text-xs text-center py-1 z-50">
          {syncState.isSyncing ? 'Sincronizando...' : `${syncState.pendingCount} item(s) pendente(s)`}
          {syncState.syncStatus.failed > 0 && ` (${syncState.syncStatus.failed} falhas)`}
        </div>
      )}
    </SyncContext.Provider>
  );
}

export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSyncContext must be used within SyncProvider');
  return context;
};
