import { NextRequest, NextResponse } from 'next/server';
import { updateSharePointListItem, deleteSharePointListItem } from '@/lib/graph';
import { SHAREPOINT_LISTS } from '@/lib/constants';
import { hashPassword } from '@/lib/password';
import { sql } from '@/lib/neon';

const siteId = process.env.SHAREPOINT_SITE_ID || '';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nome, email, perfil, situacao, resetPassword, novaSenha } = body;

    const fieldsToUpdate: Record<string, unknown> = {};

    if (nome) {
      fieldsToUpdate.Title = nome;
      fieldsToUpdate.NomeUsuario = nome;
    }
    if (email) {
      fieldsToUpdate.EmailUsuario = email.toLowerCase().trim();
    }
    if (perfil) {
      fieldsToUpdate.Perfil = perfil;
    }
    if (situacao) {
      fieldsToUpdate.Situacao = situacao;
    }
    // Redefinição de senha pelo Administrador
    if (resetPassword) {
      fieldsToUpdate.SenhaHash = ''; // Zera para forçar primeiro acesso novamente
    } else if (novaSenha && novaSenha.length >= 6) {
      fieldsToUpdate.SenhaHash = hashPassword(novaSenha);
    }

    // 1. Atualiza no Neon Postgres (por ID ou por Email)
    try {
      if (email) {
        await (sql as any).query(
          `UPDATE app_users 
           SET nome = COALESCE($1, nome), perfil = COALESCE($2, perfil), situacao = COALESCE($3, situacao),
               senha_hash = CASE WHEN $4::text IS NOT NULL THEN $4::text ELSE senha_hash END,
               atualizado_em = NOW()
           WHERE LOWER(TRIM(email)) = $5`,
          [nome || null, perfil || null, situacao || null, fieldsToUpdate.SenhaHash !== undefined ? fieldsToUpdate.SenhaHash : null, email.toLowerCase().trim()]
        );
      } else if (!isNaN(Number(params.id))) {
        await (sql as any).query(
          `UPDATE app_users 
           SET nome = COALESCE($1, nome), perfil = COALESCE($2, perfil), situacao = COALESCE($3, situacao),
               senha_hash = CASE WHEN $4::text IS NOT NULL THEN $4::text ELSE senha_hash END,
               atualizado_em = NOW()
           WHERE id = $5`,
          [nome || null, perfil || null, situacao || null, fieldsToUpdate.SenhaHash !== undefined ? fieldsToUpdate.SenhaHash : null, Number(params.id)]
        );
      }
    } catch (neonErr) {
      console.warn('Alerta ao atualizar Neon app_users:', neonErr);
    }

    // 2. Atualiza no SharePoint
    if (siteId) {
      try {
        await updateSharePointListItem(siteId, SHAREPOINT_LISTS.USUARIOS, params.id, fieldsToUpdate);
      } catch (spErr) {
        console.warn('Alerta ao atualizar SharePoint:', spErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: { id: params.id, ...fieldsToUpdate }
    });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: error.message || 'Falha ao atualizar usuário' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Remove ou desativa no Neon Postgres
    try {
      if (!isNaN(Number(params.id))) {
        await (sql as any).query(`DELETE FROM app_users WHERE id = $1`, [Number(params.id)]);
      }
    } catch (neonErr) {
      console.warn('Alerta ao deletar do Neon app_users:', neonErr);
    }

    // 2. Remove do SharePoint
    if (siteId) {
      try {
        await deleteSharePointListItem(siteId, SHAREPOINT_LISTS.USUARIOS, params.id);
      } catch (spErr) {
        console.warn('Alerta ao deletar do SharePoint:', spErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: error.message || 'Falha ao excluir usuário' }, { status: 500 });
  }
}