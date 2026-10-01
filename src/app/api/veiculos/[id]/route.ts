import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      placa,
      modelo,
      categoria,
      capacidadePesoKg,
      comprimentoMetros,
      larguraMetros,
      alturaMetros,
      observacoes,
      status
    } = body;

    const cleanPlaca = placa?.toUpperCase().trim();
    const peso = Number(capacidadePesoKg) || 0;
    const comp = Number(comprimentoMetros) || 0;
    const larg = Number(larguraMetros) || 0;
    const alt = Number(alturaMetros) || 0;
    const cubagem = Number((comp * larg * alt).toFixed(2));

    await (sql as any).query(
      `UPDATE veiculos 
       SET placa = COALESCE($2, placa),
           modelo = COALESCE($3, modelo),
           categoria = COALESCE($4, categoria),
           capacidade_peso_kg = COALESCE($5, capacidade_peso_kg),
           comprimento_metros = COALESCE($6, comprimento_metros),
           largura_metros = COALESCE($7, largura_metros),
           altura_metros = COALESCE($8, altura_metros),
           cubagem_m3 = COALESCE($9, cubagem_m3),
           status = COALESCE($10, status),
           observacoes = COALESCE($11, observacoes)
       WHERE id = $1`,
      [id, cleanPlaca, modelo, categoria, peso, comp, larg, alt, cubagem, status, observacoes]
    );

    return NextResponse.json({ success: true, message: 'Veículo atualizado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao atualizar veículo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await (sql as any).query(
      `DELETE FROM veiculos WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true, message: 'Veículo excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir veículo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
