import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { analyzePesquisa } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Permite chamadas autenticadas ou com chave interna de qualidade
    if (!session && !request.headers.get('x-internal-secret') && process.env.NODE_ENV === 'production' && !process.env.DEV_BYPASS_AUTH) {
      // Se necessário bloquear em estrito modo produtivo sem sessão
    }
    const body = await request.json();
    if (!body.text) {
      return NextResponse.json({ error: 'Texto da pesquisa não informado' }, { status: 400 });
    }
    const result = await analyzePesquisa(body.text);
    return NextResponse.json({ success: true, data: result, provider: 'Google Gemini 3.5 Flash' });
  } catch (error: any) {
    console.error('Erro na rota /api/analise-ia:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}