import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function testDash() {
  const sql = neon(process.env.DATABASE_URL);
  const shgId = 3; 

  try {
    const membersRes = await sql`SELECT * FROM members WHERE shg_id = ${shgId}`;
    console.log("members ok");
    const savingsRes = await sql`SELECT * FROM savings WHERE shg_id = ${shgId}`;
    console.log("savings ok");
    const loansRes = await sql`SELECT * FROM loans WHERE shg_id = ${shgId}`;
    console.log("loans ok");
    const repaymentsRes = await sql`SELECT * FROM repayments WHERE shg_id = ${shgId}`;
    console.log("repayments ok");
    const [shgInfo] = await sql`SELECT district FROM shg_info WHERE id = ${shgId}`;
    console.log("shg_info ok: ", shgInfo);
    
    if (shgInfo?.district) {
      const schemes = await sql`
        SELECT gs.id, gs.title, gs.description, gs.created_at
        FROM government_schemes gs
        JOIN admins a ON gs.admin_id = a.id
        WHERE LOWER(TRIM(a.district)) = LOWER(TRIM(${shgInfo.district}))
        ORDER BY gs.created_at DESC
      `;
      console.log("schemes ok: ", schemes.length);
    }
  } catch(e) {
    console.error("SQL Error: ", e);
  }
}

testDash();
