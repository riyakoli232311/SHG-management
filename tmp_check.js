import dotenv from 'dotenv';
dotenv.config();
import { getDb } from './server/lib/db.js';

async function check() {
  const sql = getDb();
  const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'admins'`;
  console.log('Admin columns:', res.map(r => r.column_name));
  process.exit(0);
}

check().catch(console.error);
