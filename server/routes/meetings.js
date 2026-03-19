import express from 'express';
import { getDb } from '../lib/db.js';

const router = express.Router();

// GET all meetings
router.get('/', async (req, res) => {
  try {
    const sql = getDb();
    const meetings = await sql`SELECT * FROM meetings ORDER BY date DESC`;
    res.json({ success: true, meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch meetings' });
  }
});

// GET a single meeting
router.get('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const [meeting] = await sql`SELECT * FROM meetings WHERE id = ${req.params.id}`;
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });
    res.json({ success: true, meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch meeting' });
  }
});

// POST create a meeting
router.post('/', async (req, res) => {
  try {
    const sql = getDb();
    const {
      date, agenda, venue, status,
      notes, meeting_type, organizer_id,
      duration, next_meeting_date,
      total_members, total_present, category,
    } = req.body;

    if (!date || !agenda) {
      return res.status(400).json({ success: false, error: 'date and agenda are required' });
    }

    const [meeting] = await sql`
      INSERT INTO meetings (
        date, agenda, venue, status, notes,
        meeting_type, organizer_id, duration,
        next_meeting_date, total_members, total_present,
        meeting_category, updated_at
      ) VALUES (
        ${date},
        ${agenda},
        ${venue || null},
        ${status || 'scheduled'},
        ${notes || null},
        ${meeting_type || 'regular'},
        ${organizer_id || null},
        ${duration || null},
        ${next_meeting_date || null},
        ${total_members || 0},
        ${total_present || 0},
        ${category || 'internal'},
        NOW()
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to create meeting' });
  }
});

// PUT update a meeting
router.put('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const {
      date, agenda, venue, status,
      notes, meeting_type, organizer_id,
      duration, next_meeting_date,
      total_members, total_present, category,
    } = req.body;

    const [meeting] = await sql`
      UPDATE meetings SET
        date              = ${date},
        agenda            = ${agenda},
        venue             = ${venue || null},
        status            = ${status || 'scheduled'},
        notes             = ${notes || null},
        meeting_type      = ${meeting_type || 'regular'},
        organizer_id      = ${organizer_id || null},
        duration          = ${duration || null},
        next_meeting_date = ${next_meeting_date || null},
        total_members     = ${total_members || 0},
        total_present     = ${total_present || 0},
        meeting_category  = ${category || 'internal'},
        updated_at        = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });
    res.json({ success: true, meeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to update meeting' });
  }
});

// DELETE a meeting
router.delete('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const [meeting] = await sql`SELECT id FROM meetings WHERE id = ${req.params.id}`;
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    await sql`DELETE FROM meeting_attendance WHERE meeting_id = ${req.params.id}`;
    await sql`DELETE FROM meetings WHERE id = ${req.params.id}`;

    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to delete meeting' });
  }
});

export default router;