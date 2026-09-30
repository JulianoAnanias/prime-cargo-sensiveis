import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    return NextResponse.json({ data: { url: `https://sharepoint.com/mock-file-${params.id}.jpg` } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}