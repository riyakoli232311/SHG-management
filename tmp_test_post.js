import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import { neon } from '@neondatabase/serverless';

async function testPost() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const [admin] = await sql`SELECT * FROM admins LIMIT 1`;
    console.log('Admin:', admin);
    
    if (admin) {
      const [res] = await sql`
        INSERT INTO government_schemes (title, description, admin_id) 
        VALUES ('Test Scheme', 'This is a test', ${admin.id}) 
        RETURNING *
      `;
      console.log('Scheme posted:', res);
    } else {
      console.log("No admins found!");
    }
  } catch (err) {
    console.error('Post Scheme error:', err);
  }
}

testPost();
