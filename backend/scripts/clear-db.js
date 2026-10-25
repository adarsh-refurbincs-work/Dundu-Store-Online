/**
 * clear-db.js
 * Wipes all rows from every table, resets sequences, then re-seeds the super admin.
 * Schema (tables, types, constraints, indexes) is untouched.
 * product_materials and settings are preserved.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const { seedAllCategories } = require('../src/database/seedCategories');

(async () => {
  console.log('Clearing all data...');

  // One TRUNCATE with CASCADE handles every FK dependency automatically.
  // Tables listed explicitly so settings and product_materials are intentionally skipped.
  await db.query(`
    TRUNCATE
      return_requests,
      order_items,
      orders,
      reviews,
      wishlists,
      cart,
      addresses,
      notifications,
      loyalty_cards,
      referral_rewards,
      coupons,
      banners,
      announcements,
      otps,
      product_images,
      product_variants,
      products,
      brands,
      categories,
      users
    RESTART IDENTITY CASCADE
  `);

  console.log('All tables cleared.');

  // Re-create the super admin so the panel is immediately usable.
  const hash = await bcrypt.hash('12345678', 10);
  await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Super Admin', 'superadmin@gmail.com', $1, 'super_admin')`,
    [hash]
  );

  console.log('Super admin ready:  superadmin@gmail.com  /  12345678');

  // Re-seed Women, Maternity, Kids, Gen Z categories with Sub-Categories, Types, Materials, and Patterns
  await seedAllCategories(db);
  console.log('Categories (Women, Maternity, Kids, Gen Z) seeded with Sub-Categories, Types, Materials, and Patterns.');

  process.exit(0);
})().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
