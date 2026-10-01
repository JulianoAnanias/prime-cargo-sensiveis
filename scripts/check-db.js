const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_bjVix7rXY4oD@ep-cool-silence-acobvm92-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('Tabelas encontradas:', tables.map(t => t.table_name));
}

main().catch(console.error);
