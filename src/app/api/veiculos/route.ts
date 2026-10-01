import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const rows = await (sql as any).query(
      `SELECT * FROM veiculos ORDER BY categoria, placa ASC`
    );

    return NextResponse.json({
      success: true,
      data: (rows || []).map((row: any) => ({
        id: row.id,
        placa: row.placa,
        modelo: row.modelo,
        categoria: row.categoria,
        capacidadePesoKg: Number(row.capacidade_peso_kg),
        comprimentoMetros: Number(row.comprimento_metros),
        larguraMetros: Number(row.largura_metros),
        alturaMetros: Number(row.altura_metros),
        cubagemM3: Number(row.cubagem_m3),
        status: row.status,
        observacoes: row.observacoes || '',
        criadoEm: row.criado_em,
      }))
    });
  } catch (error: any) {
    console.error('Erro ao listar veículos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      status = 'ativo'
    } = body;

    if (!placa || !modelo || !categoria) {
      return NextResponse.json({ error: 'Placa, Modelo e Categoria são obrigatórios' }, { status: 400 });
    }

    const id = 'veic-' + Date.now();
    const cleanPlaca = placa.toUpperCase().trim();
    const peso = Number(capacidadePesoKg) || 0;
    const comp = Number(comprimentoMetros) || 0;
    const larg = Number(larguraMetros) || 0;
    const alt = Number(alturaMetros) || 0;
    const cubagem = Number((comp * larg * alt).toFixed(2));

    await (sql as any).query(
      `INSERT INTO veiculos 
       (id, placa, modelo, categoria, capacidade_peso_kg, comprimento_metros, largura_metros, altura_metros, cubagem_m3, status, observacoes, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [id, cleanPlaca, modelo.trim(), categoria, peso, comp, larg, alt, cubagem, status, observacoes || '']
    );

    return NextResponse.json({
      success: true,
      message: 'Veículo cadastrado com sucesso',
      data: {
        id,
        placa: cleanPlaca,
        modelo,
        categoria,
        capacidadePesoKg: peso,
        comprimentoMetros: comp,
        larguraMetros: larg,
        alturaMetros: alt,
        cubagemM3: cubagem,
        status,
        observacoes
      }
    });
  } catch (error: any) {
    console.error('Erro ao criar veículo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
