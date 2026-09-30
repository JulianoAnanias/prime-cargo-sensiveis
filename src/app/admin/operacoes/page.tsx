'use client';

import { useState } from 'react';
import { Search, Plus, Filter, User, MapPin, Eye, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
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

  const operacoes: OperacaoItem[] = [
    {
      id: 'demo-123',
      data: '29/09/2026 14:30',
      procedimento: 'entrega',
      cliente: 'Hospital Israelita Albert Einstein',
      local: 'Almoxarifado Central - Doca 3',
      documento: 'NF: 00084512',
      cadastradoPor: {
        nome: 'João Motorista',
        email: 'joao@primecargo.com.br',
        perfil: 'Motorista',
      },
      motorista: 'João Motorista',
      veiculo: 'ABC-1D23',
      status: 'concluido',
      geo: {
        latitude: -23.598642,
        longitude: -46.715389,
        accuracy: 6,
        dataHora: '29/09/2026 14:30',
      },
    },
    {
      id: 'col-402',
      data: '28/09/2026 10:15',
      procedimento: 'coleta',
      cliente: 'Siemens Healthineers Brasil',
      local: 'Centro de Distribuição Cajamar',
      documento: 'Coleta: COL-2026/091',
      cadastradoPor: {
        nome: 'João Motorista',
        email: 'joao@primecargo.com.br',
        perfil: 'Motorista',
      },
      motorista: 'João Motorista',
      veiculo: 'ABC-1D23',
      status: 'concluido',
      geo: {
        latitude: -23.355120,
        longitude: -46.877410,
        accuracy: 8,
        dataHora: '28/09/2026 10:15',
      },
    },
    {
      id: 'trans-88',
      data: '29/09/2026 17:30',
      procedimento: 'transferencia',
      cliente: 'Philips Medical Systems',
      local: 'Base Operacional Prime Cargo',
      documento: 'CT-e: 00019284',
      cadastradoPor: {
        nome: 'Carlos Motorista',
        email: 'carlos@primecargo.com.br',
        perfil: 'Motorista',
      },
      motorista: 'Carlos Motorista',
      veiculo: 'XYZ-9K88',
      status: 'pendente',
    },
    {
      id: 'col-505',
      data: '29/09/2026 18:15',
      procedimento: 'coleta',
      cliente: 'GE Healthcare Brasil',
      local: 'Unidade Barueri - Doca 2',
      documento: 'NF: 00031899',
      cadastradoPor: {
        nome: 'Carlos Motorista',
        email: 'carlos@primecargo.com.br',
        perfil: 'Motorista',
      },
      motorista: 'Carlos Motorista',
      veiculo: 'XYZ-9K88',
      status: 'pendente',
    },
  ];

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
            <button onClick={() => router.push('/admin')} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#4D4D4D]">Acompanhamento de Operações</h1>
              <p className="text-xs text-gray-500">
                Auditoria e rastreabilidade com distinção por usuário cadastrador
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/app')}
              className="py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-sm"
            >
              📱 Abrir Visão do Motorista
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Distinção por Usuário */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, NF, documento ou motorista..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
            />
          </div>

          {/* Filtro Obrigatório: Distinção por Usuário */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#F47920] flex-shrink-0" />
            <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
              Cadastrado por:
            </label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border rounded-xl px-3 py-2 text-xs font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F47920]"
            >
              <option value="todos">Todos os Usuários ({operacoes.length})</option>
              <option value="joao@primecargo.com.br">Apenas João Motorista (2)</option>
              <option value="carlos@primecargo.com.br">Apenas Carlos Motorista (2)</option>
            </select>
          </div>
        </div>

        {/* Tabela de Acompanhamento */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-4">Procedimento</th>
                  <th className="p-4">Cliente & Local</th>
                  <th className="p-4">Documento</th>
                  <th className="p-4">Cadastrado por (Autoria)</th>
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
                    {/* 👤 Distinção de Autoria */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                          op.cadastradoPor.email === 'joao@primecargo.com.br' ? 'bg-[#F47920]' : 'bg-purple-600'
                        }`}>
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
        </div>

        {/* Modal do Mapa de Localização */}
        {activeGeoItem && activeGeoItem.geo && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Ponto da Baixa — {activeGeoItem.cliente}</h3>
                  <p className="text-xs text-gray-400">Cadastrado por: {activeGeoItem.cadastradoPor.nome}</p>
                </div>
                <button
                  onClick={() => setActiveGeoItem(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <LocationMap
                  latitude={activeGeoItem.geo.latitude}
                  longitude={activeGeoItem.geo.longitude}
                  accuracy={activeGeoItem.geo.accuracy}
                  date={activeGeoItem.geo.dataHora}
                  driver={activeGeoItem.motorista}
                  client={activeGeoItem.cliente}
                  address={activeGeoItem.local}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
