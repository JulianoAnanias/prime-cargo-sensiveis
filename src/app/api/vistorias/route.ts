import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { sendEmail } from '@/lib/email-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const procedimento = searchParams.get('procedimento');
    const status = searchParams.get('status');

    let query = `SELECT * FROM vistorias WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (procedimento && procedimento !== 'todos') {
      query += ` AND procedimento = $${paramIndex++}`;
      params.push(procedimento);
    }

    if (status && status !== 'todos') {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (
        cliente ILIKE $${paramIndex} OR 
        numero_documento ILIKE $${paramIndex} OR 
        local ILIKE $${paramIndex} OR 
        veiculo_placa ILIKE $${paramIndex} OR 
        motorista_nome ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const rows: any = await (sql as any).query(query, params);

    return NextResponse.json({
      success: true,
      data: rows || [],
      count: rows?.length || 0,
    });
  } catch (error: any) {
    console.error('Erro ao listar vistorias do Neon Postgres:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const id = body.id || body.vistoriaId || `vist-${Date.now()}`;
    const procedimento = body.procedimento || 'entrega';
    const cliente = body.cliente || body.atendimento?.cliente || 'Cliente Prime';
    const local = body.local || body.atendimento?.local || '';
    const endereco = body.endereco || body.atendimento?.endereco || '';
    const tipo_documento = body.tipo_documento || body.atendimento?.tipoDocumento || 'NF';
    const numero_documento = body.numero_documento || body.atendimento?.numeroDocumento || '';
    const contato = body.contato || body.atendimento?.contato || '';
    const telefone = body.telefone || body.atendimento?.telefone || '';
    const setor = body.setor || body.atendimento?.setor || '';
    const ramal = body.ramal || body.atendimento?.ramal || '';
    const veiculo_placa = body.veiculo_placa || body.atendimento?.veiculo || '';
    const veiculo_modelo = body.veiculo_modelo || '';
    const observacoes = body.observacoes || '';
    const autorizacao_abertura = Boolean(body.autorizacaoAbertura ?? body.autorizacao_abertura ?? false);
    const latitude = body.latitude || body.localizacao?.latitude || null;
    const longitude = body.longitude || body.localizacao?.longitude || null;
    const precisao_gps = body.accuracy || body.precisao || body.precisao_gps || null;
    const motorista_nome = body.motorista_nome || body.motorista || body.atendimento?.motorista || 'Motorista Prime';
    const motorista_email = body.motorista_email || body.cadastradoPor?.email || 'motorista@primecargo.com.br';
    const status = body.status || 'concluida';

    const condicao_equipamento = JSON.stringify(body.condicao || body.condicao_equipamento || {});
    const dimensoes = JSON.stringify(body.dimensoes || {});
    const inspecao_embalagem = JSON.stringify(body.embalagem || body.inspecao_embalagem || {});
    const inspecao_equipamento = JSON.stringify(body.equipamento || body.inspecao_equipamento || {});
    const fotos = JSON.stringify(body.fotos || {});
    const assinaturas = JSON.stringify(body.assinaturas || {});
    const pesquisa_satisfacao = body.pesquisa_satisfacao || body.pesquisa ? JSON.stringify(body.pesquisa_satisfacao || body.pesquisa) : null;

    const query = `
      INSERT INTO vistorias (
        id, procedimento, cliente, local, endereco, tipo_documento, numero_documento,
        contato, telefone, setor, ramal, veiculo_placa, veiculo_modelo,
        condicao_equipamento, dimensoes, inspecao_embalagem, inspecao_equipamento,
        observacoes, autorizacao_abertura, fotos, assinaturas,
        latitude, longitude, precisao_gps, motorista_nome, motorista_email,
        status, pesquisa_satisfacao, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb,
        $18, $19, $20::jsonb, $21::jsonb,
        $22, $23, $24, $25, $26,
        $27, $28::jsonb, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        procedimento = $2,
        cliente = $3,
        local = $4,
        endereco = $5,
        tipo_documento = $6,
        numero_documento = $7,
        contato = $8,
        telefone = $9,
        setor = $10,
        ramal = $11,
        veiculo_placa = $12,
        veiculo_modelo = $13,
        condicao_equipamento = $14::jsonb,
        dimensoes = $15::jsonb,
        inspecao_embalagem = $16::jsonb,
        inspecao_equipamento = $17::jsonb,
        observacoes = $18,
        autorizacao_abertura = $19,
        fotos = $20::jsonb,
        assinaturas = $21::jsonb,
        latitude = COALESCE($22, vistorias.latitude),
        longitude = COALESCE($23, vistorias.longitude),
        precisao_gps = COALESCE($24, vistorias.precisao_gps),
        motorista_nome = $25,
        motorista_email = $26,
        status = $27,
        pesquisa_satisfacao = COALESCE($28::jsonb, vistorias.pesquisa_satisfacao),
        updated_at = NOW()
      RETURNING *;
    `;

    const rows: any = await (sql as any).query(query, [
      id, procedimento, cliente, local, endereco, tipo_documento, numero_documento,
      contato, telefone, setor, ramal, veiculo_placa, veiculo_modelo,
      condicao_equipamento, dimensoes, inspecao_embalagem, inspecao_equipamento,
      observacoes, autorizacao_abertura, fotos, assinaturas,
      latitude, longitude, precisao_gps, motorista_nome, motorista_email,
      status, pesquisa_satisfacao
    ]);

    // Grava também na tabela dedicada de pesquisas para métricas de auditoria
    if (body.pesquisa_satisfacao || body.pesquisa) {
      try {
        const ps = body.pesquisa_satisfacao || body.pesquisa;
        await (sql as any).query(
          `INSERT INTO pesquisas (
            vistoria_id, cliente, documento, respondido_por, cargo_funcao,
            recusada, motivo_recusa, q1_equipe, q2_veiculo, q3_prazo_cuidados, q4_geral, sugestoes, criado_em
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [
            id, cliente, `${tipo_documento}: ${numero_documento}`,
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
      } catch (pErr) {
        console.warn('[Vistorias API] Alerta ao registrar em pesquisas:', pErr);
      }
    }

    const savedVistoria = rows[0];

    // Disparo automático e assíncrono de e-mails para os destinatários cadastrados
    try {
      if (savedVistoria && savedVistoria.status === 'concluida') {
        sendEmail('resultado_vistoria', savedVistoria).catch(err => {
          console.error('[Vistorias API] Falha no disparo automático de e-mail:', err);
        });
      }
    } catch (emailTriggerErr) {
      console.warn('[Vistorias API] Alerta ao acionar disparo de e-mail:', emailTriggerErr);
    }

    return NextResponse.json({
      success: true,
      data: savedVistoria,
      message: 'Vistoria salva com sucesso no Neon Postgres',
    });
  } catch (error: any) {
    console.error('Erro ao salvar vistoria no Neon Postgres:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}