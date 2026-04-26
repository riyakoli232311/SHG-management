import { getDb } from './server/lib/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function testInsert() {
  const sql = getDb();
  let extractedData = {}; // empty
  let status = 'pending';
  try {
    const res = await sql`
      INSERT INTO loan_documents (loan_id, document_type, file_path, extracted_data, status)
      VALUES (1, 'Test', '/test/path', ${JSON.stringify(extractedData)}, ${status})
      RETURNING *
    `;
    console.log("Inserted with JSON.stringify:", res);
  } catch (e) {
    console.error("Error inserting string:", e.message);
  }

  try {
    const res2 = await sql`
      INSERT INTO loan_documents (loan_id, document_type, file_path, extracted_data, status)
      VALUES (1, 'Test2', '/test/path2', ${extractedData}, ${status})
      RETURNING *
    `;
    console.log("Inserted with object directly:", res2);
  } catch(e) {
    console.error("Error inserting obj:", e.message);
  }
}
testInsert();
