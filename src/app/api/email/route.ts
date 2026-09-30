import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const body = await request.json();
    await sendEmail(body.type, body.data);
    return NextResponse.json({ message: 'Email enfileirado para envio' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}