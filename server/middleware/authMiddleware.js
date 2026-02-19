// server/middleware/authMiddleware.js
import { getTokenFromRequest, verifyToken } from '../lib/auth.js';
import { getDb } from '../lib/db.js';

/**
 * Protects routes - attaches req.user and req.shgId if authenticated.
 */
export async function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }

  try {
    const sql = getDb();

    // Load user
    const [user] = await sql`SELECT id, name, email FROM users WHERE id = ${payload.userId}`;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // Load their SHG (may be null if not onboarded yet)
    const [shg] = await sql`SELECT id FROM shg_info WHERE user_id = ${user.id}`;

    req.user = user;
    req.shgId = shg?.id || null;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
}

/**
 * Same as requireAuth but also requires the SHG to exist (onboarded).
 */
export async function requireShg(req, res, next) {
  await requireAuth(req, res, async () => {
    if (!req.shgId) {
      return res.status(403).json({ success: false, error: 'SHG profile not set up yet' });
    }
    next();
  });
}