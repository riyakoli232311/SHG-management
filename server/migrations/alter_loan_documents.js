import { getDb } from '../lib/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
  try {
    const sql = getDb();
    
    console.log("Altering loan_documents table...");
    await sql`
      ALTER TABLE loan_documents
      ADD COLUMN IF NOT EXISTS extracted_data JSONB,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `;

    console.log("Creating verification_logs table...");
    await sql`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id INT REFERENCES loan_documents(doc_id),
        action TEXT,
        remarks TEXT,
        verified_by TEXT,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

runMigration();
