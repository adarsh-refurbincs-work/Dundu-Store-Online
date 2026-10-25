import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';
import useCartStore, { cartItemPrice, cartItemName, cartItemImage } from '../../store/cart.store';
import useAuthStore from '../../store/auth.store';
import { formatPrice } from '../../utils/format';
import { imageUrl } from '../../utils/image';

// Full-page cart at /cart. The slide-in CartDrawer stays the quick view; this page is
// for direct links, shared URLs and anyone who prefers a dedicated bag page.
export default function Cart() {
  const { items, updateItem, removeItem, totalPrice, totalItems } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const count = totalItems();
  const itemWord = count === 1 ? 'item' : 'items';
  const linkFor = (item) => (item.combo_id ? `/combos/${item.combo_id}` : `/products/${item.product_id}`);

  return (
    <div className="container-x max-w-4xl py-6 md:py-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl md:text-4xl text-ink">
          Your bag {items.length > 0 && <span className="text-base font-sans text-muted">({count} {itemWord})</span>}
        </h1>
        <Link to="/products" className="text-sm font-semibold text-primary-soft hover:underline">Continue shopping</Link>
      </div>

      {items.length === 0 ? (
        <div className="card rounded-3xl py-16 flex flex-col items-center text-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-elevated border border-line flex items-center justify-center">
            <ShoppingBag className="h-7 w-7 text-primary" />
          </div>
          <p className="font-display text-xl text-ink">Your bag is empty</p>
          <p className="text-sm text-muted">
            {token ? 'Find something you love.' : 'Sign in to see items you saved earlier, or start browsing.'}
          </p>
          <div className="flex gap-3 mt-2">
            <Link to="/products" className="h-11 px-5 rounded-full bg-primary text-white font-semibold flex items-center hover:bg-primary-deep transition-colors">
              Start shopping
            </Link>
            {!token && (
              <Link to="/login" state={{ from: '/cart' }} className="h-11 px-5 rounded-full border border-line text-ink font-semibold flex items-center hover:border-primary transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Items */}
          <div className="card rounded-3xl divide-y divide-line">
            {items.map((item) => {
              const name = cartItemName(item);
              const unit = cartItemPrice(item);
              const selections = Array.isArray(item.combo_selections) ? item.combo_selections : [];
              return (
                <div key={item.id} className="flex gap-4 p-4 md:p-5 animate-fade-in">
                  <Link to={linkFor(item)} className="w-[84px] h-[108px] md:w-[96px] md:h-[124px] rounded-xl overflow-hidden bg-elevated shrink-0">
                    <img src={imageUrl(cartItemImage(item))} alt={name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={linkFor(item)} className="text-sm md:text-base font-medium leading-snug line-clamp-2 text-ink hover:text-primary-soft">
                          {name}
                        </Link>
                        {item.combo_id ? (
                          <p className="text-xs text-muted mt-1 line-clamp-2">
                            Bundle · {selections.map((s) => [s.slot_label, s.size, s.color].filter(Boolean).join(' ')).join(', ') || 'combo'}
                          </p>
                        ) : (item.size || item.color) && (
                          <p className="text-xs text-muted mt-1">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                        )}
                        <p className="text-xs text-faint mt-1">{formatPrice(unit)} each</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 -mr-2 rounded-full text-faint hover:text-danger hover:bg-white/5 transition-colors shrink-0" aria-label={`Remove ${name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <div className="inline-flex items-center rounded-full border border-line bg-card">
                        <button onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                          className="h-9 w-9 flex items-center justify-center text-muted hover:text-ink" aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, Math.min(99, item.quantity + 1))}
                          className="h-9 w-9 flex items-center justify-center text-muted hover:text-ink" aria-label="Increase quantity">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-base font-bold text-ink">{formatPrice(unit * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="card rounded-3xl p-5 space-y-4 lg:sticky lg:top-40">
            <h2 className="font-semibold text-ink">Order summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal ({count} {itemWord})</span>
              <span className="font-bold text-ink">{formatPrice(totalPrice())}</span>
            </div>
            <p className="text-xs text-faint">Shipping, coupons, loyalty points and wallet balance are applied at checkout.</p>
            <Link to="/checkout"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-primary text-white font-semibold hover:bg-primary-deep transition-colors">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
