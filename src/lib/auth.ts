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
 * Retorna os dados do usuário ou null se não autorizado.
 */
async function verificarUsuarioAutorizado(email: string) {
  try {
    const siteId = process.env.SHAREPOINT_SITE_ID;
    if (!siteId) {
      console.error('SHAREPOINT_SITE_ID não configurado');
      return null;
    }

    const items = await getSharePointListItems(
      siteId,
      SHAREPOINT_LISTS.USUARIOS,
      {
        filter: `fields/Email eq '${email}'`,
        top: 1,
      }
    );

    if (!items || items.length === 0) {
      console.warn(`Usuário não cadastrado: ${email}`);
      return null;
    }

    const usuario = items[0].fields;

    if (usuario.Situacao !== 'ativo') {
      console.warn(`Usuário inativo: ${email}`);
      return null;
    }

    return {
      id: items[0].id as string,
      nome: usuario.Nome as string,
      email: usuario.Email as string,
      perfil: usuario.Perfil as Perfil,
      situacao: usuario.Situacao as string,
    };
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    // Em caso de falha na API, não permitir acesso
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

      // Verificar se o e-mail está cadastrado e ativo no SharePoint
      const usuario = await verificarUsuarioAutorizado(user.email);
      if (!usuario) {
        return '/login?error=nao_autorizado';
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
    maxAge: 24 * 60 * 60, // 24 horas
  },
});

/**
 * Middleware helper: Verifica se o usuário tem o perfil necessário.
 */
export function requirePerfil(session: any, perfis: Perfil[]): boolean {
  if (!session?.user?.perfil) return false;
  return perfis.includes(session.user.perfil);
}
