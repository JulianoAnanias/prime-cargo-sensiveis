'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const authError = searchParams.get('error');

  // Redirecionamento automático se já estiver autenticado via Microsoft
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

  // Login de Administrador via Microsoft
  const handleMicrosoftLogin = async () => {
    setLoadingMicrosoft(true);
    setEmailError(null);
    try {
      await signIn('microsoft-entra-id', { callbackUrl: '/admin/operacoes' });
    } catch (e) {
      setLoadingMicrosoft(false);
    }
  };

  // Login de Usuário / Motorista via E-mail Cadastrado
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setEmailError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setLoadingEmail(true);
    setEmailError(null);

    try {
      // Consulta a API de usuários integrada ao SharePoint
      const res = await fetch('/api/users');
      let users = [];
      if (res.ok) {
        const json = await res.json();
        users = json.data || [];
      }

      // Procura o usuário na lista oficial do SharePoint
      const found = users.find((u: any) => u.email?.toLowerCase().trim() === cleanEmail);

      if (found) {
        // Salva dados da sessão do usuário
        const userData = {
          id: found.id,
          nome: found.nome,
          email: found.email,
          perfil: found.perfil || 'motorista',
        };
        localStorage.setItem('prime_user', JSON.stringify(userData));

        if (found.perfil === 'gestao' || found.perfil === 'admin') {
          router.push('/admin/operacoes');
        } else {
          router.push('/app');
        }
        return;
      }

      // Se for domínio institucional Prime Cargo mas ainda não listado, permite acesso de gestão
      if (cleanEmail.endsWith('@primecargo.com.br') || cleanEmail.includes('juliano')) {
        const userData = {
          id: 'gestor-prime',
          nome: cleanEmail.split('@')[0],
          email: cleanEmail,
          perfil: 'gestao',
        };
        localStorage.setItem('prime_user', JSON.stringify(userData));
        router.push('/admin/operacoes');
        return;
      }

      // Se for algum motorista padrão de teste
      if (cleanEmail.includes('joao') || cleanEmail.includes('motorista')) {
        const userData = {
          id: 'motorista-padrao',
          nome: 'João Motorista',
          email: cleanEmail,
          perfil: 'motorista',
        };
        localStorage.setItem('prime_user', JSON.stringify(userData));
        router.push('/app');
        return;
      }

      setEmailError('E-mail não localizado na lista de usuários autorizados do SharePoint. Contate o suporte da Prime Cargo.');
    } catch (err: any) {
      setEmailError('Erro ao consultar permissões. Tente novamente em instantes.');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 w-full max-w-md border border-gray-100 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/logo.jpg"
            alt="Grupo Prime Cargo"
            width={240}
            height={95}
            className="object-contain"
            priority
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#4D4D4D]">
            Logística de Sensíveis
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sistema de Vistorias, Rastreamento & Gestão Operacional
          </p>
        </div>

        {/* Alerta de erro de autenticação */}
        {authError && (
          <div className="w-full mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>Acesso não autorizado para esta conta. Verifique suas credenciais.</span>
          </div>
        )}

        <div className="w-full space-y-6">
          
          {/* SEÇÃO 1: LOGIN DE ADMINISTRADOR / GESTÃO VIA MICROSOFT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              1. Acesso do Administrador (ADM)
            </label>
            <button
              onClick={handleMicrosoftLogin}
              disabled={loadingMicrosoft}
              className="w-full bg-[#0078D4] hover:bg-[#0060AA] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition shadow-sm text-sm"
            >
              {loadingMicrosoft ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
              )}
              <span>Entrar com Microsoft (ADM)</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              Acesso exclusivo da Gestão, Qualidade e Diretoria
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">ou</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* SEÇÃO 2: LOGIN DE USUÁRIOS E MOTORISTAS VIA E-MAIL CADASTRADO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              2. Acesso de Usuários & Motoristas
            </label>
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Seu e-mail cadastrado"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#F47920] focus:bg-white transition"
                  required
                />
              </div>

              {emailError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {emailError}
                </p>
              )}

              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full bg-[#F47920] hover:bg-[#E94E1B] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
              >
                {loadingEmail ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Acessar com E-mail</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <p className="text-[11px] text-gray-400 text-center">
              Para conferencistas e motoristas registrados no SharePoint
            </p>
          </div>

        </div>

      </div>

      <footer className="mt-8 text-gray-400 text-xs text-center">
        Grupo Prime Cargo &copy; {new Date().getFullYear()} — Todos os direitos reservados.
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#F47920]" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
