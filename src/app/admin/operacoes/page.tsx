'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, User, MapPin, Eye, ArrowLeft, CheckCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LocationMap } from '@/components/features/location-map';

interface OperacaoItem {
  id: string;
  data: string;
  procedimento: 'coleta' | 'entrega' | 'transferencia';
  cliente: string;
  local: string;
  documento: string;
  cadastradoPor: {
    nome: string;
    email: string;
    perfil: string;
  };
  motorista: string;
  veiculo: string;
  status: 'concluido' | 'pendente' | 'em_andamento';
  geo?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    dataHora: string;
  };
}

export default function AdminOperacoes() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('todos');
  const [activeGeoItem, setActiveGeoItem] = useState<OperacaoItem | null>(null);
  const [operacoes, setOperacoes] = useState<OperacaoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOperacoes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vistorias');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const mapped: OperacaoItem[] = json.data.map((v: any) => ({
            id: v.id,
            data: v.created_at ? new Date(v.created_at).toLocaleString('pt-BR') : 'Hoje',
            procedimento: (v.procedimento as any) || 'entrega',
            cliente: v.cliente || 'Cliente Prime',
            local: v.local || v.endereco || 'Endereço não informado',
            documento: `${v.tipo_documento || 'NF'}: ${v.numero_documento || 'S/N'}`,
            cadastradoPor: {
              nome: v.motorista_nome || 'Motorista Prime',
              email: v.motorista_email || 'motorista@primecargo.com.br',
              perfil: 'Motorista',
            },
            motorista: v.motorista_nome || 'Motorista Prime',
            veiculo: v.veiculo_placa || 'Frota Prime',
            status: v.status === 'concluida' ? 'concluido' : 'pendente',
            geo: v.latitude && v.longitude ? {
              latitude: Number(v.latitude),
              longitude: Number(v.longitude),
              accuracy: Number(v.precisao_gps || 10),
              dataHora: v.created_at ? new Date(v.created_at).toLocaleString('pt-BR') : '',
            } : undefined,
          }));
          setOperacoes(mapped);
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar vistorias do banco:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperacoes();
  }, []);

  // Extrai lista única de motoristas / cadastrados
  const uniqueUsers = Array.from(
    new Set(operacoes.map(op => JSON.stringify({ nome: op.cadastradoPor.nome, email: op.cadastradoPor.email })))
  ).map(s => JSON.parse(s));

  const filtered = operacoes.filter(op => {
    const matchSearch =
      op.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.cadastradoPor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.cadastradoPor.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchUser =
      userFilter === 'todos' || op.cadastradoPor.email === userFilter;

    return matchSearch && matchUser;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#4D4D4D]">Acompanhamento de Operações</h1>
              <p className="text-xs text-gray-500">
                Auditoria de baixas, laudos IPP 41, assinaturas digitais e rastreamento GPS em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOperacoes}
              disabled={loading}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="Atualizar lista em tempo real"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F47920]' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
            <button
              onClick={() => router.push('/app/vistoria/nova')}
              className="py-2.5 px-4 bg-[#F47920] hover:bg-[#E94E1B] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Vistoria</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, documento ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full md:w-auto py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F47920]"
            >
              <option value="todos">Todos os Motoristas ({operacoes.length})</option>
              {uniqueUsers.map((u, i) => (
                <option key={i} value={u.email}>
                  {u.nome} ({operacoes.filter(o => o.cadastradoPor.email === u.email).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de Acompanhamento */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#F47920] animate-spin" />
              <p className="text-xs text-gray-500 font-semibold">Carregando vistorias do banco de dados central...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-bold text-gray-700">Nenhuma vistoria encontrada</p>
              <p className="text-xs text-gray-400">As vistorias concluídas pelos motoristas no celular aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4">Procedimento</th>
                    <th className="p-4">Cliente & Local</th>
                    <th className="p-4">Documento</th>
                    <th className="p-4">Cadastrado por (Motorista)</th>
                    <th className="p-4">Veículo</th>
                    <th className="p-4">Status & GPS</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((op) => (
                    <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase ${
                          op.procedimento === 'coleta' ? 'bg-blue-100 text-blue-800' :
                          op.procedimento === 'entrega' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {op.procedimento}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{op.cliente}</p>
                        <p className="text-xs text-gray-500">{op.local}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          {op.documento}
                        </span>
                      </td>
                      {/* Distinção de Autoria */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#F47920] flex items-center justify-center font-bold text-xs text-white">
                            {op.cadastradoPor.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-xs">{op.cadastradoPor.nome}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{op.cadastradoPor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-xs text-gray-700">{op.veiculo}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {op.status === 'concluido' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                              <CheckCircle className="w-3 h-3 text-green-600" /> Baixa Concluída
                            </span>
                            {op.geo && (
                              <button
                                onClick={() => setActiveGeoItem(op)}
                                className="text-[11px] text-[#F47920] font-bold flex items-center gap-1 hover:underline block"
                              >
                                <MapPin className="w-3 h-3" /> Ver Ponto no Mapa
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                            <Clock className="w-3 h-3 text-yellow-600" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/app/vistoria/${op.id}?tipo=${op.procedimento}`)}
                          className="py-1.5 px-3 bg-gray-100 hover:bg-[#F47920] hover:text-white text-gray-700 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver IPP 41
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal do Mapa de Localização */}
        {activeGeoItem && activeGeoItem.geo && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in">
              <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Ponto Geográfico da Baixa</h3>
                  <p className="text-xs text-gray-400">{activeGeoItem.cliente} — {activeGeoItem.documento}</p>
                </div>
                <button
                  onClick={() => setActiveGeoItem(null)}
                  className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                <LocationMap
                  latitude={activeGeoItem.geo.latitude}
                  longitude={activeGeoItem.geo.longitude}
                  accuracy={activeGeoItem.geo.accuracy}
                  date={activeGeoItem.geo.dataHora}
                  client={activeGeoItem.cliente}
                  address={activeGeoItem.local}
                  driver={activeGeoItem.motorista}
                />
              </div>

              <div className="p-4 bg-gray-50 border-t flex justify-end">
                <button
                  onClick={() => setActiveGeoItem(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-xs rounded-xl text-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
