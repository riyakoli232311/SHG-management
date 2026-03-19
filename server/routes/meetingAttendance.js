import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/meeting-attendance/meeting/:meetingId ────────────
// Returns all members with their attendance record for this meeting.
// If a member has no record yet, returns defaults (attended: false).
router.get('/meeting/:meetingId', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const { meetingId } = req.params;

    // Verify meeting belongs to this SHG
    const [meeting] = await sql`
      SELECT id, total_members FROM meetings
      WHERE id = ${meetingId} AND shg_id = ${req.shgId}
    `;
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    // Get all active members of this SHG
    const members = await sql`
      SELECT id, name, role FROM members
      WHERE shg_id = ${req.shgId} AND status = 'active'
      ORDER BY
        CASE role
          WHEN 'president'  THEN 1
          WHEN 'secretary'  THEN 2
          WHEN 'treasurer'  THEN 3
          ELSE 4
        END, name ASC
    `;

    // Get existing attendance records for this meeting
    const existing = await sql`
      SELECT * FROM meeting_attendance WHERE meeting_id = ${meetingId}
    `;
    const existingMap = {};
    existing.forEach(r => { existingMap[r.member_id] = r; });

    // Merge: one entry per member
    const attendance = members.map(m => ({
      member_id:      m.id,
      member_name:    m.name,
      member_role:    m.role,
      // Use existing record if present, otherwise defaults
      id:             existingMap[m.id]?.id            ?? null,
      attended:       existingMap[m.id]?.attended      ?? false,
      late_minutes:   existingMap[m.id]?.late_minutes  ?? 0,
      fine_amount:    existingMap[m.id]?.fine_amount    ?? 0,
      fine_paid:      existingMap[m.id]?.fine_paid      ?? false,
      tasks_assigned: existingMap[m.id]?.tasks_assigned ?? '',
      notes:          existingMap[m.id]?.notes          ?? '',
    }));

    res.json({ success: true, attendance, meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance' });
  }
});

// ── POST /api/meeting-attendance/meeting/:meetingId/bulk ──────
// Upserts all attendance records at once and updates meeting totals.
// Body: { records: [{ member_id, attended, late_minutes, fine_amount, fine_paid, tasks_assigned, notes }] }
router.post('/meeting/:meetingId/bulk', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const { meetingId } = req.params;
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: 'records array is required' });
    }

    // Verify meeting belongs to this SHG
    const [meeting] = await sql`
      SELECT id FROM meetings WHERE id = ${meetingId} AND shg_id = ${req.shgId}
    `;
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    // Upsert each record
    for (const r of records) {
      await sql`
        INSERT INTO meeting_attendance (
          meeting_id, member_id, attended, late_minutes,
          fine_amount, fine_paid, tasks_assigned, notes
        ) VALUES (
          ${meetingId}, ${r.member_id},
          ${r.attended ?? false},
          ${r.late_minutes ?? 0},
          ${r.fine_amount ?? 0},
          ${r.fine_paid ?? false},
          ${r.tasks_assigned || null},
          ${r.notes || null}
        )
        ON CONFLICT (meeting_id, member_id) DO UPDATE SET
          attended       = EXCLUDED.attended,
          late_minutes   = EXCLUDED.late_minutes,
          fine_amount    = EXCLUDED.fine_amount,
          fine_paid      = EXCLUDED.fine_paid,
          tasks_assigned = EXCLUDED.tasks_assigned,
          notes          = EXCLUDED.notes
      `;
    }

    // Recalculate and update meeting totals
    const presentCount = records.filter(r => r.attended).length;
    const totalCount   = records.length;
    const absentCount  = totalCount - presentCount;

    await sql`
      UPDATE meetings SET
        total_members = ${totalCount},
        total_present = ${presentCount},
        total_absent  = ${absentCount},
        updated_at    = NOW()
      WHERE id = ${meetingId}
    `;

    res.json({
      success: true,
      message: 'Attendance saved',
      summary: { total: totalCount, present: presentCount, absent: absentCount },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save attendance' });
  }
});

// ── PATCH /api/meeting-attendance/:id/fine-paid ───────────────
// Mark a single attendance fine as paid
router.patch('/:id/fine-paid', requireShg, async (req, res) => {
  try {
    const sql = getDb();

    // Verify the record belongs to a meeting in this SHG
    const [record] = await sql`
      SELECT ma.id FROM meeting_attendance ma
      JOIN meetings m ON m.id = ma.meeting_id
      WHERE ma.id = ${req.params.id} AND m.shg_id = ${req.shgId}
    `;
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });

    const [updated] = await sql`
      UPDATE meeting_attendance SET fine_paid = true
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update fine status' });
  }
});

export default router;