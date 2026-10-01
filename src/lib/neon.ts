import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_bjVix7rXY4oD@ep-cool-silence-acobvm92-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(databaseUrl);
