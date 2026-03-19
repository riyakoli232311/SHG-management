import express from 'express';
import { getDb } from '../lib/db.js';

const router = express.Router();

// GET attendance for a specific meeting
router.get('/meeting/:meetingId', async (req, res) => {
  try {
    const sql = getDb();
    const attendance = await sql`
      SELECT * FROM meeting_attendance
      WHERE meeting_id = ${req.params.meetingId}
      ORDER BY id ASC
    `;
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance records' });
  }
});

// GET a single attendance record
router.get('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const [attendance] = await sql`
      SELECT * FROM meeting_attendance WHERE id = ${req.params.id}
    `;
    if (!attendance) return res.status(404).json({ success: false, error: 'Attendance record not found' });
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance record' });
  }
});

// POST create attendance record
router.post('/', async (req, res) => {
  try {
    const sql = getDb();
    const { meeting_id, check_in_time, checkout_time, minutes_of_the_meeting } = req.body;

    if (!meeting_id) {
      return res.status(400).json({ success: false, error: 'meeting_id is required' });
    }

    const [attendance] = await sql`
      INSERT INTO meeting_attendance (
        meeting_id, check_in_time, check_out_time, minutes_of_meeting
      ) VALUES (
        ${meeting_id},
        ${check_in_time || null},
        ${checkout_time || null},
        ${minutes_of_the_meeting || null}
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to create attendance record' });
  }
});

// PUT update attendance record
router.put('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const { meeting_id, check_in_time, checkout_time, minutes_of_the_meeting } = req.body;

    const [attendance] = await sql`
      UPDATE meeting_attendance SET
        meeting_id         = ${meeting_id},
        check_in_time      = ${check_in_time || null},
        check_out_time     = ${checkout_time || null},
        minutes_of_meeting = ${minutes_of_the_meeting || null}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (!attendance) return res.status(404).json({ success: false, error: 'Attendance record not found' });
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to update attendance record' });
  }
});

// DELETE attendance record
router.delete('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM meeting_attendance WHERE id = ${req.params.id} RETURNING id
    `;
    if (!deleted) return res.status(404).json({ success: false, error: 'Attendance record not found' });
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to delete attendance record' });
  }
});

export default router;