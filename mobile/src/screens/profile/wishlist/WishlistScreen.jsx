import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { userApi } from '../../../api/index';
import { COLORS } from '../../../config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WISHLIST_RED } from '../../../components/ui/WishlistHeart';
import ProductCard from '../../../components/product/ProductCard';
import AppHeader from '../../../components/ui/AppHeader';
import useAuthStore from '../../../store/auth.store';
import useLoginPromptStore from '../../../store/loginPrompt.store';

const CARD_WIDTH = (Dimensions.get('window').width - 32) / 2;

export default function WishlistScreen() {
  const navigation = useNavigation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showPrompt = useLoginPromptStore((s) => s.show);

  const [wishlist, setWishlist] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [loading, setLoading] = useState(true);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [removing, setRemoving] = useState(false);

  // Group creation modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Group rename modal state
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameGroupName, setRenameGroupName] = useState('');
  const [renamingGroup, setRenamingGroup] = useState(false);

  // Move product to group modal state
  const [moveProduct, setMoveProduct] = useState(null);
  const [movingProduct, setMovingProduct] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showPrompt('Login to view and manage your wishlist');
      navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs', { screen: 'Home' });
      return;
    }
    fetchWishlistAndGroups();
  }, [isAuthenticated]);

  async function fetchWishlistAndGroups() {
    setLoading(true);
    try {
      const [wishlistRes, groupsRes] = await Promise.all([
        userApi.getWishlist(),
        userApi.getWishlistGroups().catch(() => ({ groups: [] })),
      ]);
      const items = wishlistRes.products || wishlistRes.wishlist || wishlistRes || [];
      setWishlist(items);
      const fetchedGroups = groupsRes?.groups || [];
      setGroups(fetchedGroups);
    } catch (err) {
      Alert.alert('Error', 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmRemove() {
    if (!confirmProduct) return;
    setRemoving(true);
    try {
      await userApi.toggleWishlist(confirmProduct.id);
      setWishlist((prev) => prev.filter((p) => (p.product_id || p.id) !== confirmProduct.id));
      setConfirmProduct(null);
    } catch {
      Alert.alert('Error', 'Could not remove from wishlist.');
    } finally {
      setRemoving(false);
    }
  }

  async function handleCreateGroup(targetProduct = null) {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Please enter a group name.');
      return;
    }
    if (trimmed.toLowerCase() === 'all') {
      Alert.alert('Reserved Name', '"All" is a reserved group name.');
      return;
    }
    setCreatingGroup(true);
    try {
      await userApi.createWishlistGroup(trimmed);
      setNewGroupName('');
      setCreateModalVisible(false);

      if (targetProduct) {
        await userApi.setWishlistItemGroup(targetProduct.id, trimmed);
        setWishlist((prev) =>
          prev.map((item) =>
            (item.product_id || item.id) === targetProduct.id ? { ...item, group_name: trimmed } : item
          )
        );
        setMoveProduct(null);
      }

      const res = await userApi.getWishlistGroups().catch(() => ({ groups: [] }));
      setGroups(res.groups || []);
      setSelectedGroup(trimmed);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to create group.');
    } finally {
      setCreatingGroup(false);
    }
  }

  async function handleRenameGroup() {
    const trimmed = renameGroupName.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Please enter a group name.');
      return;
    }
    if (trimmed.toLowerCase() === 'all') {
      Alert.alert('Reserved Name', '"All" is a reserved group name.');
      return;
    }
    if (trimmed === selectedGroup) {
      setRenameModalVisible(false);
      return;
    }
    setRenamingGroup(true);
    try {
      await userApi.renameWishlistGroup(selectedGroup, trimmed);
      setWishlist((prev) =>
        prev.map((item) =>
          (item.group_name || 'General') === selectedGroup ? { ...item, group_name: trimmed } : item
        )
      );
      const res = await userApi.getWishlistGroups().catch(() => ({ groups: [] }));
      setGroups(res.groups || []);
      setSelectedGroup(trimmed);
      setRenameModalVisible(false);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to rename group.');
    } finally {
      setRenamingGroup(false);
    }
  }

  function confirmDeleteGroup(groupNameToDelete) {
    Alert.alert(
      'Delete Group',
      `Delete "${groupNameToDelete}"? All saved items will be moved to General.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userApi.deleteWishlistGroup(groupNameToDelete);
              setWishlist((prev) =>
                prev.map((item) =>
                  (item.group_name || 'General') === groupNameToDelete ? { ...item, group_name: 'General' } : item
                )
              );
              const res = await userApi.getWishlistGroups().catch(() => ({ groups: [] }));
              setGroups(res.groups || []);
              setSelectedGroup('All');
            } catch (err) {
              Alert.alert('Error', err?.message || 'Failed to delete group.');
            }
          },
        },
      ]
    );
  }

  async function handleMoveProductToGroup(targetGroup) {
    if (!moveProduct) return;
    setMovingProduct(true);
    try {
      await userApi.setWishlistItemGroup(moveProduct.id, targetGroup);
      setWishlist((prev) =>
        prev.map((item) =>
          (item.product_id || item.id) === moveProduct.id ? { ...item, group_name: targetGroup } : item
        )
      );
      setMoveProduct(null);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Could not move item.');
    } finally {
      setMovingProduct(false);
    }
  }

  // Derived filtered items based on selected group
  const filteredWishlist = selectedGroup === 'All'
    ? wishlist
    : wishlist.filter((item) => (item.group_name || 'General').toLowerCase() === selectedGroup.toLowerCase());

  // Distinct list of groups for move picker
  const allGroupOptions = Array.from(new Set(['General', ...groups.map((g) => g.name).filter(Boolean)]));

  function renderProduct({ item }) {
    const product = { ...item, id: item.product_id || item.id, is_wishlisted: true };
    const groupName = item.group_name || 'General';

    return (
      <View style={styles.cardContainer}>
        <ProductCard
          product={product}
          style={styles.productCard}
          onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
          onWishlistRemove={(p) => setConfirmProduct(p)}
        />
        <TouchableOpacity
          style={styles.groupBadgeBtn}
          onPress={() => setMoveProduct(product)}
          activeOpacity={0.8}
        >
          <Ionicons name="folder-outline" size={13} color={COLORS.primary} />
          <Text style={styles.groupBadgeText} numberOfLines={1}>
            {groupName}
          </Text>
          <Ionicons name="swap-horizontal-outline" size={12} color="#888" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      {/* ── Remove confirmation popup ── */}
      <Modal visible={!!confirmProduct} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="trash-outline" size={26} color="#EF4444" />
            </View>
            <Text style={styles.confirmTitle}>Remove from Wishlist?</Text>
            <Text style={styles.confirmMsg} numberOfLines={2}>
              {confirmProduct?.name}
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setConfirmProduct(null)}
                disabled={removing}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmOkBtn}
                onPress={handleConfirmRemove}
                disabled={removing}
              >
                <Text style={styles.confirmOkText}>{removing ? 'Removing…' : 'Remove'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Create Wishlist Group Modal ── */}
      <Modal visible={createModalVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="folder-open-outline" size={22} color={COLORS.primary} />
              </View>
              <TouchableOpacity
                onPress={() => { setCreateModalVisible(false); setNewGroupName(''); }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Create Wishlist Group</Text>
            <Text style={styles.modalSub}>
              Give your group a custom name to organize your favorite styles (e.g. Summer Fits, Ethnic, Party Wear).
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Summer Vacation, Ethnic Wear"
              placeholderTextColor="#9CA3AF"
              value={newGroupName}
              onChangeText={setNewGroupName}
              maxLength={40}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setCreateModalVisible(false); setNewGroupName(''); }}
                disabled={creatingGroup}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, !newGroupName.trim() && styles.modalSubmitBtnDisabled]}
                onPress={() => handleCreateGroup(moveProduct)}
                disabled={creatingGroup || !newGroupName.trim()}
              >
                {creatingGroup ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Rename Wishlist Group Modal ── */}
      <Modal visible={renameModalVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
              </View>
              <TouchableOpacity onPress={() => setRenameModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Rename Group</Text>
            <Text style={styles.modalSub}>Enter a new name for "{selectedGroup}".</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Group name"
              placeholderTextColor="#9CA3AF"
              value={renameGroupName}
              onChangeText={setRenameGroupName}
              maxLength={40}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRenameModalVisible(false)}
                disabled={renamingGroup}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, !renameGroupName.trim() && styles.modalSubmitBtnDisabled]}
                onPress={handleRenameGroup}
                disabled={renamingGroup || !renameGroupName.trim()}
              >
                {renamingGroup ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Move Product to Group Sheet ── */}
      <Modal visible={!!moveProduct} transparent animationType="slide" statusBarTranslucent>
        <TouchableOpacity
          style={styles.bottomSheetBackdrop}
          activeOpacity={1}
          onPress={() => setMoveProduct(null)}
        >
          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="folder-outline" size={20} color={COLORS.primary} />
                <Text style={styles.sheetTitle}>Move to Wishlist Group</Text>
              </View>
              <TouchableOpacity onPress={() => setMoveProduct(null)} style={styles.sheetCloseBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSub} numberOfLines={1}>
              {moveProduct?.name}
            </Text>

            <ScrollView style={styles.groupPickerList} showsVerticalScrollIndicator={false}>
              {allGroupOptions.map((gName) => {
                const isCurrent = (moveProduct?.group_name || 'General').toLowerCase() === gName.toLowerCase();
                const count = wishlist.filter((p) => (p.group_name || 'General').toLowerCase() === gName.toLowerCase()).length;
                return (
                  <TouchableOpacity
                    key={gName}
                    style={[styles.groupPickerItem, isCurrent && styles.groupPickerItemActive]}
                    onPress={() => handleMoveProductToGroup(gName)}
                    disabled={movingProduct}
                  >
                    <View style={styles.groupPickerLeft}>
                      <Ionicons
                        name={gName === 'General' ? 'bookmark-outline' : 'folder-outline'}
                        size={18}
                        color={isCurrent ? COLORS.primary : '#4B5563'}
                      />
                      <Text style={[styles.groupPickerName, isCurrent && styles.groupPickerNameActive]}>
                        {gName}
                      </Text>
                      <Text style={styles.groupPickerCount}>({count})</Text>
                    </View>
                    {isCurrent ? (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    ) : (
                      <Ionicons name="radio-button-off" size={18} color="#D1D5DB" />
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.pickerNewGroupBtn}
                onPress={() => setCreateModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.pickerNewGroupText}>Create New Group</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <AppHeader title="Wishlist" showBack showCart />

      {/* ── Wishlist Group Filter Tabs ── */}
      <View style={styles.filterStripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStripContent}
        >
          {/* All tab */}
          <TouchableOpacity
            style={[styles.groupChip, selectedGroup === 'All' && styles.groupChipActive]}
            onPress={() => setSelectedGroup('All')}
            activeOpacity={0.8}
          >
            <Text style={[styles.groupChipText, selectedGroup === 'All' && styles.groupChipTextActive]}>
              All ({wishlist.length})
            </Text>
          </TouchableOpacity>

          {/* User groups */}
          {allGroupOptions.map((gName) => {
            const count = wishlist.filter(
              (p) => (p.group_name || 'General').toLowerCase() === gName.toLowerCase()
            ).length;
            const active = selectedGroup.toLowerCase() === gName.toLowerCase();
            return (
              <TouchableOpacity
                key={gName}
                style={[styles.groupChip, active && styles.groupChipActive]}
                onPress={() => setSelectedGroup(gName)}
                activeOpacity={0.8}
              >
                <Text style={[styles.groupChipText, active && styles.groupChipTextActive]}>
                  {gName} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* + New Group button */}
          <TouchableOpacity
            style={styles.newGroupChip}
            onPress={() => {
              setNewGroupName('');
              setCreateModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={15} color={COLORS.primary} />
            <Text style={styles.newGroupChipText}>New Group</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Active Group Action Strip (if custom group selected) ── */}
      {selectedGroup !== 'All' && selectedGroup !== 'General' && (
        <View style={styles.groupActionHeader}>
          <View style={styles.groupInfoLeft}>
            <Ionicons name="folder" size={15} color={COLORS.primary} />
            <Text style={styles.groupTitleText} numberOfLines={1}>{selectedGroup}</Text>
            <Text style={styles.groupCountText}>
              ({filteredWishlist.length})
            </Text>
          </View>
          <View style={styles.groupActionBtns}>
            <TouchableOpacity
              style={styles.groupEditBtn}
              onPress={() => {
                setRenameGroupName(selectedGroup);
                setRenameModalVisible(true);
              }}
            >
              <Ionicons name="pencil-outline" size={13} color="#4B5563" />
              <Text style={styles.groupEditBtnText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.groupDeleteBtn}
              onPress={() => confirmDeleteGroup(selectedGroup)}
            >
              <Ionicons name="trash-outline" size={13} color="#EF4444" />
              <Text style={styles.groupDeleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={WISHLIST_RED} style={styles.emptyIconSpacing} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any product to save it here
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : filteredWishlist.length === 0 ? (
        <View style={styles.emptyGroupContainer}>
          <View style={styles.emptyGroupIconWrap}>
            <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No items in "{selectedGroup}"</Text>
          <Text style={styles.emptySubtitle}>
            Tap the folder tag below any product in "All" to organize it into this group.
          </Text>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => setSelectedGroup('All')}
          >
            <Text style={styles.viewAllBtnText}>View All Saved Items</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredWishlist}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchWishlistAndGroups}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Filter Strip ── */
  filterStripContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 10,
  },
  filterStripContent: {
    paddingHorizontal: 14,
    gap: 8,
    alignItems: 'center',
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  groupChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  groupChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  newGroupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFF1F8',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
  },
  newGroupChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* ── Group Action Bar ── */
  groupActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAF5FF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  groupInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  groupTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    maxWidth: 140,
  },
  groupCountText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  groupActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupEditBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  groupDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  groupDeleteBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },

  /* ── List Content ── */
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    paddingHorizontal: 6,
    justifyContent: 'flex-start',
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productCard: {
    width: '100%',
    flex: 0,
    margin: 0,
    borderWidth: 0,
  },
  groupBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 4,
  },
  groupBadgeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },

  /* ── Empty states ── */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  emptyGroupContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  emptyGroupIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconSpacing: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  viewAllBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  viewAllBtnText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
  },

  /* ── Modals & Sheets ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalSubmitBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnDisabled: {
    opacity: 0.45,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  /* ── Bottom Sheet (Move Item) ── */
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
  },
  sheetSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  groupPickerList: {
    maxHeight: 280,
  },
  groupPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupPickerItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FDF2F8',
  },
  groupPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  groupPickerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  groupPickerNameActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  groupPickerCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  pickerNewGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F9',
    marginTop: 6,
    marginBottom: 12,
  },
  pickerNewGroupText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* ── Remove confirmation ── */
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  confirmMsg: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  confirmOkBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmOkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
