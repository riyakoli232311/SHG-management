// server/routes/repayments.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/repayments ───────────────────────────────────────
// Supports ?loan_id=&member_id=&status=
router.get('/', requireShg, async (req, res) => {
  try {
    const { loan_id, member_id, status } = req.query;
    const sql = getDb();

    let rows;
    if (loan_id) {
      rows = await sql`
        SELECT r.*, m.name AS member_name, l.loan_amount
        FROM repayments r
        JOIN members m ON m.id = r.member_id
        JOIN loans l ON l.id = r.loan_id
        WHERE r.shg_id = ${req.shgId} AND r.loan_id = ${loan_id}
        ORDER BY r.due_date ASC
      `;
    } else if (member_id) {
      rows = await sql`
        SELECT r.*, m.name AS member_name, l.loan_amount
        FROM repayments r
        JOIN members m ON m.id = r.member_id
        JOIN loans l ON l.id = r.loan_id
        WHERE r.shg_id = ${req.shgId} AND r.member_id = ${member_id}
        ORDER BY r.due_date DESC
      `;
    } else if (status) {
      rows = await sql`
        SELECT r.*, m.name AS member_name, l.loan_amount
        FROM repayments r
        JOIN members m ON m.id = r.member_id
        JOIN loans l ON l.id = r.loan_id
        WHERE r.shg_id = ${req.shgId} AND r.status = ${status}
        ORDER BY r.due_date ASC
      `;
    } else {
      rows = await sql`
        SELECT r.*, m.name AS member_name, l.loan_amount
        FROM repayments r
        JOIN members m ON m.id = r.member_id
        JOIN loans l ON l.id = r.loan_id
        WHERE r.shg_id = ${req.shgId}
        ORDER BY r.due_date DESC
      `;
    }

    // Auto-mark overdue
    const today = new Date().toISOString().split('T')[0];
    const updated = rows.map(r => ({
      ...r,
      status: r.status === 'pending' && r.due_date < today ? 'overdue' : r.status,
    }));

    const totalCollected = updated.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.emi_amount), 0);
    const pendingCount = updated.filter(r => r.status === 'pending').length;
    const overdueCount = updated.filter(r => r.status === 'overdue').length;

    res.json({ success: true, data: updated, totalCollected, pendingCount, overdueCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch repayments' });
  }
});

// ── POST /api/repayments/:id/pay ──────────────────────────────
// Mark an EMI as paid
router.post('/:id/pay', requireShg, async (req, res) => {
  try {
    const { paid_date } = req.body;
    const sql = getDb();

    const [repayment] = await sql`
      UPDATE repayments SET
        status = 'paid',
        paid_date = ${paid_date || new Date()}
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
      RETURNING *
    `;
    if (!repayment) return res.status(404).json({ success: false, error: 'Repayment not found' });

    // Check if all EMIs for this loan are paid → close the loan
    const pending = await sql`
      SELECT COUNT(*) as count FROM repayments
      WHERE loan_id = ${repayment.loan_id} AND status != 'paid'
    `;
    if (Number(pending[0].count) === 0) {
      await sql`UPDATE loans SET status = 'closed', updated_at = now() WHERE id = ${repayment.loan_id}`;
    }

    res.json({ success: true, data: repayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to mark payment' });
  }
});

export default router;