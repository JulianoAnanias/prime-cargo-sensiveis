import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, data, targetEmail, vistoriaId } = body;

    if (vistoriaId) {
      const { sql } = await import('@/lib/neon');
      const rows: any = await (sql as any).query(`SELECT * FROM vistorias WHERE id = $1`, [vistoriaId]);
      if (!rows || rows.length === 0) {
        return NextResponse.json({ error: 'Vistoria não encontrada' }, { status: 404 });
      }
      const result = await sendEmail('resultado_vistoria', rows[0]);
      return NextResponse.json({
        success: true,
        message: `E-mail da vistoria ${vistoriaId} disparado com sucesso!`,
        result
      });
    }

    if (action === 'test') {
      const sampleVistoria = {
        id: `TESTE-${Date.now().toString().slice(-4)}`,
        procedimento: 'entrega',
        cliente: 'Hospital Albert Einstein (Demonstração)',
        local: 'Almoxarifado Central - Doca 3',
        endereco: 'Av. Albert Einstein, 627 - Morumbi, São Paulo - SP',
        tipo_documento: 'NF',
        numero_documento: '00084512',
        veiculo_placa: 'PRIME-2026',
        motorista_nome: 'Equipe de Operações Prime Cargo',
        condicao_equipamento: { funcionando: true, novo: true },
        inspecao_embalagem: { embalagemOriginal: true },
        inspecao_equipamento: { semSinaisAvarias: true },
        observacoes: 'Envio de teste acionado diretamente pelo Painel de Gestão de E-mails da Prime Cargo.',
        latitude: -23.5982,
        longitude: -46.7153,
        precisao_gps: 5,
        fotos: ['foto_geral.jpg', 'plaqueta_serie.jpg'],
        assinaturas: ['assinatura_cliente.png', 'assinatura_conferente.png'],
        status: 'concluida'
      };

      const result = await sendEmail('resultado_vistoria', sampleVistoria);
      return NextResponse.json({
        success: true,
        message: 'E-mail de teste disparado com sucesso!',
        result
      });
    }

    // Envio normal de vistoria
    const result = await sendEmail(type || 'resultado_vistoria', data || {});
    return NextResponse.json({
      success: true,
      message: 'Notificação de e-mail processada',
      result
    });
  } catch (error: any) {
    console.error('Erro na API de envio de email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}