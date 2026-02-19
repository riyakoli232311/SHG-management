// server/routes/savings.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/savings ──────────────────────────────────────────
// Supports ?member_id=&month=&year=
router.get('/', requireShg, async (req, res) => {
  try {
    const { member_id, month, year } = req.query;
    const sql = getDb();

    let rows;
    if (member_id) {
      rows = await sql`
        SELECT s.*, m.name AS member_name
        FROM savings s JOIN members m ON m.id = s.member_id
        WHERE s.shg_id = ${req.shgId} AND s.member_id = ${member_id}
        ORDER BY s.year DESC, s.month DESC
      `;
    } else if (month && year) {
      rows = await sql`
        SELECT s.*, m.name AS member_name
        FROM savings s JOIN members m ON m.id = s.member_id
        WHERE s.shg_id = ${req.shgId} AND s.month = ${month} AND s.year = ${year}
        ORDER BY m.name ASC
      `;
    } else {
      rows = await sql`
        SELECT s.*, m.name AS member_name
        FROM savings s JOIN members m ON m.id = s.member_id
        WHERE s.shg_id = ${req.shgId}
        ORDER BY s.year DESC, s.month DESC
      `;
    }

    const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);
    res.json({ success: true, data: rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch savings' });
  }
});

// ── POST /api/savings ─────────────────────────────────────────
router.post('/', requireShg, async (req, res) => {
  try {
    const { member_id, month, year, amount, payment_mode, date } = req.body;
    if (!member_id || !month || !year || !amount) {
      return res.status(400).json({ success: false, error: 'member_id, month, year, amount are required' });
    }

    const sql = getDb();

    // Verify member belongs to this SHG
    const [member] = await sql`SELECT id FROM members WHERE id = ${member_id} AND shg_id = ${req.shgId}`;
    if (!member) return res.status(404).json({ success: false, error: 'Member not found in your SHG' });

    const [saving] = await sql`
      INSERT INTO savings (shg_id, member_id, month, year, amount, payment_mode, date)
      VALUES (${req.shgId}, ${member_id}, ${month}, ${year}, ${amount}, ${payment_mode || 'cash'}, ${date || new Date()})
      ON CONFLICT (member_id, month, year)
      DO UPDATE SET amount = EXCLUDED.amount, payment_mode = EXCLUDED.payment_mode, date = EXCLUDED.date
      RETURNING *
    `;
    res.status(201).json({ success: true, data: saving });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to record saving' });
  }
});

// ── DELETE /api/savings/:id ───────────────────────────────────
router.delete('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM savings WHERE id = ${req.params.id} AND shg_id = ${req.shgId} RETURNING id
    `;
    if (!deleted) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, message: 'Saving deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete saving' });
  }
});

export default router;