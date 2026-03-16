import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  const res = await sql`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND data_type = 'uuid'
  `;
  console.log("UUID Columns:", res);
  process.exit(0);
}

check().catch(console.error);
