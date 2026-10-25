const db = require('../../config/db');
const { verify, sign, shouldRefresh } = require('../../utils/jwt');
const { unauthorized } = require('../../utils/response');

// Header carrying a renewed token when the current one is past half its lifetime.
// Clients (admin panel) swap it in so an active session never expires.
const REFRESH_HEADER = 'X-Refreshed-Token';

// Re-load the fields that authorization depends on from the database on every request,
// so blocking a user/admin or changing role/permissions takes effect immediately instead
// of only when the (7-day) JWT expires.
const loadUser = async (payload) => {
  if (!payload?.id) return null;
  const { rows } = await db.query(
    'SELECT id, role, email, phone, name, permissions, is_blocked FROM users WHERE id=$1',
    [payload.id]
  );
  if (!rows.length) return { reason: 'ACCOUNT_NOT_FOUND' };
  if (rows[0].is_blocked) return { reason: 'ACCOUNT_BLOCKED' };
  const u = rows[0];
  return {
    id: u.id,
    role: u.role,
    email: u.email,
    phone: u.phone,
    name: u.name,
    permissions: Array.isArray(u.permissions) ? u.permissions : [],
  };
};

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
};

const authenticate = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return unauthorized(res);

  let payload;
  try {
    payload = verify(token);
  } catch (err) {
    // Distinguish expiry from tampering so clients can show the right message.
    const expired = err?.name === 'TokenExpiredError';
    res.set('X-Auth-Reason', expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID');
    return unauthorized(res, expired ? 'Session expired, please sign in again' : 'Invalid token');
  }

  try {
    const user = await loadUser(payload);
    if (!user || user.reason) {
      const reason = user?.reason || 'ACCOUNT_NOT_FOUND';
      res.set('X-Auth-Reason', reason);
      return unauthorized(res, reason === 'ACCOUNT_BLOCKED'
        ? 'Account blocked'
        : 'Account not found on this server (was the database switched?)');
    }
    req.user = user;

    // Sliding session: once half the token's life is used up, hand back a fresh one.
    if (shouldRefresh(payload)) {
      res.set(REFRESH_HEADER, sign({ id: user.id, role: user.role, email: user.email, phone: user.phone, permissions: user.permissions }));
    }
    next();
  } catch (err) {
    next(err);
  }
};

const authenticateOptional = async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const user = await loadUser(verify(token));
      if (user && !user.reason) req.user = user;
    } catch {}
  }
  next();
};

module.exports = { authenticate, authenticateOptional };
