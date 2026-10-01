'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Video, 
  StopCircle, 
  Share2, 
  Copy, 
  Check, 
  Camera, 
  Mic, 
  MicOff, 
  RotateCcw, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  Radio, 
  MessageCircle, 
  Users,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

function DriverLiveStream() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const docParam = searchParams.get('doc') || 'Atendimento Operacional';
  const clienteParam = searchParams.get('cliente') || 'Cliente Prime Cargo';
  const vistoriaId = searchParams.get('id') || 'vist-' + Date.now();

  const [token, setToken] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [status, setStatus] = useState<'preparando' | 'aguardando' | 'conectado' | 'encerrado'>('preparando');
  const [showWaitingCard, setShowWaitingCard] = useState(true);
  const [copied, setCopied] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const addedViewerCandidatesRef = useRef<Set<string>>(new Set());
  const clientAudioRef = useRef<HTMLAudioElement>(null);
  const controlDcRef = useRef<RTCDataChannel | null>(null);

  const [isClientTalking, setIsClientTalking] = useState(false);

  // 1. Inicializa token e link do visualizador e pré-registra a sessão no Neon Postgres
  useEffect(() => {
    const generatedToken = 'live-' + Math.random().toString(36).substring(2, 9);
    setToken(generatedToken);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sensiveis-mobile.primecargoatendimento.com.br';
    setViewerUrl(`${baseUrl}/video/${generatedToken}`);

    // Registra antecipadamente no servidor para o link do cliente não retornar 404
    fetch('/api/video/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'init',
        token: generatedToken,
        clientName: clienteParam,
        docNumber: docParam,
        driverName: 'Motorista Prime Cargo',
      }),
    }).catch(console.error);
  }, [clienteParam, docParam]);

  // 2. Inicia câmera traseira do motorista
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (mediaErr) {
          console.warn('Microfone indisponível ou negado, iniciando somente vídeo:', mediaErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        }

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.defaultMuted = true;
          localVideoRef.current.muted = true;
          localVideoRef.current.play().catch(console.error);
        }

        // Se já houver transmissão ativa, substitui as faixas de vídeo e áudio instantaneamente
        if (peerConnectionRef.current) {
          const newVideoTrack = stream.getVideoTracks()[0];
          const videoSender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (videoSender && newVideoTrack) {
            videoSender.replaceTrack(newVideoTrack).catch(console.error);
          }
          const newAudioTrack = stream.getAudioTracks()[0];
          const audioSender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'audio');
          if (audioSender && newAudioTrack) {
            audioSender.replaceTrack(newAudioTrack).catch(console.error);
          }
        }
      } catch (err) {
        console.error('Erro ao acessar câmera do motorista:', err);
      }
    }

    startCamera();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // 3. Temporizador de transmissão
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'conectado' || status === 'aguardando') {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // 4. Iniciar Transmissão WebRTC (Cria Oferta e envia para Signaling)
  const handleStartBroadcast = async () => {
    if (!token || !localStreamRef.current) return;

    setStatus('aguardando');

    try {
      // 4.1 Registra a sessão no servidor
      await fetch('/api/video/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init',
          token,
          clientName: clienteParam,
          docNumber: docParam,
          driverName: 'Motorista Prime Cargo',
        }),
      });

      // 4.2 Cria conexão WebRTC
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      // Desbloqueia o elemento de áudio local do motorista com o gesto do usuário
      if (clientAudioRef.current) {
        clientAudioRef.current.defaultMuted = false;
        clientAudioRef.current.muted = false;
        clientAudioRef.current.volume = 1.0;
        clientAudioRef.current.play().catch(() => {});
      }

      // Canal de controle P2P para status instantâneo do Walkie-Talkie
      try {
        const controlDc = pc.createDataChannel('control');
        controlDcRef.current = controlDc;
        controlDc.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'talking') {
              setIsClientTalking(!!msg.value);
            }
          } catch (err) {}
        };
      } catch (e) {
        console.warn('Erro ao criar DataChannel:', e);
      }

      pc.ondatachannel = (e) => {
        if (e.channel.label === 'control') {
          e.channel.onmessage = (ev) => {
            try {
              const msg = JSON.parse(ev.data);
              if (msg.type === 'talking') {
                setIsClientTalking(!!msg.value);
              }
            } catch (err) {}
          };
        }
      };

      const candidates: RTCIceCandidateInit[] = [];

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          candidates.push(event.candidate.toJSON());
          fetch('/api/video/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'driver_candidate',
              token,
              candidate: event.candidate.toJSON(),
            }),
          }).catch(console.error);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setStatus('conectado');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setStatus('aguardando');
        }
      };

      // Recebe e reproduz a faixa de áudio do cliente (Push-to-Talk)
      pc.ontrack = (event) => {
        console.log('[Driver WebRTC] Track recebido do cliente:', event.track.kind);
        if (event.track.kind === 'audio' && clientAudioRef.current) {
          const clientStream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
          clientAudioRef.current.srcObject = clientStream;
          clientAudioRef.current.defaultMuted = false;
          clientAudioRef.current.muted = false;
          clientAudioRef.current.volume = 1.0;
          clientAudioRef.current.play().catch(e => {
            console.warn('[Driver WebRTC] Autoplay aguardando interação do motorista:', e);
          });

          event.track.onmute = () => setIsClientTalking(false);
          event.track.onunmute = () => {
            setIsClientTalking(true);
            if (clientAudioRef.current) {
              clientAudioRef.current.play().catch(console.error);
            }
          };
        }
      };

      // Adiciona as faixas de vídeo e áudio do motorista
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // Cria a oferta (Offer)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Envia a oferta para a API
      await fetch('/api/video/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'offer',
          token,
          offer,
          candidates,
        }),
      });

      // Inicia polling para esperar o cliente responder com a Answer
      startPollingForAnswer(token, pc);
    } catch (err) {
      console.error('Falha ao iniciar transmissão WebRTC:', err);
      setStatus('preparando');
    }
  };

  // 5. Polling para receber resposta do cliente
  const startPollingForAnswer = (sessionToken: string, pc: RTCPeerConnection) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/signal?token=${sessionToken}`);
        if (!res.ok) return;

        const { data } = await res.json();

        // Se o cliente respondeu com a Answer e ainda não definimos
        if (data.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          setStatus('conectado');
        }

        // Adiciona novos candidatos ICE do cliente (sem duplicar)
        if (Array.isArray(data.viewerCandidates)) {
          for (const cand of data.viewerCandidates) {
            const key = typeof cand === 'string' ? cand : JSON.stringify(cand);
            if (!addedViewerCandidatesRef.current.has(key)) {
              addedViewerCandidatesRef.current.add(key);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        console.error('Erro no polling do sinal:', err);
      }
    }, 1500);
  };

  // 6. Encerrar transmissão
  const handleStopBroadcast = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (token) {
      await fetch('/api/video/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close', token }),
      }).catch(console.error);
    }

    setStatus('encerrado');
  };

  // Alternar câmera (Traseira / Frontal)
  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Alternar mudo
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Compartilhar no WhatsApp
  const shareWhatsApp = () => {
    setShowWaitingCard(false); // Fecha o aviso para desobstruir o vídeo da câmera
    const text = `Olá! A Prime Cargo está iniciando a transmissão ao vivo da vistoria de sua carga (${docParam} - ${clienteParam}).\n\nAcompanhe em tempo real pelo link:\n${viewerUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copiar link
  const copyLink = () => {
    navigator.clipboard.writeText(viewerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackToInspection = () => {
    if (vistoriaId && !vistoriaId.startsWith('live-')) {
      router.push(`/app/vistoria/${vistoriaId}`);
    } else {
      router.back();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 bg-black/70 backdrop-blur-md flex items-center justify-between z-20 sticky top-0 border-b border-white/10">
        <button
          onClick={handleBackToInspection}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition flex items-center gap-1.5"
          title="Voltar para a vistoria"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold hidden sm:inline">Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          {status === 'conectado' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full animate-pulse tracking-wider uppercase">
              <Radio className="w-3.5 h-3.5" /> AO VIVO
            </span>
          ) : status === 'aguardando' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Aguardando Cliente
            </span>
          ) : (
            <span className="px-3 py-1 bg-white/20 text-xs font-bold rounded-full">
              Câmera Pronta
            </span>
          )}

          {!showWaitingCard && status === 'aguardando' && (
            <button
              onClick={() => setShowWaitingCard(true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1 transition"
              title="Reabrir botão de envio do WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}

          {(status === 'conectado' || status === 'aguardando') && (
            <span className="font-mono text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full">
              {formatTime(streamDuration)}
            </span>
          )}
        </div>

        <button
          onClick={toggleCamera}
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition"
          title="Alternar Câmera"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Main Video Viewport */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-950">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Elemento de áudio para reproduzir voz do cliente em tempo real */}
        <audio ref={clientAudioRef} autoPlay playsInline />

        {/* Notificação Visual na Tela do Motorista: Cliente Falando (Walkie-Talkie) */}
        {isClientTalking && (
          <div className="absolute top-20 left-4 right-4 z-30 flex justify-center animate-bounce">
            <div className="bg-red-600/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-2xl border-2 border-white/40 tracking-wider uppercase">
              <Mic className="w-4 h-4 animate-pulse text-white" />
              <span>Cliente Falando ao Vivo...</span>
            </div>
          </div>
        )}

        {/* Overlay com Dados do Atendimento */}
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/15 max-w-sm pointer-events-auto">
            <p className="text-xs font-black text-[#F47920] truncate uppercase tracking-wider">
              {docParam}
            </p>
            <p className="text-sm font-bold text-white truncate mt-0.5">
              {clienteParam}
            </p>
          </div>
        </div>

        {/* Banner Central: Aguardando com botão de fechar (X) e auto-close */}
        {status === 'aguardando' && showWaitingCard && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="bg-black/90 backdrop-blur-md p-6 rounded-3xl border border-white/20 max-w-xs shadow-2xl flex flex-col items-center relative">
              {/* Botão de Fechar com Ícone X */}
              <button
                type="button"
                onClick={() => setShowWaitingCard(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
                title="Fechar e ver imagem da câmera"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 mt-1">
                <Users className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-bold text-sm text-white">Aguardando o Cliente</h3>
              <p className="text-xs text-gray-300 mt-1">
                Envie o link para o cliente acompanhar sua vistoria ao vivo em tempo real.
              </p>
              <button
                onClick={shareWhatsApp}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {status === 'conectado' && (
          <div className="absolute bottom-24 left-4 right-4 z-10 flex justify-center">
            <div className="bg-emerald-600/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>Cliente Conectado assistindo agora!</span>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls */}
      <footer className="p-5 bg-black/85 backdrop-blur-md border-t border-white/10 z-20 space-y-4">
        {/* Caixa de Compartilhamento do Link */}
        <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between gap-2">
          <div className="truncate text-xs text-gray-300 select-all font-mono">
            {viewerUrl || 'Gerando link...'}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={copyLink}
              className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white text-xs font-semibold flex items-center gap-1 transition"
              title="Copiar Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={shareWhatsApp}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-xs font-bold flex items-center gap-1 transition"
              title="Compartilhar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Botões de Ação Principal */}
        <div className="flex items-center justify-around">
          <button
            onClick={toggleAudio}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition",
              isAudioMuted ? "bg-red-500/30 text-red-400 border border-red-500" : "bg-white/15 text-white"
            )}
            title={isAudioMuted ? "Ativar Áudio" : "Silenciar Áudio"}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {status === 'preparando' ? (
            <button
              onClick={handleStartBroadcast}
              className="px-6 py-3.5 bg-gradient-to-r from-[#F47920] to-[#E94E1B] hover:opacity-90 text-white font-black text-sm rounded-full shadow-lg flex items-center gap-2 transition hover:scale-105"
            >
              <Video className="w-5 h-5" />
              <span>Iniciar Transmissão</span>
            </button>
          ) : (
            <button
              onClick={handleStopBroadcast}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-full shadow-lg flex items-center gap-2 transition"
            >
              <StopCircle className="w-5 h-5" />
              <span>Encerrar Transmissão</span>
            </button>
          )}

          <button
            onClick={toggleCamera}
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
            title="Virar Câmera"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function DriverLivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#F47920]" />
      </div>
    }>
      <DriverLiveStream />
    </Suspense>
  );
}
