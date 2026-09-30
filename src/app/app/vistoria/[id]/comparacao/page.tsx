'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, Calendar, User, Truck, Package, RefreshCcw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { ComparisonViewer, StageData } from '@/components/features/comparison-viewer';

export default function ComparacaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const previousStage: StageData = {
    stageName: 'Coleta Inicial (CD Cajamar)',
    date: '28/09/2026 10:15',
    responsible: 'Marcos Oliveira (Prime Cargo)',
    conditions: [
      { label: 'Estado do Equipamento', value: 'Novo' },
      { label: 'Apresentação', value: 'Embalado (Caixa de Madeira)' },
      { label: 'Inspeção da Embalagem', value: 'Embalagem original intacta' },
      { label: 'Funcionamento', value: 'Funcionando (teste de bancada OK)' },
      { label: 'Avarias Registradas', value: 'Nenhuma não conformidade detectada' },
    ],
    photos: [
      { url: '/logo.jpg', label: 'Foto Geral na Coleta' },
      { url: '/icon-app.png', label: 'Etiqueta e Lacre na Coleta' },
    ],
  };

  const currentStage: StageData = {
    stageName: 'Entrega Final (Hospital Einstein)',
    date: '29/09/2026 14:30',
    responsible: 'João Motorista (Prime Cargo)',
    conditions: [
      { label: 'Estado do Equipamento', value: 'Novo' },
      { label: 'Apresentação', value: 'Embalado' },
      { label: 'Inspeção da Embalagem', value: 'Embalagem original' },
      { label: 'Funcionamento', value: 'Funcionando' },
      { label: 'Avarias Registradas', value: 'Sem sinais de avarias durante o transporte' },
    ],
    photos: [
      { url: '/logo.jpg', label: 'Foto Geral na Doca de Entrega' },
      { url: '/icon-app.png', label: 'Conferência de Lacre no Destino' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-12">
      <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-gray-800">
              Comparação Entre Etapas (IPP 41)
            </h1>
            <p className="text-xs text-gray-500">
              Coleta vs Entrega — Atendimento #{id}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-xs text-orange-900 flex items-start gap-2">
          <Eye className="w-4 h-4 text-[#F47920] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Esta tela permite ao motorista e à gestão comparar lado a lado o estado do equipamento e as fotos registradas na <strong>Coleta</strong> com a <strong>Entrega</strong> atual para garantir a integridade da logística sensível.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <ComparisonViewer previousStage={previousStage} currentStage={currentStage} />
        </div>

        <button
          onClick={() => router.push(`/app/vistoria/${id}`)}
          className="w-full py-3.5 bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold rounded-xl shadow-md transition-colors text-sm"
        >
          Voltar para a Vistoria da Entrega
        </button>
      </main>
    </div>
  );
}
