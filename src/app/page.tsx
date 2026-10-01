'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowLeft 
} from 'lucide-react';

interface DriverInfo {
  nome: string;
  email: string;
  perfil: string;
  hasPassword: boolean;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  
  // Estados do fluxo de login dos usuários/motoristas
  const [step, setStep] = useState<'email' | 'enter_password' | 'create_password'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    try {
      await signIn('microsoft-entra-id', { callbackUrl: '/admin/operacoes' });
    } catch (e) {
      setLoadingMicrosoft(false);
    }
  };

  // Etapa 1: Verificar e-mail do motorista no SharePoint
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setLoadingAction(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'E-mail não autorizado na Prime Cargo.');
        return;
      }

      setDriverInfo({
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        hasPassword: data.hasPassword,
      });

      // Se já possui senha, pede para digitar a senha
      if (data.hasPassword) {
        setStep('enter_password');
      } else {
        // Primeiro acesso: pede para cadastrar a senha
        setStep('create_password');
      }
    } catch (err: any) {
      setErrorMessage('Falha ao conectar aos servidores da Prime Cargo. Tente novamente.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Etapa 2A: Cadastrar senha no primeiro acesso
  const handleRegisterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverInfo) return;

    if (!passwordInput || passwordInput.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setLoadingAction(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_password',
          email: driverInfo.email,
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao cadastrar senha.');
        return;
      }

      setSuccessMessage('Senha cadastrada com sucesso! Entrando no sistema...');
      localStorage.setItem('prime_user', JSON.stringify(data.user));
      try {
        document.cookie = `prime_session=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=604800; SameSite=Lax`;
      } catch (e) {}

      setTimeout(() => {
        if (data.user.perfil === 'gestao' || data.user.perfil === 'admin') {
          window.location.href = '/admin/operacoes';
        } else {
          window.location.href = '/app';
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage('Erro ao salvar sua senha. Tente novamente.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Etapa 2B: Login com senha cadastrada
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverInfo) return;

    if (!passwordInput) {
      setErrorMessage('Por favor, informe sua senha.');
      return;
    }

    setLoadingAction(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: driverInfo.email,
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Senha incorreta. Tente novamente.');
        return;
      }

      setSuccessMessage('Autenticado com sucesso! Redirecionando...');
      localStorage.setItem('prime_user', JSON.stringify(data.user));
      try {
        document.cookie = `prime_session=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=604800; SameSite=Lax`;
      } catch (e) {}

      setTimeout(() => {
        if (data.user.perfil === 'gestao' || data.user.perfil === 'admin') {
          window.location.href = '/admin/operacoes';
        } else {
          window.location.href = '/app';
        }
      }, 400);
    } catch (err: any) {
      setErrorMessage('Erro de comunicação. Tente novamente.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Voltar para a tela de digitar o e-mail
  const handleBackToEmail = () => {
    setStep('email');
    setPasswordInput('');
    setConfirmPasswordInput('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 w-full max-w-md border border-gray-100 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="Grupo Prime Cargo"
            width={240}
            height={95}
            className="object-contain h-16 w-auto"
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

        {/* Alerta de erro de autenticação Microsoft */}
        {authError && (
          <div className="w-full mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Acesso não autorizado via Microsoft</p>
              <p className="mt-0.5 text-red-600">
                Para acessar, sua conta corporativa deve ser <strong>@primecargo</strong> ou <strong>@primestorage</strong> e estar previamente cadastrada e ativa pela Gestão.
              </p>
            </div>
          </div>
        )}

        <div className="w-full space-y-6">
          
          {/* SEÇÃO 1: LOGIN DE ADMINISTRADOR / GESTÃO VIA MICROSOFT */}
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  1. Acesso Corporativo / Gestão (ADM)
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
                <p className="text-[11px] text-gray-500 text-center">
                  Contas <strong>@primecargo</strong> ou <strong>@primestorage</strong> cadastradas no sistema
                </p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">ou</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
            </>
          )}

          {/* SEÇÃO 2: FLUXO DE LOGIN SEGURO DO MOTORISTA / CONFERENTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                {step === 'email' ? '2. Acesso de Usuários & Motoristas' : 'Acesso Operacional'}
              </label>
              {step !== 'email' && (
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-xs text-[#F47920] hover:underline flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Trocar e-mail
                </button>
              )}
            </div>

            {/* FEEDBACK DE MENSAGENS */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* PASSO 1: DIGITAÇÃO DO E-MAIL */}
            {step === 'email' && (
              <form onSubmit={handleCheckEmail} className="space-y-3">
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

                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full bg-[#F47920] hover:bg-[#E94E1B] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
                >
                  {loadingAction ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-400 text-center">
                  Para conferencistas e motoristas registrados no SharePoint
                </p>
              </form>
            )}

            {/* PASSO 2A: PRIMEIRO ACESSO - CADASTRAR SENHA */}
            {step === 'create_password' && (
              <form onSubmit={handleRegisterPassword} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Primeiro Acesso Detectado</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Olá, <strong>{driverInfo?.nome}</strong>! Para sua segurança, cadastre uma senha pessoal para acessar suas vistorias.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Criar nova senha (mín. 6 dígitos)"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#F47920] focus:bg-white transition"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#F47920] focus:bg-white transition"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full bg-[#F47920] hover:bg-[#E94E1B] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
                >
                  {loadingAction ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Cadastrar Senha e Entrar</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* PASSO 2B: LOGIN COM SENHA CADASTRADA */}
            {step === 'enter_password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#4D4D4D]">{driverInfo?.nome}</p>
                    <p className="text-[11px] text-gray-500">{driverInfo?.email}</p>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    Cadastrado
                  </span>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Sua senha de acesso"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#F47920] focus:bg-white transition"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full bg-[#F47920] hover:bg-[#E94E1B] disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
                >
                  {loadingAction ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Entrar no Aplicativo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

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
