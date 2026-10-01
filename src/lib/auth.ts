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

import { sql } from './neon';

/**
 * Verifica se o e-mail corporativo possui domínio @primecargo ou @primestorage
 */
export function isAllowedCorporateDomain(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().trim().split('@')[1] || '';
  return domain.includes('primecargo') || domain.includes('primestorage');
}

/**
 * Verifica se o usuário tem autorização para login via Microsoft:
 * 1. Deve possuir domínio corporativo (@primecargo ou @primestorage)
 * 2. Deve estar PRESENTE no cadastro de usuários (Neon Postgres ou SharePoint)
 * 3. Deve estar com status 'ativo'
 */
async function verificarUsuarioAutorizado(email: string) {
  const cleanEmail = email.toLowerCase().trim();

  // 1. Validação obrigatória de domínio corporativo
  if (!isAllowedCorporateDomain(cleanEmail)) {
    console.warn(`[Auth] Acesso negado para ${cleanEmail}: apenas contas corporativas @primecargo ou @primestorage são permitidas.`);
    return null;
  }

  try {
    // 2. Consulta tabela de usuários no banco Neon Postgres (rápido e prioritário)
    try {
      const dbRows: any = await (sql as any).query(
        `SELECT id, nome, email, perfil, situacao FROM app_users WHERE LOWER(TRIM(email)) = $1 LIMIT 1`,
        [cleanEmail]
      );
      if (dbRows && dbRows.length > 0) {
        const u = dbRows[0];
        if (u.situacao && u.situacao.toLowerCase() !== 'ativo') {
          console.warn(`[Auth] Usuário ${cleanEmail} está com cadastro inativo.`);
          return null;
        }
        return {
          id: String(u.id),
          nome: (u.nome || cleanEmail.split('@')[0]) as string,
          email: cleanEmail,
          perfil: (u.perfil || 'gestao') as Perfil,
          situacao: u.situacao || 'ativo',
        };
      }
    } catch (dbErr) {
      console.warn('[Auth] Alerta ao consultar app_users no Neon:', dbErr);
    }

    // 3. Consulta lista de Usuários no SharePoint (com sincronização para o Neon)
    const siteId = process.env.SHAREPOINT_SITE_ID;
    if (siteId) {
      try {
        const items = await getSharePointListItems(siteId, SHAREPOINT_LISTS.USUARIOS);
        const found = items.find((item: any) => {
          const e = item.fields?.EmailUsuario || item.fields?.Email || item.fields?.Title || '';
          return e.toLowerCase().trim() === cleanEmail;
        });

        if (found) {
          const situacao = (found.fields?.Situacao || 'ativo').toLowerCase();
          if (situacao !== 'ativo') {
            console.warn(`[Auth] Usuário ${cleanEmail} está inativo no SharePoint.`);
            return null;
          }

          const perfil = (found.fields?.Perfil || 'gestao') as Perfil;
          const nome = (found.fields?.NomeUsuario || found.fields?.Nome || found.fields?.Title || cleanEmail.split('@')[0]) as string;

          // Auto-sincroniza no Neon Postgres
          try {
            await (sql as any).query(
              `INSERT INTO app_users (nome, email, perfil, situacao, atualizado_em)
               VALUES ($1, $2, $3, 'ativo', NOW())
               ON CONFLICT (email) DO UPDATE
               SET nome = EXCLUDED.nome, perfil = EXCLUDED.perfil, situacao = 'ativo', atualizado_em = NOW()`,
              [nome, cleanEmail, perfil]
            );
          } catch (e) {}

          return {
            id: String(found.id),
            nome,
            email: cleanEmail,
            perfil,
            situacao: 'ativo',
          };
        }
      } catch (spErr) {
        console.warn('[Auth] Alerta ao consultar SharePoint:', spErr);
      }
    }

    console.warn(`[Auth] O e-mail ${cleanEmail} possui domínio corporativo válido, mas NÃO está presente no cadastro de usuários.`);
    return null;
  } catch (error) {
    console.error('[Auth] Erro crítico ao verificar usuário:', error);
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
