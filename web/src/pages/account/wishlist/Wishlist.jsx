import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Trash2, Heart, ShoppingBag, Folder, Plus, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../../api';
import { formatPrice, pluralize } from '../../../utils/format';
import { imageUrl } from '../../../utils/image';
import useCartStore from '../../../store/cart.store';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';
import { ProductGridSkeleton } from '../../../components/ui/Skeleton';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const qc = useQueryClient();
  const { addToCart } = useCartStore();

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [movingItem, setMovingItem] = useState(null); // item to move

  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: userApi.getWishlist });
  const { data: groupsData } = useQuery({ queryKey: ['wishlist-groups'], queryFn: userApi.getWishlistGroups });

  const items = data?.data?.wishlist || [];
  const groups = groupsData?.data?.groups || [];

  const allGroupNames = Array.from(new Set(['General', ...groups.map((g) => g.name).filter(Boolean)]));

  const filteredItems = selectedGroup === 'All'
    ? items
    : items.filter((item) => (item.group_name || 'General').toLowerCase() === selectedGroup.toLowerCase());

  const remove = async (product_id) => {
    await userApi.toggleWishlist(product_id);
    qc.invalidateQueries({ queryKey: ['wishlist'] });
    qc.invalidateQueries({ queryKey: ['wishlist-groups'] });
  };

  const moveToCart = async (product_id) => {
    try {
      await addToCart(product_id);
      await userApi.toggleWishlist(product_id);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['wishlist-groups'] });
      toast.success('Moved to your bag');
    } catch (e) {
      toast.error(e?.message || 'Could not add to bag');
    }
  };

  const handleCreateGroup = async (e) => {
    e?.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === 'all') {
      toast.error('"All" is a reserved group name');
      return;
    }
    try {
      await userApi.createWishlistGroup(trimmed);
      toast.success(`Group "${trimmed}" created`);
      setNewGroupName('');
      setShowCreateModal(false);
      qc.invalidateQueries({ queryKey: ['wishlist-groups'] });
      setSelectedGroup(trimmed);
    } catch (err) {
      toast.error(err?.message || 'Failed to create group');
    }
  };

  const handleMoveToGroup = async (product_id, targetGroup) => {
    try {
      await userApi.setWishlistItemGroup(product_id, targetGroup);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['wishlist-groups'] });
      setMovingItem(null);
      toast.success(`Moved to "${targetGroup}"`);
    } catch (err) {
      toast.error(err?.message || 'Failed to move item');
    }
  };

  const handleDeleteGroup = async (groupName) => {
    if (!window.confirm(`Delete group "${groupName}"? All items will be moved to General.`)) return;
    try {
      await userApi.deleteWishlistGroup(groupName);
      toast.success(`Group "${groupName}" deleted`);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['wishlist-groups'] });
      setSelectedGroup('All');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete group');
    }
  };

  const handleRenameGroup = async (oldName) => {
    const newName = window.prompt(`Rename group "${oldName}" to:`, oldName);
    if (!newName || newName.trim() === oldName) return;
    try {
      await userApi.renameWishlistGroup(oldName, newName.trim());
      toast.success(`Renamed to "${newName.trim()}"`);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['wishlist-groups'] });
      setSelectedGroup(newName.trim());
    } catch (err) {
      toast.error(err?.message || 'Failed to rename group');
    }
  };

  return (
    <div className="container-x py-6 md:py-10">
      <PageHeader
        title="Wishlist"
        subtitle={items.length ? pluralize(items.length, 'saved item') : undefined}
        crumbs={[{ label: 'Wishlist' }]}
      />

      {/* ── Groups Filter Bar ── */}
      {items.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-line/60 pb-4">
          <button
            onClick={() => setSelectedGroup('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedGroup === 'All'
                ? 'bg-ink text-white shadow-sm'
                : 'bg-elevated text-ink-2 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            All ({items.length})
          </button>

          {allGroupNames.map((gName) => {
            const count = items.filter(
              (i) => (i.group_name || 'General').toLowerCase() === gName.toLowerCase()
            ).length;
            const active = selectedGroup.toLowerCase() === gName.toLowerCase();
            return (
              <button
                key={gName}
                onClick={() => setSelectedGroup(gName)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-elevated text-ink-2 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                <Folder className="h-3 w-3" />
                {gName} ({count})
              </button>
            );
          })}

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-primary border border-dashed border-primary/50 hover:border-primary flex items-center gap-1 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Group
          </button>

          {/* Group manage actions */}
          {selectedGroup !== 'All' && selectedGroup !== 'General' && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => handleRenameGroup(selectedGroup)}
                className="text-xs text-ink-2 hover:text-ink font-medium flex items-center gap-1 px-2.5 py-1 rounded-md border border-line hover:border-ink/40"
              >
                <Edit2 className="h-3 w-3" /> Rename
              </button>
              <button
                onClick={() => handleDeleteGroup(selectedGroup)}
                className="text-xs text-danger font-medium flex items-center gap-1 px-2.5 py-1 rounded-md border border-danger/30 hover:bg-danger/10"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Create Group Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-line">
            <h3 className="text-base font-bold text-ink mb-1">Create Wishlist Group</h3>
            <p className="text-xs text-ink-2 mb-4">
              Enter a name for this collection (e.g. Summer Fits, Workwear, Festive).
            </p>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                autoFocus
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                maxLength={40}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-elevated text-ink text-sm mb-4 outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-line text-ink-2 hover:bg-elevated"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-deep disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Move Item Dialog ── */}
      {movingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-line">
            <h3 className="text-base font-bold text-ink mb-1">Organize Item</h3>
            <p className="text-xs text-ink-2 line-clamp-1 mb-4">
              Move "{movingItem.name}" to:
            </p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4">
              {allGroupNames.map((gName) => {
                const isCurrent = (movingItem.group_name || 'General').toLowerCase() === gName.toLowerCase();
                return (
                  <button
                    key={gName}
                    onClick={() => handleMoveToGroup(movingItem.product_id, gName)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-elevated text-ink-2 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="h-3.5 w-3.5" />
                      {gName}
                    </span>
                    {isCurrent && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setMovingItem(null)}
              className="w-full py-2 text-xs font-semibold rounded-xl border border-line text-ink-2 hover:bg-elevated"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here for later."
          action="Browse products"
          to="/products"
        />
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center">
          <Folder className="h-12 w-12 mx-auto text-ink-3 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-ink mb-1">No items in "{selectedGroup}"</h3>
          <p className="text-xs text-ink-2 mb-4">
            Organize products into this group by clicking the group tag on any item.
          </p>
          <button
            onClick={() => setSelectedGroup('All')}
            className="px-4 py-2 rounded-full text-xs font-bold bg-primary text-white"
          >
            View All Saved Items
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="group animate-fade-up">
              <Link
                to={`/products/${item.product_id}`}
                className="block relative aspect-[3/4] rounded-2xl overflow-hidden bg-elevated border border-line/60"
              >
                <img
                  src={imageUrl(item.image)}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    remove(item.product_id);
                  }}
                  aria-label="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 h-9 w-9 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>

              <div className="mt-2.5 px-0.5">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <button
                    onClick={() => setMovingItem(item)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-elevated text-ink-2 hover:bg-neutral-200 border border-line"
                  >
                    <Folder className="h-2.5 w-2.5 text-primary" />
                    <span className="truncate max-w-[100px]">{item.group_name || 'General'}</span>
                  </button>
                </div>
                <p className="text-sm font-medium line-clamp-2 text-ink-2">{item.name}</p>
                <p className="text-sm font-bold mt-1 text-ink">{formatPrice(item.offer_price || item.price)}</p>
                <button
                  onClick={() => moveToCart(item.product_id)}
                  className="mt-2.5 w-full h-10 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-deep transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
