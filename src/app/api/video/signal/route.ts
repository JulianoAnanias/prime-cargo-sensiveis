import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 });
    }

    const rows: any = await (sql as any).query(
      `SELECT * FROM video_sessions WHERE token = $1`,
      [token]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Sessão de transmissão não encontrada ou expirada' }, { status: 404 });
    }

    const session = rows[0];

    // Atualiza timestamp de atividade assincronamente
    (sql as any).query(
      `UPDATE video_sessions SET updated_at = NOW() WHERE token = $1`,
      [token]
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        token: session.token,
        driverName: session.driver_name,
        clientName: session.client_name,
        docNumber: session.doc_number,
        status: session.status,
        offer: session.offer,
        answer: session.answer,
        driverCandidates: session.driver_candidates || [],
        viewerCandidates: session.viewer_candidates || [],
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar sinal de vídeo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token, ...payload } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 });
    }

    // 1. INICIALIZAR SESSÃO PELO MOTORISTA
    if (action === 'init') {
      const driverName = payload.driverName || 'Motorista Prime Cargo';
      const clientName = payload.clientName || 'Cliente Prime Cargo';
      const docNumber = payload.docNumber || 'Vistoria Operacional';

      await (sql as any).query(
        `INSERT INTO video_sessions 
         (token, driver_name, client_name, doc_number, status, offer, answer, driver_candidates, viewer_candidates, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'waiting', null, null, '[]'::jsonb, '[]'::jsonb, NOW(), NOW())
         ON CONFLICT (token) DO UPDATE 
         SET driver_name = $2, client_name = $3, doc_number = $4, status = 'waiting', updated_at = NOW()`,
        [token, driverName, clientName, docNumber]
      );

      return NextResponse.json({ success: true, message: 'Sessão iniciada com sucesso' });
    }

    // 2. MOTORISTA ENVIA OFERTA WEBRTC (OFFER)
    if (action === 'offer') {
      const offerJson = payload.offer ? JSON.stringify(payload.offer) : null;
      const candidatesJson = Array.isArray(payload.candidates) ? JSON.stringify(payload.candidates) : '[]';

      await (sql as any).query(
        `UPDATE video_sessions 
         SET offer = $2::jsonb, 
             driver_candidates = driver_candidates || $3::jsonb, 
             updated_at = NOW() 
         WHERE token = $1`,
        [token, offerJson, candidatesJson]
      );

      return NextResponse.json({ success: true, message: 'Oferta registrada' });
    }

    // 3. CLIENTE ENVIA RESPOSTA WEBRTC (ANSWER)
    if (action === 'answer') {
      const answerJson = payload.answer ? JSON.stringify(payload.answer) : null;
      const candidatesJson = Array.isArray(payload.candidates) ? JSON.stringify(payload.candidates) : '[]';

      await (sql as any).query(
        `UPDATE video_sessions 
         SET answer = $2::jsonb, 
             status = 'connected', 
             viewer_candidates = viewer_candidates || $3::jsonb, 
             updated_at = NOW() 
         WHERE token = $1`,
        [token, answerJson, candidatesJson]
      );

      return NextResponse.json({ success: true, message: 'Resposta registrada' });
    }

    // 4. CANDIDATO ICE DO MOTORISTA
    if (action === 'driver_candidate') {
      if (payload.candidate) {
        const candidateJson = JSON.stringify([payload.candidate]);
        await (sql as any).query(
          `UPDATE video_sessions 
           SET driver_candidates = driver_candidates || $2::jsonb, 
               updated_at = NOW() 
           WHERE token = $1`,
          [token, candidateJson]
        );
      }
      return NextResponse.json({ success: true });
    }

    // 5. CANDIDATO ICE DO CLIENTE
    if (action === 'viewer_candidate') {
      if (payload.candidate) {
        const candidateJson = JSON.stringify([payload.candidate]);
        await (sql as any).query(
          `UPDATE video_sessions 
           SET viewer_candidates = viewer_candidates || $2::jsonb, 
               updated_at = NOW() 
           WHERE token = $1`,
          [token, candidateJson]
        );
      }
      return NextResponse.json({ success: true });
    }

    // 6. ENCERRAR SESSÃO
    if (action === 'close') {
      await (sql as any).query(
        `UPDATE video_sessions SET status = 'closed', updated_at = NOW() WHERE token = $1`,
        [token]
      );
      return NextResponse.json({ success: true, message: 'Transmissão encerrada' });
    }

    return NextResponse.json({ error: 'Ação de sinalização inválida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro ao processar sinal de vídeo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}