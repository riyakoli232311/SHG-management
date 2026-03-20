// server/routes/chat.js
import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOOL_ROUNDS = 6;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Tools ─────────────────────────────────────────────────────
const TOOLS = [
  { type: 'function', function: { name: 'get_dashboard', description: 'Get overall SHG statistics: total members, total savings, active loans, pending/overdue repayments.', parameters: { type: 'object', properties: {}, required: [] } } },
  { type: 'function', function: { name: 'get_shg_info', description: 'Get SHG details: name, village, district, state, formation date, bank details.', parameters: { type: 'object', properties: {}, required: [] } } },
  { type: 'function', function: { name: 'get_members', description: 'List all SHG members. Filter by name (partial) or status.', parameters: { type: 'object', properties: { search: { type: 'string' }, status: { type: 'string', enum: ['active', 'inactive'] } }, required: [] } } },
  { type: 'function', function: { name: 'get_member', description: 'Get full profile of a member by ID.', parameters: { type: 'object', properties: { member_id: { type: 'integer' } }, required: ['member_id'] } } },
  { type: 'function', function: { name: 'add_member', description: 'Add a new member to the SHG.', parameters: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, age: { type: 'integer' }, village: { type: 'string' }, role: { type: 'string', enum: ['member', 'president', 'secretary', 'treasurer'] }, occupation: { type: 'string' }, husband_name: { type: 'string' }, joined_date: { type: 'string' }, caste_category: { type: 'string', enum: ['general', 'obc', 'sc', 'st'] }, bpl_status: { type: 'boolean' }, income: { type: 'number' }, aadhar: { type: 'string' } }, required: ['name'] } } },
  { type: 'function', function: { name: 'update_member', description: 'Update an existing member by ID.', parameters: { type: 'object', properties: { member_id: { type: 'integer' }, name: { type: 'string' }, phone: { type: 'string' }, age: { type: 'integer' }, role: { type: 'string', enum: ['member', 'president', 'secretary', 'treasurer'] }, status: { type: 'string', enum: ['active', 'inactive'] }, occupation: { type: 'string' }, income: { type: 'number' }, village: { type: 'string' }, bank_account: { type: 'string' }, bank_ifsc: { type: 'string' } }, required: ['member_id'] } } },
  { type: 'function', function: { name: 'get_savings', description: 'Fetch savings. Filter by member_id, month+year, or get all.', parameters: { type: 'object', properties: { member_id: { type: 'integer' }, month: { type: 'integer' }, year: { type: 'integer' } }, required: [] } } },
  { type: 'function', function: { name: 'record_saving', description: 'Record or update a savings entry for a member.', parameters: { type: 'object', properties: { member_id: { type: 'integer' }, month: { type: 'integer' }, year: { type: 'integer' }, amount: { type: 'number' }, payment_mode: { type: 'string', enum: ['cash', 'upi', 'bank_transfer'] }, date: { type: 'string' } }, required: ['member_id', 'month', 'year', 'amount'] } } },
  { type: 'function', function: { name: 'get_loans', description: 'Fetch loans. Filter by member_id or status.', parameters: { type: 'object', properties: { member_id: { type: 'integer' }, status: { type: 'string', enum: ['active', 'closed'] } }, required: [] } } },
  { type: 'function', function: { name: 'create_loan', description: 'Disburse a new loan. Auto-generates EMI schedule.', parameters: { type: 'object', properties: { member_id: { type: 'integer' }, loan_amount: { type: 'number' }, interest_rate: { type: 'number' }, tenure_months: { type: 'integer' }, purpose: { type: 'string' }, disbursed_date: { type: 'string' } }, required: ['member_id', 'loan_amount'] } } },
  { type: 'function', function: { name: 'update_loan_status', description: 'Update loan status.', parameters: { type: 'object', properties: { loan_id: { type: 'integer' }, status: { type: 'string', enum: ['active', 'closed'] } }, required: ['loan_id', 'status'] } } },
  { type: 'function', function: { name: 'get_repayments', description: 'Get EMI records. Filter by loan_id, member_id, or status.', parameters: { type: 'object', properties: { loan_id: { type: 'integer' }, member_id: { type: 'integer' }, status: { type: 'string', enum: ['pending', 'paid', 'overdue'] } }, required: [] } } },
  { type: 'function', function: { name: 'mark_repayment_paid', description: 'Mark an EMI as paid. Auto-closes loan if all paid.', parameters: { type: 'object', properties: { repayment_id: { type: 'integer' }, paid_date: { type: 'string' } }, required: ['repayment_id'] } } },
  { type: 'function', function: { name: 'get_meetings', description: 'List all meetings with attendance.', parameters: { type: 'object', properties: {}, required: [] } } },
  { type: 'function', function: { name: 'create_meeting', description: 'Schedule a new meeting.', parameters: { type: 'object', properties: { date: { type: 'string' }, agenda: { type: 'string' }, venue: { type: 'string' }, status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] }, meeting_type: { type: 'string' }, notes: { type: 'string' } }, required: ['date', 'agenda'] } } },
  { type: 'function', function: { name: 'get_government_schemes', description: 'Get government schemes for this district.', parameters: { type: 'object', properties: {}, required: [] } } },
];

// ── Type coercion — Llama always sends strings ────────────────
const toInt  = (v) => (v !== undefined && v !== null && v !== '') ? parseInt(v, 10)  : null;
const toNum  = (v) => (v !== undefined && v !== null && v !== '') ? parseFloat(v)    : null;
const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

// ── Groq call with auto-retry on 429 ─────────────────────────
async function callGroq(payload, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      const match = (body?.error?.message || '').match(/try again in ([\d.]+)s/);
      const waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : 7000;
      console.log(`[Sakhi] Rate limited. Waiting ${waitMs}ms (attempt ${attempt + 1}/${retries})`);
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err}`);
    }

    return res.json();
  }
  throw new Error('Rate limit exceeded after retries. Please wait a moment and try again.');
}

// ── Trim history to save tokens ───────────────────────────────
function trimMessages(messages, maxPairs = 4) {
  const system  = messages.filter(m => m.role === 'system');
  const convo   = messages.filter(m => m.role !== 'system');
  return [...system, ...convo.slice(-(maxPairs * 2))];
}

// ── Tool executor ─────────────────────────────────────────────
async function executeTool(name, args, shgId, sql) {
  const today = new Date().toISOString().split('T')[0];

  switch (name) {
    case 'get_dashboard': {
      const [members, savings, loans, repayments] = await Promise.all([
        sql`SELECT * FROM members WHERE shg_id = ${shgId}`,
        sql`SELECT * FROM savings WHERE shg_id = ${shgId}`,
        sql`SELECT * FROM loans WHERE shg_id = ${shgId}`,
        sql`SELECT * FROM repayments WHERE shg_id = ${shgId}`,
      ]);
      const reps = repayments.map(r => ({ ...r, status: r.status === 'pending' && r.due_date < today ? 'overdue' : r.status }));
      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        totalSavings: savings.reduce((s, r) => s + Number(r.amount), 0),
        activeLoansCount: loans.filter(l => l.status === 'active').length,
        totalLoansDisbursed: loans.reduce((s, r) => s + Number(r.loan_amount), 0),
        totalRepaymentsCollected: reps.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.emi_amount), 0),
        pendingRepayments: reps.filter(r => r.status === 'pending').length,
        overdueRepayments: reps.filter(r => r.status === 'overdue').length,
      };
    }

    case 'get_shg_info': {
      const [shg] = await sql`SELECT * FROM shg_info WHERE id = ${shgId}`;
      return shg || { error: 'SHG not found' };
    }

    case 'get_members': {
      let rows;
      if (args.search) {
        rows = await sql`SELECT * FROM members WHERE shg_id = ${shgId} AND LOWER(name) LIKE ${'%' + args.search.toLowerCase() + '%'} ORDER BY name`;
      } else if (args.status) {
        rows = await sql`SELECT * FROM members WHERE shg_id = ${shgId} AND status = ${args.status} ORDER BY name`;
      } else {
        rows = await sql`SELECT * FROM members WHERE shg_id = ${shgId} ORDER BY name`;
      }
      return { count: rows.length, members: rows };
    }

    case 'get_member': {
      const mid = toInt(args.member_id);
      const [member] = await sql`SELECT * FROM members WHERE id = ${mid} AND shg_id = ${shgId}`;
      if (!member) return { error: 'Member not found' };
      const [savings, loans] = await Promise.all([
        sql`SELECT * FROM savings WHERE member_id = ${mid} ORDER BY year DESC, month DESC`,
        sql`SELECT * FROM loans WHERE member_id = ${mid} AND shg_id = ${shgId} ORDER BY disbursed_date DESC`,
      ]);
      return { ...member, savings, loans };
    }

    case 'add_member': {
      const [member] = await sql`
        INSERT INTO members (shg_id, name, phone, age, income, aadhar, joined_date, village, gram_panchayat, block, district, state, husband_name, occupation, role, caste_category, bpl_status, status)
        VALUES (${shgId}, ${args.name}, ${args.phone || null}, ${toInt(args.age)}, ${toNum(args.income)}, ${args.aadhar || null}, ${args.joined_date || today}, ${args.village || null}, ${null}, ${null}, ${null}, ${null}, ${args.husband_name || null}, ${args.occupation || null}, ${args.role || 'member'}, ${args.caste_category || null}, ${toBool(args.bpl_status)}, 'active')
        RETURNING *`;
      return { success: true, member };
    }

    case 'update_member': {
      const mid = toInt(args.member_id);
      const [member] = await sql`
        UPDATE members SET
          name = COALESCE(${args.name}, name), phone = COALESCE(${args.phone}, phone),
          age = COALESCE(${toInt(args.age)}, age), role = COALESCE(${args.role}, role),
          status = COALESCE(${args.status}, status), occupation = COALESCE(${args.occupation}, occupation),
          income = COALESCE(${toNum(args.income)}, income), village = COALESCE(${args.village}, village),
          bank_account = COALESCE(${args.bank_account}, bank_account), bank_ifsc = COALESCE(${args.bank_ifsc}, bank_ifsc),
          updated_at = now()
        WHERE id = ${mid} AND shg_id = ${shgId} RETURNING *`;
      return member ? { success: true, member } : { error: 'Member not found' };
    }

    case 'get_savings': {
      let rows;
      if (args.member_id) {
        const mid = toInt(args.member_id);
        rows = await sql`SELECT s.*, m.name AS member_name FROM savings s JOIN members m ON m.id = s.member_id WHERE s.shg_id = ${shgId} AND s.member_id = ${mid} ORDER BY s.year DESC, s.month DESC`;
      } else if (args.month && args.year) {
        rows = await sql`SELECT s.*, m.name AS member_name FROM savings s JOIN members m ON m.id = s.member_id WHERE s.shg_id = ${shgId} AND s.month = ${toInt(args.month)} AND s.year = ${toInt(args.year)} ORDER BY m.name`;
      } else {
        rows = await sql`SELECT s.*, m.name AS member_name FROM savings s JOIN members m ON m.id = s.member_id WHERE s.shg_id = ${shgId} ORDER BY s.year DESC, s.month DESC`;
      }
      return { count: rows.length, total: rows.reduce((s, r) => s + Number(r.amount), 0), savings: rows };
    }

    case 'record_saving': {
      const mid    = toInt(args.member_id);
      const month  = toInt(args.month);
      const year   = toInt(args.year);
      const amount = toNum(args.amount);
      const [member] = await sql`SELECT id, name FROM members WHERE id = ${mid} AND shg_id = ${shgId}`;
      if (!member) return { error: `Member ID ${mid} not found in this SHG` };
      const [saving] = await sql`
        INSERT INTO savings (shg_id, member_id, month, year, amount, payment_mode, date)
        VALUES (${shgId}, ${mid}, ${month}, ${year}, ${amount}, ${args.payment_mode || 'cash'}, ${args.date || today})
        ON CONFLICT (member_id, month, year) DO UPDATE SET amount = EXCLUDED.amount, payment_mode = EXCLUDED.payment_mode, date = EXCLUDED.date
        RETURNING *`;
      return { success: true, saving, message: `Recorded ₹${amount} savings for ${member.name}` };
    }

    case 'get_loans': {
      let rows;
      if (args.member_id) {
        const mid = toInt(args.member_id);
        rows = await sql`SELECT l.*, m.name AS member_name FROM loans l JOIN members m ON m.id = l.member_id WHERE l.shg_id = ${shgId} AND l.member_id = ${mid} ORDER BY l.disbursed_date DESC`;
      } else if (args.status) {
        rows = await sql`SELECT l.*, m.name AS member_name FROM loans l JOIN members m ON m.id = l.member_id WHERE l.shg_id = ${shgId} AND l.status = ${args.status} ORDER BY l.disbursed_date DESC`;
      } else {
        rows = await sql`SELECT l.*, m.name AS member_name FROM loans l JOIN members m ON m.id = l.member_id WHERE l.shg_id = ${shgId} ORDER BY l.disbursed_date DESC`;
      }
      return { count: rows.length, loans: rows };
    }

    case 'create_loan': {
      const principal = toNum(args.loan_amount);
      const rate      = toNum(args.interest_rate ?? 2);
      const months    = toInt(args.tenure_months ?? 12);
      const mid       = toInt(args.member_id);
      const disbursed = args.disbursed_date || today;
      const r = rate / 100 / 12;
      const emi = r === 0 ? Math.round(principal / months) : Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
      const [loan] = await sql`INSERT INTO loans (shg_id, member_id, loan_amount, interest_rate, tenure_months, purpose, disbursed_date) VALUES (${shgId}, ${mid}, ${principal}, ${rate}, ${months}, ${args.purpose || null}, ${disbursed}) RETURNING *`;
      const disbursedDate = new Date(disbursed);
      for (let i = 1; i <= months; i++) {
        const d = new Date(disbursedDate); d.setMonth(d.getMonth() + i);
        await sql`INSERT INTO repayments (shg_id, loan_id, member_id, emi_amount, due_date, status) VALUES (${shgId}, ${loan.id}, ${mid}, ${emi}, ${d.toISOString().split('T')[0]}, 'pending')`;
      }
      return { success: true, loan, emi_amount: emi, total_emis: months };
    }

    case 'update_loan_status': {
      const lid = toInt(args.loan_id);
      const [loan] = await sql`UPDATE loans SET status = ${args.status}, updated_at = now() WHERE id = ${lid} AND shg_id = ${shgId} RETURNING *`;
      return loan ? { success: true, loan } : { error: 'Loan not found' };
    }

    case 'get_repayments': {
      let rows;
      if (args.loan_id) {
        const lid = toInt(args.loan_id);
        rows = await sql`SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id WHERE r.shg_id = ${shgId} AND r.loan_id = ${lid} ORDER BY r.due_date ASC`;
      } else if (args.member_id) {
        const mid = toInt(args.member_id);
        rows = await sql`SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id WHERE r.shg_id = ${shgId} AND r.member_id = ${mid} ORDER BY r.due_date ASC`;
      } else if (args.status) {
        rows = await sql`SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id WHERE r.shg_id = ${shgId} AND r.status = ${args.status} ORDER BY r.due_date ASC`;
      } else {
        rows = await sql`SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id WHERE r.shg_id = ${shgId} ORDER BY r.due_date DESC`;
      }
      const mapped = rows.map(r => ({ ...r, status: r.status === 'pending' && String(r.due_date).split('T')[0] < today ? 'overdue' : r.status }));
      return { count: mapped.length, repayments: mapped };
    }

    case 'mark_repayment_paid': {
      const rid = toInt(args.repayment_id);
      const paidDate = args.paid_date || today;
      const [repayment] = await sql`UPDATE repayments SET status = 'paid', paid_date = ${paidDate} WHERE id = ${rid} AND shg_id = ${shgId} RETURNING *`;
      if (!repayment) return { error: 'Repayment not found' };
      const [pending] = await sql`SELECT COUNT(*) AS count FROM repayments WHERE loan_id = ${repayment.loan_id} AND status != 'paid'`;
      if (Number(pending.count) === 0) {
        await sql`UPDATE loans SET status = 'closed', updated_at = now() WHERE id = ${repayment.loan_id}`;
        return { success: true, repayment, loan_closed: true };
      }
      return { success: true, repayment };
    }

    case 'get_meetings': {
      const meetings = await sql`SELECT * FROM meetings WHERE shg_id = ${shgId} ORDER BY date DESC`;
      return { count: meetings.length, meetings };
    }

    case 'create_meeting': {
      const [meeting] = await sql`
        INSERT INTO meetings (shg_id, date, agenda, venue, status, notes, "meeting type", created_updated)
        VALUES (${shgId}, ${args.date}, ${args.agenda}, ${args.venue || null}, ${args.status || 'scheduled'}, ${args.notes || null}, ${args.meeting_type || 'monthly'}, NOW())
        RETURNING *`;
      return { success: true, meeting };
    }

    case 'get_government_schemes': {
      const [shgInfo] = await sql`SELECT district FROM shg_info WHERE id = ${shgId}`;
      if (!shgInfo?.district) return { schemes: [], message: 'No district set' };
      const schemes = await sql`
        SELECT gs.id, gs.title, gs.description, gs.created_at, a.name AS posted_by
        FROM government_schemes gs JOIN admins a ON gs.admin_id = a.id
        WHERE LOWER(TRIM(a.district)) = LOWER(TRIM(${shgInfo.district}))
        ORDER BY gs.created_at DESC`;
      return { count: schemes.length, district: shgInfo.district, schemes };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ── POST /api/chat ────────────────────────────────────────────
router.post('/', requireShg, async (req, res) => {
  const { messages = [], language = 'en', shgName, userName, userRole } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ success: false, error: 'GROQ_API_KEY not configured on the server.' });
  }

  const sql   = getDb();
  const shgId = req.shgId;

  const [shgInfo] = await sql`SELECT name, village, district, state FROM shg_info WHERE id = ${shgId}`;
  const location  = [shgInfo?.village, shgInfo?.district, shgInfo?.state].filter(Boolean).join(', ');

  const LANGUAGE_NAMES = { en: 'English', hi: 'हिंदी', mr: 'मराठी', ta: 'தமிழ்', te: 'తెలుగు', kn: 'ಕನ್ನಡ', bn: 'বাংলা' };
  const langInstruction = language === 'en' ? 'Respond in English only.' : `Respond in ${LANGUAGE_NAMES[language] || language} only.`;

  const systemPrompt = `You are Sakhi, AI assistant for ${shgInfo?.name || shgName || 'the SHG'}${location ? ` in ${location}` : ''}.
User: ${userName || 'leader'}. Today: ${new Date().toLocaleDateString('en-IN')}.

TOOL USAGE RULES:

MODE 1 — Answer from your own knowledge (NO tools needed):
Use this for general, educational, or conversational questions. Examples:
- "What is a loan?" → just explain what a loan is. Do NOT call any tool.
- "What is interest?" → explain interest. Do NOT call any tool.
- "How is EMI calculated?" → explain EMI. Do NOT call any tool.
- "What is an SHG?" → explain SHGs. Do NOT call any tool.
- "Hi / Hello / How are you" → just greet. Do NOT call any tool.
- Any general knowledge or finance question → answer directly. Do NOT call any tool.

MODE 2 — Use tools for THIS SHG's real data:
ONLY call tools when user asks about their specific SHG. Examples:
- "How many members do we have?" → call get_members
- "Show our active loans" → call get_loans
- "Record ₹500 for Kavita" → call get_members first, then record_saving

Golden rule: if ANY person on Earth could answer it from general knowledge, answer it yourself without tools.

Extra rules:
- Always call get_members FIRST when a member is mentioned by name.
- Use ₹ for currency. Be warm, concise, practical.
- ${langInstruction}`;

  const groqMessages = trimMessages([
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: String(m.content || '') })),
  ], 4);

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const data = await callGroq({
        model: GROQ_MODEL,
        messages: groqMessages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 512,
      });

      const assistantMsg = data.choices?.[0]?.message;

      if (!assistantMsg) {
        return res.json({ success: true, reply: 'Sorry, I did not get a response. Please try again.' });
      }

      // No tool calls → final answer
      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        const reply = assistantMsg.content || '';
        return res.json({ success: true, reply });
      }

      groqMessages.push(assistantMsg);

      // Execute all tool calls
      const toolResults = await Promise.all(
        assistantMsg.tool_calls.map(async (tc) => {
          let args = {};
          try { args = JSON.parse(tc.function.arguments || '{}'); } catch { args = {}; }
          console.log(`[Sakhi Tool] ${tc.function.name}(${JSON.stringify(args)})`);
          const result = await executeTool(tc.function.name, args, shgId, sql);
          return {
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result).slice(0, 3000),
          };
        })
      );

      groqMessages.push(...toolResults);
    }

    return res.json({ success: true, reply: 'I had trouble fetching the data. Please rephrase your question.' });

  } catch (err) {
    console.error('[Sakhi Chat Error]', err.message);

    if (err.message.includes('Rate limit') || err.message.includes('rate limit')) {
      return res.status(429).json({ success: false, error: 'The AI is busy right now. Please wait 10–15 seconds and try again.' });
    }

    return res.status(500).json({ success: false, error: err.message || 'Chat failed. Please try again.' });
  }
});

export default router;