import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const sql = neon(process.env.DATABASE_URL);

async function fixLoansDB() {
  try {
    console.log('Dropping old tables...');
    await sql`DROP TABLE IF EXISTS repayments CASCADE`;
    await sql`DROP TABLE IF EXISTS loans CASCADE`;

    console.log('Creating loans table...');
    await sql`
      CREATE TABLE loans (
        id SERIAL PRIMARY KEY,
        shg_id INTEGER REFERENCES shg_info(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        loan_amount DECIMAL(10, 2) NOT NULL,
        interest_rate DECIMAL(5, 2) NOT NULL,
        tenure_months INTEGER NOT NULL,
        purpose VARCHAR(255),
        disbursed_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating repayments table...');
    await sql`
      CREATE TABLE repayments (
        id SERIAL PRIMARY KEY,
        shg_id INTEGER REFERENCES shg_info(id) ON DELETE CASCADE,
        loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        emi_amount DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        paid_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Loans and Repayments tables fixed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing DB:', err);
    process.exit(1);
  }
}

fixLoansDB();
