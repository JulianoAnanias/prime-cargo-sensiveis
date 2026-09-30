import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.perfil !== 'gestao' && session.user.perfil !== 'qualidade')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }
    return NextResponse.json({ data: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const token = Math.random().toString(36).substring(2, 15);
    return NextResponse.json({ data: { token, expiracao: new Date(Date.now() + 86400000) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}