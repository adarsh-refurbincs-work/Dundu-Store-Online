const router = require('express').Router();
const ctrl = require('../../controllers/customer/user/user.controller');
const wishlistCtrl = require('../../controllers/customer/user/wishlist.controller');
const { authenticate } = require('../../middleware/auth/auth.middleware');
const ah = require('../../utils/asyncHandler');

router.use(authenticate);

router.get('/profile', ah(ctrl.getProfile));
router.put('/profile', ah(ctrl.updateProfile));
router.post('/change-password', ah(ctrl.changePassword));

router.get('/addresses', ah(ctrl.getAddresses));
router.post('/addresses', ah(ctrl.addAddress));
router.put('/addresses/:id', ah(ctrl.updateAddress));
router.delete('/addresses/:id', ah(ctrl.deleteAddress));

// Wishlist Endpoints
router.get('/wishlist', ah(wishlistCtrl.getWishlist));
router.get('/wishlist/groups', ah(wishlistCtrl.getWishlistGroups));
router.post('/wishlist/groups', ah(wishlistCtrl.createWishlistGroup));
router.put('/wishlist/groups', ah(wishlistCtrl.renameWishlistGroup));
router.delete('/wishlist/groups/:name', ah(wishlistCtrl.deleteWishlistGroup));
router.put('/wishlist/item-group', ah(wishlistCtrl.setWishlistItemGroup));
router.post('/wishlist', ah(wishlistCtrl.toggleWishlist));
router.post('/wishlist/toggle', ah(wishlistCtrl.toggleWishlist));
router.delete('/wishlist/:product_id', ah(wishlistCtrl.toggleWishlist));

router.get('/notifications', ah(ctrl.getNotifications));
router.put('/notifications/read', ah(ctrl.markNotificationsRead));

module.exports = router;
