import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const sql = neon(process.env.DATABASE_URL);

async function init() {
  try {
    console.log('Creating loan_applications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS loan_applications (
        loan_id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        shg_id INTEGER REFERENCES shg_info(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        duration INTEGER NOT NULL, -- in months
        trust_score INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
        aadhar_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('loan_applications table created successfully.');

    console.log('Creating loan_documents table...');
    await sql`
      CREATE TABLE IF NOT EXISTS loan_documents (
        doc_id SERIAL PRIMARY KEY,
        loan_id INTEGER REFERENCES loan_applications(loan_id) ON DELETE CASCADE,
        document_type VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('loan_documents table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('DB Init Error:', err);
    process.exit(1);
  }
}

init();
