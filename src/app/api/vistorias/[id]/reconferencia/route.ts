import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateReconferencia } from '@/lib/validation';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    return NextResponse.json({ data: { vistoriaId: params.id, ncs: [] } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const body = await request.json();
    const validation = validateReconferencia(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Dados de reconferência inválidos', details: validation.error }, { status: 400 });
    }
    return NextResponse.json({ data: { vistoriaId: params.id, status: 'Reconferida' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}