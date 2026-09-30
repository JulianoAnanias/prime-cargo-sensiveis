'use client';

import React, { createContext, useContext } from 'react';
// import { useSession, signOut } from 'next-auth/react'; // Descomentar quando NextAuth estiver instalado
import { useSyncContext } from './sync-context';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Simulando useSession para evitar erros antes da instalação
  // const { data: session } = useSession();
  const session = { user: { name: 'Juliano', email: 'juliano@primecargo.com.br' } };
  
  const { pendingCount } = useSyncContext();

  const handleLogout = async () => {
    if (pendingCount > 0) {
      const confirm = window.confirm('Você tem dados não sincronizados. Fazer logout agora pode causar perda de dados. Deseja continuar?');
      if (!confirm) return;
    }
    // await signOut();
    console.log('Usuario logged out');
  };

  const value = {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
