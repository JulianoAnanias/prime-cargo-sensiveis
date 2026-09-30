import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.sessionId) return NextResponse.json({ error: 'Sessão inválida' }, { status: 400 });
    return NextResponse.json({ message: 'Sinal processado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}