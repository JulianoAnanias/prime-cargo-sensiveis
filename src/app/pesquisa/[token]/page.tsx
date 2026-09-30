'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  IPP35_HEADER,
  IPP35_PERGUNTAS,
  RESPOSTA_PESQUISA_LABELS,
} from '@/lib/constants';
import { RespostaPesquisa } from '@/types';
import {
  EmoticonOtimo,
  EmoticonBom,
  EmoticonRegular,
  EmoticonRuim,
} from '@/components/ui/emoticons';

interface PesquisaDados {
  pesquisaId: string;
  minutaDACTe: string;
  nfNumero: string;
  resultadoPesquisa?: string;
  remetenteCliente: string;
  remetenteContato: string;
  remetenteFuncao: string;
  remetenteTelefone: string;
  remetenteData: string;
  destinatarioCliente: string;
  destinatarioContato: string;
  destinatarioFuncao: string;
  destinatarioTelefone: string;
  destinatarioData: string;
  jaRespondida: boolean;
  expirada: boolean;
}

export default function PesquisaPublicaPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<PesquisaDados | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [respostas, setRespostas] = useState<Record<number, RespostaPesquisa>>({});
  const [sugestao, setSugestao] = useState('');
  const [respondidoPor, setRespondidoPor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadPesquisa() {
      try {
        const res = await fetch(`/api/pesquisa/${token}`);
        if (res.status === 410) {
          setError('O prazo para responder esta pesquisa expirou.');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.jaRespondida) setSubmitted(true);
          setDados(data);
        } else {
          // Dados padrão para teste/homologação visual se token não cadastrado
          setDados({
            pesquisaId: 'demo-ipp35',
            minutaDACTe: 'MIN-2026/0489',
            nfNumero: '00084512',
            resultadoPesquisa: 'Uso Exclusivo da Qualidade',
            remetenteCliente: 'Siemens Healthineers Logística',
            remetenteContato: 'Carlos Eduardo Mendes',
            remetenteFuncao: 'Gerente de Expedição',
            remetenteTelefone: '(11) 3908-4500',
            remetenteData: new Date().toLocaleDateString('pt-BR'),
            destinatarioCliente: 'Hospital Israelita Albert Einstein',
            destinatarioContato: 'Dra. Mariana Vasconcellos',
            destinatarioFuncao: 'Coordenação de Recebimento',
            destinatarioTelefone: '(11) 2151-1233',
            destinatarioData: new Date().toLocaleDateString('pt-BR'),
            jaRespondida: false,
            expirada: false,
          });
        }
      } catch {
        // Fallback para visualização de teste
        setDados({
          pesquisaId: 'demo-ipp35',
          minutaDACTe: 'MIN-2026/0489',
          nfNumero: '00084512',
          resultadoPesquisa: 'Uso Exclusivo da Qualidade',
          remetenteCliente: 'Siemens Healthineers Logística',
          remetenteContato: 'Carlos Eduardo Mendes',
          remetenteFuncao: 'Gerente de Expedição',
          remetenteTelefone: '(11) 3908-4500',
          remetenteData: new Date().toLocaleDateString('pt-BR'),
          destinatarioCliente: 'Hospital Israelita Albert Einstein',
          destinatarioContato: 'Dra. Mariana Vasconcellos',
          destinatarioFuncao: 'Coordenação de Recebimento',
          destinatarioTelefone: '(11) 2151-1233',
          destinatarioData: new Date().toLocaleDateString('pt-BR'),
          jaRespondida: false,
          expirada: false,
        });
      } finally {
        setLoading(false);
      }
    }
    loadPesquisa();
  }, [token]);

  const handleSubmit = async () => {
    // Validar 4 respostas obrigatórias
    const faltando = IPP35_PERGUNTAS.filter(p => !respostas[p.numero]);
    if (faltando.length > 0) {
      alert(`Por favor, responda todas as perguntas com as carinhas (Emoticons). Faltam: ${faltando.map(p => `pergunta ${p.numero}`).join(', ')}`);
      return;
    }

    if (!respondidoPor.trim()) {
      alert('Por favor, informe seu nome em "Pesquisa respondida por".');
      return;
    }

    setSubmitting(true);
    try {
      await fetch(`/api/pesquisa/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta1: respostas[1],
          pergunta2: respostas[2],
          pergunta3: respostas[3],
          pergunta4: respostas[4],
          sugestao: sugestao.trim() || undefined,
          respondidaPor: respondidoPor.trim(),
        }),
      });

      setSubmitted(true);
    } catch {
      alert('Erro ao enviar pesquisa. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#F47920] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Carregando pesquisa IPP 35...</p>
        </div>
      </div>
    );
  }

  // --- Erro ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Pesquisa indisponível</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // --- Já respondida ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-gray-100">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#F47920] mb-3">Obrigado!</h2>
          <p className="text-gray-700 font-medium mb-1">
            Sua avaliação foi registrada com sucesso.
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Seu feedback é essencial para aprimorarmos continuamente os serviços de logística sensível da Prime Cargo.
          </p>
          <div className="mt-6 pt-4 border-t flex justify-center">
            <Image src="/logo.jpg" alt="Prime Cargo" width={180} height={70} className="object-contain" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto shadow-xl rounded-2xl overflow-hidden bg-white border border-gray-200">
        
        {/* ═══ CABEÇALHO OFICIAL IPP 35 ═══ */}
        <div className="border-b-2 border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center p-4 bg-white gap-4">
            <div className="md:col-span-3 flex justify-center md:justify-start">
              <Image
                src="/logo.jpg"
                alt="Prime Cargo"
                width={150}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <div className="md:col-span-6 text-center">
              <h1 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
                {IPP35_HEADER.titulo}
              </h1>
              <p className="text-sm font-semibold text-gray-600">
                ({IPP35_HEADER.subtitulo})
              </p>
            </div>
            <div className="md:col-span-3 border-2 border-gray-300 rounded-lg p-2 text-center text-xs font-semibold text-gray-700 bg-gray-50">
              <div className="font-bold text-gray-900 border-b pb-1">{IPP35_HEADER.codigo}</div>
              <div className="pt-1">Revisão: {IPP35_HEADER.revisao}</div>
              <div>Emissão: {IPP35_HEADER.emissao}</div>
            </div>
          </div>

          {/* Faixa de Mensagem */}
          <div className="bg-[#F47920] text-white p-3 text-center">
            <p className="font-extrabold text-xs sm:text-sm uppercase tracking-wide">
              {IPP35_HEADER.mensagem}
            </p>
            <p className="text-[11px] sm:text-xs opacity-95 mt-0.5">
              {IPP35_HEADER.submensagem}
            </p>
          </div>
        </div>

        {/* ═══ DADOS OPERACIONAIS ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b text-xs bg-gray-50">
          <div className="p-3 border-b sm:border-b-0 sm:border-r">
            <span className="font-bold text-gray-600 block">Minuta / DACT-e Nº:</span>
            <span className="text-sm font-semibold text-gray-900">{dados?.minutaDACTe || '—'}</span>
          </div>
          <div className="p-3 border-b sm:border-b-0 sm:border-r">
            <span className="font-bold text-gray-600 block">NF Nº:</span>
            <span className="text-sm font-semibold text-gray-900">{dados?.nfNumero || '—'}</span>
          </div>
          <div className="p-3 bg-amber-50/50">
            <span className="font-bold text-gray-600 block">Resultado da Pesquisa:</span>
            <span className="text-xs italic text-gray-500">(Uso da Qualidade)</span>
          </div>
        </div>

        {/* ═══ REMETENTE & DESTINATÁRIO ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b text-xs divide-y md:divide-y-0 md:divide-x">
          {/* Remetente */}
          <div className="p-4 space-y-1.5">
            <span className="font-black text-gray-800 uppercase tracking-wider block mb-2 text-[11px] border-b pb-1">
              Remetente:
            </span>
            <div className="flex justify-between"><span className="text-gray-500">Cliente:</span><span className="font-medium text-gray-900">{dados?.remetenteCliente}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contato:</span><span className="font-medium text-gray-900">{dados?.remetenteContato}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Função:</span><span className="font-medium text-gray-900">{dados?.remetenteFuncao}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Telefone:</span><span className="font-medium text-gray-900">{dados?.remetenteTelefone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Data:</span><span className="font-medium text-gray-900">{dados?.remetenteData}</span></div>
          </div>

          {/* Destinatário */}
          <div className="p-4 space-y-1.5">
            <span className="font-black text-gray-800 uppercase tracking-wider block mb-2 text-[11px] border-b pb-1">
              Destinatário:
            </span>
            <div className="flex justify-between"><span className="text-gray-500">Cliente:</span><span className="font-medium text-gray-900">{dados?.destinatarioCliente}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contato:</span><span className="font-medium text-gray-900">{dados?.destinatarioContato}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Função:</span><span className="font-medium text-gray-900">{dados?.destinatarioFuncao}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Telefone:</span><span className="font-medium text-gray-900">{dados?.destinatarioTelefone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Data:</span><span className="font-medium text-gray-900">{dados?.destinatarioData}</span></div>
          </div>
        </div>

        {/* ═══ PERGUNTAS COM CARINHAS (EMOTICONS OFICIAIS DO IPP 35) ═══ */}
        <div className="p-4 sm:p-6 space-y-8">
          {IPP35_PERGUNTAS.map(pergunta => (
            <div key={pergunta.numero} className="border-b pb-8 last:border-b-0 last:pb-0">
              <p className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed mb-6">
                <span className="text-[#F47920] mr-1.5">{pergunta.numero}.</span> {pergunta.texto}
              </p>

              {/* Grid das 4 Carinhas Oficiais */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
                
                {/* 1. ÓTIMO (Verde) */}
                <button
                  type="button"
                  onClick={() => setRespostas(prev => ({ ...prev, [pergunta.numero]: RespostaPesquisa.OTIMO }))}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-between border-2 transition-all ${
                    respostas[pergunta.numero] === RespostaPesquisa.OTIMO
                      ? 'border-[#00A859] bg-green-50 shadow-md ring-2 ring-green-300'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <EmoticonOtimo size={54} isSelected={respostas[pergunta.numero] === RespostaPesquisa.OTIMO} />
                  <span className="text-xs sm:text-sm font-bold text-gray-800 mt-2">Ótimo</span>
                  <div className={`w-5 h-5 mt-2 rounded border-2 flex items-center justify-center ${
                    respostas[pergunta.numero] === RespostaPesquisa.OTIMO
                      ? 'border-[#00A859] bg-[#00A859] text-white font-bold text-xs'
                      : 'border-gray-400 bg-white'
                  }`}>
                    {respostas[pergunta.numero] === RespostaPesquisa.OTIMO && '✓'}
                  </div>
                </button>

                {/* 2. BOM (Vermelho/Laranja) */}
                <button
                  type="button"
                  onClick={() => setRespostas(prev => ({ ...prev, [pergunta.numero]: RespostaPesquisa.BOM }))}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-between border-2 transition-all ${
                    respostas[pergunta.numero] === RespostaPesquisa.BOM
                      ? 'border-[#E30613] bg-red-50 shadow-md ring-2 ring-red-300'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <EmoticonBom size={54} isSelected={respostas[pergunta.numero] === RespostaPesquisa.BOM} />
                  <span className="text-xs sm:text-sm font-bold text-gray-800 mt-2">Bom</span>
                  <div className={`w-5 h-5 mt-2 rounded border-2 flex items-center justify-center ${
                    respostas[pergunta.numero] === RespostaPesquisa.BOM
                      ? 'border-[#E30613] bg-[#E30613] text-white font-bold text-xs'
                      : 'border-gray-400 bg-white'
                  }`}>
                    {respostas[pergunta.numero] === RespostaPesquisa.BOM && '✓'}
                  </div>
                </button>

                {/* 3. REGULAR (Amarelo) */}
                <button
                  type="button"
                  onClick={() => setRespostas(prev => ({ ...prev, [pergunta.numero]: RespostaPesquisa.REGULAR }))}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-between border-2 transition-all ${
                    respostas[pergunta.numero] === RespostaPesquisa.REGULAR
                      ? 'border-[#EAB308] bg-yellow-50 shadow-md ring-2 ring-yellow-300'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <EmoticonRegular size={54} isSelected={respostas[pergunta.numero] === RespostaPesquisa.REGULAR} />
                  <span className="text-xs sm:text-sm font-bold text-gray-800 mt-2">Regular</span>
                  <div className={`w-5 h-5 mt-2 rounded border-2 flex items-center justify-center ${
                    respostas[pergunta.numero] === RespostaPesquisa.REGULAR
                      ? 'border-[#EAB308] bg-[#EAB308] text-white font-bold text-xs'
                      : 'border-gray-400 bg-white'
                  }`}>
                    {respostas[pergunta.numero] === RespostaPesquisa.REGULAR && '✓'}
                  </div>
                </button>

                {/* 4. RUIM (Vermelho) */}
                <button
                  type="button"
                  onClick={() => setRespostas(prev => ({ ...prev, [pergunta.numero]: RespostaPesquisa.RUIM }))}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-between border-2 transition-all ${
                    respostas[pergunta.numero] === RespostaPesquisa.RUIM
                      ? 'border-[#E30613] bg-red-50 shadow-md ring-2 ring-red-300'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <EmoticonRuim size={54} isSelected={respostas[pergunta.numero] === RespostaPesquisa.RUIM} />
                  <span className="text-xs sm:text-sm font-bold text-gray-800 mt-2">Ruim</span>
                  <div className={`w-5 h-5 mt-2 rounded border-2 flex items-center justify-center ${
                    respostas[pergunta.numero] === RespostaPesquisa.RUIM
                      ? 'border-[#E30613] bg-[#E30613] text-white font-bold text-xs'
                      : 'border-gray-400 bg-white'
                  }`}>
                    {respostas[pergunta.numero] === RespostaPesquisa.RUIM && '✓'}
                  </div>
                </button>

              </div>
            </div>
          ))}

          {/* ═══ SUGESTÃO ═══ */}
          <div className="pt-2">
            <label className="block font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">
              Sugestão:
            </label>
            <textarea
              value={sugestao}
              onChange={(e) => setSugestao(e.target.value)}
              placeholder="Digite aqui elogios, críticas ou sugestões de melhoria (opcional)"
              className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm focus:border-[#F47920] focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* ═══ RESPONSÁVEIS (IPP 35) ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Respondido por Cliente */}
            <div className="p-3 bg-gray-50 rounded-xl border">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Pesquisa respondida por: (Cliente) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={respondidoPor}
                onChange={(e) => setRespondidoPor(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                required
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Data: {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Realizado por Prime */}
            <div className="p-3 bg-gray-50 rounded-xl border">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Pesquisa realizada por: (Prime Cargo)
              </label>
              <input
                type="text"
                value="Qualidade Prime Cargo"
                disabled
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-100 text-gray-600"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Data: {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Botão Enviar */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-[#F47920] hover:bg-[#E94E1B] disabled:opacity-60 text-white font-extrabold text-base sm:text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
              Enviar Avaliação
            </button>
          </div>
        </div>

        {/* Rodapé Oficial */}
        <div className="p-4 bg-gray-50 border-t text-center text-[11px] text-gray-500 space-y-0.5">
          <p className="font-semibold text-gray-700">{IPP35_HEADER.elaboradoPor}</p>
          <p>Procedimento de Origem: {IPP35_HEADER.procedimentoOrigem}</p>
        </div>

      </div>
    </div>
  );
}
