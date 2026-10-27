const db = require('../../../config/db');
const { ok, badRequest } = require('../../../utils/response');

const getWishlist = async (req, res) => {
  const group = req.query?.group;
  let query = `
    SELECT w.id,
           COALESCE(w.group_name, 'General') AS group_name,
           p.id AS product_id,
           p.id,
           p.name,
           p.price,
           p.offer_price,
           (SELECT url FROM product_images WHERE product_id=p.id AND is_primary=true LIMIT 1) AS image,
           true AS is_wishlisted,
           w.created_at
    FROM wishlists w
    JOIN products p ON w.product_id=p.id
    WHERE w.user_id=$1
  `;
  const params = [req.user.id];

  if (group && group !== 'All') {
    params.push(group);
    query += ` AND COALESCE(w.group_name, 'General') = $2`;
  }

  query += ` ORDER BY w.created_at DESC`;

  const { rows } = await db.query(query, params);
  ok(res, { wishlist: rows, products: rows });
};

const getWishlistGroups = async (req, res) => {
  // Aggregate distinct groups from wishlist_groups table and existing wishlists items
  const { rows } = await db.query(
    `SELECT g.name,
            COUNT(w.id)::int AS count
     FROM (
       SELECT name, created_at FROM wishlist_groups WHERE user_id=$1
       UNION
       SELECT DISTINCT COALESCE(group_name, 'General') AS name, now() AS created_at
       FROM wishlists WHERE user_id=$1
     ) g
     LEFT JOIN wishlists w ON w.user_id=$1 AND COALESCE(w.group_name, 'General') = g.name
     GROUP BY g.name
     ORDER BY CASE WHEN g.name = 'General' THEN 0 ELSE 1 END, g.name ASC`,
    [req.user.id]
  );

  // If user has no groups at all yet, provide General with 0 count
  if (rows.length === 0) {
    rows.push({ name: 'General', count: 0 });
  }

  ok(res, { groups: rows });
};

const createWishlistGroup = async (req, res) => {
  const name = (req.body?.name || '').trim();
  if (!name) {
    return badRequest(res, 'Group name is required');
  }
  if (name.toLowerCase() === 'all') {
    return badRequest(res, '"All" is a reserved group name');
  }
  if (name.length > 50) {
    return badRequest(res, 'Group name cannot exceed 50 characters');
  }

  const { rows } = await db.query(
    `INSERT INTO wishlist_groups (user_id, name)
     VALUES ($1, $2)
     ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name, created_at`,
    [req.user.id, name]
  );

  ok(res, { group: rows[0], message: `Group "${name}" created successfully` });
};

const renameWishlistGroup = async (req, res) => {
  const oldName = (req.body?.old_name || '').trim();
  const newName = (req.body?.new_name || '').trim();

  if (!oldName || !newName) {
    return badRequest(res, 'Both old and new group names are required');
  }
  if (newName.toLowerCase() === 'all') {
    return badRequest(res, '"All" is a reserved group name');
  }
  if (newName.length > 50) {
    return badRequest(res, 'Group name cannot exceed 50 characters');
  }

  await db.query(
    `UPDATE wishlist_groups SET name=$1 WHERE user_id=$2 AND name=$3`,
    [newName, req.user.id, oldName]
  );
  await db.query(
    `UPDATE wishlists SET group_name=$1 WHERE user_id=$2 AND group_name=$3`,
    [newName, req.user.id, oldName]
  );

  ok(res, { message: `Group renamed to "${newName}"` });
};

const deleteWishlistGroup = async (req, res) => {
  const name = decodeURIComponent(req.params?.name || '').trim();
  if (!name || name.toLowerCase() === 'general' || name.toLowerCase() === 'all') {
    return badRequest(res, 'Cannot delete this group');
  }

  await db.query(
    `DELETE FROM wishlist_groups WHERE user_id=$1 AND name=$2`,
    [req.user.id, name]
  );
  // Reassign all items from deleted group to General
  await db.query(
    `UPDATE wishlists SET group_name='General' WHERE user_id=$1 AND group_name=$2`,
    [req.user.id, name]
  );

  ok(res, { message: `Group "${name}" deleted; items moved to General` });
};

const setWishlistItemGroup = async (req, res) => {
  const productId = req.body?.product_id || req.body?.productId;
  const groupName = (req.body?.group_name || 'General').trim();

  if (!productId) {
    return badRequest(res, 'Product ID is required');
  }

  // Ensure custom group exists in wishlist_groups if not 'General'
  if (groupName && groupName.toLowerCase() !== 'general' && groupName.toLowerCase() !== 'all') {
    await db.query(
      `INSERT INTO wishlist_groups (user_id, name)
       VALUES ($1, $2)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [req.user.id, groupName]
    );
  }

  await db.query(
    `UPDATE wishlists SET group_name=$1 WHERE user_id=$2 AND product_id=$3`,
    [groupName, req.user.id, productId]
  );

  ok(res, { message: `Moved to group "${groupName}"` });
};

const toggleWishlist = async (req, res) => {
  const productId = req.body?.product_id || req.body?.productId || req.params?.product_id;
  const groupName = (req.body?.group_name || 'General').trim();

  if (!productId) {
    return badRequest(res, 'Product ID is required');
  }

  const { rows } = await db.query(
    'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
    [req.user.id, productId]
  );

  if (rows.length > 0) {
    await db.query('DELETE FROM wishlists WHERE id = $1', [rows[0].id]);
    ok(res, { wishlisted: false, is_wishlisted: false, message: 'Removed from wishlist' });
  } else {
    // If saving into a custom group, ensure group exists in wishlist_groups
    if (groupName && groupName.toLowerCase() !== 'general' && groupName.toLowerCase() !== 'all') {
      await db.query(
        `INSERT INTO wishlist_groups (user_id, name)
         VALUES ($1, $2)
         ON CONFLICT (user_id, name) DO NOTHING`,
        [req.user.id, groupName]
      );
    }

    await db.query(
      `INSERT INTO wishlists (user_id, product_id, group_name) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET group_name = EXCLUDED.group_name`,
      [req.user.id, productId, groupName]
    );
    ok(res, { wishlisted: true, is_wishlisted: true, message: 'Added to wishlist' });
  }
};

module.exports = {
  getWishlist,
  getWishlistGroups,
  createWishlistGroup,
  renameWishlistGroup,
  deleteWishlistGroup,
  setWishlistItemGroup,
  toggleWishlist,
};
