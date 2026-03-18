// server/routes/chat.js
// Agentic Sakhi — full read/write access to all SHG data via Groq tool-calling

import express from 'express';
import { getDb } from '../lib/db.js';
import { requireShg } from '../middleware/authMiddleware.js';

const router = express.Router();
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOOL_ROUNDS = 6; // prevent infinite loops

// ── Tool Definitions ──────────────────────────────────────────
const TOOLS = [
  // ── Dashboard ──
  {
    type: 'function',
    function: {
      name: 'get_dashboard',
      description: 'Get overall SHG statistics: total members, total savings, active loans count, pending/overdue repayments, and government schemes.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },

  // ── SHG Info ──
  {
    type: 'function',
    function: {
      name: 'get_shg_info',
      description: 'Get details about this SHG: name, village, district, state, formation date, bank details.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },

  // ── Members ──
  {
    type: 'function',
    function: {
      name: 'get_members',
      description: 'List all members of the SHG. Optionally filter by name (partial match) or status.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Partial name to search for' },
          status: { type: 'string', enum: ['active', 'inactive'], description: 'Filter by status' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_member',
      description: 'Get full profile of a single member by their ID.',
      parameters: {
        type: 'object',
        properties: {
          member_id: { type: 'integer', description: 'The member ID' },
        },
        required: ['member_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_member',
      description: 'Add a new member to the SHG.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name (required)' },
          phone: { type: 'string' },
          age: { type: 'integer' },
          village: { type: 'string' },
          role: { type: 'string', enum: ['member', 'president', 'secretary', 'treasurer'], default: 'member' },
          occupation: { type: 'string' },
          husband_name: { type: 'string' },
          joined_date: { type: 'string', description: 'YYYY-MM-DD' },
          caste_category: { type: 'string', enum: ['general', 'obc', 'sc', 'st'] },
          bpl_status: { type: 'boolean' },
          income: { type: 'number' },
          aadhar: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_member',
      description: 'Update details of an existing member.',
      parameters: {
        type: 'object',
        properties: {
          member_id: { type: 'integer', description: 'The member ID to update' },
          name: { type: 'string' },
          phone: { type: 'string' },
          age: { type: 'integer' },
          role: { type: 'string', enum: ['member', 'president', 'secretary', 'treasurer'] },
          status: { type: 'string', enum: ['active', 'inactive'] },
          occupation: { type: 'string' },
          income: { type: 'number' },
          village: { type: 'string' },
          bank_account: { type: 'string' },
          bank_ifsc: { type: 'string' },
        },
        required: ['member_id'],
      },
    },
  },

  // ── Savings ──
  {
    type: 'function',
    function: {
      name: 'get_savings',
      description: 'Fetch savings records. Can filter by member_id, month+year, or get all.',
      parameters: {
        type: 'object',
        properties: {
          member_id: { type: 'integer' },
          month: { type: 'integer', description: '1-12' },
          year: { type: 'integer', description: 'e.g. 2024' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'record_saving',
      description: 'Record or update a savings entry for a member for a specific month/year.',
      parameters: {
        type: 'object',
        properties: {
          member_id: { type: 'integer' },
          month: { type: 'integer', description: '1-12' },
          year: { type: 'integer' },
          amount: { type: 'number', description: 'Amount in rupees' },
          payment_mode: { type: 'string', enum: ['cash', 'upi', 'bank_transfer'], default: 'cash' },
          date: { type: 'string', description: 'YYYY-MM-DD, defaults to today' },
        },
        required: ['member_id', 'month', 'year', 'amount'],
      },
    },
  },

  // ── Loans ──
  {
    type: 'function',
    function: {
      name: 'get_loans',
      description: 'Fetch loans. Filter by member_id or status.',
      parameters: {
        type: 'object',
        properties: {
          member_id: { type: 'integer' },
          status: { type: 'string', enum: ['active', 'closed'] },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_loan',
      description: 'Disburse a new loan to a member. Auto-generates the EMI repayment schedule.',
      parameters: {
        type: 'object',
        properties: {
          member_id: { type: 'integer' },
          loan_amount: { type: 'number', description: 'Principal amount in rupees' },
          interest_rate: { type: 'number', description: 'Annual interest rate in %, default 2' },
          tenure_months: { type: 'integer', description: 'Loan tenure in months, default 12' },
          purpose: { type: 'string' },
          disbursed_date: { type: 'string', description: 'YYYY-MM-DD, defaults to today' },
        },
        required: ['member_id', 'loan_amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_loan_status',
      description: 'Update loan status (e.g. close a loan manually).',
      parameters: {
        type: 'object',
        properties: {
          loan_id: { type: 'integer' },
          status: { type: 'string', enum: ['active', 'closed'] },
        },
        required: ['loan_id', 'status'],
      },
    },
  },

  // ── Repayments ──
  {
    type: 'function',
    function: {
      name: 'get_repayments',
      description: 'Get EMI repayment schedule. Filter by loan_id, member_id, or status.',
      parameters: {
        type: 'object',
        properties: {
          loan_id: { type: 'integer' },
          member_id: { type: 'integer' },
          status: { type: 'string', enum: ['pending', 'paid', 'overdue'] },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_repayment_paid',
      description: 'Mark an EMI instalment as paid. Will auto-close the loan if all EMIs are paid.',
      parameters: {
        type: 'object',
        properties: {
          repayment_id: { type: 'integer' },
          paid_date: { type: 'string', description: 'YYYY-MM-DD, defaults to today' },
        },
        required: ['repayment_id'],
      },
    },
  },

  // ── Meetings ──
  {
    type: 'function',
    function: {
      name: 'get_meetings',
      description: 'List all meetings of the SHG with their attendance and details.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_meeting',
      description: 'Schedule a new meeting.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD' },
          agenda: { type: 'string' },
          venue: { type: 'string' },
          status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
          meeting_type: { type: 'string', description: 'e.g. monthly, emergency' },
          notes: { type: 'string' },
        },
        required: ['date', 'agenda'],
      },
    },
  },

  // ── Government Schemes ──
  {
    type: 'function',
    function: {
      name: 'get_government_schemes',
      description: 'Get government schemes available for this SHG based on their district.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

// ── Tool Executor ─────────────────────────────────────────────
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
      const totalSavings = savings.reduce((s, r) => s + Number(r.amount), 0);
      const activeLoans = loans.filter(l => l.status === 'active');
      const reps = repayments.map(r => ({
        ...r, status: r.status === 'pending' && r.due_date < today ? 'overdue' : r.status,
      }));
      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        totalSavings,
        activeLoansCount: activeLoans.length,
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
      const [member] = await sql`SELECT * FROM members WHERE id = ${args.member_id} AND shg_id = ${shgId}`;
      if (!member) return { error: 'Member not found' };
      const savings = await sql`SELECT * FROM savings WHERE member_id = ${args.member_id} ORDER BY year DESC, month DESC`;
      const loans = await sql`SELECT * FROM loans WHERE member_id = ${args.member_id} AND shg_id = ${shgId} ORDER BY disbursed_date DESC`;
      return { ...member, savings, loans };
    }

    case 'add_member': {
      const [member] = await sql`
        INSERT INTO members (shg_id, name, phone, age, income, aadhar, joined_date, village,
          gram_panchayat, block, district, state, husband_name, occupation, role,
          caste_category, bpl_status, status)
        VALUES (
          ${shgId}, ${args.name}, ${args.phone || null}, ${args.age || null},
          ${args.income || null}, ${args.aadhar || null},
          ${args.joined_date || today}, ${args.village || null},
          ${null}, ${null}, ${null}, ${null},
          ${args.husband_name || null}, ${args.occupation || null},
          ${args.role || 'member'}, ${args.caste_category || null},
          ${args.bpl_status ?? false}, 'active'
        )
        RETURNING *
      `;
      return { success: true, member };
    }

    case 'update_member': {
      const { member_id, ...fields } = args;
      const [member] = await sql`
        UPDATE members SET
          name           = COALESCE(${fields.name},         name),
          phone          = COALESCE(${fields.phone},        phone),
          age            = COALESCE(${fields.age},          age),
          role           = COALESCE(${fields.role},         role),
          status         = COALESCE(${fields.status},       status),
          occupation     = COALESCE(${fields.occupation},   occupation),
          income         = COALESCE(${fields.income},       income),
          village        = COALESCE(${fields.village},      village),
          bank_account   = COALESCE(${fields.bank_account}, bank_account),
          bank_ifsc      = COALESCE(${fields.bank_ifsc},    bank_ifsc),
          updated_at     = now()
        WHERE id = ${member_id} AND shg_id = ${shgId}
        RETURNING *
      `;
      return member ? { success: true, member } : { error: 'Member not found' };
    }

    case 'get_savings': {
      let rows;
      if (args.member_id) {
        rows = await sql`
          SELECT s.*, m.name AS member_name FROM savings s
          JOIN members m ON m.id = s.member_id
          WHERE s.shg_id = ${shgId} AND s.member_id = ${args.member_id}
          ORDER BY s.year DESC, s.month DESC`;
      } else if (args.month && args.year) {
        rows = await sql`
          SELECT s.*, m.name AS member_name FROM savings s
          JOIN members m ON m.id = s.member_id
          WHERE s.shg_id = ${shgId} AND s.month = ${args.month} AND s.year = ${args.year}
          ORDER BY m.name`;
      } else {
        rows = await sql`
          SELECT s.*, m.name AS member_name FROM savings s
          JOIN members m ON m.id = s.member_id
          WHERE s.shg_id = ${shgId}
          ORDER BY s.year DESC, s.month DESC`;
      }
      const total = rows.reduce((s, r) => s + Number(r.amount), 0);
      return { count: rows.length, total, savings: rows };
    }

    case 'record_saving': {
      const [saving] = await sql`
        INSERT INTO savings (shg_id, member_id, month, year, amount, payment_mode, date)
        VALUES (${shgId}, ${args.member_id}, ${args.month}, ${args.year},
                ${args.amount}, ${args.payment_mode || 'cash'}, ${args.date || today})
        ON CONFLICT (member_id, month, year)
        DO UPDATE SET amount = EXCLUDED.amount, payment_mode = EXCLUDED.payment_mode, date = EXCLUDED.date
        RETURNING *
      `;
      return { success: true, saving };
    }

    case 'get_loans': {
      let rows;
      if (args.member_id) {
        rows = await sql`
          SELECT l.*, m.name AS member_name FROM loans l
          JOIN members m ON m.id = l.member_id
          WHERE l.shg_id = ${shgId} AND l.member_id = ${args.member_id}
          ORDER BY l.disbursed_date DESC`;
      } else if (args.status) {
        rows = await sql`
          SELECT l.*, m.name AS member_name FROM loans l
          JOIN members m ON m.id = l.member_id
          WHERE l.shg_id = ${shgId} AND l.status = ${args.status}
          ORDER BY l.disbursed_date DESC`;
      } else {
        rows = await sql`
          SELECT l.*, m.name AS member_name FROM loans l
          JOIN members m ON m.id = l.member_id
          WHERE l.shg_id = ${shgId}
          ORDER BY l.disbursed_date DESC`;
      }
      return { count: rows.length, loans: rows };
    }

    case 'create_loan': {
      const principal = Number(args.loan_amount);
      const rate = Number(args.interest_rate ?? 2);
      const months = Number(args.tenure_months ?? 12);
      const disbursed = args.disbursed_date || today;

      const r = rate / 100 / 12;
      const emi = r === 0
        ? Math.round(principal / months)
        : Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));

      const [loan] = await sql`
        INSERT INTO loans (shg_id, member_id, loan_amount, interest_rate, tenure_months, purpose, disbursed_date)
        VALUES (${shgId}, ${args.member_id}, ${principal}, ${rate}, ${months},
                ${args.purpose || null}, ${disbursed})
        RETURNING *
      `;

      // Auto-generate EMI schedule
      const disbursedDate = new Date(disbursed);
      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(disbursedDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        await sql`
          INSERT INTO repayments (shg_id, loan_id, member_id, emi_amount, due_date, status)
          VALUES (${shgId}, ${loan.id}, ${args.member_id}, ${emi}, ${dueDate.toISOString().split('T')[0]}, 'pending')
        `;
      }

      return { success: true, loan, emi_amount: emi, total_emis: months };
    }

    case 'update_loan_status': {
      const [loan] = await sql`
        UPDATE loans SET status = ${args.status}, updated_at = now()
        WHERE id = ${args.loan_id} AND shg_id = ${shgId}
        RETURNING *
      `;
      return loan ? { success: true, loan } : { error: 'Loan not found' };
    }

    case 'get_repayments': {
      let rows;
      if (args.loan_id) {
        rows = await sql`
          SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r
          JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id
          WHERE r.shg_id = ${shgId} AND r.loan_id = ${args.loan_id}
          ORDER BY r.due_date ASC`;
      } else if (args.member_id) {
        rows = await sql`
          SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r
          JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id
          WHERE r.shg_id = ${shgId} AND r.member_id = ${args.member_id}
          ORDER BY r.due_date ASC`;
      } else if (args.status) {
        rows = await sql`
          SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r
          JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id
          WHERE r.shg_id = ${shgId} AND r.status = ${args.status}
          ORDER BY r.due_date ASC`;
      } else {
        rows = await sql`
          SELECT r.*, m.name AS member_name, l.loan_amount FROM repayments r
          JOIN members m ON m.id = r.member_id JOIN loans l ON l.id = r.loan_id
          WHERE r.shg_id = ${shgId}
          ORDER BY r.due_date DESC`;
      }
      // auto-flag overdue
      const mapped = rows.map(r => ({
        ...r,
        status: r.status === 'pending' && String(r.due_date).split('T')[0] < today ? 'overdue' : r.status,
      }));
      return { count: mapped.length, repayments: mapped };
    }

    case 'mark_repayment_paid': {
      const paidDate = args.paid_date || today;
      const [repayment] = await sql`
        UPDATE repayments SET status = 'paid', paid_date = ${paidDate}
        WHERE id = ${args.repayment_id} AND shg_id = ${shgId}
        RETURNING *
      `;
      if (!repayment) return { error: 'Repayment not found' };

      // Auto-close loan if all EMIs paid
      const [pending] = await sql`
        SELECT COUNT(*) AS count FROM repayments
        WHERE loan_id = ${repayment.loan_id} AND status != 'paid'
      `;
      if (Number(pending.count) === 0) {
        await sql`UPDATE loans SET status = 'closed', updated_at = now() WHERE id = ${repayment.loan_id}`;
        return { success: true, repayment, loan_closed: true };
      }
      return { success: true, repayment };
    }

    case 'get_meetings': {
      const meetings = await sql`SELECT * FROM meetings ORDER BY date DESC`;
      return { count: meetings.length, meetings };
    }

    case 'create_meeting': {
      const [meeting] = await sql`
        INSERT INTO meetings (date, agenda, venue, status, notes, "meeting type", created_updated)
        VALUES (${args.date}, ${args.agenda}, ${args.venue || null},
                ${args.status || 'scheduled'}, ${args.notes || null},
                ${args.meeting_type || 'monthly'}, NOW())
        RETURNING *
      `;
      return { success: true, meeting };
    }

    case 'get_government_schemes': {
      const [shgInfo] = await sql`SELECT district FROM shg_info WHERE id = ${shgId}`;
      if (!shgInfo?.district) return { schemes: [], message: 'No district set for this SHG' };
      const schemes = await sql`
        SELECT gs.id, gs.title, gs.description, gs.created_at, a.name AS posted_by
        FROM government_schemes gs
        JOIN admins a ON gs.admin_id = a.id
        WHERE LOWER(TRIM(a.district)) = LOWER(TRIM(${shgInfo.district}))
        ORDER BY gs.created_at DESC
      `;
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
    return res.status(500).json({ success: false, error: 'GROQ_API_KEY not configured' });
  }

  const sql = getDb();
  const shgId = req.shgId;

  // Fetch fresh SHG info for system prompt
  const [shgInfo] = await sql`SELECT name, village, district, state, formation_date FROM shg_info WHERE id = ${shgId}`;
  const location = [shgInfo?.village, shgInfo?.district, shgInfo?.state].filter(Boolean).join(', ');

  const LANGUAGE_NAMES = {
    en: 'English', hi: 'हिंदी', mr: 'मराठी',
    ta: 'தமிழ்', te: 'తెలుగు', kn: 'ಕನ್ನಡ', bn: 'বাংলা',
  };
  const langInstruction = language === 'en'
    ? 'Always respond in English only.'
    : `Always respond in ${LANGUAGE_NAMES[language] || language} only. Do not mix languages.`;

  const systemPrompt = `You are Sakhi, an intelligent agentic AI assistant for ${shgInfo?.name || shgName || 'the SHG'}${location ? `, based in ${location}` : ''}. 

You have full access to the SHG's live data through tools. Use them proactively to give accurate, data-driven answers.

The current user is ${userName || 'the leader'}, who is the ${userRole || 'leader'} of the group.${shgInfo?.formation_date ? ` The group was formed on ${new Date(shgInfo.formation_date).toLocaleDateString('en-IN')}.` : ''}

Guidelines:
- Always fetch real data before answering questions about members, loans, savings, or meetings.
- For write operations (recording savings, marking payments, adding members), confirm the action clearly.
- When showing financial data, always use Indian Rupee format (₹).
- Be warm, concise, and practical. Use simple language suitable for rural SHG leaders.
- Today's date is ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
- ${langInstruction}`;

  // Build conversation for Groq
  let groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  // ── Agentic Loop ──────────────────────────────────────────
  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: groqMessages,
          tools: TOOLS,
          tool_choice: 'auto',
          temperature: 0.4,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API error ${response.status}: ${err}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const assistantMsg = choice?.message;

      // No tool calls → final answer
      if (!assistantMsg?.tool_calls || assistantMsg.tool_calls.length === 0) {
        return res.json({
          success: true,
          reply: assistantMsg?.content || 'Sorry, I could not generate a response.',
        });
      }

      // Add assistant message with tool_calls to history
      groqMessages.push(assistantMsg);

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        assistantMsg.tool_calls.map(async (tc) => {
          const args = JSON.parse(tc.function.arguments || '{}') || {};
          console.log(`[Sakhi Tool] ${tc.function.name}(${JSON.stringify(args)})`);
          const result = await executeTool(tc.function.name, args, shgId, sql);
          return {
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          };
        })
      );

      // Add all tool results to history
      groqMessages.push(...toolResults);
    }

    // If we exhausted rounds without a final answer
    return res.json({ success: true, reply: 'I ran into a loop trying to fetch data. Please try rephrasing your question.' });

  } catch (err) {
    console.error('[Sakhi Chat Error]', err);
    res.status(500).json({ success: false, error: err.message || 'Chat failed' });
  }
});

export default router;