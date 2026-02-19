// server/routes/auth.js
import express from 'express';
import { getDb } from '../lib/db.js';
import {
  hashPassword, verifyPassword,
  createToken, setSessionCookie, clearSessionCookie,
} from '../lib/auth.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── POST /api/auth/signup ────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const sql = getDb();

    // Check existing
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);

    const [user] = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash})
      RETURNING id, name, email
    `;

    const token = createToken({ userId: user.id });
    setSessionCookie(res, token);

    return res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      onboarded: false,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Failed to create account' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const sql = getDb();

    const [user] = await sql`
      SELECT id, name, email, password_hash FROM users WHERE email = ${email.toLowerCase()}
    `;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if SHG is set up
    const [shg] = await sql`SELECT id, name FROM shg_info WHERE user_id = ${user.id}`;

    const token = createToken({ userId: user.id });
    setSessionCookie(res, token);

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      onboarded: !!shg,
      shgName: shg?.name || null,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const [shg] = await sql`SELECT * FROM shg_info WHERE user_id = ${req.user.id}`;

    res.json({
      success: true,
      user: req.user,
      shg: shg || null,
      onboarded: !!shg,
    });
  } catch (err) {
    console.error('/me error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

export default router;