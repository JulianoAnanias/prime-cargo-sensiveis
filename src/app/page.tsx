'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { LogIn, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const error = searchParams.get('error');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const perfil = (session.user as any).perfil;
      if (perfil === 'motorista') {
        router.replace('/app');
      } else {
        router.replace('/admin');
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

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F47920] border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/logo.jpg"
            alt="Grupo Prime Cargo"
            width={240}
            height={120}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Prime Cargo Vistorias
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Vistoria de equipamentos sensíveis
        </p>

        {/* Erro de autenticação */}
        {error === 'nao_autorizado' && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Acesso não autorizado</p>
              <p className="text-xs text-red-600 mt-1">
                Seu e-mail não está cadastrado no sistema. Entre em contato com a gestão para solicitar acesso.
              </p>
            </div>
          </div>
        )}

        {/* Botões de login */}
        <div className="w-full space-y-4">
          <button
            onClick={handleMicrosoftLogin}
            disabled={loading !== null}
            className="w-full bg-[#0078D4] hover:bg-[#005a9e] disabled:opacity-60 text-white font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
          >
            {loading === 'microsoft' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
            )}
            Entrar com Microsoft
          </button>

          <button
            onClick={handleGoogleLogin}
            disabled={loading !== null}
            className="w-full bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors border border-gray-300"
          >
            {loading === 'google' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Entrar com Google
          </button>
        </div>

        {/* Atalhos para Homologação Local */}
        <div className="w-full mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-3">
            Ambiente Local (Acesso Direto)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => router.push('/app')}
              className="py-2.5 px-3 bg-[#F47920]/10 hover:bg-[#F47920]/20 text-[#F47920] font-medium text-xs rounded-lg text-center transition-colors"
            >
              📱 App Motorista
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-lg text-center transition-colors"
            >
              💻 Painel Gestão
            </button>
          </div>
          <button
            onClick={() => router.push('/pesquisa/token-teste-123')}
            className="w-full mt-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-lg text-center transition-colors"
          >
            📋 Pesquisa Pós-Entrega (IPP35)
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-4 text-center">
          Grupo Prime Cargo — Sistema de Vistorias e Qualidade
        </p>
      </div>

      <footer className="mt-8 text-gray-400 text-sm">
        Grupo Prime Cargo &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F47920] border-t-transparent" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
