import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const sql = neon(process.env.DATABASE_URL);

async function fixSavingsDB() {
  try {
    console.log('Dropping old savings table...');
    await sql`DROP TABLE IF EXISTS savings CASCADE`;

    console.log('Creating savings table...');
    await sql`
      CREATE TABLE savings (
        id SERIAL PRIMARY KEY,
        shg_id INTEGER REFERENCES shg_info(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_mode VARCHAR(50) DEFAULT 'cash',
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(member_id, month, year)
      )
    `;

    console.log('Savings table fixed successfully.');
    // Insert some dummy data if we want or just leave empty
    process.exit(0);
  } catch (err) {
    console.error('Error fixing DB:', err);
    process.exit(1);
  }
}

fixSavingsDB();
