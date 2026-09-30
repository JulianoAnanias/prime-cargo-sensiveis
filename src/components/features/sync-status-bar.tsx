'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { WifiOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface SyncStatusBarProps {
  status: 'synced' | 'pending' | 'offline' | 'syncing';
  pendingCount?: number;
  onSync?: () => void;
}

export function SyncStatusBar({ status, pendingCount = 0, onSync }: SyncStatusBarProps) {
  if (status === 'synced') {
    return (
      <div className="flex w-full items-center justify-center gap-2 bg-green-500 py-1.5 px-4 text-xs font-medium text-white shadow-sm">
        <CheckCircle className="h-3.5 w-3.5" />
        <span>Tudo sincronizado</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="flex w-full items-center justify-center gap-2 bg-gray-500 py-1.5 px-4 text-xs font-medium text-white shadow-sm">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Sem conexão - modo offline</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex w-full items-center justify-between py-1.5 px-4 text-xs font-medium shadow-sm transition-colors",
        status === 'syncing' ? "bg-[#F47920] text-white" : "bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600"
      )}
      onClick={status === 'pending' ? onSync : undefined}
    >
      <div className="flex items-center gap-2">
        {status === 'syncing' ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5" />
        )}
        <span>
          {status === 'syncing' 
            ? 'Sincronizando dados...' 
            : `${pendingCount} pendência${pendingCount !== 1 ? 's' : ''} para sincronizar`}
        </span>
      </div>
      
      {status === 'pending' && (
        <button 
          className="flex items-center gap-1 rounded bg-white/20 px-2 py-0.5 text-white hover:bg-white/30"
          onClick={(e) => {
            e.stopPropagation();
            onSync?.();
          }}
        >
          <RefreshCw className="h-3 w-3" />
          Sincronizar
        </button>
      )}
    </div>
  );
}
