import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CheckCircle, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  userName?: string;
  userRole?: string;
}

export function Sidebar({ userName = 'Admin Usuario', userRole = 'Administrador' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Briefcase, label: 'Operações', href: '/admin/operacoes' },
    { icon: Users, label: 'Usuários', href: '/admin/usuarios' },
    { icon: CheckCircle, label: 'Qualidade', href: '/admin/qualidade' },
    { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
  ];

  return (
    <aside 
      className={cn(
        "hidden flex-col border-r bg-white transition-all duration-300 lg:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="font-bold text-[#F47920] text-lg truncate">
            PRIME CARGO
          </div>
        )}
        {collapsed && (
          <div className="mx-auto font-bold text-[#F47920] text-xl">
            P
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("rounded-md p-1.5 text-gray-500 hover:bg-gray-100", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#F47920]"
              >
                <Icon className={cn("h-5 w-5 shrink-0", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F47920] text-sm font-medium text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-[#4D4D4D]">{userName}</span>
              <span className="truncate text-xs text-gray-500">{userRole}</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        )}
        {collapsed && (
          <button className="mt-4 flex w-full items-center justify-center rounded-md py-2 text-gray-700 hover:bg-gray-50" title="Sair">
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
