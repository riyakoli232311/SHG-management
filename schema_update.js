import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function schemaUpdate() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log("Adding aadhar_number to loan_applications");
    await sql`ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS aadhar_number VARCHAR(255)`;
    console.log("Added successfully.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

schemaUpdate();
