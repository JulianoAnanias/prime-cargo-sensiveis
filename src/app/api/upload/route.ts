import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateUpload } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const etapa = formData.get('etapa');
    const itemId = formData.get('itemId');
    const tipo = formData.get('tipo');
    
    if (!file || !validateUpload(file)) {
      return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 });
    }
    
    const folderPath = `Data/Veiculo/Midias/${etapa}/${itemId}/${tipo}`;
    
    return NextResponse.json({ 
      data: { url: `https://sharepoint.com/${folderPath}/${file.name}`, midiaId: 'new-id' } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}