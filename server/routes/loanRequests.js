import express from 'express';
import { getDb } from '../lib/db.js';
import { requireAuth, requireShg } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── Configure Multer ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Resolve to exactly ../server/uploads/loans relative to this very file (routes/loanRequests.js)
    const dir = path.join(__dirname, '..', 'uploads', 'loans');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ── GET /api/loan/member ──────────────────────────────────────
// Member views their own loan requests
router.get('/member', requireAuth, async (req, res) => {
  try {
    // If the user is logged in as a leader, they might want to view all, but this is specific to a member role.
    // For now, let's assume req.user.id or req.member.id is set.
    // If it's a member login, req.member is set instead of req.user
    
    // We will establish req.memberId in auth middleware for member logins.
    const memberId = req.memberId || req.query.member_id;
    
    if (!memberId) {
      return res.status(400).json({ success: false, error: 'Member ID is required' });
    }

    const sql = getDb();
    const requests = await sql`
      SELECT la.*, m.name as member_name 
      FROM loan_applications la
      JOIN members m ON m.id = la.member_id
      WHERE la.member_id = ${memberId}
      ORDER BY la.created_at DESC
    `;
    
    res.json({ success: true, data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch member loan requests' });
  }
});

// ── POST /api/loan/apply ──────────────────────────────────────
const uploadHandler = upload.fields([
  { name: 'aadhar_image', maxCount: 1 }, 
  { name: 'passbook_image', maxCount: 1 }
]);

router.post('/apply', requireAuth, (req, res, next) => {
  console.log("=== LOAN APPLY ENDPOINT HIT ===");
  console.log("Headers:", req.headers['content-type']);
  
  uploadHandler(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, error: "Upload error: " + err.message });
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res.status(400).json({ success: false, error: "Upload error: " + err.message });
    }

    try {
      const memberId = req.memberId || req.body.member_id;
      const { amount, purpose, duration, aadhar_number } = req.body;
      
      if (!memberId || !amount || !purpose || !duration) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const sql = getDb();

      // Get member to find shg_id and savings
      const [member] = await sql`SELECT * FROM members WHERE id = ${memberId}`;
      if (!member) {
        return res.status(404).json({ success: false, error: 'Member not found' });
      }

      const shgId = member.shg_id;

      // Calculate eligibility (Max Loan = Total Savings * 3)
      const [savingsResult] = await sql`
        SELECT COALESCE(SUM(amount), 0) as total_savings
        FROM savings
        WHERE member_id = ${memberId}
      `;
      const totalSavings = Number(savingsResult.total_savings) || 0;
      const maxLoan = totalSavings * 3;

      if (Number(amount) > maxLoan) {
        return res.status(400).json({ 
          success: false, 
          error: `Requested amount exceeds eligibility. Max eligible: ${maxLoan}`,
          maxLoan 
        });
      }

      // Trust Score Calculation
      const [savingsCountRes] = await sql`SELECT COUNT(*) as count FROM savings WHERE member_id = ${memberId}`;
      const savingsCount = Number(savingsCountRes.count);
      
      const [repaymentsRes] = await sql`SELECT COUNT(*) as count FROM repayments WHERE member_id = ${memberId} AND status = 'paid'`;
      const paidEmis = Number(repaymentsRes.count);

      const trustScore = Math.min(100, (savingsCount * 2) + (paidEmis * 5));

      // Insert loan application
      const [application] = await sql`
        INSERT INTO loan_applications (member_id, shg_id, amount, purpose, duration, trust_score, status, aadhar_number)
        VALUES (${memberId}, ${shgId}, ${amount}, ${purpose}, ${duration}, ${trustScore}, 'pending', ${aadhar_number || null})
        RETURNING *
      `;

      // Process files from multer
      const documents = [];
      if (req.files?.['aadhar_image']?.[0]) {
        documents.push({
          type: 'Aadhaar Card',
          path: '/uploads/loans/' + req.files['aadhar_image'][0].filename
        });
      }
      if (req.files?.['passbook_image']?.[0]) {
        documents.push({
          type: 'Bank Passbook',
          path: '/uploads/loans/' + req.files['passbook_image'][0].filename
        });
      }

      if (documents.length > 0) {
        for (const doc of documents) {
          await sql`
            INSERT INTO loan_documents (loan_id, document_type, file_path)
            VALUES (${application.loan_id}, ${doc.type}, ${doc.path})
          `;
        }
      }

      res.status(201).json({ success: true, data: application });
    } catch (err) {
      console.error('Apply catch err:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to submit loan application' });
    }
  });
});

// ── GET /api/loan/leader-review ───────────────────────────────
router.get('/leader-review', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    
    // Correct query: select pending loan applications for the SHG
    const requests = await sql`
      SELECT la.*, m.name as member_name, m.phone,
      COALESCE((SELECT SUM(amount) FROM savings WHERE member_id = la.member_id), 0) as total_savings
      FROM loan_applications la
      JOIN members m ON m.id = la.member_id
      WHERE la.shg_id = ${req.shgId} AND la.status = 'pending'
      ORDER BY la.created_at ASC
    `;

    // attach documents
    for (const requestItem of requests) {
      const docs = await sql`SELECT * FROM loan_documents WHERE loan_id = ${requestItem.loan_id}`;
      requestItem.documents = docs;
    }

    res.json({ success: true, data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending requests' });
  }
});

// ── PUT /api/loan/leader-approve ──────────────────────────────
router.put('/leader-approve', requireShg, async (req, res) => {
  try {
    const { loan_id, status } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const sql = getDb();
    
    // Verify application belongs to this SHG
    const [application] = await sql`
      SELECT * FROM loan_applications 
      WHERE loan_id = ${loan_id} AND shg_id = ${req.shgId}
    `;

    if (!application) {
      return res.status(404).json({ success: false, error: 'Loan application not found' });
    }

    // Update status
    const [updatedApp] = await sql`
      UPDATE loan_applications 
      SET status = ${status} 
      WHERE loan_id = ${loan_id}
      RETURNING *
    `;

    // If approved, optionally trigger real loan creation here or return so frontend can call /api/loans explicitly.
    // For full automation, we insert into `loans` directly:
    if (status === 'approved') {
      const interest_rate = 2; // default
      const [newLoan] = await sql`
        INSERT INTO loans (shg_id, member_id, loan_amount, interest_rate, tenure_months, purpose, disbursed_date)
        VALUES (
          ${application.shg_id}, ${application.member_id}, ${application.amount},
          ${interest_rate}, ${application.duration},
          ${application.purpose}, ${new Date()}
        )
        RETURNING *
      `;

      // Auto-generate EMI schedule
      const principal = Number(application.amount);
      const months = Number(application.duration);
      const r = interest_rate / 100 / 12;
      let emi = Math.round(principal / months);
      if (r > 0) {
        emi = Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
      }

      const disbursed = new Date();
      const emiInserts = [];
      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(disbursed);
        dueDate.setMonth(dueDate.getMonth() + i);
        emiInserts.push({ loan_id: newLoan.id, due_date: dueDate.toISOString().split('T')[0], emi_amount: emi });
      }

      for (const emi_row of emiInserts) {
        await sql`
          INSERT INTO repayments (shg_id, loan_id, member_id, emi_amount, due_date, status)
          VALUES (${application.shg_id}, ${emi_row.loan_id}, ${application.member_id}, ${emi_row.emi_amount}, ${emi_row.due_date}, 'pending')
        `;
      }
    }

    res.json({ success: true, data: updatedApp, message: 'Loan application ' + status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to process application' });
  }
});

export default router;
