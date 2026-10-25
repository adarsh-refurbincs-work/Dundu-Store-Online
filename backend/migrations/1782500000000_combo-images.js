// Combos get a multi-image gallery. `combos.image_url` stays the cover (= first gallery image).
exports.up = (pgm) => {
  pgm.createTable('combo_images', {
    id:         { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    combo_id:   { type: 'uuid', notNull: true, references: 'combos', onDelete: 'CASCADE' },
    url:        { type: 'text', notNull: true },
    sort_order: { type: 'integer', default: 0 },
    created_at: { type: 'timestamptz', default: pgm.func('now()') },
  });
  pgm.createIndex('combo_images', 'combo_id');
  // Backfill: existing covers become the first gallery image
  pgm.sql("INSERT INTO combo_images (combo_id, url, sort_order) SELECT id, image_url, 0 FROM combos WHERE image_url IS NOT NULL AND image_url <> ''");
};

exports.down = (pgm) => {
  pgm.dropTable('combo_images');
};
