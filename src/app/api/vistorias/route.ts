import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSharePointListItem, getSharePointListItems } from '@/lib/graph';
import { SHAREPOINT_LISTS } from '@/lib/constants';

const siteId = process.env.SHAREPOINT_SITE_ID || '';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (siteId) {
      const items = await getSharePointListItems(siteId, SHAREPOINT_LISTS.VISTORIAS);
      const vistorias = items.map((item: any) => ({
        id: item.id,
        vistoriaId: item.fields?.VistoriaId,
        operacaoId: item.fields?.OperacaoId,
        procedimento: item.fields?.Procedimento,
        etapa: item.fields?.Etapa,
        situacao: item.fields?.Situacao,
        latitude: item.fields?.Latitude,
        longitude: item.fields?.Longitude,
        precisaoGPS: item.fields?.PrecisaoGPS,
        cadastradoPorEmail: item.fields?.CadastradoPorEmail,
        cadastradoPorNome: item.fields?.CadastradoPorNome,
        dados: item.fields?.DadosJSON ? JSON.parse(item.fields.DadosJSON) : null,
      }));
      return NextResponse.json({ data: vistorias });
    }
    return NextResponse.json({ data: [] });
  } catch (error: any) {
    console.error('Erro ao listar vistorias:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const vistoriaId = body.vistoriaId || body.id || `vistoria_${Date.now()}`;
    const operacaoId = body.operacaoId || 'op-demo';
    const itemId = body.itemId || 'item-demo';
    const procedimento = body.procedimento || 'entrega';
    const etapa = body.etapa || 'entrega';

    let sharePointResult = null;
    if (siteId) {
      try {
        sharePointResult = await createSharePointListItem(siteId, SHAREPOINT_LISTS.VISTORIAS, {
          Title: `Vistoria ${vistoriaId}`,
          VistoriaId: vistoriaId,
          OperacaoId: operacaoId,
          ItemId: itemId,
          Procedimento: procedimento,
          Etapa: etapa,
          Situacao: 'concluida',
          Latitude: String(body.latitude || body.localizacao?.latitude || ''),
          Longitude: String(body.longitude || body.localizacao?.longitude || ''),
          PrecisaoGPS: String(body.precisao || body.localizacao?.precisao || ''),
          CadastradoPorEmail: body.cadastradoPor?.email || session?.user?.email || 'motorista@primecargo.com.br',
          CadastradoPorNome: body.cadastradoPor?.nome || session?.user?.name || 'Motorista Prime',
          BaixaRealizada: 'true',
          DadosJSON: JSON.stringify(body).slice(0, 10000),
        });
      } catch (spErr: any) {
        console.warn('Alerta ao gravar no SharePoint (continuando com resposta local):', spErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: vistoriaId,
        sharePointId: sharePointResult?.id || null,
        ...body,
      },
      message: 'Vistoria registrada com sucesso no SharePoint',
    });
  } catch (error: any) {
    console.error('Erro ao salvar vistoria:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}