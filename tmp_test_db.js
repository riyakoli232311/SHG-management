import { getDb } from './server/lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const sql = getDb();
  
  const admins = await sql`SELECT id, name, email, district FROM admins`;
  console.log('Admins:', admins);
  
  const shgs = await sql`SELECT id, name, district FROM shg_info`;
  console.log('SHGs:', shgs);
  
  const schemes = await sql`SELECT id, title, admin_id FROM government_schemes`;
  console.log('Schemes:', schemes);
  
  process.exit(0);
}

check().catch(console.error);
