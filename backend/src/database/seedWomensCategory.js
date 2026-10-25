const { seedAllCategories, seedWomensCategory, CATEGORIES_SEED } = require('./seedCategories');

module.exports = {
  seedWomensCategory,
  seedAllCategories,
  WOMENS_SEED: CATEGORIES_SEED.women,
};
