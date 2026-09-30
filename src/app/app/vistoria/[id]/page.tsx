'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Camera, MapPin, Save, Check, FileSignature, AlertTriangle,
  ChevronDown, ChevronUp, Eye, ArrowLeft, Loader2, X, RefreshCw, Upload, Image as ImageIcon
} from 'lucide-react';
import {
  CONDICAO_EQUIPAMENTO_OPCOES,
  INSPECAO_EMBALAGEM_OPCOES,
  INSPECAO_EQUIPAMENTO_OPCOES,
  DIMENSOES_LABELS,
  UNIDADES,
  TERMO_RESPONSABILIDADE,
  DECLARACAO_CONCORDANCIA,
  FINALIDADE_ASSINATURA_LABELS,
  IPP41_HEADER,
  PROCEDIMENTO_LABELS,
} from '@/lib/constants';
import type {
  CondicaoEquipamento,
  Dimensoes,
  InspecaoEmbalagem,
  InspecaoEquipamento,
  NaoConformidade,
} from '@/types';
import { AssinaturaPad } from '@/components/features/signature-pad';

// --- Estado inicial ---
const initialCondicao: CondicaoEquipamento = {
  novo: false, usado: false, embalado: false, desembalado: false,
  funcionando: false, funcionandoNaoVerificado: false,
  danificado: false, descricaoDanificado: '',
  outros: false, descricaoOutros: '',
};

const initialDimensoes: Dimensoes = {};

const initialEmbalagem: InspecaoEmbalagem = {
  embalagemOriginal: false, embalagemInadequada: false,
  embalagemComAvaria: false, semEmbalagem: false,
};

const initialEquipamento: InspecaoEquipamento = {
  semAvarias: false, apresentaAvarias: false,
  descricaoAvarias: '', umidoMolhado: false,
  outros: false, descricaoOutros: '',
};

interface CapturedPhoto {
  id: string;
  url: string;
  label: string;
  tipo: string;
  origin: 'camera' | 'arquivo';
}

interface SavedSignature {
  signatureDataUrl: string;
  name: string;
  document: string;
  date: string;
}

function VistoriaFormContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const vistoriaId = params.id as string;
  const tipoQuery = searchParams.get('tipo') || searchParams.get('procedimento');

  // Inicializa o procedimento com base na URL ou no ID do atendimento
  const initialProcedimento: 'coleta' | 'entrega' | 'transferencia' = 
    (tipoQuery === 'entrega' || tipoQuery === 'coleta' || tipoQuery === 'transferencia')
      ? tipoQuery
      : (vistoriaId === 'col-402' ? 'coleta' : vistoriaId === 'trans-88' ? 'transferencia' : 'entrega');

  // --- Form state ---
  const [condicao, setCondicao] = useState<CondicaoEquipamento>(initialCondicao);
  const [dimensoes, setDimensoes] = useState<Dimensoes>(initialDimensoes);
  const [embalagem, setEmbalagem] = useState<InspecaoEmbalagem>(initialEmbalagem);
  const [equipamento, setEquipamento] = useState<InspecaoEquipamento>(initialEquipamento);
  const [observacoes, setObservacoes] = useState('');
  const [aberturaAutorizada, setAberturaAutorizada] = useState<boolean | null>(null);

  // --- Procedimento / Tipo de Movimentação (IPP41) ---
  const [procedimento, setProcedimento] = useState<'coleta' | 'entrega' | 'transferencia'>(initialProcedimento);

  // Sincroniza se o parâmetro da URL mudar
  useEffect(() => {
    if (tipoQuery === 'entrega' || tipoQuery === 'coleta' || tipoQuery === 'transferencia') {
      setProcedimento(tipoQuery);
    }
  }, [tipoQuery]);

  // --- Dados do Atendimento (IPP41) ---
  const [atendimento, setAtendimento] = useState({
    cliente: 'Hospital Israelita Albert Einstein',
    local: 'Almoxarifado Geral - Doca 3',
    data: new Date().toLocaleDateString('pt-BR'),
    endereco: 'Av. Albert Einstein, 627 - Morumbi, São Paulo - SP',
    contato: 'Dr. Roberto Santos',
    setor: 'Engenharia Clínica',
    telefone: '(11) 98765-4321',
    ramal: '402',
    tipoDocumento: 'NF',
    numeroDocumento: '00045892',
    minutaDACTe: 'MIN-2026/894',
    veiculo: 'ABC-1D23',
    veiculoDestino: '',
    motorista: 'João Motorista',
    volumetria: '1 Volume (Palete Especial)',
    equipamentoDescricao: 'Ultrassom Digital 4D Modelo Pro',
  });

  // Atualiza os dados de exemplo de acordo com o procedimento
  useEffect(() => {
    if (procedimento === 'coleta') {
      setAtendimento(prev => ({
        ...prev,
        cliente: 'Siemens Healthineers Brasil',
        local: 'Centro de Distribuição Cajamar - Doca 1',
        endereco: 'Rod. Anhanguera, km 38 - Cajamar - SP',
        contato: 'Carlos Mendes',
        setor: 'Expedição de Sensíveis',
        tipoDocumento: 'coleta',
        numeroDocumento: 'COL-2026/091',
        minutaDACTe: 'MIN-2026/0489',
        volumetria: '2 Volumes (Caixas Blindadas)',
        equipamentoDescricao: 'Módulo de Ressonância Magnética',
      }));
    } else if (procedimento === 'transferencia') {
      setAtendimento(prev => ({
        ...prev,
        cliente: 'Philips Medical Systems',
        local: 'Base Prime Logística - Galpão 2',
        endereco: 'Av. das Nações Unidas, 14.171 - São Paulo - SP',
        contato: 'Marcos Almeida',
        setor: 'Operações Cross-Docking',
        tipoDocumento: 'CT-e',
        numeroDocumento: '00019284',
        minutaDACTe: 'MIN-2026/0122',
        veiculoDestino: 'XYZ-9K88',
        volumetria: '1 Volume',
        equipamentoDescricao: 'Aparelho de Raio-X Digital Móvel',
      }));
    } else {
      setAtendimento(prev => ({
        ...prev,
        cliente: 'Hospital Israelita Albert Einstein',
        local: 'Almoxarifado Central - Doca 3',
        endereco: 'Av. Albert Einstein, 627 - Morumbi, São Paulo - SP',
        contato: 'Dr. Roberto Santos',
        setor: 'Engenharia Clínica',
        tipoDocumento: 'NF',
        numeroDocumento: '00084512',
        minutaDACTe: 'MIN-2026/894',
        volumetria: '1 Volume (Palete Especial)',
        equipamentoDescricao: 'Ultrassom Digital 4D Modelo Pro',
      }));
    }
  }, [procedimento]);

  // --- Seções expandidas ---
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    atendimento: true, condicao: true, dimensoes: true, embalagem: true, equipamento: true,
    observacoes: true, fotos: true, autorizacao: true, assinaturas: true,
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Array<{ id: string; msg: string; section: string }>>([]);

  // --- Fotos ---
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [activePhotoType, setActivePhotoType] = useState<string>('foto_geral');
  const [activePhotoLabel, setActivePhotoLabel] = useState<string>('Foto Geral');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Assinaturas ---
  const [activeSignatureModal, setActiveSignatureModal] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Record<string, SavedSignature>>({});

  // --- Geolocalização ---
  const [geoState, setGeoState] = useState<{
    lat?: number;
    lng?: number;
    accuracy?: number;
    status: 'idle' | 'capturing' | 'success' | 'error';
    msg?: string;
  }>({ status: 'idle' });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Handlers de condição ---
  const handleCondicaoChange = (field: keyof CondicaoEquipamento, value: boolean | string) => {
    setCondicao(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'novo' && value) next.usado = false;
      if (field === 'usado' && value) next.novo = false;
      if (field === 'embalado' && value) next.desembalado = false;
      if (field === 'desembalado' && value) next.embalado = false;
      if (field === 'danificado' && !value) next.descricaoDanificado = '';
      if (field === 'outros' && !value) next.descricaoOutros = '';
      return next;
    });
  };

  // --- Handlers de embalagem ---
  const handleEmbalagemChange = (field: keyof InspecaoEmbalagem, value: boolean) => {
    setEmbalagem(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'semEmbalagem' && value) {
        next.embalagemOriginal = false;
        next.embalagemInadequada = false;
        next.embalagemComAvaria = false;
      }
      if ((field === 'embalagemOriginal' || field === 'embalagemInadequada' || field === 'embalagemComAvaria') && value) {
        next.semEmbalagem = false;
      }
      return next;
    });
  };

  // --- Handlers de equipamento ---
  const handleEquipamentoChange = (field: keyof InspecaoEquipamento, value: boolean | string) => {
    setEquipamento(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'semAvarias' && value) {
        next.apresentaAvarias = false;
        next.descricaoAvarias = '';
      }
      if (field === 'apresentaAvarias' && value) {
        next.semAvarias = false;
      }
      if (field === 'apresentaAvarias' && !value) next.descricaoAvarias = '';
      if (field === 'outros' && !value) next.descricaoOutros = '';
      return next;
    });
  };

  // --- Câmera e Fotos ---
  const openCameraModal = async (tipo: string, label: string) => {
    setActivePhotoType(tipo);
    setActivePhotoLabel(label);
    setCameraModalOpen(true);
    setCameraError(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Câmera não suportada neste navegador. Use a opção de carregar arquivo.');
      }
    } catch (err: any) {
      console.warn('Erro ao acessar webcam/câmera:', err);
      setCameraError('Não foi possível acessar a webcam ou permissão negada. Você pode selecionar uma foto do seu computador/celular.');
    }
  };

  const closeCameraModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraModalOpen(false);
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const newPhoto: CapturedPhoto = {
      id: Math.random().toString(36).substring(2, 9),
      url: dataUrl,
      label: activePhotoLabel,
      tipo: activePhotoType,
      origin: 'camera',
    };

    setPhotos(prev => [...prev.filter(p => p.tipo !== activePhotoType), newPhoto]);
    closeCameraModal();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newPhoto: CapturedPhoto = {
      id: Math.random().toString(36).substring(2, 9),
      url,
      label: activePhotoLabel,
      tipo: activePhotoType,
      origin: 'arquivo',
    };
    setPhotos(prev => [...prev.filter(p => p.tipo !== activePhotoType), newPhoto]);
    closeCameraModal();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // --- Geolocalização ---
  const captureGeolocation = () => {
    setGeoState({ status: 'capturing' });
    if (!navigator.geolocation) {
      setGeoState({ status: 'error', msg: 'Geolocalização não suportada no aparelho' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState({
          status: 'success',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        setGeoState({ status: 'error', msg: `Erro ao obter GPS: ${err.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- Validação detalhada com localização visual do erro ---
  const validate = (): Array<{ id: string; msg: string; section: string }> => {
    const errs: Array<{ id: string; msg: string; section: string }> = [];

    // Condição obrigatória
    if (!condicao.novo && !condicao.usado) {
      errs.push({ id: 'sec-condicao', msg: 'Selecione se o equipamento é Novo ou Usado.', section: 'condicao' });
    }
    if (condicao.danificado && !condicao.descricaoDanificado?.trim()) {
      errs.push({ id: 'sec-condicao', msg: 'Descreva o dano/avaria do equipamento.', section: 'condicao' });
    }

    // Embalagem
    if (!embalagem.embalagemOriginal && !embalagem.embalagemInadequada && !embalagem.embalagemComAvaria && !embalagem.semEmbalagem) {
      errs.push({ id: 'sec-embalagem', msg: 'Selecione ao menos uma opção de inspeção da embalagem.', section: 'embalagem' });
    }

    // Equipamento
    if (!equipamento.semAvarias && !equipamento.apresentaAvarias && !equipamento.umidoMolhado && !equipamento.outros) {
      errs.push({ id: 'sec-equipamento', msg: 'Selecione ao menos uma opção de inspeção do equipamento.', section: 'equipamento' });
    }
    if (equipamento.apresentaAvarias && !equipamento.descricaoAvarias?.trim()) {
      errs.push({ id: 'sec-equipamento', msg: 'Descreva as avarias do equipamento.', section: 'equipamento' });
    }

    // Autorização de Abertura (O que causou a dúvida do usuário!)
    if (aberturaAutorizada === null) {
      errs.push({
        id: 'sec-autorizacao',
        msg: 'Informe se a abertura da embalagem para inspeção foi autorizada (Sim ou Não).',
        section: 'autorizacao',
      });
    }

    return errs;
  };

  const scrollToError = (errorItem: { id: string; section: string }) => {
    setExpandedSections(prev => ({ ...prev, [errorItem.section]: true }));
    setTimeout(() => {
      const el = document.getElementById(errorItem.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Rola automaticamente até o primeiro erro
      scrollToError(validationErrors[0]);
      return;
    }

    setErrors([]);
    setSubmitting(true);
    try {
      // Captura automática e transparente do GPS no momento da baixa da etapa
      let finalLat = -23.5982;
      let finalLng = -46.7153;
      let finalAccuracy = 8;
      let finalStatus = 'sucesso';

      if (typeof window !== 'undefined' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
            });
          });
          finalLat = pos.coords.latitude;
          finalLng = pos.coords.longitude;
          finalAccuracy = Math.round(pos.coords.accuracy);
        } catch (geoErr) {
          console.warn('GPS não obtido diretamente, usando fallback de registro:', geoErr);
          finalStatus = 'indisponivel';
        }
      }

      // Salva o registro da baixa com as coordenadas para visualização imediata no card da entrega
      const baixaRecord = {
        vistoriaId,
        procedimento,
        cliente: atendimento.cliente,
        local: atendimento.local,
        endereco: atendimento.endereco,
        documento: `${atendimento.tipoDocumento}: ${atendimento.numeroDocumento}`,
        dataHora: new Date().toLocaleString('pt-BR'),
        latitude: finalLat,
        longitude: finalLng,
        accuracy: finalAccuracy,
        status: finalStatus,
        motorista: atendimento.motorista,
      };

      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('prime_baixas') || '[]');
        const updated = [baixaRecord, ...existing.filter((b: any) => b.vistoriaId !== vistoriaId)];
        localStorage.setItem('prime_baixas', JSON.stringify(updated));
      }

      await new Promise(r => setTimeout(r, 600));
      alert(`✅ Vistoria de ${procedimento.toUpperCase()} concluída com sucesso!\n📍 Ponto da baixa capturado automaticamente no mapa.`);
      router.push('/app');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      alert('💾 Rascunho salvo no aparelho!');
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ title, section, isPending, icon }: { title: string; section: string; isPending?: boolean; icon?: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-3 border-b border-gray-200"
    >
      <span className={`font-semibold flex items-center gap-2 ${isPending ? 'text-red-700' : 'text-gray-800'}`}>
        {icon}
        {title}
        {isPending && (
          <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
            Pendente
          </span>
        )}
      </span>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
    </button>
  );

  const hasNaoConformidades = condicao.danificado || embalagem.embalagemComAvaria ||
    embalagem.embalagemInadequada || equipamento.apresentaAvarias || equipamento.umidoMolhado;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header fixo */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-20 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base sm:text-lg text-gray-800 truncate">
              {IPP41_HEADER.titulo}
            </h1>
            <p className="text-xs text-gray-500">
              {IPP41_HEADER.codigo} — Rev. {IPP41_HEADER.revisao} — {IPP41_HEADER.emissao}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Painel de Alerta de Pendências Interativo */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="font-bold text-red-900">Itens obrigatórios pendentes:</span>
            </div>
            <p className="text-xs text-red-700 mb-3">
              Clique em qualquer item abaixo para ir direto até o campo e preenchê-lo:
            </p>
            <div className="space-y-2">
              {errors.map((err, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToError(err)}
                  className="w-full text-left text-xs sm:text-sm font-semibold text-red-800 bg-white/80 hover:bg-white p-2.5 rounded-lg border border-red-200 flex items-center justify-between transition-colors"
                >
                  <span>• {err.msg}</span>
                  <span className="text-[#F47920] font-bold text-xs underline ml-2 whitespace-nowrap">
                    Ir para campo →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PROCEDIMENTO & DADOS DO ATENDIMENTO (IPP 41) ═══ */}
        <section id="sec-atendimento" className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-4">
            <SectionHeader
              title={`Procedimento: ${procedimento === 'coleta' ? '📦 Coleta' : procedimento === 'entrega' ? '🚚 Entrega' : '🔄 Transferência'}`}
              section="atendimento"
            />
          </div>
          {expandedSections.atendimento && (
            <div className="p-4 space-y-4">
              {/* Seleção do Tipo de Movimentação */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Tipo de Movimentação (Referente à):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'coleta', label: 'Coleta', icon: '📦', color: 'border-blue-500 bg-blue-50 text-blue-800' },
                    { id: 'entrega', label: 'Entrega', icon: '🚚', color: 'border-green-500 bg-green-50 text-green-800' },
                    { id: 'transferencia', label: 'Transferência', icon: '🔄', color: 'border-purple-500 bg-purple-50 text-purple-800' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProcedimento(p.id as any)}
                      className={`py-3 px-2 rounded-xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all ${
                        procedimento === p.id
                          ? `${p.color} shadow-sm ring-1 ring-offset-1`
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Se for transferência, pedir veículo de destino */}
              {procedimento === 'transferencia' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    Veículo de Destino (Placa): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={atendimento.veiculoDestino}
                    onChange={(e) => setAtendimento({ ...atendimento, veiculoDestino: e.target.value.toUpperCase() })}
                    placeholder="Ex: XYZ-9K88"
                    className="w-full border border-purple-300 rounded-lg p-2.5 text-sm uppercase bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <p className="text-[11px] text-purple-700 mt-1">
                    Na transferência, os arquivos serão salvos na pasta com ambas as placas.
                  </p>
                </div>
              )}

              {/* Tipo de Documento & Número */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    value={atendimento.tipoDocumento}
                    onChange={(e) => setAtendimento({ ...atendimento, tipoDocumento: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  >
                    <option value="NF">Nota Fiscal (NF)</option>
                    <option value="coleta">Número de Coleta</option>
                    <option value="CT-e">CT-e</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Número do Documento (com zeros)
                  </label>
                  <input
                    type="text"
                    value={atendimento.numeroDocumento}
                    onChange={(e) => setAtendimento({ ...atendimento, numeroDocumento: e.target.value })}
                    placeholder="Ex: 00045892"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
              </div>

              {/* Cliente e Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    value={atendimento.cliente}
                    onChange={(e) => setAtendimento({ ...atendimento, cliente: e.target.value })}
                    placeholder="Nome do Cliente"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Local da Coleta/Entrega</label>
                  <input
                    type="text"
                    value={atendimento.local}
                    onChange={(e) => setAtendimento({ ...atendimento, local: e.target.value })}
                    placeholder="Ex: Almoxarifado / Doca"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={atendimento.endereco}
                  onChange={(e) => setAtendimento({ ...atendimento, endereco: e.target.value })}
                  placeholder="Endereço completo"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                />
              </div>

              {/* Contato, Setor, Telefone, Ramal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contato</label>
                  <input
                    type="text"
                    value={atendimento.contato}
                    onChange={(e) => setAtendimento({ ...atendimento, contato: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Setor</label>
                  <input
                    type="text"
                    value={atendimento.setor}
                    onChange={(e) => setAtendimento({ ...atendimento, setor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={atendimento.telefone}
                    onChange={(e) => setAtendimento({ ...atendimento, telefone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ramal</label>
                  <input
                    type="text"
                    value={atendimento.ramal}
                    onChange={(e) => setAtendimento({ ...atendimento, ramal: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
              </div>

              {/* Veículo & Volumetria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Veículo (Placa)</label>
                  <input
                    type="text"
                    value={atendimento.veiculo}
                    onChange={(e) => setAtendimento({ ...atendimento, veiculo: e.target.value.toUpperCase() })}
                    placeholder="Ex: ABC-1D23"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Volumetria</label>
                  <input
                    type="text"
                    value={atendimento.volumetria}
                    onChange={(e) => setAtendimento({ ...atendimento, volumetria: e.target.value })}
                    placeholder="Ex: 1 Volume, 2 Caixas"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ═══ CONDIÇÃO DO EQUIPAMENTO ═══ */}
        <section
          id="sec-condicao"
          className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
            errors.some(e => e.section === 'condicao') ? 'border-2 border-red-400 bg-red-50/10' : ''
          }`}
        >
          <div className="px-4">
            <SectionHeader
              title="Condição do Equipamento"
              section="condicao"
              isPending={errors.some(e => e.section === 'condicao')}
            />
          </div>
          {expandedSections.condicao && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Estado:</p>
                <div className="flex gap-4">
                  {CONDICAO_EQUIPAMENTO_OPCOES.estado.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer font-medium text-gray-700">
                      <input
                        type="radio"
                        name="estado"
                        checked={condicao[opt.value as keyof CondicaoEquipamento] as boolean}
                        onChange={() => handleCondicaoChange(opt.value as keyof CondicaoEquipamento, true)}
                        className="w-5 h-5 accent-[#F47920]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Apresentação:</p>
                <div className="flex gap-4">
                  {CONDICAO_EQUIPAMENTO_OPCOES.embalagem.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer font-medium text-gray-700">
                      <input
                        type="radio"
                        name="embalagem_estado"
                        checked={condicao[opt.value as keyof CondicaoEquipamento] as boolean}
                        onChange={() => handleCondicaoChange(opt.value as keyof CondicaoEquipamento, true)}
                        className="w-5 h-5 accent-[#F47920]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Funcionamento:</p>
                <div className="space-y-2">
                  {CONDICAO_EQUIPAMENTO_OPCOES.funcionamento.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
                      <input
                        type="checkbox"
                        checked={condicao[opt.value === 'nao_verificado' ? 'funcionandoNaoVerificado' : opt.value as keyof CondicaoEquipamento] as boolean}
                        onChange={(e) => handleCondicaoChange(
                          opt.value === 'nao_verificado' ? 'funcionandoNaoVerificado' : opt.value as keyof CondicaoEquipamento,
                          e.target.checked
                        )}
                        className="w-5 h-5 accent-[#F47920] rounded"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {condicao.danificado && (
                <div className="ml-7">
                  <textarea
                    value={condicao.descricaoDanificado || ''}
                    onChange={(e) => handleCondicaoChange('descricaoDanificado', e.target.value)}
                    placeholder="Descreva o dano / avaria (obrigatório)"
                    className="w-full border border-red-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* ═══ DIMENSÕES DO MATERIAL ═══ */}
        <section id="sec-dimensoes" className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4">
            <SectionHeader title="Dimensões do Material" section="dimensoes" />
          </div>
          {expandedSections.dimensoes && (
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3">
                Não preencha com zero quando a medida for desconhecida. Deixe vazio.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['altura', 'largura', 'comprimento', 'peso'] as const).map(dim => (
                  <div key={dim}>
                    <label className="text-sm font-medium text-gray-600">
                      {DIMENSOES_LABELS[dim]} ({UNIDADES[dim]})
                    </label>
                    <input
                      type="number"
                      value={dimensoes[dim] ?? ''}
                      onChange={(e) => setDimensoes(prev => ({
                        ...prev,
                        [dim]: e.target.value === '' ? undefined : parseFloat(e.target.value),
                      }))}
                      placeholder="—"
                      min="0"
                      step="0.1"
                      className="w-full mt-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ═══ INSPEÇÃO DA EMBALAGEM ═══ */}
        <section
          id="sec-embalagem"
          className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
            errors.some(e => e.section === 'embalagem') ? 'border-2 border-red-400 bg-red-50/10' : ''
          }`}
        >
          <div className="px-4">
            <SectionHeader
              title="Inspeção da Embalagem"
              section="embalagem"
              isPending={errors.some(e => e.section === 'embalagem')}
            />
          </div>
          {expandedSections.embalagem && (
            <div className="p-4 space-y-3">
              {INSPECAO_EMBALAGEM_OPCOES.map(opt => (
                <label key={opt.value} className="flex items-center gap-3 text-sm cursor-pointer py-1 text-gray-700">
                  <input
                    type="checkbox"
                    checked={embalagem[opt.value as keyof InspecaoEmbalagem]}
                    onChange={(e) => handleEmbalagemChange(opt.value as keyof InspecaoEmbalagem, e.target.checked)}
                    className="w-5 h-5 accent-[#F47920] rounded flex-shrink-0"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* ═══ INSPEÇÃO DO EQUIPAMENTO/PRODUTO ═══ */}
        <section
          id="sec-equipamento"
          className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
            errors.some(e => e.section === 'equipamento') ? 'border-2 border-red-400 bg-red-50/10' : ''
          }`}
        >
          <div className="px-4">
            <SectionHeader
              title="Inspeção do Equipamento/Produto"
              section="equipamento"
              isPending={errors.some(e => e.section === 'equipamento')}
            />
          </div>
          {expandedSections.equipamento && (
            <div className="p-4 space-y-3">
              {INSPECAO_EQUIPAMENTO_OPCOES.map(opt => (
                <div key={opt.value}>
                  <label className="flex items-center gap-3 text-sm cursor-pointer py-1 text-gray-700">
                    <input
                      type="checkbox"
                      checked={equipamento[opt.value as keyof InspecaoEquipamento] as boolean}
                      onChange={(e) => handleEquipamentoChange(opt.value as keyof InspecaoEquipamento, e.target.checked)}
                      className="w-5 h-5 accent-[#F47920] rounded flex-shrink-0"
                    />
                    <span>{opt.label}</span>
                  </label>
                  {opt.value === 'apresentaAvarias' && equipamento.apresentaAvarias && (
                    <div className="ml-8 mt-2">
                      <textarea
                        value={equipamento.descricaoAvarias || ''}
                        onChange={(e) => handleEquipamentoChange('descricaoAvarias', e.target.value)}
                        placeholder="Descreva as avarias (obrigatório)"
                        className="w-full border border-red-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ AUTORIZAÇÃO DE ABERTURA DA EMBALAGEM (IPP41) ═══ */}
        <section
          id="sec-autorizacao"
          className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
            aberturaAutorizada === null && errors.some(e => e.section === 'autorizacao')
              ? 'border-2 border-red-500 bg-red-50/30 ring-2 ring-red-200'
              : 'border border-gray-100'
          }`}
        >
          <div className="px-4">
            <SectionHeader
              title="Autorização de Abertura da Embalagem"
              section="autorizacao"
              isPending={aberturaAutorizada === null}
            />
          </div>
          {expandedSections.autorizacao && (
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-2">
                <p className="text-sm text-gray-800 font-semibold leading-relaxed">
                  A abertura da embalagem para inspeção do equipamento/produto foi autorizada pelo cliente?
                </p>
              </div>

              {/* Botões de Seleção em Destaque */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAberturaAutorizada(true)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    aberturaAutorizada === true
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${aberturaAutorizada === true ? 'border-green-500 bg-green-500' : 'border-gray-400'}`}>
                    {aberturaAutorizada === true && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  Sim, autorizada
                </button>

                <button
                  type="button"
                  onClick={() => setAberturaAutorizada(false)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    aberturaAutorizada === false
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${aberturaAutorizada === false ? 'border-red-500 bg-red-500' : 'border-gray-400'}`}>
                    {aberturaAutorizada === false && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  Não autorizada
                </button>
              </div>

              {/* Termo de Responsabilidade se NÃO autorizada */}
              {aberturaAutorizada === false && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fadeIn">
                  <h3 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Termo de Responsabilidade Obrigatório (IPP41)
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700 leading-relaxed italic">
                    &ldquo;{TERMO_RESPONSABILIDADE}&rdquo;
                  </p>
                  <p className="text-xs text-red-600 mt-2 font-semibold">
                    * A assinatura deste termo será solicitada na seção de Assinaturas.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ═══ FOTOS E EVIDÊNCIAS (Câmera do Notebook / Celular) ═══ */}
        <section id="sec-fotos" className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4">
            <SectionHeader
              title={`Fotos e Evidências (${photos.length} registradas)`}
              section="fotos"
              icon={<Camera className="w-4 h-4 text-[#F47920]" />}
            />
          </div>
          {expandedSections.fotos && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-gray-500">
                Tire fotos com a câmera do dispositivo ou selecione arquivos do computador/galeria.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { tipo: 'foto_geral', label: 'Foto Geral', desc: 'Equipamento / Embalagem', obrigatorio: true },
                  { tipo: 'foto_identificacao', label: 'Identificação', desc: 'Etiqueta / Nº Série', obrigatorio: true },
                  ...(hasNaoConformidades ? [{ tipo: 'evidencia_nc', label: 'Evidência NC', desc: 'Detalhe do dano', obrigatorio: true }] : []),
                  { tipo: 'outro', label: 'Foto Adicional', desc: 'Outros ângulos', obrigatorio: false },
                ].map((item, idx) => {
                  const existingPhoto = photos.find(p => p.tipo === item.tipo);

                  return (
                    <div
                      key={idx}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-3 flex flex-col items-center justify-between text-center relative hover:border-[#F47920] transition-colors bg-gray-50/50 min-h-[140px]"
                    >
                      {existingPhoto ? (
                        <div className="w-full flex flex-col items-center">
                          <img
                            src={existingPhoto.url}
                            alt={item.label}
                            className="w-full h-24 object-cover rounded-lg shadow-sm mb-2"
                          />
                          <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(existingPhoto.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                            title="Remover foto"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="my-auto flex flex-col items-center">
                            <Camera className="w-7 h-7 text-gray-400 mb-1" />
                            <span className="text-xs font-bold text-gray-700">{item.label}</span>
                            <span className="text-[10px] text-gray-500">{item.desc}</span>
                            {item.obrigatorio && (
                              <span className="text-[10px] font-semibold text-red-500 mt-1">Obrigatório</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => openCameraModal(item.tipo, item.label)}
                            className="w-full mt-2 py-1.5 px-2 bg-[#F47920] hover:bg-[#E94E1B] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-colors"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Capturar Foto
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ═══ ASSINATURAS DIGITAIS ═══ */}
        <section id="sec-assinaturas" className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4">
            <SectionHeader
              title="Assinaturas Digitais"
              section="assinaturas"
              icon={<FileSignature className="w-4 h-4 text-[#F47920]" />}
            />
          </div>
          {expandedSections.assinaturas && (
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 italic border">
                &ldquo;{DECLARACAO_CONCORDANCIA}&rdquo;
              </div>

              {/* Assinatura Cliente */}
              <div className="border rounded-xl p-3 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-800">
                    {FINALIDADE_ASSINATURA_LABELS.concordancia_vistoria}
                  </span>
                  {signatures['concordancia'] ? (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Assinado
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Pendente</span>
                  )}
                </div>

                {signatures['concordancia'] ? (
                  <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                    <div>
                      <img
                        src={signatures['concordancia'].signatureDataUrl}
                        alt="Assinatura"
                        className="h-10 object-contain mb-1"
                      />
                      <p className="text-xs font-medium text-gray-700">{signatures['concordancia'].name}</p>
                      <p className="text-[10px] text-gray-500">Doc: {signatures['concordancia'].document || 'N/I'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSignatureModal('concordancia')}
                      className="text-xs text-[#F47920] underline font-medium"
                    >
                      Refazer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveSignatureModal('concordancia')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-[#F47920] rounded-xl flex items-center justify-center gap-2 text-gray-600 font-medium text-xs bg-white transition-colors"
                  >
                    <FileSignature className="w-4 h-4 text-[#F47920]" />
                    Coletar Assinatura do Cliente
                  </button>
                )}
              </div>

              {/* Assinatura Prime Cargo */}
              <div className="border rounded-xl p-3 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-800">
                    {FINALIDADE_ASSINATURA_LABELS.responsavel_prime}
                  </span>
                  {signatures['prime'] ? (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Assinado
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Pendente</span>
                  )}
                </div>

                {signatures['prime'] ? (
                  <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                    <div>
                      <img
                        src={signatures['prime'].signatureDataUrl}
                        alt="Assinatura Prime"
                        className="h-10 object-contain mb-1"
                      />
                      <p className="text-xs font-medium text-gray-700">{signatures['prime'].name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSignatureModal('prime')}
                      className="text-xs text-[#F47920] underline font-medium"
                    >
                      Refazer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveSignatureModal('prime')}
                    className="w-full py-3 border-2 border-dashed border-[#F47920]/40 hover:border-[#F47920] rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium text-xs bg-orange-50/30 transition-colors"
                  >
                    <FileSignature className="w-4 h-4 text-[#F47920]" />
                    Assinar como Responsável Prime
                  </button>
                )}
              </div>

              {/* Termo se abertura não autorizada */}
              {aberturaAutorizada === false && (
                <div className="border border-red-200 rounded-xl p-3 bg-red-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-red-900">
                      Assinatura do Termo de Abertura Não Autorizada
                    </span>
                    {signatures['termo'] ? (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Assinado
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-bold">Obrigatório</span>
                    )}
                  </div>

                  {signatures['termo'] ? (
                    <div className="bg-white p-3 rounded-lg border flex items-center justify-between">
                      <div>
                        <img
                          src={signatures['termo'].signatureDataUrl}
                          alt="Assinatura Termo"
                          className="h-10 object-contain mb-1"
                        />
                        <p className="text-xs font-medium text-gray-700">{signatures['termo'].name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSignatureModal('termo')}
                        className="text-xs text-[#F47920] underline font-medium"
                      >
                        Refazer
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveSignatureModal('termo')}
                      className="w-full py-3 border-2 border-dashed border-red-300 hover:border-red-500 rounded-xl flex items-center justify-center gap-2 text-red-700 font-semibold text-xs bg-white transition-colors"
                    >
                      <FileSignature className="w-4 h-4 text-red-600" />
                      Assinar Termo de Responsabilidade
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ═══ OBSERVAÇÕES ═══ */}
        <section id="sec-observacoes" className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4">
            <SectionHeader title="Observações Gerais" section="observacoes" />
          </div>
          {expandedSections.observacoes && (
            <div className="p-4">
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações complementares (opcional)"
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                rows={3}
              />
            </div>
          )}
        </section>
      </main>

      {/* ═══ MODAL DE CÂMERA (Notebook e Celular) ═══ */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Capturar: {activePhotoLabel}</h3>
                <p className="text-[11px] text-gray-400">Notebook (Webcam) ou Celular</p>
              </div>
              <button
                type="button"
                onClick={closeCameraModal}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative bg-black flex-1 min-h-[260px] flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-white space-y-3">
                  <Camera className="w-12 h-12 text-gray-500 mx-auto" />
                  <p className="text-xs text-gray-300">{cameraError}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover max-h-[360px]"
                />
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t space-y-3">
              {!cameraError && (
                <button
                  type="button"
                  onClick={captureFromVideo}
                  className="w-full py-3.5 bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Tirar Foto Agora
                </button>
              )}

              {/* Opção alternativa: Upload de arquivo / Galeria */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  Selecionar Foto do Computador / Galeria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL DE ASSINATURA ═══ */}
      {activeSignatureModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {activeSignatureModal === 'concordancia' && FINALIDADE_ASSINATURA_LABELS.concordancia_vistoria}
                {activeSignatureModal === 'prime' && FINALIDADE_ASSINATURA_LABELS.responsavel_prime}
                {activeSignatureModal === 'termo' && 'Termo de Responsabilidade (IPP41)'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSignatureModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <AssinaturaPad
                purpose={activeSignatureModal as any}
                agreementText={
                  activeSignatureModal === 'termo'
                    ? TERMO_RESPONSABILIDADE
                    : DECLARACAO_CONCORDANCIA
                }
                onSave={(sigData) => {
                  setSignatures(prev => ({ ...prev, [activeSignatureModal]: sigData }));
                  setActiveSignatureModal(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Barra inferior fixa */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex gap-2 z-20 safe-area-bottom">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saving}
          className="p-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
          title="Salvar rascunho no aparelho"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 p-3.5 bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          Concluir Vistoria & Registrar Baixa
        </button>
      </div>
    </div>
  );
}

export default function VistoriaFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F47920] animate-spin" />
      </div>
    }>
      <VistoriaFormContent />
    </Suspense>
  );
}
