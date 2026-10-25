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
  const { rows: userRows } = await db.query('SELECT phone, name FROM users WHERE id=$1', [req.user.id]);
  const phone = (userRows[0]?.phone || '').replace(/\D/g, '');
  // Cards are keyed by phone (the billing counter looks them up by number).
  if (!phone) return ok(res, { card: null, needs_phone: true });

  // Issue the card the first time the member opens it, instead of waiting for a
  // points-earning order — so name / balance / member-since are always populated.
  await db.query(
    `INSERT INTO loyalty_cards (phone, name, points, total_spent)
     VALUES ($1, $2, 0, 0) ON CONFLICT (phone) DO NOTHING`,
    [phone, userRows[0]?.name || null]
  );
  const { rows } = await db.query(
    'SELECT id, phone, name, points, total_spent, created_at, updated_at FROM loyalty_cards WHERE phone=$1',
    [phone]
  );
  const card = rows[0] || null;
  // Keep the printed name in step with the profile name when the card was created nameless.
  if (card && !card.name && userRows[0]?.name) {
    await db.query('UPDATE loyalty_cards SET name=$1 WHERE id=$2', [userRows[0].name, card.id]);
    card.name = userRows[0].name;
  }
  ok(res, { card, needs_phone: false });
}));

module.exports = router;
