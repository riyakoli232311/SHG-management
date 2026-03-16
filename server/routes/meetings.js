import express from 'express';
import { getDb } from '../lib/db.js';

const router = express.Router();

// Get all meetings
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

// Get a single meeting
router.get('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const { id } = req.params;
    const meeting = await sql`SELECT * FROM meetings WHERE id = ${id}`;
    if (meeting.length === 0) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }
    res.json({ success: true, meeting: meeting[0] });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch meeting' });
  }
});

// Create a meeting
router.post('/', async (req, res) => {
  try {
    const sql = getDb();
    const {
      date,
      agenda,
      venue,
      status,
      notes,
      meeting_type,
      organizer_id,
      duration,
      next_meeting_date,
      total_members,
      total_present,
      category
    } = req.body;

    const newMeeting = await sql`
      INSERT INTO meetings (
        date, agenda, venue, status, notes, "meeting type", "organizer id", 
        duration, "next meeting date", "total members", "total present", category, created_updated
      ) VALUES (
        ${date}, ${agenda}, ${venue}, ${status}, ${notes}, ${meeting_type}, ${organizer_id}, 
        ${duration}, ${next_meeting_date}, ${total_members}, ${total_present}, ${category}, NOW()
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, meeting: newMeeting[0] });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to create meeting' });
  }
});

// Update a meeting
router.put('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const { id } = req.params;
    const {
      date,
      agenda,
      venue,
      status,
      notes,
      meeting_type,
      organizer_id,
      duration,
      next_meeting_date,
      total_members,
      total_present,
      category
    } = req.body;

    const updatedMeeting = await sql`
      UPDATE meetings
      SET 
        date = ${date},
        agenda = ${agenda},
        venue = ${venue},
        status = ${status},
        notes = ${notes},
        "meeting type" = ${meeting_type},
        "organizer id" = ${organizer_id},
        duration = ${duration},
        "next meeting date" = ${next_meeting_date},
        "total members" = ${total_members},
        "total present" = ${total_present},
        category = ${category},
        created_updated = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedMeeting.length === 0) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    res.json({ success: true, meeting: updatedMeeting[0] });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to update meeting' });
  }
});

// Delete a meeting
router.delete('/:id', async (req, res) => {
  try {
    const sql = getDb();
    const { id } = req.params;
    
    // Check if meeting exists
    const meeting = await sql`SELECT * FROM meetings WHERE id = ${id}`;
    if (meeting.length === 0) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    // Delete meeting attendance records first
    await sql`DELETE FROM meeting_attendance WHERE "meeting id" = ${id}`;
    
    // Delete meeting
    await sql`DELETE FROM meetings WHERE id = ${id}`;
    
    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to delete meeting' });
  }
});

export default router;
