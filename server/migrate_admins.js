import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config(); // Assuming run from server/ directory where .env is located

const sql = neon(process.env.DATABASE_URL);

async function migrateAdminsTable() {
  try {
    console.log('Running admins table migration...');
    
    // Add columns
    await sql`
      ALTER TABLE admins 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS district VARCHAR(100)
    `;
    console.log('Added new columns (name, phone_number, state, district)');

    // Since area_assigned is still there, let's copy 'District A' to 'district' and set state to a default so the existing row constraints don't break, then we can make the new ones NOT NULL later if required. For now, we'll just drop area_assigned
    await sql`
      UPDATE admins
      SET 
        name = 'Default Admin',
        phone_number = '0000000000',
        state = 'Maharashtra',
        district = area_assigned
      WHERE district IS NULL
    `;
    console.log('Migrated existing area_assigned into district');

    // Drop old column
    await sql`
      ALTER TABLE admins 
      DROP COLUMN IF EXISTS area_assigned
    `;
    console.log('Dropped area_assigned column');
    
    // Make columns NOT NULL (optional but good practice for new columns based on requirements)
    await sql`
      ALTER TABLE admins
      ALTER COLUMN name SET NOT NULL,
      ALTER COLUMN phone_number SET NOT NULL,
      ALTER COLUMN state SET NOT NULL,
      ALTER COLUMN district SET NOT NULL
    `;
    console.log('Set columns to NOT NULL');

    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateAdminsTable();
