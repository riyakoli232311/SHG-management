import { getDb } from './lib/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function test() {
  const sql = getDb();
  try {
    const [shgRow] = await sql`SELECT id, district FROM shg_info LIMIT 1`;
    if (!shgRow) { console.log('No SHG found'); process.exit(0); }
    const shgId = shgRow.id;
    const adminDistrict = shgRow.district;
    
    console.log(`Testing SHG ${shgId}...`);
    
    const [shg] = await sql`
      SELECT id, name, village, block, district, state, formation_date, bank_name, bank_account, ifsc 
      FROM shg_info 
      WHERE id = ${shgId} AND LOWER(district) = LOWER(${adminDistrict})
    `;
    console.log("SHG Query:", !!shg);

    const members = await sql`SELECT id, name, role, phone FROM members WHERE shg_id = ${shgId}`;
    console.log("Members Query:", members.length);

    const [savingsResult] = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM savings WHERE shg_id = ${shgId}`;
    console.log("Savings Query:", savingsResult);

    const [loansResult] = await sql`
      SELECT COUNT(*) as count, COALESCE(SUM(loan_amount), 0) as total 
      FROM loans WHERE shg_id = ${shgId} AND status = 'active'
    `;
    console.log("Loans Query:", loansResult);
    
    fs.writeFileSync('db_out5.txt', "SUCCESS!");
    process.exit(0);
  } catch(e) { 
    fs.writeFileSync('db_out5.txt', "ERROR: " + e.message); 
    process.exit(1); 
  }
}
test();
