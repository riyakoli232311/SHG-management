import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function initAdminDB() {
  try {
    console.log('Creating admins table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        area_assigned VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('admins table created successfully.');

    console.log('Creating government_schemes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS government_schemes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        admin_id INTEGER REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('government_schemes table created successfully.');

    // Create a default admin for testing
    const defaultEmail = 'admin@example.com';
    const existingAdmin = await sql`SELECT * FROM admins WHERE email = ${defaultEmail}`;
    
    if (existingAdmin.length === 0) {
      console.log('Creating default admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await sql`
        INSERT INTO admins (email, password_hash, area_assigned)
        VALUES (${defaultEmail}, ${hashedPassword}, 'District A')
      `;
      console.log('Default admin created: admin@example.com / admin123');
    } else {
      console.log('Default admin already exists.');
    }

    console.log('Admin DB initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Admin DB:', error);
    process.exit(1);
  }
}

initAdminDB();
