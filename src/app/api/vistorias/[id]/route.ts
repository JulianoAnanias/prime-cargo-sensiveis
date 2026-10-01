import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'ID da vistoria não informado' }, { status: 400 });
    }

    const rows: any = await (sql as any).query(
      `SELECT * FROM vistorias WHERE id = $1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Vistoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error: any) {
    console.error('Erro ao buscar vistoria no Neon Postgres:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const rows: any = await (sql as any).query(
      `UPDATE vistorias SET 
        status = COALESCE($2, status), 
        observacoes = COALESCE($3, observacoes),
        updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [id, body.status, body.observacoes]
    );

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error: any) {
    console.error('Erro ao atualizar vistoria no Neon Postgres:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}