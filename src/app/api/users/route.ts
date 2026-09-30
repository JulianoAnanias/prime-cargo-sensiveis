import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSharePointListItems, createSharePointListItem } from '@/lib/graph';
import { SHAREPOINT_LISTS } from '@/lib/constants';

const siteId = process.env.SHAREPOINT_SITE_ID || '';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    // Permite leitura autenticada ou interna
    if (siteId) {
      const items = await getSharePointListItems(siteId, SHAREPOINT_LISTS.USUARIOS);
      const users = items.map((item: any) => ({
        id: item.id,
        nome: item.fields?.NomeUsuario || item.fields?.Title,
        email: item.fields?.EmailUsuario,
        perfil: item.fields?.Perfil,
        situacao: item.fields?.Situacao,
      }));
      return NextResponse.json({ data: users });
    }
    return NextResponse.json({ data: [] });
  } catch (error: any) {
    console.error('Erro na API de usuários:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    if (!body.email || !body.nome) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }

    if (siteId) {
      const res = await createSharePointListItem(siteId, SHAREPOINT_LISTS.USUARIOS, {
        Title: body.nome,
        NomeUsuario: body.nome,
        EmailUsuario: body.email,
        Perfil: body.perfil || 'motorista',
        Situacao: body.situacao || 'ativo',
      });
      return NextResponse.json({ success: true, data: res, message: 'Usuário cadastrado no SharePoint com sucesso' });
    }

    return NextResponse.json({ data: body, message: 'Usuário processado' });
  } catch (error: any) {
    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}