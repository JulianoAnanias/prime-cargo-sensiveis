const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_bjVix7rXY4oD@ep-cool-silence-acobvm92-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('Criando tabela vistorias no Neon Postgres...');

  await sql`
    CREATE TABLE IF NOT EXISTS vistorias (
      id VARCHAR(100) PRIMARY KEY,
      procedimento VARCHAR(50) NOT NULL,
      cliente VARCHAR(255) NOT NULL,
      local VARCHAR(255),
      endereco TEXT,
      tipo_documento VARCHAR(50),
      numero_documento VARCHAR(100),
      contato VARCHAR(150),
      telefone VARCHAR(50),
      setor VARCHAR(100),
      ramal VARCHAR(50),
      veiculo_placa VARCHAR(50),
      veiculo_modelo VARCHAR(100),
      condicao_equipamento JSONB DEFAULT '{}'::jsonb,
      dimensoes JSONB DEFAULT '{}'::jsonb,
      inspecao_embalagem JSONB DEFAULT '{}'::jsonb,
      inspecao_equipamento JSONB DEFAULT '{}'::jsonb,
      observacoes TEXT,
      autorizacao_abertura BOOLEAN DEFAULT false,
      fotos JSONB DEFAULT '{}'::jsonb,
      assinaturas JSONB DEFAULT '{}'::jsonb,
      latitude NUMERIC,
      longitude NUMERIC,
      precisao_gps NUMERIC,
      motorista_nome VARCHAR(150),
      motorista_email VARCHAR(150),
      status VARCHAR(50) DEFAULT 'concluida',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  console.log('✅ Tabela vistorias criada com sucesso!');

  // Cria índices para busca rápida
  await sql`CREATE INDEX IF NOT EXISTS idx_vistorias_cliente ON vistorias (cliente);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vistorias_procedimento ON vistorias (procedimento);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vistorias_status ON vistorias (status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vistorias_created_at ON vistorias (created_at DESC);`;

  console.log('✅ Índices criados com sucesso!');
}

main().catch(console.error);
