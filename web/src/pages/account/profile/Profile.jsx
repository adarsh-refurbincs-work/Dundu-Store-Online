import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { userApi, loyaltyApi, orderApi, referralApi, announcementApi } from '../../../api';
import useAuthStore from '../../../store/auth.store';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Spinner from '../../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { Star, Gift, LogOut, MapPin, Plus, Trash2, Edit2, Wifi, Package, ChevronRight, Copy, Check, Share2 } from 'lucide-react';
import { formatPrice, formatDate } from '../../../utils/format';

function AddrField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: '#888' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
        style={{ backgroundColor: '#111', border: '1px solid #2e2e2e', color: '#f5f5f5' }}
        onFocus={(e) => { e.target.style.borderColor = '#e91e8c'; }}
        onBlur={(e) => { e.target.style.borderColor = '#2e2e2e'; }}
      />
    </div>
  );
}

const EMPTY_ADDR = { name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false };

function AddressForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_ADDR });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.phone || !form.address_line1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <AddrField label="Full Name *" value={form.name} onChange={set('name')} placeholder="Receiver name" />
        <AddrField label="Phone *" value={form.phone} onChange={set('phone')} placeholder="Phone number" type="tel" />
      </div>
      <AddrField label="Address Line 1 *" value={form.address_line1} onChange={set('address_line1')} placeholder="House no., Street, Area" />
      <AddrField label="Address Line 2" value={form.address_line2 || ''} onChange={set('address_line2')} placeholder="Landmark, Flat no. (optional)" />
      <div className="grid grid-cols-3 gap-3">
        <AddrField label="City *" value={form.city} onChange={set('city')} placeholder="City" />
        <AddrField label="State *" value={form.state} onChange={set('state')} placeholder="State" />
        <AddrField label="Pincode *" value={form.pincode} onChange={set('pincode')} placeholder="Pincode" />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#aaa' }}>
        <input type="checkbox" checked={!!form.is_default} onChange={(e) => set('is_default')(e.target.checked)}
          className="accent-pink-500" />
        Set as default address
      </label>
      <div className="flex gap-2 pt-1">
        <Button size="sm" loading={saving} onClick={handleSave}>Save Address</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.date_of_birth?.slice(0, 10) || '');
  const [saving, setSaving] = useState(false);
  const [addingAddr, setAddingAddr] = useState(() => !!location.state?.addAddress);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);

  useEffect(() => {
    if (location.state?.addAddress) {
      const t = setTimeout(() => document.getElementById('address-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: ordersData } = useQuery({
    queryKey: ['orders'], queryFn: orderApi.list, enabled: !!user,
  });
  const { data: referralData } = useQuery({
    queryKey: ['referral'], queryFn: referralApi.getInfo, enabled: !!user,
  });
  const orders = ordersData?.data?.orders || [];
  const referralInfo = referralData?.data || null;

  const { data: notifData } = useQuery({
    queryKey: ['notifications'], queryFn: userApi.getNotifications, enabled: !!user,
  });
  const notifications = notifData?.data?.notifications || [];

  const { data: announcData } = useQuery({
    queryKey: ['announcements-profile'], queryFn: announcementApi.list,
  });
  const announcements = announcData?.data?.announcements || [];

  const qc = useQueryClient();
  const { data: addrData, refetch: refetchAddrs } = useQuery({
    queryKey: ['addresses'], queryFn: userApi.getAddresses, enabled: !!user,
  });
  const addresses = addrData?.data?.addresses || [];

  // Put a freshly created / edited address into the cached list right away so it
  // shows the instant the form closes, then re-sync with the server in the background.
  const mergeAddressIntoCache = (addr) => {
    if (!addr?.id) return;
    qc.setQueryData(['addresses'], (old) => {
      const list = old?.data?.addresses || [];
      const rest = list.filter((a) => a.id !== addr.id).map((a) => (addr.is_default ? { ...a, is_default: false } : a));
      const next = addr.is_default ? [addr, ...rest] : [...rest, addr];
      return { ...(old || { success: true }), data: { ...(old?.data || {}), addresses: next } };
    });
  };

  const copyCode = () => {
    try {
      navigator.clipboard.writeText(referralInfo?.referral_code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Could not copy'); }
  };

  const shareLink = () => {
    const code = referralInfo?.referral_code || '';
    const link = `${window.location.origin}/signup?ref=${code}`;
    if (navigator.share) {
      navigator.share({ title: 'Join Dundu', text: `Use my referral code ${code} on Dundu and get 30% off your first order!`, url: link }).catch(() => {});
    } else {
      try { navigator.clipboard.writeText(link); toast.success('Link copied!'); } catch { toast.error('Could not copy'); }
    }
  };

  const phone = user?.phone?.replace(/\D/g, '');
  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty-card', phone],
    queryFn: () => loyaltyApi.check(phone),
    enabled: !!phone,
  });
  const loyaltyCard = loyaltyData?.data?.card || null;
  const redeemableCount = loyaltyCard ? Math.floor(loyaltyCard.points / 200) : 0;
  const pointsAfterRedeem = loyaltyCard ? loyaltyCard.points % 200 : 0;
  const progress = loyaltyCard ? Math.round((pointsAfterRedeem / 200) * 100) : 0;
  const memberYear = loyaltyCard ? new Date(loyaltyCard.created_at).getFullYear() : new Date().getFullYear();

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await userApi.updateProfile({ name, date_of_birth: user.date_of_birth ? undefined : (dob || null) });
      setUser({ ...user, ...res.data.user });
      setEditing(false);
      toast.success('Profile updated');
    } catch (e) { toast.error(e?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const saveAddress = async (form, id = null) => {
    setAddrSaving(true);
    try {
      if (id) {
        const res = await userApi.updateAddress(id, form);
        mergeAddressIntoCache(res?.data?.address || { ...form, id });
        toast.success('Address updated');
        setEditingAddr(null);
      } else {
        const res = await userApi.addAddress(form);
        mergeAddressIntoCache(res?.data?.address);
        toast.success('Address added');
        setAddingAddr(false);
        if (location.state?.next) {
          navigate(location.state.next, { state: location.state.nextState || undefined });
          return;
        }
      }
      await refetchAddrs();
    } catch { toast.error('Failed to save address'); }
    finally { setAddrSaving(false); }
  };

  const deleteAddress = async (id) => {
    try {
      await userApi.deleteAddress(id);
      qc.setQueryData(['addresses'], (old) => old ? { ...old, data: { ...old.data, addresses: (old.data?.addresses || []).filter((a) => a.id !== id) } } : old);
      toast.success('Address deleted');
      await refetchAddrs();
    } catch { toast.error('Failed to delete'); }
  };

  if (!user) return <Spinner />;

  return (
    <div className="container-x max-w-3xl py-6 md:py-10 space-y-8">
      <h1 className="font-display text-3xl md:text-4xl text-ink">My account</h1>

      {/* ── Profile card ── */}
      <section className="card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
            style={{ backgroundColor: '#1a0a12', color: '#e91e8c' }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-lg truncate" style={{ color: '#f5f5f5' }}>{user.name}</p>
            {user.email && <p className="text-sm" style={{ color: '#777' }}>{user.email}</p>}
            {user.phone && <p className="text-sm" style={{ color: '#888' }}>{user.phone}</p>}
            {user.date_of_birth && (
              <p className="text-sm" style={{ color: '#888' }}>
                🎂 {new Date(user.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label className="block text-xs font-semibold tracking-wide text-muted mb-1.5">Date of birth</label>
              {user.date_of_birth ? (
                <p className="input text-muted cursor-not-allowed">{new Date(user.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              ) : (
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} className="input" style={{ colorScheme: 'dark' }} />
              )}
              <p className="text-[11px] text-faint mt-1.5">
                {user.date_of_birth ? 'Your birthday is locked in — it unlocks a discount every year on the day.' : 'Add your birthday once to get a special discount on the day. It cannot be changed later.'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProfile} loading={saving} size="sm">Save</Button>
              <Button onClick={() => setEditing(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Button onClick={() => { setEditing(true); setName(user.name); setDob(user.date_of_birth?.slice(0, 10) || ''); }} variant="outline" size="sm">
              Edit Profile
            </Button>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#e91e8c' }}>
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </section>

      {/* ── My Orders ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#ddd' }}>My Orders</h2>
          <Link to="/orders"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: '#e91e8c', border: '1px solid #3d1226' }}>
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <Link to="/orders"
            className="card rounded-2xl py-10 text-center flex flex-col items-center transition-colors hover:bg-white/5" >
            <Package className="h-8 w-8 mb-2" style={{ color: '#333' }} />
            <p className="text-sm" style={{ color: '#666' }}>No orders yet</p>
            <p className="text-sm mt-1" style={{ color: '#e91e8c' }}>Go to My Orders</p>
          </Link>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => {
              const statusColors = {
                pending:   { bg: '#2d2000', color: '#facc15' },
                packed:    { bg: '#0a1e3d', color: '#60a5fa' },
                shipped:   { bg: '#0a1e3d', color: '#818cf8' },
                delivered: { bg: '#052e16', color: '#4ade80' },
                cancelled: { bg: '#2d1515', color: '#f87171' },
                returned:  { bg: '#1a1a1a', color: '#9ca3af' },
              };
              const st = statusColors[order.status] || statusColors.pending;
              const firstItem = order.items?.[0];

              return (
                <Link key={order.id} to={`/orders/${order.id}`}
                  className="card flex items-center gap-3 rounded-2xl p-4 transition-colors hover:bg-white/5" >
                  {/* Thumbnail */}
                  <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: '#2a2a2a' }}>
                    {firstItem?.image
                      ? <img src={firstItem.image} alt={firstItem.product_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">👗</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>#{order.order_number}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#666' }}>{formatDate(order.created_at)}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: '#e91e8c' }}>{formatPrice(order.total)}</p>
                  </div>

                  {/* Status + arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                      style={{ backgroundColor: st.bg, color: st.color }}>
                      {order.status}
                    </span>
                    <ChevronRight className="h-4 w-4" style={{ color: '#555' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Referral ── */}
      {referralInfo && (
        <section>
          <h2 className="font-semibold mb-4" style={{ color: '#ddd' }}>Refer & Earn</h2>
          <div className="card p-5 space-y-4">

            {/* Banner */}
            <div className="rounded-xl p-4 text-center"
              style={{ background: 'linear-gradient(135deg, #1a0a12 0%, #2d1226 100%)', border: '1px solid #3d1226' }}>
              <p className="text-base font-bold" style={{ color: '#e91e8c' }}>Share & Save Together</p>
              <p className="text-xs mt-1" style={{ color: '#aaa' }}>
                Your friend gets <span style={{ color: '#4ade80', fontWeight: 700 }}>30% off</span> their first order ·
                You get <span style={{ color: '#4ade80', fontWeight: 700 }}>20% off</span> your next order
              </p>
            </div>

            {/* Code + actions */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#888' }}>Your Referral Code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl text-center font-mono font-bold tracking-widest text-lg"
                  style={{ backgroundColor: '#111', border: '1.5px dashed #3d1226', color: '#e91e8c' }}>
                  {referralInfo.referral_code || '—'}
                </div>
                <button onClick={copyCode}
                  className="p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: copied ? '#052e16' : '#1e1e1e', border: `1px solid ${copied ? '#166534' : '#2e2e2e'}` }}>
                  {copied
                    ? <Check className="h-5 w-5" style={{ color: '#4ade80' }} />
                    : <Copy className="h-5 w-5" style={{ color: '#888' }} />}
                </button>
                <button onClick={shareLink}
                  className="p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: '#1a0a12', border: '1px solid #3d1226' }}>
                  <Share2 className="h-5 w-5" style={{ color: '#e91e8c' }} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: 'Friends Referred', value: referralInfo.referred_count ?? 0 },
                { label: 'Pending Rewards', value: (referralInfo.pending_rewards || []).length },
                { label: 'Rewards Used', value: (referralInfo.used_rewards || []).length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: '#111', border: '1px solid #2e2e2e' }}>
                  <p className="text-xl font-bold" style={{ color: '#e91e8c' }}>{value}</p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#666' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Pending rewards */}
            {(referralInfo.pending_rewards || []).length > 0 && (
              <div className="rounded-xl p-3 flex items-center gap-3"
                style={{ backgroundColor: '#052e16', border: '1px solid #166534' }}>
                <Gift className="h-5 w-5 shrink-0" style={{ color: '#4ade80' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#86efac' }}>
                    {referralInfo.pending_rewards[0].discount_percent}% off ready to use!
                  </p>
                  <p className="text-xs" style={{ color: '#4ade80' }}>
                    {referralInfo.pending_rewards[0].reward_type === 'referrer'
                      ? 'Your friend made their first purchase — enjoy your reward on the next order.'
                      : 'Applied automatically on your first order at checkout.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── ATM Loyalty Card ── */}
      {phone && (
        <section>
          <h2 className="font-semibold mb-4" style={{ color: '#ddd' }}>My Loyalty Card</h2>

          {loyaltyCard ? (
            <>
              {/* The Dundu Online Rewards Card matching mobile screenshot */}
              <div
                className="relative rounded-[28px] overflow-hidden select-none transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(145deg, #161c3b 0%, #11152e 45%, #0d1024 100%)',
                  padding: '24px 26px 22px',
                  minHeight: '226px',
                  border: '1.5px solid rgba(129, 140, 248, 0.35)',
                  boxShadow: '0 18px 38px -10px rgba(0,0,0,0.7), 0 0 20px rgba(99, 102, 241, 0.12)',
                }}
              >
                {/* Soft ambient lighting glow */}
                <div
                  style={{
                    position: 'absolute', top: '-40px', left: '-30px',
                    width: '240px', height: '240px', borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)',
                  }}
                />

                {/* Row 1: Brand with Sparkle Badge + App Member Pill & Waves */}
                <div className="relative flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: '#1b2247',
                        border: '1.2px solid rgba(129, 140, 248, 0.45)',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2 C12 7.5 7.5 12 2 12 C7.5 12 12 16.5 12 22 C12 16.5 16.5 12 22 12 C17 12 12 7.5 12 2 Z"
                          stroke="#c7d2fe"
                          strokeWidth="1.9"
                          strokeLinejoin="round"
                        />
                        <circle cx="18.5" cy="5.5" r="1.4" fill="#c7d2fe" />
                        <circle cx="5.5" cy="18.5" r="1.1" fill="#c7d2fe" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-black text-base tracking-wider leading-none">
                        DUNDU ONLINE
                      </p>
                      <p className="text-[10px] font-bold text-indigo-300 tracking-[2px] uppercase mt-1">
                        STORE REWARDS CLUB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide"
                      style={{
                        background: 'rgba(99, 102, 241, 0.22)',
                        border: '1px solid rgba(129, 140, 248, 0.4)',
                        color: '#c7d2fe',
                      }}
                    >
                      <span>★</span>
                      <span>SHOP MEMBER</span>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                      <circle cx="5" cy="11" r="1.6" fill="#c7d2fe" />
                      <path d="M9 6.5 C11.8 8.8 11.8 13.2 9 15.5" stroke="#c7d2fe" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M13 3.8 C17 7.5 17 14.5 13 18.2" stroke="#c7d2fe" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Row 2: Chip + Points Only Box */}
                <div className="relative flex items-center justify-between my-2.5">
                  {/* Realistic Gold EMV Chip */}
                  <div
                    style={{
                      width: '46px',
                      height: '35px',
                      background: 'linear-gradient(135deg, #ffd84d 0%, #f59e0b 45%, #d97706 100%)',
                      borderRadius: '7px',
                      border: '1.2px solid #b45309',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      padding: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        border: '0.85px solid #92400e',
                        borderRadius: '5px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: '1fr 1fr',
                        position: 'relative',
                        opacity: 0.9,
                      }}
                    >
                      <div style={{ borderRight: '0.85px solid #92400e', borderBottom: '0.85px solid #92400e' }} />
                      <div style={{ borderBottom: '0.85px solid #92400e' }} />
                      <div style={{ borderRight: '0.85px solid #92400e' }} />
                      <div />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '12px',
                          height: '10px',
                          borderRadius: '3px',
                          background: '#fbbf24',
                          border: '0.8px solid #92400e',
                        }}
                      />
                    </div>
                  </div>

                  {/* Clean Points Box (No ≈ or cash value) */}
                  <div
                    className="px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
                    style={{
                      background: 'rgba(11, 15, 33, 0.9)',
                      border: '1.2px solid rgba(99, 102, 241, 0.35)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    }}
                  >
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-white font-black text-lg leading-none">
                      {loyaltyCard.points}
                    </span>
                    <span className="text-slate-400 font-bold text-[10px] tracking-wider ml-1">
                      PTS
                    </span>
                  </div>
                </div>

                {/* Row 3: Complete 16-Digit Card Number */}
                <div className="relative my-2.5">
                  <p className="text-white font-mono font-bold text-base tracking-[3px] leading-none">
                    {(() => {
                      const full16 = ('4892' + (phone || '882049183210')).padEnd(16, '9').slice(0, 16);
                      return `${full16.slice(0, 4)}   ${full16.slice(4, 8)}   ${full16.slice(8, 12)}   ${full16.slice(12, 16)}`;
                    })()}
                  </p>
                </div>

                {/* Thin Divider Line */}
                <div className="my-2 h-[1px] bg-white/10" />

                {/* Row 4: Cardholder + Member Since */}
                <div className="relative flex items-end justify-between pt-1">
                  <div>
                    <p className="text-[8px] font-bold text-indigo-400 tracking-[1.8px] uppercase mb-1">
                      CARDHOLDER
                    </p>
                    <p className="text-white font-black text-xs tracking-wider uppercase">
                      {(loyaltyCard.name || user.name || 'ADARSH SHARMA').slice(0, 24)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-indigo-400 tracking-[1.8px] uppercase mb-1">
                      MEMBER SINCE
                    </p>
                    <p className="text-white font-black text-xs tracking-wider">
                      {memberYear}
                    </p>
                  </div>
                </div>
              </div>

              {/* Redeemable Celebration Banner */}
              {redeemableCount > 0 && (
                <div
                  className="mt-4 rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #071F14 0%, #0d3822 100%)',
                    border: '1.2px solid #166534',
                    boxShadow: '0 8px 20px -6px rgba(5,46,22,0.5)',
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(245, 208, 97, 0.15)', border: '1px solid rgba(245, 208, 97, 0.3)' }}
                    >
                      <Gift className="h-5 w-5" style={{ color: '#F5D061' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#BBF7D0' }}>
                        ₹{redeemableCount * 200} Voucher Ready to Redeem!
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#86EFAC' }}>
                        Show card at billing counter or apply at checkout
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/account/loyalty-card"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-300 bg-emerald-950/60 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              )}

              {/* Modern Dark Progress Container */}
              <div
                className="mt-3 rounded-2xl p-4.5 space-y-2.5"
                style={{ backgroundColor: '#0D0F16', border: '1px solid #1E2333' }}
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: '#F5D061' }}>★</span>
                    <span className="font-semibold" style={{ color: '#E5E7EB' }}>Reward Milestone</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      background: 'rgba(245, 208, 97, 0.12)',
                      border: '1px solid rgba(245, 208, 97, 0.25)',
                      color: '#F5D061',
                    }}
                  >
                    {200 - pointsAfterRedeem} pts to ₹200
                  </span>
                </div>

                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1C2130' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #9b6e1b, #F5D061, #FFF2B2)',
                      boxShadow: '0 0 10px rgba(245,208,97,0.7)',
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs pt-0.5">
                  <span style={{ color: '#9CA3AF' }}>{pointsAfterRedeem} / 200 pts earned</span>
                  <span className="font-bold" style={{ color: '#F5D061' }}>200 pts = ₹200 OFF</span>
                </div>

                <p className="text-xs text-center pt-1" style={{ color: '#6B7280', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  Earn 20 pts every ₹500 spent · Works in-store & online
                </p>
              </div>
            </>
          ) : (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#111' }}>
                <Star className="h-8 w-8" style={{ color: '#333' }} />
              </div>
              <p style={{ color: '#888' }}>No loyalty card yet</p>
              <p className="text-xs mt-1" style={{ color: '#555' }}>Make a purchase at our store to get started!</p>
            </div>
          )}
        </section>
      )}

      {/* ── Addresses ── */}
      <section id="address-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#ddd' }}>My Addresses</h2>
          {!addingAddr && (
            <button
              onClick={() => { setAddingAddr(true); setEditingAddr(null); }}
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: '#e91e8c' }}>
              <Plus className="h-4 w-4" /> Add New
            </button>
          )}
        </div>

        {addingAddr && (
          <div className="mb-4 rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #3d1226' }}>
            <p className="text-sm font-semibold mb-4" style={{ color: '#f5c2d4' }}>New Address</p>
            <AddressForm
              onSave={(form) => saveAddress(form)}
              onCancel={() => setAddingAddr(false)}
              saving={addrSaving}
            />
          </div>
        )}

        {addresses.length === 0 && !addingAddr ? (
          <div className="card text-center py-10 rounded-2xl">
            <MapPin className="h-8 w-8 mx-auto mb-2" style={{ color: '#333' }} />
            <p className="text-sm" style={{ color: '#666' }}>No addresses saved yet</p>
            <button
              onClick={() => setAddingAddr(true)}
              className="text-sm mt-2 hover:underline" style={{ color: '#e91e8c' }}>
              + Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-2xl p-4"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: addr.is_default ? '1px solid #3d1226' : '1px solid #2e2e2e',
                }}>
                {editingAddr === addr.id ? (
                  <AddressForm
                    initial={addr}
                    onSave={(form) => saveAddress(form, addr.id)}
                    onCancel={() => setEditingAddr(null)}
                    saving={addrSaving}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0"
                        style={{ color: addr.is_default ? '#e91e8c' : '#555' }} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-sm" style={{ color: '#f5f5f5' }}>{addr.name}</p>
                          {addr.is_default && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: '#3d1226', color: '#e91e8c' }}>
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: '#777' }}>{addr.phone}</p>
                        <p className="text-sm mt-1" style={{ color: '#888' }}>
                          {addr.address_line1}
                          {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                        </p>
                        <p className="text-sm" style={{ color: '#888' }}>
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => { setEditingAddr(addr.id); setAddingAddr(false); }}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                        style={{ color: '#666' }}>
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                        style={{ color: '#e91e8c' }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Notifications ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#ddd' }}>Notifications</h2>
          {notifications.some((n) => !n.is_read) && (
            <button onClick={() => userApi.markNotificationsRead()}
              className="text-xs hover:underline" style={{ color: '#e91e8c' }}>
              Mark all read
            </button>
          )}
        </div>
        {announcements.length === 0 && notifications.length === 0 ? (
          <p className="text-sm" style={{ color: '#666' }}>No notifications</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={`ann-${a.id}`} className="p-3 rounded-xl text-sm"
                style={{ border: '1px solid #2a1f00', backgroundColor: '#1a1500', color: '#ddd' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#3d2e00', color: '#f5c518' }}>
                    📢 Announcement
                  </span>
                </div>
                <p className="font-medium">{a.text}</p>
              </div>
            ))}
            {notifications.map((n) => (
              <div key={n.id} className="p-3 rounded-xl text-sm"
                style={n.is_read
                  ? { border: '1px solid #2e2e2e', color: '#777', backgroundColor: '#1a1a1a' }
                  : { border: '1px solid #3d1226', color: '#ddd', backgroundColor: '#1a0a12' }}>
                <p className="font-medium">{n.title}</p>
                <p className="text-xs mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
