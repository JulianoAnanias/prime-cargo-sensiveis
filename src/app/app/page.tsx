'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, ClipboardList, CheckCircle, Clock, Truck, Package, RefreshCcw, MapPin, ChevronRight, User, Users, ShieldCheck, LogOut, LayoutDashboard, Video, Star, HeartHandshake, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationMap } from '@/components/features/location-map';
import { PwaInstallBanner } from '@/components/features/pwa-install-banner';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

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
  pesquisa_satisfacao?: any;
}

export default function DriverDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'pendentes' | 'concluidos'>('todos');
  const [procedimentoFilter, setProcedimentoFilter] = useState<'todos' | 'coleta' | 'entrega' | 'transferencia'>('todos');
  const [baixas, setBaixas] = useState<BaixaData[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { savedAt?: string }>>({});

  // Filtros de visualização para Administradores / Gestão
  const [userScopeFilter, setUserScopeFilter] = useState<'todos' | 'meus'>('todos');
  const [motoristaFilter, setMotoristaFilter] = useState<string>('todos');

  // Modal de Pesquisa de Satisfação
  const [satisfactionModalOpen, setSatisfactionModalOpen] = useState(false);
  const [selectedAtendimentoForSurvey, setSelectedAtendimentoForSurvey] = useState<AtendimentoItem | null>(null);
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveyForm, setSurveyForm] = useState({
    recusada: false,
    motivoRecusa: '',
    nomeRespondente: '',
    cargoRespondente: '',
    q1: 'Otimo',
    q2: 'Otimo',
    q3: 'Otimo',
    q4: 'Otimo',
    sugestoes: ''
  });

  // Usuário real autenticado (via Microsoft ou E-mail cadastrado)
  const [currentUser, setCurrentUser] = useState({
    nome: 'Juliano Ananias',
    email: 'juliano@primecargo.com.br',
    perfil: 'gestao'
  });

  const [dbAtendimentos, setDbAtendimentos] = useState<AtendimentoItem[]>([]);

  const loadData = () => {
    if (typeof window === 'undefined') return;

    // 0. Carrega atendimentos criados localmente no aparelho
    const localCriados: AtendimentoItem[] = JSON.parse(localStorage.getItem('prime_atendimentos_criados') || '[]');

    // 1. Carrega baixas registradas localmente
    const savedBaixas: BaixaData[] = JSON.parse(localStorage.getItem('prime_baixas') || '[]');
    setBaixas(savedBaixas);

    // 2. Carrega rascunhos em andamento do localStorage
    const foundDrafts: Record<string, { savedAt?: string }> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('prime_draft_vistoria_')) {
        const id = key.replace('prime_draft_vistoria_', '');
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          foundDrafts[id] = { savedAt: item.savedAt };
        } catch {}
      }
    }
    setDrafts(foundDrafts);

    // 3. Sincroniza vistorias e baixas salvas no Neon Postgres
    fetch('/api/vistorias')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          // Apenas vistorias com status 'concluida' contam como Baixas finalizadas
          const dbBaixas: BaixaData[] = json.data
            .filter((v: any) => v.status === 'concluida')
            .map((v: any) => ({
              vistoriaId: v.id,
              procedimento: v.procedimento || 'entrega',
              cliente: v.cliente,
              local: v.local || v.endereco || 'Endereço registrado',
              endereco: v.endereco,
              documento: `${v.tipo_documento || 'NF'}: ${v.numero_documento || 'S/N'}`,
              dataHora: v.created_at ? new Date(v.created_at).toLocaleString('pt-BR') : '',
              latitude: Number(v.latitude || -23.59),
              longitude: Number(v.longitude || -46.71),
              accuracy: Number(v.precisao_gps || 10),
              status: 'sucesso',
              motorista: v.motorista_nome || '',
            }));

          // Vistorias com status 'em_andamento' recebem marcação de rascunho
          json.data.forEach((v: any) => {
            if (v.status === 'em_andamento' && !foundDrafts[v.id]) {
              foundDrafts[v.id] = { savedAt: v.updated_at || v.created_at };
            }
          });
          setDrafts({ ...foundDrafts });

          // Mescla baixas locais com as do banco (apenas as que realmente estão concluídas)
          const map = new Map<string, BaixaData>();
          [...dbBaixas, ...savedBaixas].forEach(b => {
            const dbRecord = json.data.find((v: any) => v.id === b.vistoriaId);
            if (dbRecord && dbRecord.status !== 'concluida') {
              return; // não adiciona como concluída se o banco diz que não está concluída
            }
            map.set(b.vistoriaId, b);
          });
          setBaixas(Array.from(map.values()));

          const dynamicItems: AtendimentoItem[] = json.data.map((v: any) => ({
            id: v.id,
            procedimento: (v.procedimento as any) || 'entrega',
            cliente: v.cliente || 'Cliente em Atendimento',
            documento: `${v.tipo_documento || 'NF'}: ${v.numero_documento || 'S/N'}`,
            local: v.local || v.endereco || 'Endereço registrado',
            horarioPrevisto: v.created_at ? new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '14:00',
            cadastradoPor: {
              id: `user-${v.motorista_email || 'db'}`,
              nome: v.motorista_nome || 'Motorista Equipe',
              email: v.motorista_email || 'operacoes@primecargo.com.br',
            },
            pesquisa_satisfacao: typeof v.pesquisa_satisfacao === 'string' ? JSON.parse(v.pesquisa_satisfacao || '{}') : v.pesquisa_satisfacao
          }));
          setDbAtendimentos([...dynamicItems, ...localCriados]);

          // Auto-sync de cards criados offline/localmente para o banco Neon
          const dbIds = new Set(json.data.map((v: any) => v.id));
          localCriados.forEach((localItem: AtendimentoItem) => {
            if (!dbIds.has(localItem.id)) {
              fetch('/api/vistorias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: localItem.id,
                  procedimento: localItem.procedimento,
                  cliente: localItem.cliente,
                  tipo_documento: localItem.documento?.includes(':') ? localItem.documento.split(':')[0].trim() : 'NF',
                  numero_documento: localItem.documento?.includes(':') ? localItem.documento.split(':')[1].trim() : localItem.documento || 'S/N',
                  local: localItem.local,
                  motorista_nome: localItem.cadastradoPor?.nome || currentUser.nome,
                  motorista_email: localItem.cadastradoPor?.email || currentUser.email,
                  status: 'em_andamento',
                }),
              }).catch(err => console.warn('Erro ao sincronizar card local:', err));
            }
          });
        }
      })
      .catch(console.error);
  };

  const openSurveyModal = (item: AtendimentoItem) => {
    setSelectedAtendimentoForSurvey(item);
    const existing = item.pesquisa_satisfacao;
    if (existing) {
      setSurveyForm({
        recusada: Boolean(existing.recusada),
        motivoRecusa: existing.motivo_recusa || existing.motivoRecusa || '',
        nomeRespondente: existing.respondido_por || existing.nomeRespondente || '',
        cargoRespondente: existing.cargo_funcao || existing.cargoRespondente || '',
        q1: existing.respostas?.q1 || existing.q1 || 'Otimo',
        q2: existing.respostas?.q2 || existing.q2 || 'Otimo',
        q3: existing.respostas?.q3 || existing.q3 || 'Otimo',
        q4: existing.respostas?.q4 || existing.q4 || 'Otimo',
        sugestoes: existing.sugestoes || ''
      });
    } else {
      setSurveyForm({
        recusada: false,
        motivoRecusa: '',
        nomeRespondente: '',
        cargoRespondente: '',
        q1: 'Otimo',
        q2: 'Otimo',
        q3: 'Otimo',
        q4: 'Otimo',
        sugestoes: ''
      });
    }
    setSatisfactionModalOpen(true);
  };

  const handleSaveSurvey = async () => {
    if (!selectedAtendimentoForSurvey) return;
    setSurveySubmitting(true);
    try {
      const payload = {
        respondida: !surveyForm.recusada,
        recusada: surveyForm.recusada,
        motivoRecusa: surveyForm.motivoRecusa,
        motivo_recusa: surveyForm.motivoRecusa,
        nomeRespondente: surveyForm.nomeRespondente,
        respondido_por: surveyForm.nomeRespondente,
        cargoRespondente: surveyForm.cargoRespondente,
        cargo_funcao: surveyForm.cargoRespondente,
        respostas: {
          q1: surveyForm.q1,
          q2: surveyForm.q2,
          q3: surveyForm.q3,
          q4: surveyForm.q4
        },
        sugestoes: surveyForm.sugestoes
      };

      const res = await fetch(`/api/vistorias/${selectedAtendimentoForSurvey.id}/pesquisa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(surveyForm.recusada 
          ? 'ℹ️ Recusa registrada e notificação enviada à gestão com sucesso!' 
          : '⭐ Pesquisa de satisfação registrada com sucesso e e-mail disparado para a gestão e qualidade!'
        );
        setSatisfactionModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert('Erro ao salvar pesquisa: ' + (err.error || 'Falha de comunicação'));
      }
    } catch (e: any) {
      alert('Erro ao salvar pesquisa: ' + e.message);
    } finally {
      setSurveySubmitting(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Tenta carregar usuário salvo no login
      const stored = localStorage.getItem('prime_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser({
            nome: parsed.nome || 'Juliano Ananias',
            email: parsed.email || 'juliano@primecargo.com.br',
            perfil: parsed.perfil || 'gestao'
          });
        } catch (e) {}
      } else if (session?.user) {
        setCurrentUser({
          nome: session.user.name || 'Juliano Ananias',
          email: session.user.email || 'juliano@primecargo.com.br',
          perfil: (session.user as any).perfil || 'gestao'
        });
      }

      loadData();
    }
  }, [session]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleLogout = async () => {
    localStorage.removeItem('prime_user');
    await fetch('/api/auth/driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    signOut({ callbackUrl: '/' });
    router.push('/');
  };

  const isGestor = currentUser.perfil === 'gestao' || currentUser.perfil === 'admin' || currentUser.email.endsWith('@primecargo.com.br');

  // Base operacional oficial com itens do banco de dados e da frota
  const baseAtendimentos: AtendimentoItem[] = [
    {
      id: 'demo-123',
      procedimento: 'entrega',
      cliente: 'Hospital Israelita Albert Einstein',
      documento: 'NF: 00084512',
      local: 'Almoxarifado Central - Doca 3',
      horarioPrevisto: '14:30',
      cadastradoPor: {
        id: 'user-02',
        nome: 'João Motorista',
        email: 'motorista@primecargo.com.br',
      },
    },
    ...dbAtendimentos,
  ];

  // Desduplica atendimentos por ID
  const itemMap = new Map<string, AtendimentoItem>();
  baseAtendimentos.forEach(item => itemMap.set(item.id, item));
  const todosAtendimentos = Array.from(itemMap.values());

  // Lista única de motoristas/usuários para o seletor do ADM
  const uniqueDrivers = Array.from(
    new Map(todosAtendimentos.map(item => [item.cadastradoPor.email.toLowerCase(), item.cadastradoPor])).values()
  );

  // Escopo de itens dependendo do perfil: ADM vê todos por padrão; motorista vê os seus
  const scopeItems = todosAtendimentos.filter(item => {
    if (!isGestor) {
      return item.cadastradoPor.email.toLowerCase() === currentUser.email.toLowerCase();
    }
    if (userScopeFilter === 'meus') {
      return item.cadastradoPor.email.toLowerCase() === currentUser.email.toLowerCase();
    }
    if (motoristaFilter !== 'todos') {
      return item.cadastradoPor.email.toLowerCase() === motoristaFilter.toLowerCase();
    }
    return true;
  });

  const filteredItems = scopeItems.filter(item => {
    // Filtro por procedimento (Coleta / Entrega / Transferência)
    if (procedimentoFilter !== 'todos' && item.procedimento !== procedimentoFilter) {
      return false;
    }
    // Filtro por situação
    const isConcluida = baixas.some(b => b.vistoriaId === item.id);
    if (filter === 'pendentes') return !isConcluida;
    if (filter === 'concluidos') return isConcluida;
    return true;
  });

  // Base para cálculo dos indicadores superiores
  const kpiBaseItems = (isGestor && userScopeFilter === 'todos')
    ? todosAtendimentos
    : todosAtendimentos.filter(a => a.cadastradoPor.email.toLowerCase() === currentUser.email.toLowerCase());

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
            <div className="bg-white/95 px-2.5 py-1 rounded-lg shadow-xs inline-flex items-center mb-2">
              <Image
                src="/logo.png"
                alt="Grupo Prime Cargo"
                width={110}
                height={28}
                className="h-5 w-auto object-contain"
                priority
              />
            </div>
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

        {/* Filtros Rápidos por Procedimento */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <button
            onClick={() => setProcedimentoFilter(prev => prev === 'coleta' ? 'todos' : 'coleta')}
            className={cn(
              "p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border",
              procedimentoFilter === 'coleta'
                ? "bg-white text-[#F47920] shadow-md border-white font-black"
                : "bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border-white/20 font-bold"
            )}
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs">Coleta</span>
            <span className="text-[10px] opacity-75 mt-0.5">
              ({scopeItems.filter(a => a.procedimento === 'coleta').length})
            </span>
          </button>

          <button
            onClick={() => setProcedimentoFilter(prev => prev === 'entrega' ? 'todos' : 'entrega')}
            className={cn(
              "p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border",
              procedimentoFilter === 'entrega'
                ? "bg-white text-[#F47920] shadow-md border-white font-black"
                : "bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border-white/20 font-bold"
            )}
          >
            <Truck className="w-5 h-5 mb-1" />
            <span className="text-xs">Entrega</span>
            <span className="text-[10px] opacity-75 mt-0.5">
              ({scopeItems.filter(a => a.procedimento === 'entrega').length})
            </span>
          </button>

          <button
            onClick={() => setProcedimentoFilter(prev => prev === 'transferencia' ? 'todos' : 'transferencia')}
            className={cn(
              "p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all border",
              procedimentoFilter === 'transferencia'
                ? "bg-white text-[#F47920] shadow-md border-white font-black"
                : "bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border-white/20 font-bold"
            )}
          >
            <RefreshCcw className="w-5 h-5 mb-1" />
            <span className="text-xs">Transferência</span>
            <span className="text-[10px] opacity-75 mt-0.5">
              ({scopeItems.filter(a => a.procedimento === 'transferencia').length})
            </span>
          </button>
        </div>
      </header>

      {/* Cards de Métricas */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <Clock className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-lg font-black text-[#4D4D4D]">
              {kpiBaseItems.filter(a => !baixas.some(b => b.vistoriaId === a.id)).length}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">
              {isGestor && userScopeFilter === 'todos' ? 'Pendentes (Frota)' : 'Pendentes'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 mb-1" />
            <span className="text-lg font-black text-[#4D4D4D]">
              {kpiBaseItems.filter(a => baixas.some(b => b.vistoriaId === a.id)).length}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">
              {isGestor && userScopeFilter === 'todos' ? 'Baixas (Frota)' : 'Baixas'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <ClipboardList className="w-5 h-5 text-[#F47920] mb-1" />
            <span className="text-lg font-black text-[#4D4D4D]">{kpiBaseItems.length}</span>
            <span className="text-[10px] uppercase font-bold text-gray-400">
              {isGestor && userScopeFilter === 'todos' ? 'Total Frota' : 'Total Seus'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção Principal de Atendimentos */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
        {/* Banner de Instalação PWA no Celular */}
        <PwaInstallBanner />

        {/* Painel de Gestão e Escopo de Cards para Administrador */}
        {isGestor && (
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-orange-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-800 block">
                    Painel do Administrador • Gestão de Cards
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Você pode auditar todos os atendimentos da frota ou filtrar por motorista específico
                  </p>
                </div>
              </div>

              {/* Seletor de Escopo: Todos da Equipe vs Apenas Meus */}
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setUserScopeFilter('todos');
                    setMotoristaFilter('todos');
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    userScopeFilter === 'todos'
                      ? "bg-gray-900 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  <span>Todos os Cards ({todosAtendimentos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserScopeFilter('meus')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    userScopeFilter === 'meus'
                      ? "bg-[#F47920] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Apenas Meus ({todosAtendimentos.filter(a => a.cadastradoPor.email.toLowerCase() === currentUser.email.toLowerCase()).length})</span>
                </button>
              </div>
            </div>

            {/* Filtro por Motorista quando em visualização de Todos */}
            {userScopeFilter === 'todos' && (
              <div className="pt-2.5 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-gray-600">Filtrar por Motorista:</span>
                <select
                  value={motoristaFilter}
                  onChange={(e) => setMotoristaFilter(e.target.value)}
                  className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#F47920]"
                >
                  <option value="todos">Todos os Usuários da Frota ({todosAtendimentos.length} cards)</option>
                  {uniqueDrivers.map((driver) => {
                    const count = todosAtendimentos.filter(a => a.cadastradoPor.email.toLowerCase() === driver.email.toLowerCase()).length;
                    return (
                      <option key={driver.email} value={driver.email}>
                        👤 {driver.nome} ({count} {count === 1 ? 'card' : 'cards'})
                      </option>
                    );
                  })}
                </select>
                {motoristaFilter !== 'todos' && (
                  <button
                    type="button"
                    onClick={() => setMotoristaFilter('todos')}
                    className="text-[11px] font-bold text-[#F47920] hover:underline ml-1"
                  >
                    Mostrar todos os motoristas
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#4D4D4D]">
              {isGestor && userScopeFilter === 'todos' ? 'Todos os Atendimentos da Frota' : 'Seus Atendimentos'} ({filteredItems.length})
            </h2>
            {isGestor && userScopeFilter === 'todos' && (
              <p className="text-[11px] text-gray-500 font-medium">
                Exibindo cards com identificação visual do usuário/motorista responsável
              </p>
            )}
          </div>

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
            const draft = drafts[item.id];
            const hasDraft = !isConcluido && Boolean(draft);

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-white rounded-2xl p-5 shadow-sm border transition-all",
                  hasDraft ? "border-amber-300 ring-2 ring-amber-100" : "border-gray-200 hover:border-orange-200"
                )}
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
                  ) : hasDraft ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                      <Clock className="w-3.5 h-3.5" /> Em Andamento
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> Pendente • {item.horarioPrevisto}
                    </span>
                  )}
                </div>

                {/* Apontamento Referente a Qual é o Usuário / Motorista */}
                <div className="my-2.5 p-2.5 bg-gradient-to-r from-orange-50/90 via-gray-50 to-white border border-orange-200/80 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-gray-700">
                      {item.cadastradoPor.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#F47920]">
                          Usuário Responsável:
                        </span>
                        <span className="text-xs font-black text-gray-800">
                          {item.cadastradoPor.nome}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono truncate">
                        {item.cadastradoPor.email}
                      </p>
                    </div>
                  </div>
                  {item.cadastradoPor.email.toLowerCase() === currentUser.email.toLowerCase() ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-orange-100 text-[#F47920] border border-orange-300 rounded-md shrink-0">
                      Seu Usuário
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-md shrink-0">
                      Motorista Equipe
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

                {/* Alerta de Status: Rascunho / Vistoria em Andamento */}
                {hasDraft && (
                  <div className="mt-3 p-3 bg-amber-50/90 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
                      <div>
                        <p className="font-bold flex items-center gap-1.5">
                          <span>Vistoria em Andamento</span>
                          <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-black">
                            Rascunho
                          </span>
                        </p>
                        <p className="text-[11px] text-amber-700">Preenchimento salvo. Toque para continuar de onde parou.</p>
                      </div>
                    </div>
                    {draft?.savedAt && (
                      <span className="text-[10px] text-amber-800 font-mono font-bold bg-amber-200/60 px-2 py-0.5 rounded shrink-0">
                        {new Date(draft.savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                )}

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

                {/* Badge da Pesquisa de Satisfação */}
                {item.pesquisa_satisfacao && (
                  <div className="mt-3">
                    {item.pesquisa_satisfacao.recusada ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        ℹ️ Pesquisa de Satisfação: Recusada no local ({item.pesquisa_satisfacao.motivo_recusa || item.pesquisa_satisfacao.motivoRecusa || 'Sem justificativa'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        ⭐ Satisfação Avaliada: {item.pesquisa_satisfacao.respostas?.q4 || item.pesquisa_satisfacao.q4 || 'Conforme'} ({item.pesquisa_satisfacao.respondido_por || item.pesquisa_satisfacao.nomeRespondente || 'Cliente'})
                      </span>
                    )}
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/app/video?id=${item.id}&doc=${encodeURIComponent(item.documento)}&cliente=${encodeURIComponent(item.cliente)}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition border border-red-200"
                      title="Transmitir ao vivo para o cliente"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Ao Vivo</span>
                    </button>

                    <button
                      onClick={() => openSurveyModal(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition border border-amber-200"
                      title="Coletar pesquisa de satisfação do cliente"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>{item.pesquisa_satisfacao ? 'Ver Satisfação' : 'Coletar Satisfação'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => router.push(`/app/vistoria/${item.id}?tipo=${item.procedimento}`)}
                    className={cn(
                      "flex items-center gap-1 text-xs font-bold transition px-3.5 py-2 rounded-xl",
                      isConcluido
                        ? "text-[#F47920] hover:text-[#E94E1B]"
                        : hasDraft
                        ? "bg-gradient-to-r from-[#F47920] to-[#E94E1B] text-white shadow-md hover:opacity-95"
                        : "bg-orange-50 text-[#F47920] hover:bg-orange-100 border border-orange-200"
                    )}
                  >
                    <span>
                      {isConcluido ? 'Ver Detalhes da Vistoria' : hasDraft ? 'Retomar Vistoria' : 'Iniciar Vistoria'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ═══ MODAL INTERATIVO: PESQUISA DE SATISFAÇÃO (IPP35) ═══ */}
      {satisfactionModalOpen && selectedAtendimentoForSurvey && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Pesquisa de Satisfação (IPP35)</h3>
                  <p className="text-[11px] text-gray-400">{selectedAtendimentoForSurvey.cliente} — {selectedAtendimentoForSurvey.documento}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSatisfactionModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Opção para cliente que se recusar */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="modal-chk-recusa"
                  checked={surveyForm.recusada}
                  onChange={(e) => setSurveyForm(prev => ({ ...prev, recusada: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-[#F47920] rounded border-gray-300 focus:ring-[#F47920] cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="modal-chk-recusa" className="text-xs font-bold text-amber-900 cursor-pointer block">
                    O cliente optou por NÃO responder à pesquisa de satisfação
                  </label>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Marque caso o cliente não tenha disponibilidade ou se recuse a responder.
                  </p>

                  {surveyForm.recusada && (
                    <div className="mt-2.5">
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                        Motivo / Justificativa da recusa:
                      </label>
                      <input
                        type="text"
                        value={surveyForm.motivoRecusa}
                        onChange={(e) => setSurveyForm(prev => ({ ...prev, motivoRecusa: e.target.value }))}
                        placeholder="Ex: Cliente sem tempo, norma interna da instituição, ausência de gestor"
                        className="w-full text-xs p-2.5 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {!surveyForm.recusada && (
                <div className="space-y-4 pt-1">
                  {/* Perguntas */}
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-800 block mb-2">
                      1. Apresentação e postura da equipe Prime Cargo:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 'Otimo', label: '😍 Ótimo', color: 'bg-emerald-500 text-white' },
                        { val: 'Bom', label: '😊 Bom', color: 'bg-blue-500 text-white' },
                        { val: 'Regular', label: '😐 Regular', color: 'bg-amber-500 text-white' },
                        { val: 'Ruim', label: '🙁 Ruim', color: 'bg-red-500 text-white' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setSurveyForm(prev => ({ ...prev, q1: opt.val as any }))}
                          className={cn(
                            "py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all",
                            surveyForm.q1 === opt.val
                              ? opt.color + " shadow-sm border-transparent"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-800 block mb-2">
                      2. Veículos conservados e adequados:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 'Otimo', label: '😍 Ótimo', color: 'bg-emerald-500 text-white' },
                        { val: 'Bom', label: '😊 Bom', color: 'bg-blue-500 text-white' },
                        { val: 'Regular', label: '😐 Regular', color: 'bg-amber-500 text-white' },
                        { val: 'Ruim', label: '🙁 Ruim', color: 'bg-red-500 text-white' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setSurveyForm(prev => ({ ...prev, q2: opt.val as any }))}
                          className={cn(
                            "py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all",
                            surveyForm.q2 === opt.val
                              ? opt.color + " shadow-sm border-transparent"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-800 block mb-2">
                      3. Cumprimento do horário e cuidado com a carga:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 'Otimo', label: '😍 Ótimo', color: 'bg-emerald-500 text-white' },
                        { val: 'Bom', label: '😊 Bom', color: 'bg-blue-500 text-white' },
                        { val: 'Regular', label: '😐 Regular', color: 'bg-amber-500 text-white' },
                        { val: 'Ruim', label: '🙁 Ruim', color: 'bg-red-500 text-white' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setSurveyForm(prev => ({ ...prev, q3: opt.val as any }))}
                          className={cn(
                            "py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all",
                            surveyForm.q3 === opt.val
                              ? opt.color + " shadow-sm border-transparent"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-800 block mb-2">
                      4. Classificação geral do atendimento:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 'Otimo', label: '😍 Ótimo', color: 'bg-emerald-500 text-white' },
                        { val: 'Bom', label: '😊 Bom', color: 'bg-blue-500 text-white' },
                        { val: 'Regular', label: '😐 Regular', color: 'bg-amber-500 text-white' },
                        { val: 'Ruim', label: '🙁 Ruim', color: 'bg-red-500 text-white' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setSurveyForm(prev => ({ ...prev, q4: opt.val as any }))}
                          className={cn(
                            "py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all",
                            surveyForm.q4 === opt.val
                              ? opt.color + " shadow-sm border-transparent"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Nome de quem avaliou:
                      </label>
                      <input
                        type="text"
                        value={surveyForm.nomeRespondente}
                        onChange={(e) => setSurveyForm(prev => ({ ...prev, nomeRespondente: e.target.value }))}
                        placeholder="Nome do cliente / recebedor"
                        className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Cargo / Função:
                      </label>
                      <input
                        type="text"
                        value={surveyForm.cargoRespondente}
                        onChange={(e) => setSurveyForm(prev => ({ ...prev, cargoRespondente: e.target.value }))}
                        placeholder="Ex: Almoxarife"
                        className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Comentários / Sugestões (opcional):
                    </label>
                    <textarea
                      value={surveyForm.sugestoes}
                      onChange={(e) => setSurveyForm(prev => ({ ...prev, sugestoes: e.target.value }))}
                      placeholder="Espaço para observações do cliente..."
                      className="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSatisfactionModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSurvey}
                disabled={surveySubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#F47920] to-[#E94E1B] hover:opacity-95 rounded-xl shadow-md flex items-center gap-1.5 transition disabled:opacity-60"
              >
                {surveySubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4 fill-white" />}
                <span>Salvar & Disparar E-mail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Botão Flutuante: Nova Vistoria */}
      <button
        onClick={() => router.push('/app/vistoria/nova')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-[#E94E1B] to-[#F47920] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40"
        title="Criar Nova Vistoria"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
