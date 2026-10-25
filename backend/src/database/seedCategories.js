const dbClient = require('../config/db');

const CATEGORIES_SEED = {
  women: {
    name: 'Women',
    slug: 'women',
    sort_order: 1,
    image_url: '/uploads/5b3c6994-c385-4bc6-9bcc-919cbad68af3.jpg',
    theme_enabled: false,
    theme_color: null,
    theme_bg_color: null,
    matches: ["LOWER(slug) = 'women'", "LOWER(name) = 'women'", "LOWER(name) LIKE '%women%'"],
    sub_categories: [
      'Daily Wear',
      'Office Wear',
      'Nightwear',
      'Casual Wear',
    ].map((name) => ({ name, is_active: true })),
    types: [
      'Churidar',
      'Kurti',
      'Short Kurti',
      'Top',
      'T-shirt',
      'Shirt',
      'Salwar Kameez',
      'Anarkali Suit',
      'Pant',
      'Leggings',
      'Jeggings',
      'Jeans',
      'Trousers',
      'Skirt',
      'Long Skirt',
      'Maxi Dress',
      'Midi Dress',
      'Short Dress',
      'Gown',
      'Jumpsuit',
      'Playsuit',
      'Saree',
      'Set Mundu',
      'Kerala Saree',
      'Pavada and Blouse',
      'Nightdress',
      'Nighty',
      'Night Suit',
    ].map((name) => ({ name, is_active: true, options: [] })),
    materials: [
      'Cotton',
      'Linen',
      'Silk',
      'Cotton Silk',
      'Chiffon',
      'Georgette',
      'Crepe',
      'Rayon',
      'Viscose',
      'Modal',
      'Polyester',
      'Satin',
      'Velvet',
      'Wool',
      'Denim',
      'Knit',
      'Lace',
      'Net',
      'Organza',
      'Chanderi',
      'Khadi',
      'Ikat',
      'Handloom Cotton',
      'Kasavu Fabric',
      'Bamboo Fabric',
    ].map((name) => ({ name, is_active: true })),
    patterns: [
      'Solid',
      'Floral',
      'Striped',
      'Checks',
      'Polka Dot',
      'Paisley',
      'Geometric',
      'Abstract',
      'Animal Print',
      'Leaf Print',
      'Block Print',
      'Batik',
      'Ikat',
      'Kalamkari',
      'Bandhani',
      'Tie-Dye',
      'Embroidered',
      'Printed',
      'Woven',
      'Jacquard',
      'Lace',
      'Brocade',
      'Kasavu Border',
      'Temple Border',
    ].map((name) => ({ name, is_active: true })),
  },

  maternity: {
    name: 'Maternity',
    slug: 'maternity',
    sort_order: 2,
    image_url: '/uploads/64eedee7-77da-4b81-9bf5-f5e60b593cb8.jpg',
    theme_enabled: false,
    theme_color: null,
    theme_bg_color: null,
    matches: ["LOWER(slug) = 'maternity'", "LOWER(name) = 'maternity'", "LOWER(name) LIKE '%maternity%'"],
    sub_categories: [
      'Daily Wear',
      'Nightwear',
      'Office Wear',
      'Hospital Wear',
    ].map((name) => ({ name, is_active: true })),
    types: [
      'Maternity T-shirt',
      'Maternity Tunic',
      'Maternity Kurti',
      'Maternity Gown',
      'Wrap Dress',
      'Feeding Dress',
      'Nursing Top',
      'Maternity Palazzo',
      'Over-the-Bump Leggings',
      'Maternity Nightdress',
      'Nursing Bra',
    ].map((name) => ({ name, is_active: true, options: [] })),
    materials: [
      'Cotton',
      'Organic Cotton',
      'Cotton Jersey',
      'Modal',
      'Viscose',
      'Rayon',
      'Linen',
      'Bamboo Fabric',
      'Cotton-Spandex Blend',
      'Modal-Spandex Blend',
      'Soft Knit',
      'Muslin',
    ].map((name) => ({ name, is_active: true })),
    patterns: [
      'Solid',
      'Floral',
      'Striped',
      'Polka Dot',
      'Geometric',
      'Abstract',
      'Paisley',
      'Leaf Print',
      'Animal Print',
      'Checks',
      'Color Block',
      'Embroidered',
      'Printed',
      'Tie-Dye',
    ].map((name) => ({ name, is_active: true })),
  },

  kids: {
    name: 'Kids',
    slug: 'kids',
    sort_order: 3,
    image_url: '/uploads/e507f92b-6486-4e37-aea0-7df459740f94.jpg',
    theme_enabled: false,
    theme_color: null,
    theme_bg_color: null,
    matches: ["LOWER(slug) = 'kids'", "LOWER(name) = 'kids'", "LOWER(name) LIKE '%kids%'"],
    sub_categories: [
      'Daily Wear',
      'Party Wear',
      'Nightwear',
      'School Wear',
      'Ethnic Wear',
      'Sportswear',
      'Winter Wear',
    ].map((name) => ({ name, is_active: true })),
    types: [
      'T-shirt',
      'Shirt',
      'Top',
      'Frock',
      'Dress',
      'Kurta',
      'Ethnic Set',
      'Shorts',
      'Pants',
      'Jeans',
      'Leggings',
      'Skirt',
      'Romper',
      'Jumpsuit',
      'Pajama Set',
      'Nightdress',
      'Sweater',
      'Jacket',
      'School Uniform',
    ].map((name) => ({ name, is_active: true, options: [] })),
    materials: [
      'Cotton',
      'Organic Cotton',
      'Cotton Jersey',
      'Muslin',
      'Linen',
      'Denim',
      'Knit Fabric',
      'Fleece',
      'Rayon',
      'Viscose',
      'Polyester',
      'Cotton Blend',
    ].map((name) => ({ name, is_active: true })),
    patterns: [
      'Solid',
      'Floral',
      'Striped',
      'Checks',
      'Polka Dot',
      'Animal Print',
      'Cartoon Print',
      'Geometric',
      'Dinosaur Print',
      'Vehicle Print',
      'Stars',
      'Hearts',
      'Plaid',
      'Embroidered',
      'Printed',
    ].map((name) => ({ name, is_active: true })),
  },

  genz: {
    name: 'Genz',
    slug: 'genz',
    sort_order: 4,
    image_url: '/uploads/4b7738c6-fb11-4b49-8cb8-27b6b553c39d.jpg',
    theme_enabled: true,
    theme_color: '#22c55e',
    theme_bg_color: '#040d04',
    matches: [
      "LOWER(slug) = 'genz'",
      "LOWER(slug) = 'gen-z'",
      "LOWER(name) = 'genz'",
      "LOWER(name) = 'gen z'",
      "LOWER(name) LIKE '%gen%z%'",
    ],
    sub_categories: [
      'Daily Wear',
      'College Wear',
      'Streetwear',
      'Party Wear',
      'Casual Wear',
      'Nightwear',
      'Sportswear',
      'Festive Wear',
    ].map((name) => ({ name, is_active: true })),
    types: [
      'Oversized T-shirt',
      'Crop Top',
      'Graphic Tee',
      'Hoodie',
      'Sweatshirt',
      'Shirt',
      'Tank Top',
      'Kurti',
      'Short Kurti',
      'Jeans',
      'Cargo Pants',
      'Wide-Leg Pants',
      'Joggers',
      'Shorts',
      'Skirt',
      'Co-ord Set',
      'Mini Dress',
      'Jumpsuit',
    ].map((name) => ({ name, is_active: true, options: [] })),
    materials: [
      'Cotton',
      'Organic Cotton',
      'Cotton Jersey',
      'Denim',
      'Linen',
      'Rayon',
      'Viscose',
      'Modal',
      'Polyester',
      'Fleece',
      'Knit Fabric',
      'Cotton-Spandex Blend',
    ].map((name) => ({ name, is_active: true })),
    patterns: [
      'Solid',
      'Graphic Print',
      'Slogan Print',
      'Floral',
      'Striped',
      'Checks',
      'Plaid',
      'Tie-Dye',
      'Color Block',
      'Abstract',
      'Geometric',
      'Animal Print',
      'Camouflage',
      'Polka Dot',
      'Denim Wash',
    ].map((name) => ({ name, is_active: true })),
  },
};

/**
 * Seeds or updates Women, Maternity, Kids, and Gen Z categories
 * with Sub-Categories, Types, Materials, and Patterns.
 * Also synchronizes the global product_materials table.
 */
async function seedAllCategories(db = dbClient) {
  const results = {};
  const allMaterials = new Set();

  for (const [key, cfg] of Object.entries(CATEGORIES_SEED)) {
    const subCatsJson = JSON.stringify(cfg.sub_categories);
    const typesJson = JSON.stringify(cfg.types);
    const materialsJson = JSON.stringify(cfg.materials);
    const patternsJson = JSON.stringify(cfg.patterns);

    // Collect all unique material names
    cfg.materials.forEach((m) => allMaterials.add(m.name));

    // Find category by matches
    const whereClause = cfg.matches.join(' OR ');
    const { rows } = await db.query(
      `SELECT id, name FROM categories WHERE ${whereClause} ORDER BY sort_order ASC LIMIT 1`
    );

    let categoryId;
    if (rows.length > 0) {
      categoryId = rows[0].id;
      await db.query(
        `UPDATE categories
         SET name = COALESCE(NULLIF(name, ''), $1),
             slug = COALESCE(NULLIF(slug, ''), $2),
             sort_order = $3,
             image_url = COALESCE(categories.image_url, $4),
             theme_enabled = COALESCE(categories.theme_enabled, $5),
             theme_color = COALESCE(categories.theme_color, $6),
             theme_bg_color = COALESCE(categories.theme_bg_color, $7),
             is_active = true,
             sub_categories = $8,
             types = $9,
             materials = $10,
             patterns = $11
         WHERE id = $12`,
        [
          cfg.name,
          cfg.slug,
          cfg.sort_order,
          cfg.image_url,
          cfg.theme_enabled || false,
          cfg.theme_color || null,
          cfg.theme_bg_color || null,
          subCatsJson,
          typesJson,
          materialsJson,
          patternsJson,
          categoryId,
        ]
      );
    } else {
      const insertRes = await db.query(
        `INSERT INTO categories (name, slug, sort_order, image_url, theme_enabled, theme_color, theme_bg_color, is_active, sub_categories, types, materials, patterns)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $10, $11)
         RETURNING id`,
        [
          cfg.name,
          cfg.slug,
          cfg.sort_order,
          cfg.image_url,
          cfg.theme_enabled || false,
          cfg.theme_color || null,
          cfg.theme_bg_color || null,
          subCatsJson,
          typesJson,
          materialsJson,
          patternsJson,
        ]
      );
      categoryId = insertRes.rows[0].id;
    }

    results[key] = {
      id: categoryId,
      name: cfg.name,
      counts: {
        sub_categories: cfg.sub_categories.length,
        types: cfg.types.length,
        materials: cfg.materials.length,
        patterns: cfg.patterns.length,
      },
    };
  }

  // Populate product_materials table
  let sortOrder = 1;
  for (const mat of allMaterials) {
    await db.query(
      `INSERT INTO product_materials (name, sort_order, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (name) DO NOTHING`,
      [mat, sortOrder++]
    ).catch(() => {});
  }

  return results;
}

// Backward-compatible wrapper
async function seedWomensCategory(db = dbClient) {
  const all = await seedAllCategories(db);
  return { categoryId: all.women.id, counts: all.women.counts };
}

module.exports = { seedAllCategories, seedWomensCategory, CATEGORIES_SEED };
