// server/routes/shg.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireAuth, requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/shg ─────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const [shg] = await sql`SELECT * FROM shg_info WHERE user_id = ${req.user.id}`;
    if (!shg) return res.status(404).json({ success: false, error: 'SHG not found' });
    res.json({ success: true, data: shg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch SHG info' });
  }
});

// ── POST /api/shg/setup ──────────────────────────────────────
// Called once after signup to create the SHG profile
router.post('/setup', requireAuth, async (req, res) => {
  try {
    const {
      name, registration_number, village, block, district,
      state, formation_date, bank_name, bank_account, ifsc,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'SHG name is required' });
    }

    const sql = getDb();

    // Check if already set up
    const existing = await sql`SELECT id FROM shg_info WHERE user_id = ${req.user.id}`;
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'SHG already set up' });
    }

    const [shg] = await sql`
      INSERT INTO shg_info (
        user_id, name, registration_number, village, block, district,
        state, formation_date, bank_name, bank_account, ifsc
      ) VALUES (
        ${req.user.id}, ${name}, ${registration_number || null},
        ${village || null}, ${block || null}, ${district || null},
        ${state || 'Rajasthan'}, ${formation_date || null},
        ${bank_name || null}, ${bank_account || null}, ${ifsc || null}
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, data: shg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create SHG' });
  }
});

// ── PUT /api/shg ─────────────────────────────────────────────
router.put('/', requireShg, async (req, res) => {
  try {
    const {
      name, registration_number, village, block, district,
      state, formation_date, bank_name, bank_account, ifsc,
    } = req.body;

    const sql = getDb();
    const [updated] = await sql`
      UPDATE shg_info SET
        name = COALESCE(${name}, name),
        registration_number = COALESCE(${registration_number}, registration_number),
        village = COALESCE(${village}, village),
        block = COALESCE(${block}, block),
        district = COALESCE(${district}, district),
        state = COALESCE(${state}, state),
        formation_date = COALESCE(${formation_date}, formation_date),
        bank_name = COALESCE(${bank_name}, bank_name),
        bank_account = COALESCE(${bank_account}, bank_account),
        ifsc = COALESCE(${ifsc}, ifsc),
        updated_at = now()
      WHERE user_id = ${req.user.id}
      RETURNING *
    `;
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update SHG' });
  }
});

export default router;