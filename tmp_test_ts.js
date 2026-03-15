import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function testPost() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const res = await sql`SELECT * FROM government_schemes ORDER BY created_at DESC LIMIT 5`;
    console.log('Schemes:', res.map(r => ({ id: r.id, created_at: r.created_at, parsed: new Date(r.created_at).getTime() })));
  } catch (err) {
    console.error('Test error:', err);
  }
}

testPost();
