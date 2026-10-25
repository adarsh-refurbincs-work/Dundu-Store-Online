require('dotenv').config();
const { seedWomensCategory } = require('../src/database/seedWomensCategory');

(async () => {
  console.log('Seeding Women category sub-categories, types, materials, patterns...');
  const res = await seedWomensCategory();
  console.log(`✓ Women category successfully seeded (ID: ${res.categoryId}):`);
  console.log(`  - Sub-Categories: ${res.counts.sub_categories}`);
  console.log(`  - Types:          ${res.counts.types}`);
  console.log(`  - Materials:      ${res.counts.materials}`);
  console.log(`  - Patterns:       ${res.counts.patterns}`);
  process.exit(0);
})().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
