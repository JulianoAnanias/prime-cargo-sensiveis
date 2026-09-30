'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, ClipboardList, CheckCircle, Clock, Truck, Package, RefreshCcw, MapPin, ChevronRight, User, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationMap } from '@/components/features/location-map';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

interface BaixaData {
  vistoriaId: string;
  procedimento: string;
  cliente: string;
  local: string;
  endereco?: string;
  documento: string;
  dataHora: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  status: string;
  motorista: string;
}

interface AtendimentoItem {
  id: string;
  procedimento: 'coleta' | 'entrega' | 'transferencia';
  cliente: string;
  documento: string;
  local: string;
  horarioPrevisto: string;
  cadastradoPor: {
    id: string;
    nome: string;
    email: string;
  };
}

export default function DriverDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'concluidos'>('todos');
  const [baixas, setBaixas] = useState<BaixaData[]>([]);

  // Usuário real autenticado (via Microsoft ou E-mail cadastrado)
  const [currentUser, setCurrentUser] = useState({
    nome: 'Motorista',
    email: '',
    perfil: 'motorista'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Tenta carregar usuário salvo no login
      const stored = localStorage.getItem('prime_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser({
            nome: parsed.nome || 'Usuário',
            email: parsed.email || '',
            perfil: parsed.perfil || 'motorista'
          });
        } catch (e) {}
      } else if (session?.user) {
        setCurrentUser({
          nome: session.user.name || 'Usuário',
          email: session.user.email || '',
          perfil: (session.user as any).perfil || 'gestao'
        });
      }

      // 2. Carrega baixas registradas
      const savedBaixas = JSON.parse(localStorage.getItem('prime_baixas') || '[]');
      setBaixas(savedBaixas);
    }
  }, [session]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const saved = JSON.parse(localStorage.getItem('prime_baixas') || '[]');
        setBaixas(saved);
      }
      setIsRefreshing(false);
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem('prime_user');
    signOut({ callbackUrl: '/' });
    router.push('/');
  };

  const isGestor = currentUser.perfil === 'gestao' || currentUser.perfil === 'admin' || currentUser.email.endsWith('@primecargo.com.br');

  // Base operacional oficial
  const todosAtendimentos: AtendimentoItem[] = [
    {
      id: 'demo-123',
      procedimento: 'entrega',
      cliente: 'Hospital Israelita Albert Einstein',
      documento: 'NF: 00084512',
      local: 'Almoxarifado Central - Doca 3',
      horarioPrevisto: '14:30',
      cadastradoPor: {
        id: 'user-01',
        nome: currentUser.nome,
        email: currentUser.email || 'motorista@primecargo.com.br',
      },
    },
    {
      id: 'col-402',
      procedimento: 'coleta',
      cliente: 'Siemens Healthineers Brasil',
      documento: 'Coleta: COL-2026/091',
      local: 'Centro de Distribuição Cajamar',
      horarioPrevisto: '16:00',
      cadastradoPor: {
        id: 'user-01',
        nome: currentUser.nome,
        email: currentUser.email || 'motorista@primecargo.com.br',
      },
    }
  ];

  // 🔒 Isolamento: O motorista visualiza exclusivamente os itens cadastrados por ele
  const meusAtendimentos = todosAtendimentos.filter(
    item => !currentUser.email || item.cadastradoPor.email === currentUser.email
  );

  const filteredItems = meusAtendimentos.filter(item => {
    const isConcluida = baixas.some(b => b.vistoriaId === item.id);
    if (filter === 'pendentes') return !isConcluida;
    if (filter === 'concluidos') return isConcluida;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Barra de Acesso Rápido ao Painel ADM (para Gestores e Administradores) */}
      {isGestor && (
        <div className="bg-gray-900 text-white px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold">Perfil Administrador / Gestão</span>
          </div>
          <Link
            href="/admin/operacoes"
            className="flex items-center gap-1.5 px-3 py-1 bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold rounded-lg transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Acessar Painel de Gestão (ADM) ➔</span>
          </Link>
        </div>
      )}

      {/* Header do Motorista */}
      <header className="bg-[#F47920] text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider opacity-85 font-semibold">Prime Cargo Sensíveis</span>
            <h1 className="text-2xl font-black mt-0.5">Olá, {currentUser.nome.split(' ')[0]}</h1>
            {currentUser.email && (
              <p className="text-[11px] opacity-90 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentUser.email}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-white/20 hover:bg-red-500 rounded-full transition-colors"
              title="Sair do aplicativo"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Botões de Ação por Procedimento */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <button
            onClick={() => router.push('/app/vistoria/col-402?tipo=coleta')}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border border-white/20"
          >
            <Package className="w-5 h-5 mb-1 text-white" />
            <span className="text-xs font-bold">Coleta</span>
          </button>

          <button
            onClick={() => router.push('/app/vistoria/demo-123?tipo=entrega')}
            className="bg-white text-[#F47920] shadow-md p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all"
          >
            <Truck className="w-5 h-5 mb-1" />
            <span className="text-xs font-black">Entrega</span>
          </button>

          <button
            onClick={() => router.push('/app/vistoria/trans-88?tipo=transferencia')}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border border-white/20"
          >
            <RefreshCcw className="w-5 h-5 mb-1 text-white" />
            <span className="text-xs font-bold">Transferência</span>
          </button>
        </div>
      </header>

      {/* Cards de Métricas */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <Clock className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-lg font-black text-[#4D4D4D]">
              {meusAtendimentos.filter(a => !baixas.some(b => b.vistoriaId === a.id)).length}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Pendentes</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 mb-1" />
            <span className="text-lg font-black text-[#4D4D4D]">
              {meusAtendimentos.filter(a => baixas.some(b => b.vistoriaId === a.id)).length}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Baixas</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <ClipboardList className="w-5 h-5 text-[#F47920] mb-1" />
            <span className="text-lg font-black text-[#4D4D4D]">{meusAtendimentos.length}</span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Seus</span>
          </div>
        </div>
      </div>

      {/* Seção Principal de Atendimentos */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#4D4D4D]">
            Seus Atendimentos ({filteredItems.length})
          </h2>

          <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('todos')}
              className={cn("px-3 py-1 rounded-lg transition-all", filter === 'todos' ? "bg-[#F47920] text-white shadow-sm" : "text-gray-600")}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('pendentes')}
              className={cn("px-3 py-1 rounded-lg transition-all", filter === 'pendentes' ? "bg-[#F47920] text-white shadow-sm" : "text-gray-600")}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('concluidos')}
              className={cn("px-3 py-1 rounded-lg transition-all", filter === 'concluidos' ? "bg-[#F47920] text-white shadow-sm" : "text-gray-600")}
            >
              Concluídos
            </button>
          </div>
        </div>

        {/* Lista de Cards de Atendimento */}
        <div className="space-y-4">
          {filteredItems.map(item => {
            const baixa = baixas.find(b => b.vistoriaId === item.id);
            const isConcluido = !!baixa;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:border-orange-200 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider",
                    item.procedimento === 'entrega' ? "bg-emerald-100 text-emerald-800" :
                    item.procedimento === 'coleta' ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  )}>
                    {item.procedimento}
                  </span>

                  {isConcluido ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle className="w-3.5 h-3.5" /> Baixa Concluída
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> Previsto: {item.horarioPrevisto}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#4D4D4D] leading-snug">
                  {item.cliente}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{item.documento}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{item.local}</span>
                </p>

                {/* Exibição do Ponto da Baixa no Mapa */}
                {isConcluido && baixa && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <LocationMap
                      latitude={baixa.latitude}
                      longitude={baixa.longitude}
                      accuracy={baixa.accuracy}
                      address={baixa.local}
                      date={baixa.dataHora}
                      client={item.cliente}
                      driver={item.cadastradoPor.nome}
                    />
                  </div>
                )}

                {/* Botão de Ação */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <button
                    onClick={() => router.push(`/app/vistoria/${item.id}?tipo=${item.procedimento}`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#F47920] hover:text-[#E94E1B] transition"
                  >
                    <span>{isConcluido ? 'Ver Detalhes da Vistoria' : 'Iniciar Vistoria'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FAB Botão Flutuante: Nova Vistoria */}
      <button
        onClick={() => router.push('/app/vistoria/demo-123?tipo=entrega')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-[#E94E1B] to-[#F47920] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40"
        title="Nova Vistoria"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
