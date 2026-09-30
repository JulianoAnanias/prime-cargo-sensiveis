'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Truck, BarChart3, Sparkles, FileSpreadsheet, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const perfil = (session.user as any).perfil;
      if (perfil === 'motorista') {
        router.replace('/app');
      } else {
        router.replace('/admin/operacoes');
      }
    }
  }, [status, session, router]);

  const handleMicrosoftLogin = async () => {
    setLoading('microsoft');
    await signIn('microsoft-entra-id', { callbackUrl: '/app' });
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    await signIn('google', { callbackUrl: '/app' });
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-lg border border-gray-100 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/logo.jpg"
            alt="Grupo Prime Cargo"
            width={220}
            height={90}
            className="object-contain"
            priority
          />
        </div>

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#F47920] rounded-full text-xs font-bold tracking-wide uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Logística de Sensíveis
          </span>
          <h1 className="text-2xl font-black text-[#4D4D4D]">
            Portal Unificado Prime Cargo
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Vistorias IPP 41, Pesquisa IPP 35, Acompanhamento & Auditoria IA
          </p>
        </div>

        {/* Módulos Integrados - Acesso Direto */}
        <div className="w-full space-y-3 mb-6">
          <button
            onClick={() => router.push('/app')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-snug">App do Motorista / Campo</h3>
                <p className="text-xs text-white/90">Vistorias, Coletas, Entregas & Baixa com GPS</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => router.push('/admin/operacoes')}
            className="w-full p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#4D4D4D] leading-snug">Acompanhamento Operacional</h3>
                <p className="text-xs text-gray-500">Monitoramento da Gestão, Histórico e Mapas de Baixa</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => router.push('/admin/qualidade')}
            className="w-full p-4 rounded-2xl bg-white hover:bg-gray-50 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-purple-950 leading-snug">Gestão da Qualidade & Auditoria IA</h3>
                <p className="text-xs text-purple-700">Análise de Pesquisas com Google Gemini 3.5</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => router.push('/pesquisa/token-teste-123')}
            className="w-full p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 ml-1" />
              <div>
                <h4 className="font-semibold text-xs text-gray-700">Pesquisa de Satisfação IPP 35</h4>
                <p className="text-[11px] text-gray-400">Formulário oficial do cliente com emoticons</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 group-hover:underline pr-1">Abrir →</span>
          </button>
        </div>

        {/* Autenticação Corporativa Microsoft (Opcional) */}
        <div className="w-full pt-4 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 text-center uppercase tracking-wider mb-2.5">
            Login Corporativo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleMicrosoftLogin}
              disabled={loading !== null}
              className="py-2.5 px-3 bg-[#0078D4] hover:bg-[#005a9e] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              Entrar com Microsoft
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={loading !== null}
              className="py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-6 text-gray-400 text-xs text-center">
        Grupo Prime Cargo &copy; {new Date().getFullYear()} — Logística Integrada
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#F47920] border-t-transparent" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
