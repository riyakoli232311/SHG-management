import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function testAdmin() {
  const sql = neon(process.env.DATABASE_URL);
  const shgId = 3; 

  try {
    const [savingsResult] = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM savings WHERE shg_id = ${shgId}`;
    console.log("savings totalok", savingsResult?.total);

    const [loansResult] = await sql`
      SELECT 
        COUNT(*) as count, 
        COALESCE(SUM(loan_amount), 0) as total 
      FROM loans 
      WHERE shg_id = ${shgId} AND status = 'active'
    `;
    console.log("loans ok", loansResult?.count);
  } catch(e) {
    console.error("SQL Error: ", e);
  }
  process.exit(0);
}

testAdmin();
