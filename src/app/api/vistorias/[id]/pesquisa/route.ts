import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { sendEmail } from '@/lib/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vistoriaId = params.id;
    const body = await request.json();
    const ps = body.pesquisa_satisfacao || body;

    if (!ps) {
      return NextResponse.json({ error: 'Dados da pesquisa não informados' }, { status: 400 });
    }

    // 1. Atualiza na tabela vistorias
    const rows: any = await (sql as any).query(
      `UPDATE vistorias 
       SET pesquisa_satisfacao = $1::jsonb, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *;`,
      [JSON.stringify(ps), vistoriaId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Vistoria não encontrada' }, { status: 404 });
    }

    const vistoria = rows[0];

    // 2. Insere na tabela de pesquisas
    try {
      await (sql as any).query(
        `INSERT INTO pesquisas (
          vistoria_id, cliente, documento, respondido_por, cargo_funcao,
          recusada, motivo_recusa, q1_equipe, q2_veiculo, q3_prazo_cuidados, q4_geral, sugestoes, criado_em
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [
          vistoriaId,
          vistoria.cliente,
          `${vistoria.tipo_documento || 'NF'}: ${vistoria.numero_documento || 'S/N'}`,
          ps.respondido_por || ps.nomeRespondente || 'Cliente no Local',
          ps.cargo_funcao || ps.cargoRespondente || '',
          Boolean(ps.recusada),
          ps.motivo_recusa || ps.motivoRecusa || '',
          ps.respostas?.q1 || ps.q1 || '',
          ps.respostas?.q2 || ps.q2 || '',
          ps.respostas?.q3 || ps.q3 || '',
          ps.respostas?.q4 || ps.q4 || '',
          ps.sugestoes || ''
        ]
      );
    } catch (dbErr) {
      console.warn('[Pesquisa API] Alerta ao gravar em pesquisas:', dbErr);
    }

    // 3. Dispara o envio de e-mail corporativo com a mesma dinâmica
    sendEmail('pesquisa_satisfacao', {
      ...vistoria,
      pesquisa_satisfacao: ps
    }).catch(emailErr => {
      console.error('[Pesquisa API] Erro ao enviar e-mail de satisfação:', emailErr);
    });

    return NextResponse.json({
      success: true,
      message: ps.recusada 
        ? 'Recusa da pesquisa registrada com sucesso e notificação enviada' 
        : 'Pesquisa de satisfação registrada com sucesso e e-mail disparado',
      data: vistoria
    });
  } catch (error: any) {
    console.error('Erro ao salvar pesquisa de satisfação:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
