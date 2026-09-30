import React from 'react';
import { cn } from '@/lib/utils';
import { Home, ClipboardList, Camera, Clock, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t bg-white pb-safe pt-2 md:hidden">
      <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#F47920]">
        <Home className="h-6 w-6" />
        <span className="text-[10px] font-medium">Início</span>
      </Link>
      
      <Link href="/atendimentos" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#F47920]">
        <ClipboardList className="h-6 w-6" />
        <span className="text-[10px] font-medium">Atendimentos</span>
      </Link>
      
      <div className="relative -top-6 flex flex-col items-center">
        <Link 
          href="/nova-vistoria" 
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F47920] text-white shadow-lg shadow-orange-500/30 ring-4 ring-white"
        >
          <Camera className="h-6 w-6" />
        </Link>
        <span className="mt-1 text-[10px] font-medium text-[#F47920]">Vistoria</span>
      </div>
      
      <Link href="/historico" className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#F47920]">
        <Clock className="h-6 w-6" />
        <span className="text-[10px] font-medium">Histórico</span>
      </Link>
      
      <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#F47920]">
        <MoreHorizontal className="h-6 w-6" />
        <span className="text-[10px] font-medium">Mais</span>
      </button>
    </div>
  );
}
