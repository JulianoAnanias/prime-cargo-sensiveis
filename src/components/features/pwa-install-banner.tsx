'use client';

import { useState, useEffect } from 'react';
import { Download, Share, X, CheckCircle, Smartphone } from 'lucide-react';
import Image from 'next/image';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está em modo standalone (já instalado)
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      setIsInstalled(isStandalone);

      // 2. Detecta iOS / iPhone / iPad
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua);
      setIsIos(isIosDevice);

      // 3. Captura evento de instalação nativo no Android / Chrome
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handler);

      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosInstructions(true);
    }
  };

  // Se já está instalado ou foi dispensado, não exibe
  if (isInstalled || dismissed) return null;

  // Se o prompt ainda não foi disparado e não é iOS, não exibe para evitar poluição
  if (!deferredPrompt && !isIos) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3.5 rounded-2xl shadow-xl border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 relative animate-in fade-in slide-in-from-top-2">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
        title="Dispensar aviso"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-center gap-3 w-full sm:w-auto pr-6">
        <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
          <Image
            src="/icons/icon-192.png"
            alt="Prime Cargo App"
            width={36}
            height={36}
            className="rounded-lg object-contain"
          />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#F47920]" />
            <span>Instalar App Prime Cargo</span>
          </h4>
          <p className="text-[11px] text-gray-300 mt-0.5">
            Acesso rápido offline na doca, câmera otimizada e sem barra de navegação.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={handleInstallClick}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#F47920] to-[#E94E1B] hover:opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{isIos ? 'Ver Como Instalar' : 'Instalar no Celular'}</span>
        </button>
      </div>

      {/* Modal / Card de Instruções para iPhone / iPad */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-gray-900 uppercase">
                Como Instalar no iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIosInstructions(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="text-xs text-gray-700 space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F47920] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra inferior do Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F47920] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F47920] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>Toque em <strong>"Adicionar"</strong> no canto superior direito.</span>
              </li>
            </ol>

            <div className="pt-2">
              <button
                onClick={() => setShowIosInstructions(false)}
                className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
