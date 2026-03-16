import { getDb } from './lib/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function test() {
  const sql = getDb();
  try {
    const shgInfoCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'shg_info'`;
    fs.writeFileSync('db_out4.txt', "SHG_Info: " + shgInfoCols.map(c => c.column_name).join(', '));
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
test();
