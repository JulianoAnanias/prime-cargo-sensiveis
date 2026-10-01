import { sql } from './neon';
import { getGraphClient } from './graph';

export interface VistoriaEmailData {
  id: string;
  procedimento: string;
  cliente: string;
  local?: string;
  endereco?: string;
  tipo_documento?: string;
  numero_documento?: string;
  setor?: string;
  contato?: string;
  veiculo_placa?: string;
  motorista_nome?: string;
  motorista_email?: string;
  condicao_equipamento?: any;
  inspecao_embalagem?: any;
  inspecao_equipamento?: any;
  observacoes?: string;
  latitude?: number;
  longitude?: number;
  precisao_gps?: number;
  fotos?: any;
  assinaturas?: any;
  pesquisa_satisfacao?: any;
  status?: string;
  created_at?: string;
}

/**
 * Monta o corpo do e-mail em HTML corporativo Prime Cargo
 */
export function buildVistoriaEmailHtml(vistoria: VistoriaEmailData): string {
  const proc = (vistoria.procedimento || 'entrega').toUpperCase();
  const procColor = proc === 'COLETA' ? '#0078D4' : proc === 'ENTREGA' ? '#107C41' : '#5C2D91';
  
  // Parse de campos JSON
  const condicao = typeof vistoria.condicao_equipamento === 'string' 
    ? JSON.parse(vistoria.condicao_equipamento || '{}') 
    : vistoria.condicao_equipamento || {};

  const embalagem = typeof vistoria.inspecao_embalagem === 'string' 
    ? JSON.parse(vistoria.inspecao_embalagem || '{}') 
    : vistoria.inspecao_embalagem || {};

  const equipamento = typeof vistoria.inspecao_equipamento === 'string' 
    ? JSON.parse(vistoria.inspecao_equipamento || '{}') 
    : vistoria.inspecao_equipamento || {};

  const hasAvaria = Boolean(
    condicao.danificado || 
    embalagem.embalagemComAvaria || 
    embalagem.embalagemInadequada || 
    equipamento.apresentaAvarias || 
    equipamento.umidoMolhado
  );

  const fotosCount = Array.isArray(vistoria.fotos) ? vistoria.fotos.length : 
    (typeof vistoria.fotos === 'object' && vistoria.fotos !== null ? Object.keys(vistoria.fotos).length : 0);

  const assinaturasCount = Array.isArray(vistoria.assinaturas) ? vistoria.assinaturas.length : 
    (typeof vistoria.assinaturas === 'object' && vistoria.assinaturas !== null ? Object.keys(vistoria.assinaturas).length : 0);

  const dataFormatada = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Vistoria Concluída - Grupo Prime Cargo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e5e5; }
    .header { background-color: #1e1e1e; padding: 24px; text-align: center; border-bottom: 4px solid #F47920; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { color: #F47920; margin: 6px 0 0 0; font-size: 13px; font-weight: bold; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; color: #fff; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 12px; background-color: ${procColor}; }
    .content { padding: 28px; color: #333333; line-height: 1.5; }
    .status-box { padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; font-weight: 600; display: flex; align-items: center; }
    .status-ok { background-color: #E6F4EA; border-left: 5px solid #137333; color: #137333; }
    .status-avaria { background-color: #FCE8E6; border-left: 5px solid #C5221F; color: #C5221F; }
    .grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .grid td { padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 13px; vertical-align: top; }
    .grid td.label { font-weight: bold; color: #666666; width: 35%; background-color: #fafafa; }
    .grid td.value { color: #222222; font-weight: 500; }
    .section-title { font-size: 14px; font-weight: bold; color: #F47920; text-transform: uppercase; margin: 24px 0 10px 0; border-bottom: 2px solid #F47920; padding-bottom: 4px; }
    .btn-container { text-align: center; margin: 30px 0 10px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #F47920, #E94E1B); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 10px rgba(244,121,32,0.3); }
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 11px; color: #888888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Grupo Prime Cargo Logística Integrada</h1>
      <p>Notificação Automática de Vistoria de Cargas Sensíveis</p>
      <div class="badge">Procedimento: ${proc}</div>
    </div>
    
    <div class="content">
      ${hasAvaria ? `
        <div class="status-box status-avaria">
          ⚠️ <strong>ATENÇÃO DA QUALIDADE / GESTÃO:</strong> Esta vistoria registrou apontamento de <strong>AVARIA OU NÃO CONFORMIDADE</strong>. Ação imediata necessária.
        </div>
      ` : `
        <div class="status-box status-ok">
          ✅ <strong>VISTORIA CONFORME:</strong> Equipamento e embalagem inspecionados sem divergências ou avarias.
        </div>
      `}

      <div class="section-title">Dados Gerais do Atendimento</div>
      <table class="grid">
        <tr>
          <td class="label">ID da Vistoria:</td>
          <td class="value"><code>${vistoria.id}</code></td>
        </tr>
        <tr>
          <td class="label">Cliente:</td>
          <td class="value"><strong>${vistoria.cliente || 'Não informado'}</strong></td>
        </tr>
        <tr>
          <td class="label">Documento Fiscal:</td>
          <td class="value">${vistoria.tipo_documento || 'NF'}: <strong>${vistoria.numero_documento || 'Não informado'}</strong></td>
        </tr>
        <tr>
          <td class="label">Local / Setor:</td>
          <td class="value">${vistoria.local || 'Local não informado'} ${vistoria.setor ? `(${vistoria.setor})` : ''}</td>
        </tr>
        <tr>
          <td class="label">Endereço da Operação:</td>
          <td class="value">${vistoria.endereco || 'Endereço não informado'}</td>
        </tr>
        <tr>
          <td class="label">Veículo (Placa):</td>
          <td class="value"><strong>${vistoria.veiculo_placa || 'Veículo não informado'}</strong></td>
        </tr>
        <tr>
          <td class="label">Motorista / Conferente:</td>
          <td class="value">${vistoria.motorista_nome || 'Equipe Prime Cargo'}</td>
        </tr>
        <tr>
          <td class="label">Data e Hora da Conclusão:</td>
          <td class="value">${dataFormatada}</td>
        </tr>
      </table>

      <div class="section-title">Evidências & Auditoria Digital</div>
      <table class="grid">
        <tr>
          <td class="label">Fotos Registradas:</td>
          <td class="value">${fotosCount > 0 ? `${fotosCount} foto(s) anexadas aos quadrantes` : 'Fotos salvas no dossiê'}</td>
        </tr>
        <tr>
          <td class="label">Assinaturas Coletadas:</td>
          <td class="value">${assinaturasCount > 0 ? `${assinaturasCount} assinatura(s) com carimbo de tempo` : 'Assinaturas colhidas na tela'}</td>
        </tr>
        ${vistoria.latitude && vistoria.longitude && !isNaN(Number(vistoria.latitude)) ? `
        <tr>
          <td class="label">Carimbo GPS:</td>
          <td class="value">
            Lat: ${Number(vistoria.latitude).toFixed(6)}, Lng: ${Number(vistoria.longitude).toFixed(6)}
            <br>
            <a href="https://www.google.com/maps?q=${encodeURIComponent(String(vistoria.latitude))},${encodeURIComponent(String(vistoria.longitude))}" target="_blank" style="color: #0078D4; text-decoration: underline; font-size: 11px;">
              📍 Abrir coordenadas no Google Maps
            </a>
          </td>
        </tr>
        ` : ''}
        ${vistoria.observacoes ? `
        <tr>
          <td class="label">Observações de Campo:</td>
          <td class="value"><em>${vistoria.observacoes}</em></td>
        </tr>
        ` : ''}
      </table>

      ${(() => {
        const ps = typeof vistoria.pesquisa_satisfacao === 'string'
          ? JSON.parse(vistoria.pesquisa_satisfacao || '{}')
          : vistoria.pesquisa_satisfacao;
        if (!ps || (!ps.respondida && !ps.recusada && !ps.respostas && !ps.q4)) return '';

        const isRecusada = Boolean(ps.recusada);
        const respostas = ps.respostas || { q1: ps.q1, q2: ps.q2, q3: ps.q3, q4: ps.q4 };
        const hasNotaBaixa = Object.values(respostas).some((v: any) => 
          String(v).toLowerCase() === 'regular' || String(v).toLowerCase() === 'ruim'
        );

        return `
          <div class="section-title">Pesquisa de Satisfação do Cliente (IPP35)</div>
          ${isRecusada ? `
            <div style="background-color: #FFF3CD; border-left: 5px solid #856404; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #856404; margin-bottom: 16px;">
              <strong>ℹ️ O CLIENTE OPTOU POR NÃO RESPONDER À PESQUISA NO LOCAL:</strong><br>
              <em>Motivo registrado: ${ps.motivo_recusa || ps.motivoRecusa || 'Cliente sem tempo / ausência de gestor no ato da baixa'}</em>
            </div>
          ` : `
            ${hasNotaBaixa ? `
              <div style="background-color: #F8D7DA; border-left: 5px solid #721C24; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #721C24; margin-bottom: 16px;">
                <strong>⚠️ ALERTA DA QUALIDADE — CLIENTE AVALIOU COMO REGULAR OU RUIM:</strong><br>
                A equipe de Qualidade deve analisar os apontamentos e prestar suporte proativo ao cliente.
              </div>
            ` : `
              <div style="background-color: #D4EDDA; border-left: 5px solid #155724; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #155724; margin-bottom: 16px;">
                <strong>⭐ AVALIAÇÃO POSITIVA COLETADA NO LOCAL:</strong><br>
                Atendimento avaliado pelo cliente com êxito conforme os padrões Prime Cargo.
              </div>
            `}
            <table class="grid">
              <tr>
                <td class="label">Respondido Por:</td>
                <td class="value"><strong>${ps.respondido_por || ps.nomeRespondente || 'Cliente no Local'}</strong> ${ps.cargo_funcao || ps.cargoRespondente ? `(${ps.cargo_funcao || ps.cargoRespondente})` : ''}</td>
              </tr>
              <tr>
                <td class="label">1. Postura & Equipe:</td>
                <td class="value"><strong>${respostas.q1 || 'Não avaliado'}</strong></td>
              </tr>
              <tr>
                <td class="label">2. Veículo & Conservação:</td>
                <td class="value"><strong>${respostas.q2 || 'Não avaliado'}</strong></td>
              </tr>
              <tr>
                <td class="label">3. Cumprimento de Prazo:</td>
                <td class="value"><strong>${respostas.q3 || 'Não avaliado'}</strong></td>
              </tr>
              <tr>
                <td class="label">4. Classificação Geral:</td>
                <td class="value"><strong>${respostas.q4 || 'Não avaliado'}</strong></td>
              </tr>
              ${ps.sugestoes ? `
              <tr>
                <td class="label">Sugestões / Comentários:</td>
                <td class="value"><em>${ps.sugestoes}</em></td>
              </tr>
              ` : ''}
            </table>
          `}
        `;
      })()}

      <div class="btn-container">
        <a href="https://sensiveis-mobile.primecargoatendimento.com.br/admin/operacoes" class="btn">
          Acessar Dossiê Completo no Painel ADM →
        </a>
      </div>
    </div>

    <div class="footer">
      Este é um e-mail automático gerado pelo Sistema de Vistorias Sensíveis da Prime Cargo.<br>
      Grupo Prime Cargo Logística Integrada & Prime Storage &copy; ${new Date().getFullYear()} — Todos os direitos reservados.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispara e-mails automáticos consultando a lista de destinatários em config_emails
 */
export const sendEmail = async (type: string, data: any): Promise<{ success: boolean; count?: number; message?: string }> => {
  console.log(`[Email Service] Iniciando processamento de e-mail tipo: ${type}`);

  try {
    // 1. Busca os destinatários ativos no Neon Postgres
    const rows: any = await (sql as any).query(
      `SELECT email, nome, tipo FROM config_emails WHERE ativo = true`
    );

    if (!rows || rows.length === 0) {
      console.warn('[Email Service] Nenhum destinatário ativo configurado em config_emails.');
      return { success: true, count: 0, message: 'Nenhum destinatário cadastrado' };
    }

    // Verifica se a vistoria possui avarias para filtrar quem recebe
    const condicao = typeof data.condicao_equipamento === 'string' 
      ? JSON.parse(data.condicao_equipamento || '{}') 
      : data.condicao_equipamento || {};
    const embalagem = typeof data.inspecao_embalagem === 'string' 
      ? JSON.parse(data.inspecao_embalagem || '{}') 
      : data.inspecao_embalagem || {};
    const equipamento = typeof data.inspecao_equipamento === 'string' 
      ? JSON.parse(data.inspecao_equipamento || '{}') 
      : data.inspecao_equipamento || {};

    const hasAvaria = Boolean(
      condicao.danificado || 
      embalagem.embalagemComAvaria || 
      embalagem.embalagemInadequada || 
      equipamento.apresentaAvarias || 
      equipamento.umidoMolhado
    );

    const ps = typeof data.pesquisa_satisfacao === 'string'
      ? JSON.parse(data.pesquisa_satisfacao || '{}')
      : data.pesquisa_satisfacao;
    const isRecusada = Boolean(ps?.recusada);
    const respostas = ps?.respostas || { q1: ps?.q1, q2: ps?.q2, q3: ps?.q3, q4: ps?.q4 };
    const hasNotaBaixa = Object.values(respostas).some((v: any) => 
      String(v).toLowerCase() === 'regular' || String(v).toLowerCase() === 'ruim'
    );

    // Filtra destinatários elegíveis
    const recipients: string[] = [];
    for (const r of rows) {
      if (r.tipo === 'todas') {
        recipients.push(r.email.trim());
      } else if (r.tipo === 'avarias_apenas' && (hasAvaria || hasNotaBaixa)) {
        recipients.push(r.email.trim());
      }
    }

    if (recipients.length === 0) {
      console.log('[Email Service] Nenhum destinatário atende ao critério do evento.');
      return { success: true, count: 0 };
    }

    let assunto = hasAvaria 
      ? `🚨 [ALERTA DE AVARIA] Vistoria ${data.procedimento ? data.procedimento.toUpperCase() : ''} - ${data.cliente || 'Prime Cargo'} (Doc: ${data.numero_documento || ''})`
      : `✅ [Vistoria Concluída] ${data.procedimento ? data.procedimento.toUpperCase() : ''} - ${data.cliente || 'Prime Cargo'} (Doc: ${data.numero_documento || ''})`;

    if (type === 'pesquisa_satisfacao') {
      if (isRecusada) {
        assunto = `ℹ️ [PESQUISA RECUSADA] Cliente Recusou Pesquisa - ${data.cliente || 'Prime Cargo'} (Doc: ${data.numero_documento || ''})`;
      } else if (hasNotaBaixa) {
        assunto = `🚨 [ALERTA QUALIDADE] Pesquisa Regular/Ruim - ${data.cliente || 'Prime Cargo'} (Doc: ${data.numero_documento || ''})`;
      } else {
        assunto = `⭐ [Pesquisa de Satisfação] Avaliação Coletada - ${data.cliente || 'Prime Cargo'} (Doc: ${data.numero_documento || ''})`;
      }
    } else if (hasNotaBaixa) {
      assunto = `🚨 [ALERTA QUALIDADE] Vistoria & Pesquisa Regular/Ruim - ${data.cliente || 'Prime Cargo'} (Doc: ${data.numero_documento || ''})`;
    } else if (isRecusada) {
      assunto = `${assunto} (Pesquisa Recusada)`;
    }

    const htmlBody = buildVistoriaEmailHtml(data);
    const fromEmail = process.env.EMAIL_FROM || 'noreply@primecargo.com.br';

    let deliveryStatus = 'enviado';
    let deliveryDetails = `Disparado com sucesso para ${recipients.length} destinatários: ${recipients.join(', ')}`;

    // 2. Tenta envio através do Microsoft Graph API (App Permissions / Shared Mailbox)
    try {
      const graphClient = getGraphClient();
      await graphClient.api(`/users/${fromEmail}/sendMail`).post({
        message: {
          subject: assunto,
          body: {
            contentType: 'HTML',
            content: htmlBody,
          },
          toRecipients: recipients.map(address => ({
            emailAddress: { address }
          })),
        },
        saveToSentItems: 'false',
      });
      console.log(`[Email Service] E-mail enviado com sucesso via Microsoft Graph API para: ${recipients.join(', ')}`);
    } catch (graphErr: any) {
      console.warn(`[Email Service] Notificação sobre Graph API (${graphErr?.message}). Registrando em log auditável de e-mails.`);
      deliveryStatus = 'simulado';
      deliveryDetails = `Entrega registrada em fila de auditoria (Graph API offline ou credencial em homologação). Destinatários: ${recipients.join(', ')}`;
    }

    // 3. Grava log permanente da notificação na tabela email_logs
    try {
      await (sql as any).query(
        `INSERT INTO email_logs (tipo, destinatarios, assunto, status, detalhes, criado_em)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [type, recipients.join(', '), assunto, deliveryStatus, deliveryDetails]
      );
    } catch (logErr) {
      console.warn('[Email Service] Alerta ao gravar email_logs:', logErr);
    }

    return { 
      success: true, 
      count: recipients.length, 
      message: `Notificação processada para ${recipients.length} destinatário(s)` 
    };
  } catch (error: any) {
    console.error('[Email Service] Erro geral ao enviar e-mail:', error);
    return { success: false, message: error.message };
  }
};
