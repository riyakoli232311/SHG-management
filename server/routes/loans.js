// server/routes/loans.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/loans ────────────────────────────────────────────
// Supports ?member_id=&status=
router.get('/', requireShg, async (req, res) => {
  try {
    const { member_id, status } = req.query;
    const sql = getDb();

    let rows;
    if (member_id) {
      rows = await sql`
        SELECT l.*, m.name AS member_name
        FROM loans l JOIN members m ON m.id = l.member_id
        WHERE l.shg_id = ${req.shgId} AND l.member_id = ${member_id}
        ORDER BY l.disbursed_date DESC
      `;
    } else if (status) {
      rows = await sql`
        SELECT l.*, m.name AS member_name
        FROM loans l JOIN members m ON m.id = l.member_id
        WHERE l.shg_id = ${req.shgId} AND l.status = ${status}
        ORDER BY l.disbursed_date DESC
      `;
    } else {
      rows = await sql`
        SELECT l.*, m.name AS member_name
        FROM loans l JOIN members m ON m.id = l.member_id
        WHERE l.shg_id = ${req.shgId}
        ORDER BY l.disbursed_date DESC
      `;
    }

    const totalDisbursed = rows.reduce((sum, r) => sum + Number(r.loan_amount), 0);
    res.json({ success: true, data: rows, totalDisbursed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch loans' });
  }
});

// ── GET /api/loans/:id ────────────────────────────────────────
router.get('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [loan] = await sql`
      SELECT l.*, m.name AS member_name
      FROM loans l JOIN members m ON m.id = l.member_id
      WHERE l.id = ${req.params.id} AND l.shg_id = ${req.shgId}
    `;
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
    res.json({ success: true, data: loan });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch loan' });
  }
});

// ── POST /api/loans ───────────────────────────────────────────
router.post('/', requireShg, async (req, res) => {
  try {
    const {
      member_id, loan_amount, interest_rate,
      tenure_months, purpose, disbursed_date,
    } = req.body;

    if (!member_id || !loan_amount) {
      return res.status(400).json({ success: false, error: 'member_id and loan_amount are required' });
    }

    const sql = getDb();

    // Verify member belongs to this SHG
    const [member] = await sql`SELECT id FROM members WHERE id = ${member_id} AND shg_id = ${req.shgId}`;
    if (!member) return res.status(404).json({ success: false, error: 'Member not found in your SHG' });

    const [loan] = await sql`
      INSERT INTO loans (shg_id, member_id, loan_amount, interest_rate, tenure_months, purpose, disbursed_date)
      VALUES (
        ${req.shgId}, ${member_id}, ${loan_amount},
        ${interest_rate || 2}, ${tenure_months || 12},
        ${purpose || null}, ${disbursed_date || new Date()}
      )
      RETURNING *
    `;

    // Auto-generate EMI schedule
    const emi = calculateEMI(Number(loan_amount), Number(interest_rate || 2), Number(tenure_months || 12));
    const disbursed = new Date(disbursed_date || new Date());
    const emiInserts = [];
    for (let i = 1; i <= Number(tenure_months || 12); i++) {
      const dueDate = new Date(disbursed);
      dueDate.setMonth(dueDate.getMonth() + i);
      emiInserts.push({ loan_id: loan.id, due_date: dueDate.toISOString().split('T')[0], emi_amount: emi });
    }

    for (const emi_row of emiInserts) {
      await sql`
        INSERT INTO repayments (shg_id, loan_id, member_id, emi_amount, due_date, status)
        VALUES (${req.shgId}, ${emi_row.loan_id}, ${member_id}, ${emi_row.emi_amount}, ${emi_row.due_date}, 'pending')
      `;
    }

    res.status(201).json({ success: true, data: loan, emiAmount: emi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create loan' });
  }
});

// ── PUT /api/loans/:id ────────────────────────────────────────
router.put('/:id', requireShg, async (req, res) => {
  try {
    const { status, purpose } = req.body;
    const sql = getDb();
    const [loan] = await sql`
      UPDATE loans SET
        status = COALESCE(${status}, status),
        purpose = COALESCE(${purpose}, purpose),
        updated_at = now()
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
      RETURNING *
    `;
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
    res.json({ success: true, data: loan });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update loan' });
  }
});

// ── Helper: EMI calculator ────────────────────────────────────
function calculateEMI(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.round(emi);
}

export default router;