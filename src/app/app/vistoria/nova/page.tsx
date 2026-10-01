'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Truck, Package, RefreshCcw, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NovaVistoriaDirect() {
  const router = useRouter();
  const [selectedProcedure, setSelectedProcedure] = useState<'coleta' | 'entrega' | 'transferencia'>('entrega');

  const handleStartInspection = (procedure = selectedProcedure) => {
    const vistoriaId = 'vist-' + Date.now();
    
    // Obtém dados do usuário local
    const stored = localStorage.getItem('prime_user');
    let currentUser = { nome: 'Motorista', email: 'motorista@primecargo.com.br' };
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch (e) {}
    }

    const novoAtendimento = {
      id: vistoriaId,
      procedimento: procedure,
      cliente: 'A preencher no formulário',
      documento: 'A preencher no formulário',
      local: 'A preencher no formulário',
      horarioPrevisto: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cadastradoPor: {
        id: 'user-local',
        nome: currentUser.nome,
        email: currentUser.email,
      },
    };

    // Registra na lista local para suporte offline
    const existing = JSON.parse(localStorage.getItem('prime_atendimentos_criados') || '[]');
    existing.unshift(novoAtendimento);
    localStorage.setItem('prime_atendimentos_criados', JSON.stringify(existing));

    // Sincroniza imediatamente com o Neon Postgres para que os administradores vejam o card em tempo real
    fetch('/api/vistorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: vistoriaId,
        procedimento: procedure,
        cliente: 'A preencher no formulário',
        tipo_documento: 'NF',
        numero_documento: 'S/N',
        local: 'Local em definição',
        motorista_nome: currentUser.nome,
        motorista_email: currentUser.email,
        status: 'em_andamento',
      }),
    }).catch(err => console.warn('Aviso ao sincronizar novo card com a nuvem:', err));

    // Redireciona diretamente para o formulário oficial unificado
    router.push(`/app/vistoria/${vistoriaId}?tipo=${procedure}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={() => router.push('/app')}
          className="p-2 text-[#4D4D4D] hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-bold text-[#4D4D4D] uppercase tracking-wider">
          Iniciar Nova Vistoria
        </h1>

        <button
          onClick={() => router.push('/app')}
          className="text-xs font-bold text-gray-400 hover:text-gray-600 p-2"
        >
          Cancelar
        </button>
      </header>

      {/* Conteúdo Central: Seleção do Procedimento */}
      <main className="flex-1 max-w-lg w-full mx-auto p-5 flex flex-col justify-center">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-100 text-[#F47920] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-[#4D4D4D]">Qual o tipo de serviço?</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Selecione o procedimento para abrir o formulário completo sem etapas redundantes:
          </p>
        </div>

        <div className="grid gap-3.5 mb-8">
          {[
            {
              id: 'coleta',
              label: '1. Coleta',
              desc: 'Retirada de equipamento no cliente / fornecedor',
              icon: Package,
              badgeColor: 'bg-blue-100 text-blue-800'
            },
            {
              id: 'entrega',
              label: '2. Entrega',
              desc: 'Entrega técnica no destino final com conferência',
              icon: Truck,
              badgeColor: 'bg-emerald-100 text-emerald-800'
            },
            {
              id: 'transferencia',
              label: '3. Transferência',
              desc: 'Movimentação entre filiais, cross-docking ou armazém',
              icon: RefreshCcw,
              badgeColor: 'bg-purple-100 text-purple-800'
            }
          ].map(proc => {
            const isSelected = selectedProcedure === proc.id;
            const IconComponent = proc.icon;

            return (
              <button
                key={proc.id}
                onClick={() => {
                  setSelectedProcedure(proc.id as any);
                  handleStartInspection(proc.id as any);
                }}
                className={cn(
                  "p-4 rounded-2xl shadow-sm flex items-center justify-between border-2 transition-all text-left group hover:scale-[1.01]",
                  isSelected
                    ? "bg-white border-[#F47920] ring-2 ring-orange-200 shadow-md"
                    : "bg-white border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    isSelected ? "bg-[#F47920] text-white" : "bg-gray-100 text-gray-600 group-hover:bg-orange-50 group-hover:text-[#F47920]"
                  )}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-[#4D4D4D] block">{proc.label}</span>
                    <span className="text-xs text-gray-500 leading-tight block">{proc.desc}</span>
                  </div>
                </div>

                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all",
                  isSelected ? "bg-[#F47920] text-white" : "border-2 border-gray-200 group-hover:border-[#F47920]"
                )}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 text-center">
          💡 <strong>Praticidade:</strong> Todos os dados de documento, endereço, volumes e conferência técnica serão preenchidos diretamente no formulário oficial da vistoria.
        </div>
      </main>

      {/* Footer com Botão de Ação */}
      <footer className="p-4 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => handleStartInspection()}
            className="w-full bg-gradient-to-r from-[#F47920] to-[#E94E1B] hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition text-sm"
          >
            <span>Abrir Formulário de Vistoria ({selectedProcedure.toUpperCase()})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
