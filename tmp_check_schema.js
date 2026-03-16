import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  
  const tables = ['members', 'shg_info', 'government_schemes', 'admins'];
  let output = '';
  for (const table of tables) {
    const res = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${table}
    `;
    output += `\nTable: ${table}\n`;
    res.forEach(c => output += `  ${c.column_name}: ${c.data_type}\n`);
  }
  fs.writeFileSync('schema_out.txt', output);
  process.exit(0);
}

check().catch(console.error);
