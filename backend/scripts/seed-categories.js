require('dotenv').config();
const { seedAllCategories } = require('../src/database/seedCategories');

(async () => {
  console.log('Seeding categories (Women, Maternity, Kids, Gen Z)...');
  const results = await seedAllCategories();

  for (const [key, cat] of Object.entries(results)) {
    console.log(`✓ ${cat.name} (ID: ${cat.id}):`);
    console.log(`    - Sub-Categories: ${cat.counts.sub_categories}`);
    console.log(`    - Types:          ${cat.counts.types}`);
    console.log(`    - Materials:      ${cat.counts.materials}`);
    console.log(`    - Patterns:       ${cat.counts.patterns}`);
  }

  process.exit(0);
})().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
