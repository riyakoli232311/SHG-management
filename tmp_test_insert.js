import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function testQuery() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const memberId = 1; // You need a real member ID from DB
    const [member] = await sql`SELECT * FROM members LIMIT 1`;
    if (!member) return console.log("No members found");
    console.log("Found member", member.id);

    try {
      const shgId = member.shg_id;
      const amount = 1500;
      const purpose = "Other";
      const duration = 3;
      const aadhar_number = "1234";
      const trustScore = 50;

      const [application] = await sql`
        INSERT INTO loan_applications (member_id, shg_id, amount, purpose, duration, trust_score, status, aadhar_number)
        VALUES (${member.id}, ${shgId}, ${amount}, ${purpose}, ${duration}, ${trustScore}, 'pending', ${aadhar_number || null})
        RETURNING *
      `;
      console.log("Success:", application);

      await sql`DELETE FROM loan_applications WHERE loan_id = ${application.loan_id}`;
    } catch(err) {
      console.error("SQL Error on Insert:", err);
    }

  } catch (err) {
    console.error('Test error:', err);
  }
}

testQuery();
