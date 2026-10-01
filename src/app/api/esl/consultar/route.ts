import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ESL_BASE_URL = process.env.ESL_BASE_URL || 'https://prime.eslcloud.com.br';
const ESL_TOKEN = process.env.ESL_TOKEN || 'zA8CXzUSaq_5J4U-sK5NbjxbnLWKjwcspvekT23z32UgQxxUuQ4pLg';
const TEMPLATE_DELIVERIES_ID = 2259;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = (searchParams.get('tipo') || 'NF').toUpperCase().trim();
    const rawNumero = searchParams.get('numero') || '';
    const cleanNumero = rawNumero.replace(/\D/g, '').trim();

    if (!cleanNumero) {
      return NextResponse.json(
        { success: false, message: 'Informe o número do documento (NF, Minuta ou CT-e) para realizar a consulta.' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const dateRange = `${currentYear}-01-01 - ${currentYear}-12-31`;

    const url = new URL(`${ESL_BASE_URL}/api/analytics/reports/${TEMPLATE_DELIVERIES_ID}/data`);
    url.searchParams.set('per', '10');
    url.searchParams.set('search[freights][service_at]', dateRange);

    if (tipo === 'MINUTA') {
      url.searchParams.set('search[freights][corporation_sequence_number]', cleanNumero);
    } else if (tipo === 'CTE') {
      // Tenta buscar no relatório de entregas ou via parâmetro
      url.searchParams.set('search[freights][corporation_sequence_number]', cleanNumero);
    } else {
      // Padrão: Busca por Nota Fiscal
      url.searchParams.set('search[scopes][from_invoice_number]', cleanNumero);
    }

    const resp = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${ESL_TOKEN}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (resp.status === 429) {
      return NextResponse.json(
        { success: false, message: 'Serviço ESL temporariamente ocupado (Rate limit). Tente novamente em alguns segundos.' },
        { status: 429 }
      );
    }

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, message: `Erro na comunicação com ESL TMS (Status ${resp.status}).` },
        { status: 502 }
      );
    }

    const json = await resp.json();
    let matches = Array.isArray(json) ? json : [];

    // Se a busca por CT-e não veio pelo relatório, podemos complementar via GraphQL
    if (tipo === 'CTE' && matches.length === 0) {
      try {
        const gqlQuery = `
          query ConsultaCte($number: String!) {
            cte(params: { number: $number }) {
              edges {
                node {
                  id
                  number
                  series
                  issuedAt
                  corporation { name }
                }
              }
            }
          }
        `;

        const gqlResp = await fetch(`${ESL_BASE_URL}/graphql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ESL_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: gqlQuery, variables: { number: cleanNumero } }),
        });

        if (gqlResp.ok) {
          const gqlData = await gqlResp.json();
          const cteNode = gqlData.data?.cte?.edges?.[0]?.node;
          if (cteNode) {
            matches = [{
              fit_fhe_cte_number: cteNode.number,
              fit_pyr_name: cteNode.corporation?.name || 'Cliente identificado via CT-e',
              service_at_day: cteNode.issuedAt ? cteNode.issuedAt.slice(0, 10) : '',
              invoices_mapping: [cleanNumero],
            }];
          }
        }
      } catch (gqlErr) {
        console.warn('Fallback GraphQL CTE:', gqlErr);
      }
    }

    if (matches.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Nenhum documento localizado no ESL TMS para ${tipo}: ${cleanNumero}. Verifique o número digitado ou preencha os dados manualmente.`,
      });
    }

    // Pega o registro mais relevante / recente
    const match = matches[0];

    // Formata o endereço completo
    const partesEndereco: string[] = [];
    if (match.fit_dos_line_1) partesEndereco.push(match.fit_dos_line_1);
    if (match.fit_dos_number && match.fit_dos_number !== '000X' && match.fit_dos_number !== '0') {
      partesEndereco.push(`nº ${match.fit_dos_number}`);
    }
    if (match.fit_dos_neighborhood) partesEndereco.push(match.fit_dos_neighborhood);
    if (match.fit_diy_name) partesEndereco.push(match.fit_diy_name);

    const enderecoFormatado = partesEndereco.join(', ') || 'Endereço registrado no ESL';

    const nfsArray: string[] = Array.isArray(match.invoices_mapping)
      ? match.invoices_mapping.map(String)
      : [cleanNumero];

    return NextResponse.json({
      success: true,
      message: 'Documento localizado com sucesso no ESL TMS!',
      data: {
        tipoConsultado: tipo,
        numeroConsultado: cleanNumero,
        cliente: match.fit_pyr_name || 'Cliente Identificado',
        documento: tipo === 'MINUTA'
          ? `Minuta: ${match.corporation_sequence_number || cleanNumero}`
          : tipo === 'CTE'
          ? `CT-e: ${match.fit_fhe_cte_number || cleanNumero}`
          : `NF: ${nfsArray[0] || cleanNumero}`,
        tipoDocumento: tipo === 'MINUTA' ? 'MINUTA' : tipo === 'CTE' ? 'CTE' : 'NF',
        numeroDocumento: tipo === 'MINUTA'
          ? String(match.corporation_sequence_number || cleanNumero)
          : tipo === 'CTE'
          ? String(match.fit_fhe_cte_number || cleanNumero)
          : String(nfsArray[0] || cleanNumero),
        minuta: match.corporation_sequence_number ? String(match.corporation_sequence_number) : '',
        cte: match.fit_fhe_cte_number ? String(match.fit_fhe_cte_number) : '',
        nfs: nfsArray,
        endereco: enderecoFormatado,
        local: enderecoFormatado,
        volumes: Number(match.invoices_volumes || 1),
        peso: Number(match.real_weight || match.cubages_cubed_weight || 0),
        valorMercadoria: match.invoices_value ? Number(match.invoices_value) : null,
        natureza: match.fit_psn_name || '',
        manifesto: match.fit_mey_mft_sequence_code ? String(match.fit_mey_mft_sequence_code) : '',
        previsaoEntrega: match.fit_dpn_delivery_prediction_at || '',
        statusEsl: match.status || '',
      },
    });
  } catch (error: any) {
    console.error('Erro na API de consulta ESL:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro interno ao consultar ESL TMS.' },
      { status: 500 }
    );
  }
}
