const router = require('express').Router();
const db = require('../../config/db');
const { ok } = require('../../utils/response');
const ah = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth/auth.middleware');

router.get('/check', ah(async (req, res) => {
  const phone = (req.query.phone || '').replace(/\D/g, '');
  if (phone.length < 10) return res.status(400).json({ message: 'Valid phone number required' });
  const { rows } = await db.query(
    'SELECT id, phone, name, points, total_spent, created_at, updated_at FROM loyalty_cards WHERE phone=$1',
    [phone]
  );
  ok(res, { card: rows[0] || null });
}));

router.get('/my-card', authenticate, ah(async (req, res) => {
  // req.user is already loaded by the auth middleware; cards are keyed by phone
  // (the billing counter looks them up by number).
  const phone = (req.user.phone || '').replace(/\D/g, '');
  if (!phone) return ok(res, { card: null, needs_phone: true });

  // One round trip: issue the card on first open (so name / balance / member-since
  // are always populated), back-fill a missing name, and return the row.
  const { rows } = await db.query(
    `INSERT INTO loyalty_cards (phone, name, points, total_spent)
     VALUES ($1, $2, 0, 0)
     ON CONFLICT (phone) DO UPDATE SET name = COALESCE(loyalty_cards.name, EXCLUDED.name)
     RETURNING id, phone, name, points, total_spent, created_at, updated_at`,
    [phone, req.user.name || null]
  );
  ok(res, { card: rows[0] || null, needs_phone: false });
}));

module.exports = router;
