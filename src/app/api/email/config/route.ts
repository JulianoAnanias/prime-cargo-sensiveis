import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET: Lista todos os e-mails configurados e o histórico recente de envios
export async function GET(request: NextRequest) {
  try {
    const emails: any = await (sql as any).query(
      `SELECT * FROM config_emails ORDER BY id ASC`
    );

    const logs: any = await (sql as any).query(
      `SELECT * FROM email_logs ORDER BY criado_em DESC LIMIT 20`
    );

    return NextResponse.json({
      success: true,
      data: emails || [],
      logs: logs || [],
      counts: {
        total: emails?.length || 0,
        ativos: emails?.filter((e: any) => e.ativo)?.length || 0,
        inativos: emails?.filter((e: any) => !e.ativo)?.length || 0,
      }
    });
  } catch (error: any) {
    console.error('Erro na rota de configuração de e-mails:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Cadastra novo destinatário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, tipo, ativo } = body;

    if (!email || !nome) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const rows: any = await (sql as any).query(
      `INSERT INTO config_emails (nome, email, tipo, ativo, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE
       SET nome = EXCLUDED.nome, tipo = EXCLUDED.tipo, ativo = EXCLUDED.ativo, atualizado_em = NOW()
       RETURNING *;`,
      [nome.trim(), cleanEmail, tipo || 'todas', ativo ?? true]
    );

    return NextResponse.json({
      success: true,
      message: 'Destinatário cadastrado com sucesso!',
      data: rows[0]
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar destinatário de e-mail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Atualiza destinatário existente (ex: ativar/desativar ou alterar tipo)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nome, email, tipo, ativo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const rows: any = await (sql as any).query(
      `UPDATE config_emails
       SET nome = COALESCE($1, nome),
           email = COALESCE($2, email),
           tipo = COALESCE($3, tipo),
           ativo = COALESCE($4, ativo),
           atualizado_em = NOW()
       WHERE id = $5
       RETURNING *;`,
      [nome ? nome.trim() : null, email ? email.toLowerCase().trim() : null, tipo || null, ativo !== undefined ? ativo : null, id]
    );

    return NextResponse.json({
      success: true,
      message: 'Destinatário atualizado com sucesso!',
      data: rows[0]
    });
  } catch (error: any) {
    console.error('Erro ao atualizar destinatário de e-mail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove destinatário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    await (sql as any).query(`DELETE FROM config_emails WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Destinatário removido com sucesso!'
    });
  } catch (error: any) {
    console.error('Erro ao excluir destinatário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}