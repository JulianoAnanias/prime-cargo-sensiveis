import { NextRequest, NextResponse } from 'next/server';
import { getSharePointListItems, createSharePointListItem } from '@/lib/graph';
import { SHAREPOINT_LISTS } from '@/lib/constants';
import { hashPassword } from '@/lib/password';
import { sql } from '@/lib/neon';

const siteId = process.env.SHAREPOINT_SITE_ID || '';

export async function GET(request: NextRequest) {
  try {
    const userMap = new Map<string, any>();

    // 1. Busca usuários do banco de dados Neon Postgres
    try {
      const dbUsers: any = await (sql as any).query(
        `SELECT id, nome, email, perfil, situacao, (senha_hash IS NOT NULL AND senha_hash != '') as has_password FROM app_users ORDER BY id ASC`
      );
      if (Array.isArray(dbUsers)) {
        for (const u of dbUsers) {
          const emailLower = (u.email || '').toLowerCase().trim();
          userMap.set(emailLower, {
            id: String(u.id),
            nome: u.nome,
            email: emailLower,
            perfil: u.perfil || 'gestao',
            situacao: u.situacao || 'ativo',
            hasPassword: Boolean(u.has_password),
          });
        }
      }
    } catch (dbErr) {
      console.warn('Alerta ao consultar app_users no Neon:', dbErr);
    }

    // 2. Busca e mescla com usuários do SharePoint
    if (siteId) {
      try {
        const items = await getSharePointListItems(siteId, SHAREPOINT_LISTS.USUARIOS);
        for (const item of items) {
          const emailLower = (item.fields?.EmailUsuario || item.fields?.Email || item.fields?.Title || '').toLowerCase().trim();
          if (emailLower) {
            const hasPassword = Boolean(item.fields?.SenhaHash && String(item.fields?.SenhaHash).trim().length > 0);
            if (!userMap.has(emailLower)) {
              userMap.set(emailLower, {
                id: item.id,
                nome: item.fields?.NomeUsuario || item.fields?.Title || emailLower,
                email: emailLower,
                perfil: item.fields?.Perfil || 'motorista',
                situacao: item.fields?.Situacao || 'ativo',
                hasPassword,
              });
            } else {
              // Atualiza hasPassword se existir no SharePoint
              if (hasPassword) {
                userMap.get(emailLower)!.hasPassword = true;
              }
            }
          }
        }
      } catch (spErr) {
        console.warn('Alerta ao listar usuários do SharePoint:', spErr);
      }
    }

    return NextResponse.json({ data: Array.from(userMap.values()) });
  } catch (error: any) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.nome) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }

    const cleanEmail = body.email.toLowerCase().trim();
    const nome = body.nome.trim();
    const perfil = body.perfil || 'gestao';
    const situacao = body.situacao || 'ativo';
    const senhaHash = body.senha && body.senha.length >= 6 ? hashPassword(body.senha) : null;

    // 1. Salva no banco de dados Neon Postgres (persistência confiável e instantânea)
    try {
      await (sql as any).query(
        `INSERT INTO app_users (nome, email, perfil, situacao, senha_hash, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (email) DO UPDATE
         SET nome = EXCLUDED.nome, perfil = EXCLUDED.perfil, situacao = EXCLUDED.situacao,
             senha_hash = COALESCE(EXCLUDED.senha_hash, app_users.senha_hash),
             atualizado_em = NOW()`,
        [nome, cleanEmail, perfil, situacao, senhaHash]
      );
    } catch (dbErr) {
      console.warn('Alerta ao salvar usuário no Neon:', dbErr);
    }

    // 2. Salva na lista oficial do SharePoint
    if (siteId) {
      try {
        const fields: Record<string, unknown> = {
          Title: nome,
          NomeUsuario: nome,
          EmailUsuario: cleanEmail,
          Perfil: perfil,
          Situacao: situacao,
        };

        if (senhaHash) {
          fields.SenhaHash = senhaHash;
        }

        await createSharePointListItem(siteId, SHAREPOINT_LISTS.USUARIOS, fields);
      } catch (spErr) {
        console.warn('Alerta ao salvar usuário no SharePoint:', spErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário cadastrado com sucesso!',
      data: { nome, email: cleanEmail, perfil, situacao }
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}