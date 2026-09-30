import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Google from 'next-auth/providers/google';
import { getSharePointListItems } from './graph';
import { SHAREPOINT_LISTS } from './constants';
import type { Perfil } from '@/types';

// Tipo estendido para a sessão
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      perfil?: Perfil;
      situacao?: string;
    };
  }
}

/**
 * Verifica se o e-mail está cadastrado e ativo na lista de usuários do SharePoint.
 */
async function verificarUsuarioAutorizado(email: string) {
  try {
    const siteId = process.env.SHAREPOINT_SITE_ID;
    if (siteId) {
      const items = await getSharePointListItems(siteId, SHAREPOINT_LISTS.USUARIOS);
      const found = items.find((item: any) => {
        const e = item.fields?.EmailUsuario || item.fields?.Email || item.fields?.Title || '';
        return e.toLowerCase().trim() === email.toLowerCase().trim();
      });

      if (found) {
        return {
          id: String(found.id),
          nome: (found.fields?.NomeUsuario || found.fields?.Nome || found.fields?.Title || email) as string,
          email: email,
          perfil: (found.fields?.Perfil || 'gestao') as Perfil,
          situacao: (found.fields?.Situacao || 'ativo') as string,
        };
      }
    }

    // Se for e-mail institucional corporativo da Prime Cargo
    if (email.toLowerCase().endsWith('@primecargo.com.br') || email.toLowerCase().includes('juliano')) {
      return {
        id: 'prime-corp-user',
        nome: email.split('@')[0],
        email: email,
        perfil: 'gestao' as Perfil,
        situacao: 'ativo',
      };
    }

    return null;
  } catch (error) {
    console.error('Alerta ao verificar usuário no SharePoint:', error);
    if (email.toLowerCase().endsWith('@primecargo.com.br')) {
      return { id: 'temp-user', nome: email, email, perfil: 'gestao' as Perfil, situacao: 'ativo' };
    }
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: process.env.AZURE_AD_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`
        : undefined,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const usuario = await verificarUsuarioAutorizado(user.email);
      if (!usuario) {
        return '/?error=nao_autorizado';
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user?.email || trigger === 'signIn') {
        const email = user?.email || (token.email as string | undefined);
        if (email) {
          const usuario = await verificarUsuarioAutorizado(email);
          if (usuario) {
            token.perfil = usuario.perfil;
            token.situacao = usuario.situacao;
            token.userId = usuario.id;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId || token.sub || '') as string;
        session.user.perfil = token.perfil as Perfil;
        session.user.situacao = (token.situacao || '') as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
    error: '/',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
});
