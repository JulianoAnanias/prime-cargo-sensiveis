import { NextRequest, NextResponse } from 'next/server';
import { validatePesquisa } from '@/lib/validation';
import { analyzePesquisa } from '@/lib/ai-service';
import { sendEmail } from '@/lib/email-service';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    return NextResponse.json({ data: { token: params.token, operacao: 'Op-123' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const body = await request.json();
    const validation = validatePesquisa(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Pesquisa inválida', details: validation.error }, { status: 400 });
    }
    
    analyzePesquisa(body.respostas.join(' ')).catch(console.error);
    sendEmail('pesquisa_cliente', { token: params.token, respostas: body.respostas }).catch(console.error);
    
    return NextResponse.json({ message: 'Pesquisa enviada com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}