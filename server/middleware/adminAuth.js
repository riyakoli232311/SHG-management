// server/middleware/adminAuth.js
import { verifyToken } from '../lib/auth.js';
import { getDb } from '../lib/db.js';

const ADMIN_COOKIE_NAME = 'admin_session';

export function getAdminTokenFromRequest(req) {
  if (req.cookies?.[ADMIN_COOKIE_NAME]) {
    return req.cookies[ADMIN_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export async function requireAdminAuth(req, res, next) {
  const token = getAdminTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Admin not authenticated' });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.adminId) {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin session' });
  }

  try {
    const sql = getDb();

    // Load admin
    const [admin] = await sql`SELECT id, email, name, phone_number, state, district FROM admins WHERE id = ${payload.adminId}`;
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Admin Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
}
