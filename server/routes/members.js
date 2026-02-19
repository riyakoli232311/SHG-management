// server/routes/members.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/members ─────────────────────────────────────────
router.get('/', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const members = await sql`
      SELECT * FROM members WHERE shg_id = ${req.shgId} ORDER BY name ASC
    `;
    res.json({ success: true, data: members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch members' });
  }
});

// ── GET /api/members/:id ──────────────────────────────────────
router.get('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [member] = await sql`
      SELECT * FROM members WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
    `;
    if (!member) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch member' });
  }
});

// ── POST /api/members ─────────────────────────────────────────
router.post('/', requireShg, async (req, res) => {
  try {
    const { name, phone, village, age, income, aadhar, joined_date } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    const sql = getDb();
    const [member] = await sql`
      INSERT INTO members (shg_id, name, phone, village, age, income, aadhar, joined_date)
      VALUES (
        ${req.shgId}, ${name}, ${phone || null}, ${village || null},
        ${age || null}, ${income || 0}, ${aadhar || null}, ${joined_date || new Date()}
      )
      RETURNING *
    `;
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to add member' });
  }
});

// ── PUT /api/members/:id ──────────────────────────────────────
router.put('/:id', requireShg, async (req, res) => {
  try {
    const { name, phone, village, age, income, aadhar, status, joined_date } = req.body;
    const sql = getDb();
    const [member] = await sql`
      UPDATE members SET
        name = COALESCE(${name}, name),
        phone = COALESCE(${phone}, phone),
        village = COALESCE(${village}, village),
        age = COALESCE(${age}, age),
        income = COALESCE(${income}, income),
        aadhar = COALESCE(${aadhar}, aadhar),
        status = COALESCE(${status}, status),
        joined_date = COALESCE(${joined_date}, joined_date),
        updated_at = now()
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
      RETURNING *
    `;
    if (!member) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update member' });
  }
});

// ── DELETE /api/members/:id ───────────────────────────────────
router.delete('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM members WHERE id = ${req.params.id} AND shg_id = ${req.shgId} RETURNING id
    `;
    if (!deleted) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete member' });
  }
});

export default router;