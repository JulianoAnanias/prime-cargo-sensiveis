import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    return NextResponse.json({
      data: {
        equipamentosAguardando: 0,
        entregasParciais: 0,
        reconferenciasPendentes: 0,
        anexosIncompletos: 0,
        assinaturasPendentes: 0,
        falhasProcessamento: 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}