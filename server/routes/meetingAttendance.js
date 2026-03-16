import express from 'express';
import { getDb } from '../lib/db.js';

const router = express.Router();

// Get attendance for a specific meeting
router.get('/meeting/:meetingId', async (req, res) => {
  try {
    const sql = getDb();
    const { meetingId } = req.params;
    
    const attendance = await sql`
      SELECT * FROM meeting_attendance 
      WHERE "meeting id" = ${meetingId}
    `;
    
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance records' });
  }
});

// Get a single attendance record
router.get('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const { id } = req.params;
    
    const attendance = await sql`
      SELECT * FROM meeting_attendance WHERE id = ${id}
    `;
    
    if (attendance.length === 0) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    res.json({ success: true, attendance: attendance[0] });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance record' });
  }
});

// Create attendance record
router.post('/', async (req, res) => {
  try {
    const sql = getDb();
    const {
      meeting_id,
      check_in_time,
      checkout_time,
      minutes_of_the_meeting
    } = req.body;

    const newAttendance = await sql`
      INSERT INTO meeting_attendance (
        "meeting id", "check in time", "checkout time", "minutes of the meeting"
      ) VALUES (
        ${meeting_id}, ${check_in_time}, ${checkout_time}, ${minutes_of_the_meeting}
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, attendance: newAttendance[0] });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to create attendance record' });
  }
});

// Update attendance record
router.put('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const { id } = req.params;
    const {
      meeting_id,
      check_in_time,
      checkout_time,
      minutes_of_the_meeting
    } = req.body;

    const updatedAttendance = await sql`
      UPDATE meeting_attendance
      SET 
        "meeting id" = ${meeting_id},
        "check in time" = ${check_in_time},
        "checkout time" = ${checkout_time},
        "minutes of the meeting" = ${minutes_of_the_meeting}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedAttendance.length === 0) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }

    res.json({ success: true, attendance: updatedAttendance[0] });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to update attendance record' });
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const { id } = req.params;
    
    const deletedAttendance = await sql`
      DELETE FROM meeting_attendance 
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (deletedAttendance.length === 0) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ success: false, error: 'Failed to delete attendance record' });
  }
});

export default router;
