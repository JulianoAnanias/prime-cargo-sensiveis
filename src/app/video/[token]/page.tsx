'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Radio, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Loader2, 
  AlertCircle, 
  Truck, 
  Clock,
  Play,
  Mic,
  MicOff
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

function createSilentAudioTrack(): MediaStreamTrack | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    if (track) {
      track.enabled = false;
      return track;
    }
  } catch (err) {
    console.warn('Falha ao gerar faixa de áudio silenciosa:', err);
  }
  return null;
}

export default function ClientVideoViewer() {
  const params = useParams();
  const token = params.token as string;

  const [sessionData, setSessionData] = useState<{
    driverName: string;
    clientName: string;
    docNumber: string;
    status: string;
  } | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<
    'carregando' | 'aguardando_motorista' | 'conectando' | 'ao_vivo' | 'encerrado' | 'erro'
  >('carregando');

  const [isMuted, setIsMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasReceivedStream, setHasReceivedStream] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const driverAudioRef = useRef<HTMLAudioElement>(null);
  const controlDcRef = useRef<RTCDataChannel | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const addedDriverCandidatesRef = useRef<Set<string>>(new Set());
  const clientAudioStreamRef = useRef<MediaStream | null>(null);

  const [isTalking, setIsTalking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Inicializa propriedades do elemento de vídeo para autoplay seguro
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.defaultMuted = true;
      remoteVideoRef.current.muted = true;
      remoteVideoRef.current.playsInline = true;
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    let hasAnswered = false;

    async function checkAndConnect() {
      try {
        const res = await fetch(`/api/video/signal?token=${token}`);
        if (!res.ok) {
          if (res.status === 404) {
            setConnectionStatus('aguardando_motorista');
          } else {
            setConnectionStatus('erro');
            setErrorMessage('Não foi possível localizar esta transmissão.');
          }
          return;
        }

        const { data } = await res.json();
        setSessionData(data);

        if (data.status === 'closed') {
          setConnectionStatus('encerrado');
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }

        // Se o motorista já enviou a Oferta e nós ainda não respondemos
        if (data.offer && !hasAnswered) {
          hasAnswered = true;
          setConnectionStatus('conectando');
          await setupWebRTC(data.offer, data.driverCandidates || []);
        } else if (!data.offer) {
          setConnectionStatus('aguardando_motorista');
        }

        // Adiciona candidatos ICE do motorista que chegarem em tempo real (sem duplicatas)
        if (hasAnswered && data.driverCandidates && Array.isArray(data.driverCandidates) && peerConnectionRef.current) {
          for (const cand of data.driverCandidates) {
            const key = typeof cand === 'string' ? cand : JSON.stringify(cand);
            if (!addedDriverCandidatesRef.current.has(key)) {
              addedDriverCandidatesRef.current.add(key);
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {}
            }
          }
        }
      } catch (err: any) {
        console.error('Erro ao verificar sessão de vídeo:', err);
      }
    }

    // Inicia polling inicial para checar a sessão a cada 1.5s
    checkAndConnect();
    pollingRef.current = setInterval(checkAndConnect, 1500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (clientAudioStreamRef.current) {
        clientAudioStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [token]);

  // Unmute unificado do áudio do motorista
  const handleUnmute = async () => {
    setIsMuted(false);
    if (driverAudioRef.current) {
      driverAudioRef.current.defaultMuted = false;
      driverAudioRef.current.muted = false;
      driverAudioRef.current.volume = 1.0;
      try {
        await driverAudioRef.current.play();
      } catch (err) {
        console.warn('Erro ao reproduzir áudio do motorista:', err);
      }
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;
      try {
        await remoteVideoRef.current.play();
      } catch (err) {
        console.warn('Erro ao reproduzir vídeo com som:', err);
      }
    }
  };

  // Captura / Reutiliza o microfone do cliente com cancelamento de eco acústico
  const getOrCreateClientAudioTrack = async (): Promise<MediaStreamTrack | null> => {
    if (clientAudioStreamRef.current) {
      const track = clientAudioStreamRef.current.getAudioTracks()[0];
      if (track && track.readyState === 'live') {
        return track;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return null;

      // Inicia silenciado por segurança
      audioTrack.enabled = false;
      clientAudioStreamRef.current = stream;

      // Vincula a faixa ao PeerConnection existente
      if (peerConnectionRef.current) {
        const audioTransceiver = peerConnectionRef.current.getTransceivers().find(
          t => t.receiver.track?.kind === 'audio' || t.sender.track?.kind === 'audio'
        );
        if (audioTransceiver && audioTransceiver.sender) {
          await audioTransceiver.sender.replaceTrack(audioTrack);
        } else {
          const senders = peerConnectionRef.current.getSenders();
          const audioSender = senders.find(s => s.track?.kind === 'audio') || senders.find(s => !s.track);
          if (audioSender) {
            await audioSender.replaceTrack(audioTrack);
          } else {
            peerConnectionRef.current.addTrack(audioTrack, stream);
          }
        }
      }

      setMicError(null);
      return audioTrack;
    } catch (err: any) {
      console.error('Erro ao acessar microfone do cliente:', err);
      setMicError('Permissão de microfone necessária para falar com o motorista.');
      setTimeout(() => setMicError(null), 5000);
      return null;
    }
  };

  // Push-to-Talk: Iniciar fala ao pressionar
  const handleStartTalking = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isMuted) {
      handleUnmute();
    }
    const track = await getOrCreateClientAudioTrack();
    if (track) {
      track.enabled = true;
      setIsTalking(true);
      if (controlDcRef.current && controlDcRef.current.readyState === 'open') {
        try {
          controlDcRef.current.send(JSON.stringify({ type: 'talking', value: true }));
        } catch (dcErr) {}
      }
    }
  };

  // Push-to-Talk: Encerrar fala ao soltar
  const handleStopTalking = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (clientAudioStreamRef.current) {
      clientAudioStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = false;
      });
    }
    if (controlDcRef.current && controlDcRef.current.readyState === 'open') {
      try {
        controlDcRef.current.send(JSON.stringify({ type: 'talking', value: false }));
      } catch (dcErr) {}
    }
    setIsTalking(false);
  };

  // Configuração WebRTC do Cliente (Viewer)
  const setupWebRTC = async (offer: RTCSessionDescriptionInit, driverCandidates: RTCIceCandidateInit[]) => {
    try {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      // Canal de controle P2P para status instantâneo do Walkie-Talkie
      pc.ondatachannel = (e) => {
        if (e.channel.label === 'control') {
          controlDcRef.current = e.channel;
        }
      };

      const candidates: RTCIceCandidateInit[] = [];

      // Recebe as faixas de áudio e vídeo do motorista
      pc.ontrack = (event) => {
        console.log('[WebRTC Viewer] Track recebido:', event.track.kind);
        setHasReceivedStream(true);

        // Se for faixa de áudio, direciona para o elemento de áudio dedicado
        if (event.track.kind === 'audio') {
          if (driverAudioRef.current) {
            const stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
            driverAudioRef.current.srcObject = stream;
            if (!isMuted) {
              driverAudioRef.current.defaultMuted = false;
              driverAudioRef.current.muted = false;
              driverAudioRef.current.volume = 1.0;
              driverAudioRef.current.play().catch(console.warn);
            }
          }
        }

        // Se for vídeo ou stream geral, direciona para o elemento de vídeo
        if (remoteVideoRef.current) {
          if (event.streams && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          } else {
            let stream = remoteVideoRef.current.srcObject as MediaStream;
            if (!stream) {
              stream = new MediaStream();
              remoteVideoRef.current.srcObject = stream;
            }
            stream.addTrack(event.track);
          }

          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              setConnectionStatus('ao_vivo');
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }).catch(err => {
              console.warn('[WebRTC Viewer] Autoplay bloqueado pelo navegador:', err);
              setConnectionStatus('ao_vivo');
              setAutoplayBlocked(true);
            });
          } else {
            setConnectionStatus('ao_vivo');
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          candidates.push(event.candidate.toJSON());
          fetch('/api/video/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'viewer_candidate',
              token,
              candidate: event.candidate.toJSON(),
            }),
          }).catch(console.error);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setConnectionStatus('ao_vivo');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
          setConnectionStatus('encerrado');
        }
      };

      // 1. Aplica a oferta do motorista
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // 2. Localiza o transceiver de áudio e garante direção sendrecv para habilitar Push-to-Talk
      const audioTransceiver = pc.getTransceivers().find(t => t.receiver.track?.kind === 'audio');
      if (audioTransceiver) {
        audioTransceiver.direction = 'sendrecv';
        // Cria uma faixa de áudio silenciosa inicial para garantir que o SDP Answer
        // negocie sendrecv ativo com o motorista
        const silentTrack = createSilentAudioTrack();
        if (silentTrack && audioTransceiver.sender) {
          audioTransceiver.sender.replaceTrack(silentTrack).catch(console.warn);
        }
      }

      // 3. Aplica os candidatos ICE do motorista
      for (const cand of driverCandidates) {
        const key = typeof cand === 'string' ? cand : JSON.stringify(cand);
        if (!addedDriverCandidatesRef.current.has(key)) {
          addedDriverCandidatesRef.current.add(key);
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {}
        }
      }

      // 4. Cria a resposta (Answer)
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 5. Envia a resposta de volta ao servidor
      await fetch('/api/video/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          token,
          answer,
          candidates,
        }),
      });
    } catch (err: any) {
      console.error('Erro na conexão WebRTC do cliente:', err);
      setConnectionStatus('erro');
      setErrorMessage('Erro ao estabelecer conexão de vídeo.');
    }
  };

  const handleManualPlay = () => {
    handleUnmute();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.play().then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }).catch(console.error);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (driverAudioRef.current) {
      driverAudioRef.current.muted = nextMuted;
      if (!nextMuted) {
        driverAudioRef.current.volume = 1.0;
        driverAudioRef.current.play().catch(console.warn);
      }
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = nextMuted;
      if (!nextMuted) {
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.play().catch(console.warn);
      }
    }
  };

  const toggleFullscreen = () => {
    if (remoteVideoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        remoteVideoRef.current.requestFullscreen().catch(console.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between">
      {/* Header Corporativo Oficial Prime Cargo */}
      <header className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="Prime Cargo"
              width={100}
              height={40}
              className="object-contain h-6 w-auto"
              priority
            />
          </div>
          <div>
            <h1 className="text-xs font-black text-white tracking-wider uppercase">
              Vistoria em Tempo Real
            </h1>
            <p className="text-[11px] text-gray-400">
              Grupo Prime Cargo Logística Sensíveis
            </p>
          </div>
        </div>

        {connectionStatus === 'ao_vivo' && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full animate-pulse uppercase tracking-wider shadow-lg shadow-red-600/30">
            <Radio className="w-3.5 h-3.5" /> AO VIVO
          </span>
        )}
      </header>

      {/* Main Video Screen */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 relative max-w-4xl w-full mx-auto">
        <div className="w-full bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative aspect-[9/16] sm:aspect-video flex items-center justify-center">
          
          {/* Elemento de áudio dedicado para reproduzir voz do motorista com prioridade de sistema */}
          <audio ref={driverAudioRef} autoPlay playsInline />

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={isMuted}
            onClick={isMuted ? handleUnmute : undefined}
            onLoadedMetadata={() => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.play().then(() => {
                  setIsPlaying(true);
                  setAutoplayBlocked(false);
                }).catch(() => setAutoplayBlocked(true));
              }
            }}
            onCanPlay={() => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.play().then(() => {
                  setIsPlaying(true);
                  setAutoplayBlocked(false);
                }).catch(() => setAutoplayBlocked(true));
              }
            }}
            onPlaying={() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }}
            className={cn(
              "w-full h-full object-cover",
              connectionStatus !== 'ao_vivo' && "hidden"
            )}
          />

          {/* Banner de Alto Destaque: Ativar Áudio do Motorista */}
          {connectionStatus === 'ao_vivo' && isPlaying && isMuted && (
            <button
              type="button"
              onClick={handleUnmute}
              className="absolute top-4 left-4 right-4 z-30 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-2xl transition transform hover:scale-[1.01] active:scale-95 animate-pulse cursor-pointer border border-amber-300"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-amber-400 flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-wider leading-none">
                    Áudio do Motorista Disponível
                  </p>
                  <p className="text-[11px] font-semibold text-gray-900 mt-1 leading-none">
                    Toque aqui para ouvir o áudio do motorista
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-xl uppercase tracking-wider shrink-0">
                Ativar Som
              </span>
            </button>
          )}

          {/* Overlay de Desbloqueio se Autoplay for Bloqueado pelo Navegador */}
          {connectionStatus === 'ao_vivo' && (autoplayBlocked || !isPlaying) && (
            <div 
              onClick={handleManualPlay}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-30 group p-4"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F47920] hover:bg-[#E94E1B] text-white flex items-center justify-center shadow-2xl transition transform group-hover:scale-110 animate-pulse">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-black text-white uppercase tracking-wider text-center drop-shadow-md">
                Toque para Assistir ao Vivo
              </h3>
              <p className="text-xs text-gray-200 mt-1 max-w-xs text-center drop-shadow-sm">
                O motorista está com a câmera ativa. Clique aqui para liberar a imagem na sua tela.
              </p>
            </div>
          )}

          {/* Estado: Carregando / Aguardando / Conectando */}
          {connectionStatus !== 'ao_vivo' && (
            <div className="p-8 text-center flex flex-col items-center max-w-md">
              {connectionStatus === 'encerrado' ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Transmissão Encerrada</h2>
                  <p className="text-xs text-gray-400">
                    A vistoria ao vivo foi concluída com sucesso pela equipe Prime Cargo. O relatório final será encaminhado por e-mail.
                  </p>
                </div>
              ) : connectionStatus === 'erro' ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-900/40 text-red-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Sessão Indisponível</h2>
                  <p className="text-xs text-gray-400">{errorMessage || 'Link expirado ou inexistente.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#F47920]/20 text-[#F47920] flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {connectionStatus === 'conectando'
                      ? 'Conectando à câmera do motorista...'
                      : 'Aguardando o motorista iniciar a transmissão...'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Assim que o conferencista acionar a câmera no local da carga, a imagem aparecerá automaticamente na sua tela.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Controles Flutuantes no Vídeo */}
          {connectionStatus === 'ao_vivo' && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
              <button
                onClick={toggleMute}
                className="p-3 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-full text-white transition shadow-lg"
                title={isMuted ? 'Ativar Áudio' : 'Mutar Áudio'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-full text-white transition shadow-lg"
                title="Tela Cheia"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Módulo Walkie-Talkie / Push-to-Talk para o Cliente Falar com o Motorista */}
        {connectionStatus === 'ao_vivo' && (
          <div className="w-full mt-4 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-850 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0",
                isTalking 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse" 
                  : "bg-[#F47920]/20 text-[#F47920] border border-[#F47920]/30"
              )}>
                {isTalking ? <Mic className="w-6 h-6 animate-bounce" /> : <Mic className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {isTalking ? 'Transmitindo Sua Voz...' : 'Falar com o Motorista'}
                  </h4>
                  {isTalking && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full animate-pulse">
                      AO VIVO NO VEÍCULO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  {isTalking 
                    ? 'O motorista está ouvindo você no alto-falante. Fale agora.' 
                    : 'Pressione e segure o botão ao lado para fazer perguntas ou orientações.'}
                </p>
                {micError && (
                  <p className="text-[11px] text-red-400 font-semibold mt-1">
                    {micError}
                  </p>
                )}
              </div>
            </div>

            {/* Botão Push-to-Talk (Pressionar para Falar) */}
            <button
              type="button"
              onPointerDown={handleStartTalking}
              onPointerUp={handleStopTalking}
              onPointerLeave={handleStopTalking}
              onPointerCancel={handleStopTalking}
              onContextMenu={(e) => e.preventDefault()}
              className={cn(
                "w-full sm:w-auto px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 select-none touch-none transition-all duration-150 shadow-xl active:scale-95 cursor-pointer",
                isTalking
                  ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/40 scale-105"
                  : "bg-gradient-to-r from-[#F47920] to-[#E94E1B] hover:opacity-95 text-white active:brightness-90"
              )}
            >
              <Mic className={cn("w-4 h-4 shrink-0", isTalking && "animate-pulse")} />
              <span>{isTalking ? 'Solte para Finalizar' : 'Segure para Falar'}</span>
            </button>
          </div>
        )}

        {/* Card com Detalhes da Carga / Vistoria */}
        {sessionData && (
          <div className="w-full mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#F47920] tracking-wider block">
                Dados da Operação
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {sessionData.docNumber}
              </h3>
              <p className="text-xs text-gray-400">{sessionData.clientName}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Conexão Segura Criptografada P2P</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer Informativo */}
      <footer className="p-4 bg-gray-900 border-t border-gray-800 text-center text-xs text-gray-500">
        Grupo Prime Cargo &copy; {new Date().getFullYear()} — Plataforma Segura de Vistorias Sensíveis
      </footer>
    </div>
  );
}
