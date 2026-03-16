import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function initLoansModuleDB() {
  try {
    console.log('Creating loan_applications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS loan_applications (
        loan_id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id),
        shg_id INTEGER REFERENCES shgs(id),
        amount DECIMAL(10, 2) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        duration INTEGER NOT NULL, -- in months
        trust_score INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
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

    console.log('Loans Module DB initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Loans Module DB:', error);
    process.exit(1);
  }
}

initLoansModuleDB();
