// server/routes/members.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── GET /api/members ──────────────────────────────────────────
router.get('/', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const members = await sql`
      SELECT * FROM members
      WHERE shg_id = ${req.shgId}
      ORDER BY
        CASE role
          WHEN 'president'  THEN 1
          WHEN 'secretary'  THEN 2
          WHEN 'treasurer'  THEN 3
          ELSE 4
        END,
        name ASC
    `;
    res.json({ success: true, data: members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch members' });
  }
});

// ── GET /api/members/:id ──────────────────────────────────────
router.get('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [member] = await sql`
      SELECT * FROM members
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
    `;
    if (!member) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch member' });
  }
});

// ── POST /api/members ─────────────────────────────────────────
router.post('/', requireShg, async (req, res) => {
  try {
    const {
      name, phone, age, income, aadhar, joined_date, status,
      // Address
      village, gram_panchayat, block, district, state, pin_code,
      // Personal
      husband_name, occupation,
      // Group
      role,
      // Financial
      bank_account, bank_ifsc,
      // Scheme
      caste_category, bpl_status,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    const sql = getDb();
    const [member] = await sql`
      INSERT INTO members (
        shg_id, name, phone, age, income, aadhar,
        joined_date, status,
        village, gram_panchayat, block, district, state, pin_code,
        husband_name, occupation, role,
        bank_account, bank_ifsc,
        caste_category, bpl_status
      ) VALUES (
        ${req.shgId},
        ${name},
        ${phone || null},
        ${age || null},
        ${income || 0},
        ${aadhar || null},
        ${joined_date || new Date()},
        ${status || 'active'},
        ${village || null},
        ${gram_panchayat || null},
        ${block || null},
        ${district || null},
        ${state || null},
        ${pin_code || null},
        ${husband_name || null},
        ${occupation || null},
        ${role || 'member'},
        ${bank_account || null},
        ${bank_ifsc || null},
        ${caste_category || null},
        ${bpl_status ?? false}
      )
      RETURNING *
    `;
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to add member' });
  }
});

// ── PUT /api/members/:id ──────────────────────────────────────
router.put('/:id', requireShg, async (req, res) => {
  try {
    const {
      name, phone, age, income, aadhar, joined_date, status,
      village, gram_panchayat, block, district, state, pin_code,
      husband_name, occupation, role,
      bank_account, bank_ifsc,
      caste_category, bpl_status,
    } = req.body;

    const sql = getDb();
    const [member] = await sql`
      UPDATE members SET
        name            = COALESCE(${name},            name),
        phone           = COALESCE(${phone},           phone),
        age             = COALESCE(${age},             age),
        income          = COALESCE(${income},          income),
        aadhar          = COALESCE(${aadhar},          aadhar),
        joined_date     = COALESCE(${joined_date},     joined_date),
        status          = COALESCE(${status},          status),
        village         = COALESCE(${village},         village),
        gram_panchayat  = COALESCE(${gram_panchayat},  gram_panchayat),
        block           = COALESCE(${block},           block),
        district        = COALESCE(${district},        district),
        state           = COALESCE(${state},           state),
        pin_code        = COALESCE(${pin_code},        pin_code),
        husband_name    = COALESCE(${husband_name},    husband_name),
        occupation      = COALESCE(${occupation},      occupation),
        role            = COALESCE(${role},            role),
        bank_account    = COALESCE(${bank_account},    bank_account),
        bank_ifsc       = COALESCE(${bank_ifsc},       bank_ifsc),
        caste_category  = COALESCE(${caste_category},  caste_category),
        bpl_status      = COALESCE(${bpl_status},      bpl_status),
        updated_at      = now()
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
      RETURNING *
    `;
    if (!member) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update member' });
  }
});

// ── DELETE /api/members/:id ───────────────────────────────────
router.delete('/:id', requireShg, async (req, res) => {
  try {
    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM members
      WHERE id = ${req.params.id} AND shg_id = ${req.shgId}
      RETURNING id
    `;
    if (!deleted) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete member' });
  }
});

export default router;