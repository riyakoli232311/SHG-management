import dotenv from 'dotenv';
dotenv.config();
import { getDb } from './lib/db.js';

async function query() {
  const sql = getDb();
  try {
    // 1. Get Asha's SHG details (user_id = 4 or id = 3)
    const [shg] = await sql`SELECT id, name, district FROM shg_info WHERE name = 'Asha Mahila Mandal'`;
    console.log("SHG Info:", shg);
    
    // 2. Perform exact query from dashboard.js
    const [admin] = await sql`
      SELECT id, name, email, phone_number, district
      FROM admins 
      WHERE LOWER(TRIM(district)) = LOWER(TRIM(${shg.district})) 
      LIMIT 1
    `;
    console.log("Admin Match:", admin);
    
    if (admin) {
      const schemes = await sql`
        SELECT id, title, description, created_at
        FROM government_schemes
        WHERE admin_id = ${admin.id}
        ORDER BY created_at DESC
      `;
      console.log("Schemes found:", schemes);
    }
    
  } catch(e) { console.error(e) }
  process.exit();
}
query();
