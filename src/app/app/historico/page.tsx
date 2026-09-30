'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, CheckCircle, Package, Truck, RefreshCcw, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LocationMap } from '@/components/features/location-map';

interface HistoricoItem {
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
  motorista: string;
}

export default function HistoricoPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [itens, setItens] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('prime_baixas') || '[]');
      if (saved.length === 0) {
        setItens([
          {
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
            motorista: 'João Motorista',
          },
          {
            vistoriaId: 'col-402',
            procedimento: 'coleta',
            cliente: 'Siemens Healthineers Brasil',
            local: 'Centro de Distribuição Cajamar',
            endereco: 'Rod. Anhanguera, km 38 - Cajamar - SP',
            documento: 'Coleta: COL-2026/091',
            dataHora: '28/09/2026 10:15',
            latitude: -23.355120,
            longitude: -46.877410,
            accuracy: 8,
            motorista: 'João Motorista',
          },
        ]);
      } else {
        setItens(saved);
      }
    }
  }, []);

  const filtered = itens.filter(i =>
    i.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.procedimento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <header className="bg-[#F47920] text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/app')} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black">Histórico de Baixas</h1>
            <p className="text-xs text-white/80">Vistorias concluídas com localização GPS</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, NF ou procedimento..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920] shadow-sm"
          />
        </div>

        {/* Lista de Vistorias Concluídas */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-gray-500 shadow-sm">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Nenhuma vistoria encontrada</p>
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase ${
                    item.procedimento === 'coleta' ? 'bg-blue-100 text-blue-800' :
                    item.procedimento === 'entrega' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {item.procedimento}
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Baixa Registrada
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-base">{item.cliente}</h3>
                <div className="text-xs text-gray-500 font-mono flex justify-between">
                  <span>{item.documento}</span>
                  <span>{item.dataHora}</span>
                </div>

                {/* Mapa da Baixa */}
                <LocationMap
                  latitude={item.latitude}
                  longitude={item.longitude}
                  accuracy={item.accuracy}
                  date={item.dataHora}
                  driver={item.motorista}
                  client={item.cliente}
                  address={item.endereco || item.local}
                />

                <div className="pt-2 flex justify-between items-center text-xs border-t">
                  <button
                    onClick={() => router.push(`/app/vistoria/${item.vistoriaId}/comparacao`)}
                    className="text-[#F47920] font-bold hover:underline"
                  >
                    Ver Comparação de Etapas →
                  </button>
                  <button
                    onClick={() => router.push(`/app/vistoria/${item.vistoriaId}`)}
                    className="text-gray-500 hover:text-gray-800 font-medium"
                  >
                    Ver Formulário IPP 41
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
