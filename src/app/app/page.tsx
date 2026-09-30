'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, ClipboardList, CheckCircle, Clock, Truck, Package, RefreshCcw, MapPin, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationMap } from '@/components/features/location-map';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'concluidos'>('todos');
  const [baixas, setBaixas] = useState<BaixaData[]>([]);

  // Usuário ativo no aparelho (Permite alternar para testar a regra de isolamento!)
  const [currentUser, setCurrentUser] = useState({
    id: 'user-01',
    nome: 'João Motorista',
    email: 'joao@primecargo.com.br',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('prime_baixas') || '[]');
      if (saved.length === 0) {
        const demoBaixa: BaixaData = {
          vistoriaId: 'demo-123',
          procedimento: 'entrega',
          cliente: 'Hospital Israelita Albert Einstein',
          local: 'Almoxarifado Central - Doca 3',
          endereco: 'Av. Albert Einstein, 627 - Morumbi, São Paulo - SP',
          documento: 'NF: 00084512',
          dataHora: '29/09/2026 14:30',
          latitude: -23.598642,
          longitude: -46.715389,
          accuracy: 6,
          status: 'sucesso',
          motorista: 'João Motorista',
        };
        setBaixas([demoBaixa]);
      } else {
        setBaixas(saved);
      }
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const saved = JSON.parse(localStorage.getItem('prime_baixas') || '[]');
        if (saved.length > 0) setBaixas(saved);
      }
      setIsRefreshing(false);
    }, 600);
  };

  // Base de todos os atendimentos
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
        nome: 'João Motorista',
        email: 'joao@primecargo.com.br',
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
        nome: 'João Motorista',
        email: 'joao@primecargo.com.br',
      },
    },
    {
      id: 'trans-88',
      procedimento: 'transferencia',
      cliente: 'Philips Medical Systems',
      documento: 'CT-e: 00019284',
      local: 'Base Operacional Prime Cargo',
      horarioPrevisto: '17:30',
      cadastradoPor: {
        id: 'user-02',
        nome: 'Carlos Motorista',
        email: 'carlos@primecargo.com.br',
      },
    },
    {
      id: 'col-505',
      procedimento: 'coleta',
      cliente: 'GE Healthcare Brasil',
      documento: 'NF: 00031899',
      local: 'Unidade Barueri - Doca 2',
      horarioPrevisto: '18:15',
      cadastradoPor: {
        id: 'user-02',
        nome: 'Carlos Motorista',
        email: 'carlos@primecargo.com.br',
      },
    },
  ];

  // 🔒 REGRA OBRIGATÓRIA: O motorista SÓ PODE VER os itens cadastrados por ele mesmo!
  const meusAtendimentos = todosAtendimentos.filter(
    item => item.cadastradoPor.email === currentUser.email
  );

  const filteredItems = meusAtendimentos.filter(item => {
    const isConcluida = baixas.some(b => b.vistoriaId === item.id);
    if (filter === 'pendentes') return !isConcluida;
    if (filter === 'concluidos') return isConcluida;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <header className="bg-[#F47920] text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider opacity-85 font-semibold">Grupo Prime Cargo</span>
            <h1 className="text-2xl font-black mt-0.5">Olá, {currentUser.nome.split(' ')[0]}</h1>
            <p className="text-[11px] opacity-90 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Visibilidade Restrita: {currentUser.email}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
          </button>
        </div>

        {/* Alternador de Usuário (Para Testar a Regra de Isolamento de Cadastro) */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          <span className="text-[11px] opacity-90">Simular Outro Usuário:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentUser({ id: 'user-01', nome: 'João Motorista', email: 'joao@primecargo.com.br' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentUser.email === 'joao@primecargo.com.br'
                  ? 'bg-white text-[#F47920] shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              João
            </button>
            <button
              onClick={() => setCurrentUser({ id: 'user-02', nome: 'Carlos Motorista', email: 'carlos@primecargo.com.br' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentUser.email === 'carlos@primecargo.com.br'
                  ? 'bg-white text-[#F47920] shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Carlos
            </button>
          </div>
        </div>

        {/* Botões Rápidos de Ação por Procedimento */}
        <div className="grid grid-cols-3 gap-2 mt-4">
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

      <main className="p-4 space-y-5">
        {/* Métricas do Usuário Ativo */}
        <section className="grid grid-cols-3 gap-2.5">
          <div
            onClick={() => setFilter('pendentes')}
            className={cn(
              "bg-white p-3 rounded-2xl shadow-sm text-center border-b-4 cursor-pointer transition-all",
              filter === 'pendentes' ? "border-[#4D4D4D] ring-2 ring-gray-400" : "border-gray-200"
            )}
          >
            <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
            <p className="text-xl font-black text-[#4D4D4D]">
              {meusAtendimentos.filter(i => !baixas.some(b => b.vistoriaId === i.id)).length}
            </p>
            <p className="text-[10px] uppercase font-bold text-gray-400">Seus Pendentes</p>
          </div>

          <div
            onClick={() => setFilter('concluidos')}
            className={cn(
              "bg-white p-3 rounded-2xl shadow-sm text-center border-b-4 cursor-pointer transition-all",
              filter === 'concluidos' ? "border-green-500 ring-2 ring-green-300" : "border-gray-200"
            )}
          >
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-xl font-black text-green-600">
              {meusAtendimentos.filter(i => baixas.some(b => b.vistoriaId === i.id)).length}
            </p>
            <p className="text-[10px] uppercase font-bold text-gray-400">Suas Baixas</p>
          </div>

          <div
            onClick={() => setFilter('todos')}
            className={cn(
              "bg-white p-3 rounded-2xl shadow-sm text-center border-b-4 cursor-pointer transition-all",
              filter === 'todos' ? "border-[#F47920] ring-2 ring-orange-200" : "border-gray-200"
            )}
          >
            <ClipboardList className="w-5 h-5 mx-auto mb-1 text-[#F47920]" />
            <p className="text-xl font-black text-[#F47920]">{meusAtendimentos.length}</p>
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Seus</p>
          </div>
        </section>

        {/* Lista de Atendimentos */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-[#4D4D4D]">
              Seus Atendimentos ({filteredItems.length})
            </h2>
            <div className="flex gap-1">
              {(['todos', 'pendentes', 'concluidos'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-semibold transition-colors",
                    filter === tab
                      ? "bg-[#F47920] text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  )}
                >
                  {tab === 'todos' ? 'Todos' : tab === 'pendentes' ? 'Pendentes' : 'Concluídos'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-gray-500 shadow-sm border">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">Nenhum atendimento cadastrado para seu usuário</p>
                <p className="text-xs text-gray-400 mt-1">
                  Você só visualiza os itens que você mesmo cadastrou.
                </p>
              </div>
            ) : (
              filteredItems.map(item => {
                const baixaInfo = baixas.find(b => b.vistoriaId === item.id);
                const isConcluida = Boolean(baixaInfo);

                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase",
                        item.procedimento === 'coleta' ? "bg-blue-100 text-blue-800" :
                        item.procedimento === 'entrega' ? "bg-green-100 text-green-800" :
                        "bg-purple-100 text-purple-800"
                      )}>
                        {item.procedimento}
                      </span>

                      {isConcluida ? (
                        <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-800 rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Baixa Concluída
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pendente ({item.horarioPrevisto})
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-800 text-base mb-1">{item.cliente}</h3>
                    <p className="text-xs text-gray-500 font-mono">{item.documento}</p>
                    <p className="text-xs text-gray-600 mt-1">📍 {item.local}</p>

                    {/* 👤 Distinção de Autoria do Cadastro */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 font-medium text-[#4D4D4D]">
                        <User className="w-3.5 h-3.5 text-[#F47920]" />
                        Cadastrado por: <strong className="text-gray-800">Você ({item.cadastradoPor.nome})</strong>
                      </span>
                    </div>

                    {/* Se tem baixa concluída, exibe o mapa com o ponto exato da baixa! */}
                    {baixaInfo && (
                      <LocationMap
                        latitude={baixaInfo.latitude}
                        longitude={baixaInfo.longitude}
                        accuracy={baixaInfo.accuracy}
                        date={baixaInfo.dataHora}
                        driver={baixaInfo.motorista}
                        client={item.cliente}
                        address={baixaInfo.endereco || item.local}
                      />
                    )}

                    {/* Botão de Ação */}
                    <div className="mt-3 pt-3 border-t flex justify-end">
                      <button
                        onClick={() => router.push(`/app/vistoria/${item.id}?tipo=${item.procedimento}`)}
                        className={cn(
                          "py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors",
                          isConcluida
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            : "bg-[#F47920] hover:bg-[#E94E1B] text-white shadow-sm"
                        )}
                      >
                        {isConcluida ? 'Ver Detalhes da Vistoria' : 'Iniciar Vistoria IPP 41'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Botão Flutuante (Nova Vistoria) */}
      <button 
        onClick={() => router.push('/app/vistoria/demo-123?tipo=entrega')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#F47920] hover:bg-[#E94E1B] text-white rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95 z-40"
        title="Nova Vistoria"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
