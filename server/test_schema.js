import { getDb } from './lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function getTables() {
  const sql = getDb();
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("All tables:", tables.map(t => t.table_name).join(', '));
    
    const meetingTables = tables.filter(t => t.table_name.includes('meeting'));
    
    for (const t of meetingTables) {
      const cols = await sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = ${t.table_name}
      `;
      console.log(`\nTable ${t.table_name} columns:`);
      console.table(cols);
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
getTables();
