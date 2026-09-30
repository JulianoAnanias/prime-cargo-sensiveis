'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Sparkles, 
  Users, 
  ArrowUpRight, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

export default function AdminDashboard() {
  const kpis = [
    { title: 'Vistorias Concluídas Hoje', value: '8', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { title: 'Em Rota / Andamento', value: '4', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { title: 'Reconferências Pendentes', value: '2', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { title: 'Alertas de Qualidade (IA)', value: '1', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  ];

  const secondaryCards = [
    { title: 'Aguardando Próxima Etapa', count: 5 },
    { title: 'Entregas Parciais Registradas', count: 1 },
    { title: 'Documentos e Fotos no SharePoint', count: '100% OK' },
    { title: 'Taxa de Conformidade IPP 41', count: '96.4%' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Cabeçalho da Gestão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#4D4D4D]">
            Painel Executivo da Gestão
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Indicadores de Desempenho, Qualidade e Rastreabilidade Operacional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/operacoes"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F47920] hover:bg-[#E94E1B] text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Ver Todas as Operações</span>
          </Link>
        </div>
      </div>

      {/* Cards de Destaque (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border ${kpi.border} flex items-center justify-between`}>
              <div>
                <p className="text-xs font-bold text-gray-500">{kpi.title}</p>
                <p className="text-2xl font-black text-[#4D4D4D] mt-1">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel Central: Operações Recentes + Alertas de Qualidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Acompanhamento de Atividades */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#4D4D4D]">Atividades Recentes & Baixas com GPS</h2>
              <p className="text-xs text-gray-400">Últimos atendimentos concluídos pela equipe em campo</p>
            </div>
            <Link href="/admin/operacoes" className="text-xs font-bold text-[#F47920] hover:underline flex items-center gap-1">
              Ver mapa completo <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 mt-2">
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <div>
                  <p className="text-xs font-bold text-gray-800">Hospital Israelita Albert Einstein (NF 00084512)</p>
                  <p className="text-[11px] text-gray-500">Baixa registrada com GPS às 14:30 • Responsável: João Motorista</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Concluída
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <div>
                  <p className="text-xs font-bold text-gray-800">Siemens Healthineers Brasil (Coleta COL-2026/091)</p>
                  <p className="text-[11px] text-gray-500">Equipamento sensível coletado e conferido • Em trânsito para base</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Em Rota
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <div>
                  <p className="text-xs font-bold text-gray-800">Philips Medical Systems (CT-e 00019284)</p>
                  <p className="text-[11px] text-gray-500">Transferência entre veículos agendada para 17:30</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Agendada
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 3: Auditoria IA & Qualidade */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-[#4D4D4D]">Auditoria IA (Gemini 3.5)</h3>
            </div>
            <p className="text-xs text-gray-500">
              Diagnóstico automatizado das pesquisas IPP 35 respondidas pelos clientes.
            </p>

            <div className="mt-4 p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  Última Auditoria
                </span>
                <span className="text-xs font-bold text-emerald-700">Sentimento: Positivo</span>
              </div>
              <p className="text-xs text-purple-950 font-medium">
                "Avaliação de excelência do cliente com destaque especial ao cuidado extremo da equipe no manuseio da rampa hidráulica."
              </p>
            </div>
          </div>

          <Link
            href="/admin/qualidade"
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl text-center shadow-sm transition"
          >
            Acessar Módulo de Qualidade →
          </Link>
        </div>

      </div>

      {/* Indicadores Secundários */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {secondaryCards.map((c, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 font-semibold">{c.title}</p>
            <p className="text-lg font-black text-[#4D4D4D] mt-1">{c.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
