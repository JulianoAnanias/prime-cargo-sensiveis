'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  BarChart3, 
  Sparkles, 
  Users, 
  Truck, 
  Mail,
  LogOut, 
  ShieldCheck, 
  Menu, 
  X 
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('prime_user');
      if (stored) {
        setLocalUser(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const currentUserName = session?.user?.name || localUser?.nome || 'Juliano Ananias';
  const currentUserEmail = session?.user?.email || localUser?.email || 'juliano@primecargo.com.br';
  const currentUserPerfil = session?.user?.perfil || localUser?.perfil || 'Gestão';

  const navItems = [
    { label: 'Operações & Vistorias', shortLabel: 'Operações', href: '/admin/operacoes', icon: ClipboardList },
    { label: 'Frota de Veículos', shortLabel: 'Veículos', href: '/admin/veiculos', icon: Truck },
    { label: 'Gestão de E-mails', shortLabel: 'E-mails', href: '/admin/configuracoes', icon: Mail },
    { label: 'Painel de Indicadores', shortLabel: 'Indicadores', href: '/admin', icon: BarChart3 },
    { label: 'Qualidade & Auditoria', shortLabel: 'Qualidade', href: '/admin/qualidade', icon: Sparkles },
    { label: 'Usuários & Motoristas', shortLabel: 'Usuários', href: '/admin/usuarios', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('prime_user');
    signOut({ callbackUrl: '/' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Barra de Navegação Corporativa da Gestão / ADM */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo + Título */}
            <div className="flex items-center shrink-0">
              <Link href="/admin/operacoes" className="flex items-center gap-3 shrink-0 group py-1">
                <Image
                  src="/logo.png"
                  alt="Grupo Prime Cargo"
                  width={150}
                  height={42}
                  className="object-contain h-9 sm:h-10 w-auto shrink-0 transition-opacity group-hover:opacity-90"
                  priority
                />
                <div className="hidden sm:flex flex-col border-l border-gray-200 pl-3">
                  <span className="text-[11px] font-black tracking-widest uppercase text-[#F47920] leading-none">
                    Sensíveis
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 mt-0.5 leading-none">
                    Painel ADM
                  </span>
                </div>
              </Link>
            </div>

            {/* Abas de Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 xl:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#F47920] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="inline xl:hidden">{item.shortLabel}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Ações à Direita */}
            <div className="hidden sm:flex items-center gap-2.5 shrink-0 ml-auto lg:ml-0">
              {/* Botão de Alternar para App do Motorista */}
              <Link
                href="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-[#F47920] hover:bg-orange-100 text-xs font-bold rounded-xl transition shrink-0"
                title="Visualizar a tela do motorista em campo"
              >
                <Truck className="w-4 h-4 shrink-0" />
                <span>Visão Motorista</span>
              </Link>

              {/* Usuário Logado */}
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3 shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-[#4D4D4D] leading-tight truncate max-w-[130px]">
                    {currentUserName}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase">
                    {currentUserPerfil}
                  </p>
                </div>
              </div>

              {/* Botão Sair */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition shrink-0"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Botão Menu Mobile */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href="/app"
                className="px-2.5 py-1 bg-orange-50 text-[#F47920] text-xs font-bold rounded-lg"
              >
                <Truck className="w-4 h-4 inline mr-1" /> Campo
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Menu Mobile Retrátil */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold ${
                    isActive
                      ? 'bg-[#F47920] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">{currentUserName}</p>
                <p className="text-[10px] text-gray-500">{currentUserEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-red-600 font-bold bg-red-50 rounded-lg"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo da Página ADM */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
