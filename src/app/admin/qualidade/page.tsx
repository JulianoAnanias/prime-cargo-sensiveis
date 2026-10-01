'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';
import { EmoticonOtimo, EmoticonBom, EmoticonRegular, EmoticonRuim } from '@/components/ui/emoticons';

interface PesquisaItem {
  id: string;
  cliente: string;
  documento: string;
  data: string;
  respostas: {
    atendimento: string;
    veiculos: string;
    prazos: string;
    geral: string;
  };
  observacoes: string;
  analiseIA?: {
    resumo: string;
    temas: string[];
    pontosAtencao: string[];
    acoesSugeridas: string[];
    classificacaoSentimento: 'Positivo' | 'Neutro' | 'Negativo';
  };
}

const mockPesquisas: PesquisaItem[] = [
  {
    id: 'pq-001',
    cliente: 'Hospital Santa Cruz - Equipamentos Diagnósticos',
    documento: 'NF 10452',
    data: '29/09/2026',
    respostas: {
      atendimento: 'otimo',
      veiculos: 'bom',
      prazos: 'otimo',
      geral: 'otimo'
    },
    observacoes: 'Motorista muito atencioso no descarregamento do equipamento sensível. Cuidado extremo com a rampa hidráulica. Apenas pedimos envio do comprovante mais rápido.',
  },
  {
    id: 'pq-002',
    cliente: 'Laboratório Central Diagnósticos',
    documento: 'NF 10448',
    data: '28/09/2026',
    respostas: {
      atendimento: 'bom',
      veiculos: 'regular',
      prazos: 'ruim',
      geral: 'regular'
    },
    observacoes: 'Houve atraso de 1h30min na entrega devido ao trânsito na chegada, e a equipe teve que aguardar. Equipamento chegou íntegro e sem avarias.',
  }
];

export default function AdminQualidade() {
  const [activeTab, setActiveTab] = useState<'pesquisas' | 'ia' | 'alertas'>('pesquisas');
  const [pesquisas, setPesquisas] = useState<PesquisaItem[]>(mockPesquisas);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const executarAnaliseIA = async (item: PesquisaItem) => {
    setAnalyzingId(item.id);
    try {
      const payloadText = `Cliente: ${item.cliente}. Documento: ${item.documento}. Respostas: Atendimento: ${item.respostas.atendimento}; Conservação Veicular: ${item.respostas.veiculos}; Prazos e Cuidado: ${item.respostas.prazos}; Geral: ${item.respostas.geral}. Observação do cliente: "${item.observacoes}".`;
      
      const res = await fetch('/api/analise-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payloadText })
      });

      if (!res.ok) throw new Error('Falha ao processar análise inteligente');
      const data = await res.json();
      
      setPesquisas(prev => prev.map(p => p.id === item.id ? { ...p, analiseIA: data.data } : p));
      setActiveTab('ia');
    } catch (err: any) {
      alert(`Erro na análise: ${err.message}`);
    } finally {
      setAnalyzingId(null);
    }
  };

  const getEmoticonMini = (tipo: string) => {
    switch (tipo) {
      case 'otimo': return <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold"><EmoticonOtimo className="w-5 h-5 inline" /> Ótimo</div>;
      case 'bom': return <div className="flex items-center gap-1 text-orange-600 text-xs font-semibold"><EmoticonBom className="w-5 h-5 inline" /> Bom</div>;
      case 'regular': return <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold"><EmoticonRegular className="w-5 h-5 inline" /> Regular</div>;
      case 'ruim': return <div className="flex items-center gap-1 text-red-600 text-xs font-semibold"><EmoticonRuim className="w-5 h-5 inline" /> Ruim</div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-16">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#4D4D4D] flex items-center gap-2">
                Gestão da Qualidade & Auditoria IA
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auditoria IA Ativa
                </span>
              </h1>
              <p className="text-xs text-gray-500">IPP 35 - Pesquisa sobre Serviço Prestado e Análise Inteligente</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Navegação por Abas */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
          <button 
            onClick={() => setActiveTab('pesquisas')} 
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'pesquisas' 
                ? 'border-[#F47920] text-[#F47920]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Pesquisas Respondidas (IPP 35)
          </button>
          <button 
            onClick={() => setActiveTab('ia')} 
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ia' 
                ? 'border-[#F47920] text-[#F47920]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Análises de IA
          </button>
          <button 
            onClick={() => setActiveTab('alertas')} 
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'alertas' 
                ? 'border-[#F47920] text-[#F47920]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚠️ Alertas & Ações Corretivas
          </button>
        </div>

        {/* Tab 1: Pesquisas IPP 35 */}
        {activeTab === 'pesquisas' && (
          <div className="space-y-4">
            {pesquisas.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-[#F47920] bg-orange-50 px-2 py-0.5 rounded">{item.documento}</span>
                    <h2 className="text-base font-bold text-[#4D4D4D] mt-1">{item.cliente}</h2>
                    <span className="text-xs text-gray-500">Respondido em {item.data}</span>
                  </div>

                  <button
                    onClick={() => executarAnaliseIA(item)}
                    disabled={analyzingId === item.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-sm disabled:opacity-50"
                  >
                    {analyzingId === item.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Analisando com IA...
                      </>
                    ) : item.analiseIA ? (
                      <>
                        <Sparkles className="w-4 h-4" /> Reanalisar com IA
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Analisar com IA
                      </>
                    )}
                  </button>
                </div>

                {/* Respostas IPP 35 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">1. Equipe / Uniformes</p>
                    {getEmoticonMini(item.respostas.atendimento)}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">2. Veículos Adequados</p>
                    {getEmoticonMini(item.respostas.veiculos)}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">3. Prazos & Cuidados</p>
                    {getEmoticonMini(item.respostas.prazos)}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">4. Classificação Geral</p>
                    {getEmoticonMini(item.respostas.geral)}
                  </div>
                </div>

                {item.observacoes && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-[#4D4D4D]">
                    <span className="font-bold text-amber-900 block mb-0.5">Comentário do Cliente:</span>
                    "{item.observacoes}"
                  </div>
                )}

                {item.analiseIA && (
                  <div className="mt-4 p-4 bg-purple-50/70 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-700" />
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                        Diagnóstico da IA: {item.analiseIA.classificacaoSentimento}
                      </span>
                    </div>
                    <p className="text-xs text-purple-950 font-medium">{item.analiseIA.resumo}</p>
                    <button
                      onClick={() => setActiveTab('ia')}
                      className="mt-2 text-xs font-bold text-purple-700 hover:text-purple-900 underline"
                    >
                      Ver auditoria detalhada completa →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Análises de IA */}
        {activeTab === 'ia' && (
          <div className="space-y-6">
            {pesquisas.filter(p => p.analiseIA).length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#4D4D4D]">Nenhuma análise executada ainda</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                  Clique na aba "Pesquisas Respondidas" e selecione "Analisar com IA" em qualquer pesquisa para gerar um relatório inteligente em tempo real.
                </p>
              </div>
            ) : (
              pesquisas.filter(p => p.analiseIA).map((item) => {
                const ia = item.analiseIA!;
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          Auditoria IA Especializada
                        </span>
                        <h2 className="text-base font-bold text-[#4D4D4D] mt-1">{item.cliente} ({item.documento})</h2>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ia.classificacaoSentimento === 'Positivo' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : ia.classificacaoSentimento === 'Negativo'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Sentimento: {ia.classificacaoSentimento}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Resumo Executivo</h4>
                      <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200 font-medium">
                        {ia.resumo}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                        <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                          <ThumbsUp className="w-4 h-4 text-blue-600" /> Temas Identificados
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {ia.temas.map((t, idx) => (
                            <span key={idx} className="bg-white text-blue-800 border border-blue-200 text-xs px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
                        <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Pontos de Atenção
                        </h4>
                        <ul className="text-xs text-amber-900 space-y-1">
                          {ia.pontosAtencao.length > 0 ? (
                            ia.pontosAtencao.map((pa, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span>•</span> <span>{pa}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-emerald-700 font-medium">Nenhum ponto crítico detectado</li>
                          )}
                        </ul>
                      </div>

                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                        <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ações Recomendadas
                        </h4>
                        <ul className="text-xs text-emerald-900 space-y-1">
                          {ia.acoesSugeridas.map((as, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span>✓</span> <span>{as}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Alertas */}
        {activeTab === 'alertas' && (
          <div className="space-y-4">
            <div className="p-4 border rounded-xl border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-amber-900">Alerta de Pontualidade: Laboratório Central (NF 10448)</h3>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                Cliente avaliou prazos como "Ruim" e geral como "Regular" devido a atraso de 1h30min. Recomenda-se alinhamento prévio com a equipe de tráfego.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
