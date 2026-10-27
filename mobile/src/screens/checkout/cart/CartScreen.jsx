import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useCartStore, { MAX_CART_QTY } from '../../../store/cart.store';
import useAuthStore from '../../../store/auth.store';
import { COLORS, UPLOADS_URL } from '../../../config';
import AppHeader from '../../../components/ui/AppHeader';
import { formatPrice } from '../../../utils/format';
import useRequireAuth from '../../../hooks/useRequireAuth';
import { useTranslation } from '../../../store/language.store';

function getImageUri(imageStr) {
  if (!imageStr) return null;
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) return imageStr;
  return UPLOADS_URL + (imageStr.startsWith('/') ? imageStr : '/' + imageStr);
}

export default function CartScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    items, total, count, fetchCart, updateItem, removeItem,
    deliveryCharge, freeDeliveryThreshold, fetchShippingSettings,
  } = useCartStore();
  const FREE_SHIPPING_THRESHOLD = freeDeliveryThreshold;
  const { isAuthenticated } = useAuthStore();
  const { requireAuth } = useRequireAuth();
  const [actionLoading, setActionLoading] = React.useState({});
  const [itemToRemove, setItemToRemove] = React.useState(null);
  const [isRemoving, setIsRemoving] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) fetchCart();
      fetchShippingSettings();
    }, [isAuthenticated])
  );

  async function handleUpdateQty(item, newQty) {
    if (newQty < 1) {
      setItemToRemove(item);
      return;
    }
    if (newQty > MAX_CART_QTY) {
      Alert.alert('Limit reached', `You can add up to ${MAX_CART_QTY} of an item.`);
      return;
    }
    setActionLoading((prev) => ({ ...prev, [item.id]: true }));
    try {
      await updateItem(item.id, newQty);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to update quantity.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [item.id]: false }));
    }
  }

  async function confirmRemoveItem() {
    if (!itemToRemove) return;
    setIsRemoving(true);
    setActionLoading((prev) => ({ ...prev, [itemToRemove.id]: true }));
    try {
      await removeItem(itemToRemove.id);
      setItemToRemove(null);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to remove item.');
    } finally {
      setIsRemoving(false);
      setActionLoading((prev) => ({ ...prev, [itemToRemove.id]: false }));
    }
  }

  // Estimate only — final shipping is computed by the server after discounts.
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : deliveryCharge;
  const finalTotal = total + shipping;

  function renderItem({ item }) {
    const isLoading = actionLoading[item.id];
    const atMax = parseInt(item.quantity, 10) >= MAX_CART_QTY;
    const isCombo = !!item.combo_id;

    // ── Combo item rendering ─────────────────────────────────────────────────
    if (isCombo) {
      const comboImageUri = getImageUri(item.combo_image);
      const comboName = item.combo_name || 'Combo';
      const comboPrice = Number(item.combo_offer_price) > 0 ? Number(item.combo_offer_price) : Number(item.combo_price) || 0;
      const selections = (() => {
        try {
          return typeof item.combo_selections === 'string'
            ? JSON.parse(item.combo_selections)
            : (item.combo_selections || []);
        } catch { return []; }
      })();

      return (
        <View style={[styles.cartItem, styles.comboCartItem]}>
          <View style={styles.cartItemTapArea}>
            <View style={styles.cartItemImageContainer}>
              {comboImageUri
                ? <Image source={{ uri: comboImageUri }} style={styles.cartItemImage} resizeMode="cover" />
                : <View style={styles.cartItemImagePlaceholder}><Text style={styles.cartItemImagePlaceholderText}>🎀</Text></View>
              }
              <View style={styles.comboBadgeOverlay}>
                <Text style={styles.comboBadgeOverlayText}>COMBO</Text>
              </View>
            </View>

            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName} numberOfLines={2}>{comboName}</Text>
              {/* Slot selections summary */}
              {selections.slice(0, 3).map((sel, si) => (
                <Text key={si} style={styles.cartItemMeta} numberOfLines={1}>
                  {sel.slot_label}: {
                    [sel.color, sel.size].filter(Boolean).join(' · ') || '✓ Auto'
                  }
                </Text>
              ))}
              <Text style={styles.cartItemPrice}>{formatPrice(comboPrice)}</Text>
            </View>
          </View>

          <View style={styles.cartItemControls}>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyButton} onPress={() => handleUpdateQty(item, parseInt(item.quantity, 10) - 1)} disabled={isLoading}>
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              {isLoading
                ? <ActivityIndicator size="small" color={COLORS.primary} style={styles.qtyLoading} />
                : <Text style={styles.qtyText}>{item.quantity}</Text>
              }
              <TouchableOpacity style={[styles.qtyButton, atMax && { opacity: 0.4 }]} onPress={() => handleUpdateQty(item, parseInt(item.quantity, 10) + 1)} disabled={isLoading || atMax}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cartItemActions}>
              <TouchableOpacity style={styles.buyNowBtn} onPress={() => navigation.navigate('Checkout')}>
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setItemToRemove(item)}
                disabled={isLoading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <View style={styles.removeIconCircle}>
                  <Ionicons name="trash-outline" size={17} color="#EF4444" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // ── Regular product item rendering ───────────────────────────────────────
    const imageUri = getImageUri(item.image || item.product_image);
    const name = item.product_name || item.name || 'Product';
    const price = Number(item.offer_price) > 0 ? Number(item.offer_price) : Number(item.price) || 0;

    return (
      <View style={styles.cartItem}>
        {/* Tapping image or name → Product Detail */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id || item.id })}
          style={styles.cartItemTapArea}
        >
          <View style={styles.cartItemImageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.cartItemImage} resizeMode="cover" />
            ) : (
              <View style={styles.cartItemImagePlaceholder}>
                <Text style={styles.cartItemImagePlaceholderText}>👗</Text>
              </View>
            )}
          </View>

          <View style={styles.cartItemInfo}>
            <Text style={styles.cartItemName} numberOfLines={2}>{name}</Text>
            {item.size && <Text style={styles.cartItemMeta}>Size: {item.size}</Text>}
            {item.color && <Text style={styles.cartItemMeta}>Color: {item.color}</Text>}
            <Text style={styles.cartItemPrice}>{formatPrice(price)}</Text>
          </View>
        </TouchableOpacity>

        {/* Controls — outside tap area */}
        <View style={styles.cartItemControls}>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleUpdateQty(item, parseInt(item.quantity, 10) - 1)}
              disabled={isLoading}
            >
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>

            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.qtyLoading} />
            ) : (
              <Text style={styles.qtyText}>{item.quantity}</Text>
            )}

            <TouchableOpacity
              style={[styles.qtyButton, atMax && { opacity: 0.4 }]}
              onPress={() => handleUpdateQty(item, parseInt(item.quantity, 10) + 1)}
              disabled={isLoading || atMax}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cartItemActions}>
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.buyNowText}>{t('buyNow', 'Buy Now')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setItemToRemove(item)}
              disabled={isLoading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <View style={styles.removeIconCircle}>
                <Ionicons name="trash-outline" size={17} color="#EF4444" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const removeImgUri = itemToRemove
    ? getImageUri(itemToRemove.combo_image || itemToRemove.image || itemToRemove.product_image)
    : null;
  const removeName = itemToRemove
    ? (itemToRemove.combo_name || itemToRemove.product_name || itemToRemove.name || 'Item')
    : '';
  const removePrice = itemToRemove
    ? (Number(itemToRemove.combo_offer_price || itemToRemove.offer_price) > 0
        ? Number(itemToRemove.combo_offer_price || itemToRemove.offer_price)
        : Number(itemToRemove.combo_price || itemToRemove.price) || 0)
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <AppHeader logo rightComponent={
        count > 0 ? (
          <View style={styles.cartBadgeWrap}>
            <Text style={styles.cartBadgeIcon}>🛍</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{count > 99 ? '99+' : count}</Text>
            </View>
          </View>
        ) : null
      } />

      {/* Guest state */}
      {!isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔐</Text>
          <Text style={styles.emptyTitle}>{t('emptyCartTitle', 'Your cart is waiting')}</Text>
          <Text style={styles.emptySubtitle}>{t('cartGuestSubtitle', 'Sign in to view your saved items and checkout')}</Text>
          <TouchableOpacity style={styles.shopNowButton} onPress={() => requireAuth(() => {}, 'Login to view your cart')}>
            <Text style={styles.shopNowText}>{t('login', 'Sign In / Register')}</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>{t('emptyCartTitle', 'Your cart is empty')}</Text>
          <Text style={styles.emptySubtitle}>{t('emptyCartSub', 'Add some products to get started')}</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopNowText}>{t('startShopping', 'Shop Now')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cartContent}>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('subtotal', 'Subtotal')}</Text>
              <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('deliveryFee', 'Shipping')}</Text>
              <Text style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
                {shipping === 0 ? t('freeDelivery', 'FREE') : formatPrice(shipping)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t('totalAmount', 'Total')}</Text>
              <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutButtonText}>{t('checkout', 'Proceed to Checkout')} →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Professional Remove Confirmation Modal ── */}
      <Modal
        visible={!!itemToRemove}
        transparent
        animationType="fade"
        onRequestClose={() => { if (!isRemoving) setItemToRemove(null); }}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => { if (!isRemoving) setItemToRemove(null); }}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="trash-outline" size={26} color="#EF4444" />
            </View>

            <Text style={styles.modalTitle}>{t('removeItem', 'Remove from Bag?')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('removeConfirmSub', 'Are you sure you want to remove this item from your shopping bag?')}
            </Text>

            {itemToRemove && (
              <View style={styles.modalItemPreview}>
                <View style={styles.modalItemThumb}>
                  {removeImgUri ? (
                    <Image source={{ uri: removeImgUri }} style={styles.modalItemImg} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 20 }}>{itemToRemove.combo_id ? '🎀' : '👗'}</Text>
                  )}
                </View>
                <View style={styles.modalItemInfo}>
                  <Text style={styles.modalItemName} numberOfLines={2}>{removeName}</Text>
                  {(itemToRemove.size || itemToRemove.color) && (
                    <Text style={styles.modalItemMeta} numberOfLines={1}>
                      {[itemToRemove.size, itemToRemove.color].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                  <Text style={styles.modalItemPrice}>{formatPrice(removePrice)}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setItemToRemove(null)}
                disabled={isRemoving}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>{t('cancel', 'Cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalRemoveBtn, isRemoving && { opacity: 0.7 }]}
                onPress={confirmRemoveItem}
                disabled={isRemoving}
                activeOpacity={0.8}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalRemoveText}>{t('remove', 'Remove')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cartBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    position: 'relative',
  },
  cartBadgeIcon: { fontSize: 22 },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  shopNowText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
  },
  cartItem: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  comboCartItem: {
    borderWidth: 1.5,
    borderColor: '#f0b8d8',
    backgroundColor: '#fff8fc',
  },
  comboBadgeOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 2, alignItems: 'center',
  },
  comboBadgeOverlayText: {
    color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1,
  },
  cartItemTapArea: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartItemImageContainer: {
    width: 80,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  cartItemImage: {
    width: '100%',
    height: '100%',
  },
  cartItemImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  cartItemImagePlaceholderText: {
    fontSize: 24,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
    lineHeight: 19,
  },
  cartItemMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  qtyLoading: {
    minWidth: 30,
  },
  buyNowBtn: {
    marginTop: 8,
    backgroundColor: '#FF69B4',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  removeButton: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartContent: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
    // Lift shadow above list
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  freeShipping: {
    color: COLORS.success,
  },
  freeShippingHint: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 4,
    marginTop: 2,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 6,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Professional Remove Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalItemPreview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  modalItemThumb: {
    width: 48,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemImg: {
    width: '100%',
    height: '100%',
  },
  modalItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  modalItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 17,
  },
  modalItemMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  modalRemoveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalRemoveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
