import React from 'react';
import { Menu, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick?: () => void;
  isOnline?: boolean;
  syncStatus?: 'synced' | 'pending' | 'syncing';
  userName?: string;
  showMobileMenuBtn?: boolean;
}

export function Header({
  onMenuClick,
  isOnline = true,
  syncStatus = 'synced',
  userName = 'Usuário',
  showMobileMenuBtn = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center gap-4">
        {showMobileMenuBtn && (
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <div className="relative h-8 w-32">
          {/* Default logo placeholder */}
          <div className="flex h-full w-full items-center font-bold text-[#F47920] text-lg">
            PRIME CARGO
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 md:flex">
          {syncStatus === 'syncing' ? (
            <RefreshCw className="h-5 w-5 animate-spin text-[#F47920]" />
          ) : syncStatus === 'pending' ? (
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Pendentes
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Sincronizado
            </div>
          )}

          {isOnline ? (
            <span title="Online">
              <Wifi className="h-5 w-5 text-green-500" />
            </span>
          ) : (
            <span title="Offline">
              <WifiOff className="h-5 w-5 text-red-500" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="hidden flex-col items-end md:flex">
            <span className="text-sm font-medium text-[#4D4D4D]">{userName}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F47920] text-sm font-medium text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
