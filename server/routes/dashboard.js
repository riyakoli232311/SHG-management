// server/routes/dashboard.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/dashboard ────────────────────────────────────────
router.get('/', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const shgId = req.shgId;

    const [membersRes, savingsRes, loansRes, repaymentsRes] = await Promise.all([
      sql`SELECT * FROM members WHERE shg_id = ${shgId}`,
      sql`SELECT * FROM savings WHERE shg_id = ${shgId}`,
      sql`SELECT * FROM loans WHERE shg_id = ${shgId}`,
      sql`SELECT * FROM repayments WHERE shg_id = ${shgId}`,
    ]);

    const today = new Date().toISOString().split('T')[0];
    const totalSavings = savingsRes.reduce((s, r) => s + Number(r.amount), 0);
    const totalDisbursed = loansRes.reduce((s, r) => s + Number(r.loan_amount), 0);
    const activeLoans = loansRes.filter(l => l.status === 'active');
    const repayments = repaymentsRes.map(r => ({
      ...r,
      status: r.status === 'pending' && r.due_date < today ? 'overdue' : r.status,
    }));
    const totalCollected = repayments.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.emi_amount), 0);
    const pendingCount = repayments.filter(r => r.status === 'pending').length;
    const overdueCount = repayments.filter(r => r.status === 'overdue').length;

    // Village-wise breakdown
    const membersByVillage = {};
    membersRes.forEach(m => {
      if (m.village) membersByVillage[m.village] = (membersByVillage[m.village] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalMembers: membersRes.length,
        activeMembers: membersRes.filter(m => m.status === 'active').length,
        totalSavings,
        averageSavingsPerMember: membersRes.length ? Math.round(totalSavings / membersRes.length) : 0,
        totalLoansDisbursed: totalDisbursed,
        activeLoansCount: activeLoans.length,
        totalRepaymentsCollected: totalCollected,
        pendingRepayments: pendingCount,
        overdueRepayments: overdueCount,
        membersByVillage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
});

export default router;