import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/meetings ─────────────────────────────────────────
router.get('/', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const meetings = await sql`
      SELECT * FROM meetings
      WHERE shg_id = ${req.shgId}
      ORDER BY date DESC
    `;
    res.json({ success: true, meetings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch meetings' });
  }
});

// ── GET /api/meetings/:id ─────────────────────────────────────
router.get('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [meeting] = await sql`
      SELECT * FROM meetings
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
    `;
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });
    res.json({ success: true, meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch meeting' });
  }
});

// ── POST /api/meetings ────────────────────────────────────────
router.post('/', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const {
      date, agenda, venue, meeting_type, category,
      status, meeting_link, notes, next_meeting_date,
    } = req.body;

    if (!date || !agenda) {
      return res.status(400).json({ success: false, error: 'date and agenda are required' });
    }

    // Snapshot active member count at creation time
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM members
      WHERE shg_id = ${req.shgId} AND status = 'active'
    `;

    const [meeting] = await sql`
      INSERT INTO meetings (
        shg_id, date, agenda, venue, meeting_type, category,
        status, meeting_link, notes, next_meeting_date,
        total_members, total_present, total_absent, updated_at
      ) VALUES (
        ${req.shgId}, ${date}, ${agenda},
        ${venue || null}, ${meeting_type || 'regular'}, ${category || 'internal'},
        ${status || 'scheduled'}, ${meeting_link || null},
        ${notes || null}, ${next_meeting_date || null},
        ${Number(count)}, 0, 0, NOW()
      )
      RETURNING *
    `;
    res.status(201).json({ success: true, meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create meeting' });
  }
});

// ── PUT /api/meetings/:id ─────────────────────────────────────
router.put('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const {
      date, agenda, venue, meeting_type, category,
      status, meeting_link, notes, next_meeting_date,
    } = req.body;

    const [meeting] = await sql`
      UPDATE meetings SET
        date              = COALESCE(${date},              date),
        agenda            = COALESCE(${agenda},            agenda),
        venue             = COALESCE(${venue},             venue),
        meeting_type      = COALESCE(${meeting_type},      meeting_type),
        category          = COALESCE(${category},          category),
        status            = COALESCE(${status},            status),
        meeting_link      = COALESCE(${meeting_link},      meeting_link),
        notes             = COALESCE(${notes},             notes),
        next_meeting_date = COALESCE(${next_meeting_date}, next_meeting_date),
        updated_at        = NOW()
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
      RETURNING *
    `;
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });
    res.json({ success: true, meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update meeting' });
  }
});

// ── DELETE /api/meetings/:id ──────────────────────────────────
router.delete('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [exists] = await sql`
      SELECT id FROM meetings WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
    `;
    if (!exists) return res.status(404).json({ success: false, error: 'Meeting not found' });

    await sql`DELETE FROM meeting_attendance WHERE meeting_id = ${req.params.id}`;
    await sql`DELETE FROM meetings WHERE id = ${req.params.id}`;

    res.json({ success: true, message: 'Meeting deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete meeting' });
  }
});

export default router;