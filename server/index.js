// server/index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import shgRoutes from './routes/shg.js';
import membersRoutes from './routes/members.js';
import savingsRoutes from './routes/savings.js';
import loansRoutes from './routes/loans.js';
import repaymentsRoutes from './routes/repayments.js';
import dashboardRoutes from './routes/dashboard.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import loanReqRoutes from './routes/loanRequests.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:5173'
  ],
  credentials: true, // Required for cookies!
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Static Files ──────────────────────────────────────────────
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/shg', shgRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/repayments', repaymentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loan', loanReqRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'SakhiSahyog server is running', timestamp: new Date() });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║   🌸 SakhiSahyog Server  →  http://localhost:${PORT}  ║
╠════════════════════════════════════════════════════╣
║  POST  /api/auth/signup          Register          ║
║  POST  /api/auth/login           Login             ║
║  POST  /api/auth/logout          Logout            ║
║  GET   /api/auth/me              Current user      ║
║  POST  /api/shg/setup            Create SHG        ║
║  GET   /api/members              List members      ║
║  GET   /api/savings              List savings      ║
║  GET   /api/loans                List loans        ║
║  GET   /api/repayments           List EMIs         ║
║  GET   /api/dashboard            Summary stats     ║
╚════════════════════════════════════════════════════╝
  `);
});

export default app;