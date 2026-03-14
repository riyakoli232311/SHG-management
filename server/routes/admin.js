// server/routes/admin.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { verifyPassword, createToken } from '../lib/auth.js';
import { requireAdminAuth } from '../middleware/adminAuth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();
const ADMIN_COOKIE_NAME = 'admin_session';

export function setAdminSessionCookie(res, token) {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  });
}

export function clearAdminSessionCookie(res) {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
}

// ── POST /api/admin/signup ─────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone_number, state, district } = req.body;
    
    if (!email || !password || !name || !phone_number || !state || !district) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const sql = getDb();
    
    const [existingAdmin] = await sql`SELECT id FROM admins WHERE email = ${email.toLowerCase()}`;
    if (existingAdmin) {
      return res.status(409).json({ success: false, error: 'Admin with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [admin] = await sql`
      INSERT INTO admins (email, password_hash, name, phone_number, state, district)
      VALUES (${email.toLowerCase()}, ${hashedPassword}, ${name}, ${phone_number}, ${state}, ${district})
      RETURNING id, email, name, state, district
    `;

    const token = createToken({ adminId: admin.id });
    setAdminSessionCookie(res, token);

    return res.status(201).json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name, state: admin.state, district: admin.district },
    });
    
  } catch (err) {
    console.error('Admin Signup error:', err);
    res.status(500).json({ success: false, error: 'Signup failed' });
  }
});

// ── POST /api/admin/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const sql = getDb();

    const [admin] = await sql`
      SELECT id, email, password_hash, name, district, state FROM admins WHERE email = ${email.toLowerCase()}
    `;
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = createToken({ adminId: admin.id });
    setAdminSessionCookie(res, token);

    return res.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name, district: admin.district, state: admin.state },
    });
  } catch (err) {
    console.error('Admin Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ── POST /api/admin/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
  clearAdminSessionCookie(res);
  res.json({ success: true, message: 'Admin logged out successfully' });
});

// ── GET /api/admin/me ─────────────────────────────────────────
router.get('/me', requireAdminAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.admin,
    });
  } catch (err) {
    console.error('/admin/me error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch admin user' });
  }
});

// ── GET /api/admin/shgs ─────────────────────────────────────────
router.get('/shgs', requireAdminAuth, async (req, res) => {
  try {
    const sql = getDb();
    
    // Admins see only SHGs from their assigned district (case-insensitive)
    const shgs = await sql`
      SELECT 
        s.id, s.name, s.village, s.block, s.district, s.state, s.formation_date,
        (SELECT COUNT(*) FROM members m WHERE m.shg_id = s.id) as member_count
      FROM shg_info s
      WHERE LOWER(s.district) = LOWER(${req.admin.district})
      ORDER BY s.created_at DESC
    `;
    
    res.json({ success: true, count: shgs.length, data: shgs });
  } catch (err) {
    console.error('Fetch SHGs error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch SHGs' });
  }
});

// ── GET /api/admin/shgs/:id ──────────────────────────────────────
router.get('/shgs/:id', requireAdminAuth, async (req, res) => {
  try {
    const shgId = req.params.id;
    const sql = getDb();
    
    // First verify the SHG belongs to this admin's district
    const [shg] = await sql`
      SELECT id, name, village, block, district, state, formation_date, bank_name, bank_account, ifsc 
      FROM shg_info 
      WHERE id = ${shgId} AND LOWER(district) = LOWER(${req.admin.district})
    `;
    
    if (!shg) {
      return res.status(404).json({ success: false, error: 'SHG not found or not in your district' });
    }

    // Fetch members looking for office bearers
    const members = await sql`SELECT id, name, role, phone FROM members WHERE shg_id = ${shgId}`;
    
    const president = members.find(m => m.role === 'president') || null;
    const secretary = members.find(m => m.role === 'secretary') || null;
    const treasurer = members.find(m => m.role === 'treasurer') || null;

    // Fetch savings and loans stats
    const [savingsResult] = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM savings WHERE shg_id = ${shgId}`;
    const totalSavings = savingsResult?.total || 0;

    const [loansResult] = await sql`
      SELECT 
        COUNT(*) as count, 
        COALESCE(SUM(loan_amount), 0) as total 
      FROM loans 
      WHERE shg_id = ${shgId} AND status = 'active'
    `;
    
    res.json({ 
      success: true, 
      data: {
        shg,
        total_members: members.length,
        office_bearers: {
          president,
          secretary,
          treasurer
        },
        financials: {
          total_savings: Number(totalSavings),
          active_loans_count: Number(loansResult?.count || 0),
          active_loans_total: Number(loansResult?.total || 0)
        }
      } 
    });
  } catch (err) {
    console.error('Fetch SHG Details error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch SHG details' });
  }
});

// ── GET /api/admin/schemes ─────────────────────────────────────
router.get('/schemes', requireAdminAuth, async (req, res) => {
  try {
    const sql = getDb();
    const schemes = await sql`
      SELECT s.*, a.email as admin_email 
      FROM government_schemes s
      LEFT JOIN admins a ON s.admin_id = a.id
      ORDER BY s.created_at DESC
    `;
    res.json({ success: true, count: schemes.length, data: schemes });
  } catch (err) {
    console.error('Fetch Schemes error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch schemes' });
  }
});

// ── POST /api/admin/schemes ─────────────────────────────────────
router.post('/schemes', requireAdminAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const sql = getDb();
    const [scheme] = await sql`
      INSERT INTO government_schemes (title, description, admin_id)
      VALUES (${title}, ${description}, ${req.admin.id})
      RETURNING *
    `;

    res.status(201).json({ success: true, scheme });
  } catch (err) {
    console.error('Post Scheme error:', err);
    res.status(500).json({ success: false, error: 'Failed to create scheme' });
  }
});

export default router;
