const router = require('express').Router();
const { notTrashed } = require('../../../services/trash/trash.service');
const upload = require('../../../utils/upload');
const ah = require('../../../utils/asyncHandler');
const combo = require('../../../controllers/admin/catalog/combo.controller');

// Strip icon + theme for the Combos entry (must be registered before the `/:id` guard below)
router.get('/appearance', ah(combo.getAppearance));
router.put('/appearance', upload.any(), ah(combo.updateAppearance)); // fields: icon, bg_image

// Records sitting in Trash cannot be read, edited or toggled here (restore them first).
router.use('/:id', (req, res, next) => (req.method === 'DELETE' ? next() : notTrashed('combos')(req, res, next)));

router.get('/',       ah(combo.list));
router.get('/:id',    ah(combo.getOne));
router.post('/',      upload.single('image'), ah(combo.create));
router.put('/:id',    upload.single('image'), ah(combo.update));
router.patch('/:id/toggle', ah(combo.toggle));
router.delete('/:id', ah(combo.remove));

module.exports = router;
