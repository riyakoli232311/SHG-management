import dotenv from 'dotenv';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env') });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function migrate() {
  console.log('Starting member authentication migration...');
  try {
    // Add password_hash column
    console.log('Adding password_hash column to members table...');
    await sql`
      ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT NULL
    `;
    console.log('✅ Column added successfully');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
    console.log('Migration finished.');
  }
}

migrate();
