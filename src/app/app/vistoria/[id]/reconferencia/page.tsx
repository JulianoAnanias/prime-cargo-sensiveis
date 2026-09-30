'use client';

import { useState } from 'react';
import { ArrowLeft, Camera, CheckCircle, AlertTriangle, FileSignature, X, Upload } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { SITUACAO_NC_LABELS, FINALIDADE_ASSINATURA_LABELS } from '@/lib/constants';
import { AssinaturaPad } from '@/components/features/signature-pad';

interface NCItem {
  id: string;
  titulo: string;
  etapaOrigem: string;
  status: 'permanece' | 'resolvida' | 'agravou' | 'nao_verificavel';
  justificativa?: string;
  fotoUrl?: string;
  acaoObservacao?: string;
}

export default function ReconferenciaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [ncs, setNcs] = useState<NCItem[]>([
    {
      id: 'nc-01',
      titulo: 'Embalagem de Papelão com amassado na quina superior direita',
      etapaOrigem: 'Registrada na Coleta (28/09/2026)',
      status: 'permanece',
      acaoObservacao: 'Acondicionamento reforçado com filme stretch',
      fotoUrl: '/logo.jpg',
    },
  ]);

  const [clienteAssinatura, setClienteAssinatura] = useState<{
    signatureDataUrl: string;
    name: string;
    document: string;
  } | null>(null);

  const [modalAssinaturaOpen, setModalAssinaturaOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = (ncId: string, newStatus: any) => {
    setNcs(prev => prev.map(nc => nc.id === ncId ? { ...nc, status: newStatus } : nc));
  };

  const handleJustificativaChange = (ncId: string, val: string) => {
    setNcs(prev => prev.map(nc => nc.id === ncId ? { ...nc, justificativa: val } : nc));
  };

  const handleFinalizar = () => {
    // Valida se alguma NC está como 'nao_verificavel' sem justificativa
    const pendenteJustificativa = ncs.find(nc => nc.status === 'nao_verificavel' && !nc.justificativa?.trim());
    if (pendenteJustificativa) {
      alert('Por favor, informe a justificativa para o item marcado como "Não foi possível verificar".');
      return;
    }

    if (!clienteAssinatura) {
      alert('A assinatura de Ciência das Não Conformidades pelo cliente é obrigatória para concluir a reconferência.');
      setModalAssinaturaOpen(true);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert('✅ Reconferência e Ciência de Não Conformidades salvas com sucesso!');
      router.push(`/app/vistoria/${id}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-gray-800">
              Reconferência de NC (Check Duplo)
            </h1>
            <p className="text-xs text-gray-500">
              Atendimento #{id} — Ciência de Avarias
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Procedimento Obrigatório (IPP 41):</span>
            <p className="leading-relaxed">
              Como foram identificadas avarias ou não conformidades nas etapas anteriores, é obrigatório reavaliar cada item e coletar a <strong>segunda assinatura do cliente</strong> dando ciência formal.
            </p>
          </div>
        </div>

        {/* Lista de Não Conformidades */}
        {ncs.map((nc, idx) => (
          <div key={nc.id} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  Não Conformidade #{idx + 1}
                </span>
                <h3 className="font-bold text-gray-800 text-sm mt-1">{nc.titulo}</h3>
                <span className="text-xs text-gray-500">{nc.etapaOrigem}</span>
              </div>
            </div>

            {/* Foto de Evidência */}
            {nc.fotoUrl && (
              <div>
                <span className="text-xs font-semibold text-gray-600 block mb-1">Foto da Evidência Anterior:</span>
                <img
                  src={nc.fotoUrl}
                  alt="Evidência"
                  className="w-full h-32 object-contain bg-gray-50 rounded-xl border p-2"
                />
              </div>
            )}

            {/* Seletor de Situação Atual da NC */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                Situação Atual desta Avaria:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'permanece', label: 'Permanece', color: 'border-yellow-500 bg-yellow-50 text-yellow-800' },
                  { value: 'resolvida', label: 'Foi Resolvida', color: 'border-green-500 bg-green-50 text-green-800' },
                  { value: 'agravou', label: 'Se Agravou', color: 'border-red-500 bg-red-50 text-red-800' },
                  { value: 'nao_verificavel', label: 'Não foi possível verificar', color: 'border-gray-500 bg-gray-100 text-gray-800' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusChange(nc.id, opt.value)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                      nc.status === opt.value
                        ? `${opt.color} shadow-sm ring-1 ring-offset-1`
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Justificativa obrigatória se não foi possível verificar */}
            {nc.status === 'nao_verificavel' && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <label className="block text-xs font-bold text-red-900 mb-1">
                  Justificativa Obrigatória: <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={nc.justificativa || ''}
                  onChange={(e) => handleJustificativaChange(nc.id, e.target.value)}
                  placeholder="Explique o motivo pelo qual não foi possível verificar esta avaria..."
                  className="w-full border border-red-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  rows={2}
                />
              </div>
            )}
          </div>
        ))}

        {/* Seção da Segunda Assinatura do Cliente */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-[#F47920]" />
              {FINALIDADE_ASSINATURA_LABELS.ciencia_nc}
            </span>
            {clienteAssinatura ? (
              <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Assinado
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                Obrigatório
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border">
            &ldquo;Declaro estar ciente das não conformidades e avarias acima descritas registradas no equipamento/produto durante a inspeção.&rdquo;
          </p>

          {clienteAssinatura ? (
            <div className="bg-gray-50 p-3 rounded-xl border flex items-center justify-between">
              <div>
                <img
                  src={clienteAssinatura.signatureDataUrl}
                  alt="Assinatura Cliente"
                  className="h-10 object-contain mb-1"
                />
                <p className="text-xs font-bold text-gray-800">{clienteAssinatura.name}</p>
                <p className="text-[10px] text-gray-500">Doc: {clienteAssinatura.document || 'Não informado'}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalAssinaturaOpen(true)}
                className="text-xs text-[#F47920] underline font-bold"
              >
                Refazer
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setModalAssinaturaOpen(true)}
              className="w-full py-3.5 border-2 border-dashed border-[#F47920] hover:bg-orange-50 text-[#F47920] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <FileSignature className="w-4 h-4" />
              Coletar Assinatura de Ciência do Cliente
            </button>
          )}
        </div>

        {/* Botão de Finalização */}
        <button
          type="button"
          onClick={handleFinalizar}
          disabled={submitting}
          className="w-full py-4 bg-[#F47920] hover:bg-[#E94E1B] text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Concluir Reconferência de NC
        </button>
      </main>

      {/* Modal de Assinatura */}
      {modalAssinaturaOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Assinatura: Ciência de Não Conformidade</h3>
              <button
                type="button"
                onClick={() => setModalAssinaturaOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <AssinaturaPad
                purpose="ciencia_nc"
                agreementText="Declaro estar ciente e de pleno acordo com as não conformidades registradas nesta vistoria."
                onSave={(sigData) => {
                  setClienteAssinatura(sigData);
                  setModalAssinaturaOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
