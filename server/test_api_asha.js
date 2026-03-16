import dotenv from 'dotenv';
dotenv.config();
import { getDb } from './lib/db.js';

async function testDashboardResponse() {
  const sql = getDb();
  try {
    const shgId = 3; // Asha Mahila Mandal

    const [shgInfo] = await sql`SELECT district FROM shg_info WHERE id = ${shgId}`;
    let adminInfo = null;
    let schemes = [];

    console.log("Asha's District in shg_info:", shgInfo.district);

    if (shgInfo?.district) {
      const [admin] = await sql`
        SELECT id, name, email, phone_number, district
        FROM admins 
        WHERE LOWER(TRIM(district)) = LOWER(TRIM(${shgInfo.district})) 
        LIMIT 1
      `;
      
      console.log("Matched Admin:", admin);
      
      if (admin) {
        adminInfo = admin;
        schemes = await sql`
          SELECT id, title, description, created_at
          FROM government_schemes
          WHERE admin_id = ${admin.id}
          ORDER BY created_at DESC
        `;
      }
    }
    
    console.log("Final adminInfo:", adminInfo?.name);
    console.log("Final Schemes length:", schemes.length);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
testDashboardResponse();
