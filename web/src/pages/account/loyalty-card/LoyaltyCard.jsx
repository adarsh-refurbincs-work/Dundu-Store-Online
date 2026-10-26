import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Gift,
  TrendingUp,
  Phone,
  Wifi,
  Sparkles,
  Copy,
  Check,
  Store,
  Clock,
  Award,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loyaltyApi } from '../../../api';
import useAuthStore from '../../../store/auth.store';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { formatPrice } from '../../../utils/format';
import dunduLogo from '../../../assets/logo.png';

const REDEEM_THRESHOLD = 200;
const REDEEM_VALUE = 200;

export default function LoyaltyCard() {
  useDocumentTitle('Privilege Loyalty Card');
  const { user } = useAuthStore();
  const userDigits = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const [typed, setTyped] = useState(null);
  const [queryPhone, setQueryPhone] = useState(null);
  const [copied, setCopied] = useState(false);
  const phone = typed ?? userDigits;
  const activePhone = queryPhone ?? (userDigits.length === 10 ? userDigits : '');

  const { data, isFetching, isError } = useQuery({
    queryKey: ['loyalty-card', activePhone],
    queryFn: () => loyaltyApi.check(activePhone),
    enabled: activePhone.length === 10,
    retry: false,
  });
  const card = data?.data?.card || null;
  const notFound = activePhone.length === 10 && !isFetching && (isError || (data && !card));
  const loading = isFetching;

  const lookup = (e) => {
    e.preventDefault();
    setQueryPhone(phone.replace(/\D/g, '').slice(-10));
  };

  const points = card ? Number(card.points || 0) : 0;
  const redeemableCount = card ? Math.floor(points / REDEEM_THRESHOLD) : 0;
  const pointsAfterRedeem = card ? points % REDEEM_THRESHOLD : 0;
  const progress = card ? Math.min(100, Math.round((pointsAfterRedeem / REDEEM_THRESHOLD) * 100)) : 0;
  const redeemableAmount = redeemableCount * REDEEM_VALUE;
  const memberYear = card?.created_at
    ? new Date(card.created_at).getFullYear()
    : new Date().getFullYear();

  const rawPhone = (card?.phone || activePhone || '').replace(/\D/g, '');
  const memberCode = rawPhone
    ? `DND-${rawPhone.slice(0, 4)}-${rawPhone.slice(4)}`
    : 'DND-8820-4918';

  const copyCode = () => {
    navigator.clipboard?.writeText(memberCode);
    setCopied(true);
    toast.success('Member code copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="container-x max-w-3xl py-6 md:py-10">
      <PageHeader
        title="Dundu Privilege Club"
        subtitle={`Earn 20 points every ₹500 spent · Redeem ${REDEEM_THRESHOLD} points for ${formatPrice(REDEEM_VALUE)} off`}
        crumbs={[{ label: 'Loyalty card' }]}
      />

      <form onSubmit={lookup} className="flex gap-2 mb-8 max-w-xl">
        <div className="relative flex-1">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
          <input
            value={phone}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Enter 10-digit phone number"
            inputMode="tel"
            className="input pl-10 h-12"
            aria-label="Phone number"
          />
        </div>
        <Button type="submit" loading={loading} size="lg">
          Lookup Card
        </Button>
      </form>

      {card && (
        <div className="space-y-6 animate-fade-up">
          {/* ── Status Ribbon ── */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-widest uppercase text-muted">
                Dundu Privilege Club
              </span>
            </div>
            <span
              className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider"
              style={{
                background: 'rgba(245, 208, 97, 0.12)',
                border: '1px solid rgba(245, 208, 97, 0.35)',
                color: '#F5D061',
              }}
            >
              ★ BLACK VIP TIER
            </span>
          </div>

          {/* ── The Dundu Online Rewards Card matching reference design ── */}
          <div
            className="relative rounded-[28px] overflow-hidden select-none transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: '#070208',
              padding: '26px 28px 24px',
              minHeight: '228px',
              border: '2px solid #ff1493',
              boxShadow: '0 0 35px rgba(255, 20, 147, 0.5), 0 0 65px rgba(255, 20, 147, 0.2), 0 20px 42px rgba(0,0,0,0.9)',
            }}
          >
            {/* Neon Curved Swooshes & Ambient Glow */}
            <div
              style={{
                position: 'absolute', top: '-40px', left: '-30px',
                width: '260px', height: '260px', borderRadius: '50%', pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(255, 20, 147, 0.25) 0%, transparent 70%)',
              }}
            />
            <div
              style={{
                position: 'absolute', left: '-100px', top: '-40px',
                width: '340px', height: '340px', borderRadius: '50%', pointerEvents: 'none',
                border: '2px solid rgba(255, 20, 147, 0.75)',
                background: 'rgba(255, 20, 147, 0.07)',
                boxShadow: '0 0 22px rgba(255, 20, 147, 0.35)',
              }}
            />
            <div
              style={{
                position: 'absolute', right: '-90px', bottom: '-100px',
                width: '290px', height: '290px', borderRadius: '50%', pointerEvents: 'none',
                border: '2px solid rgba(255, 20, 147, 0.75)',
                background: 'rgba(255, 20, 147, 0.08)',
                boxShadow: '0 0 22px rgba(255, 20, 147, 0.35)',
              }}
            />

            {/* Row 1: Brand Logo & D LINK CARD + Waves */}
            <div className="relative flex items-center justify-between mb-4 z-10">
              <div className="flex items-center gap-2.5">
                <img
                  src={dunduLogo}
                  alt="D Link"
                  className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]"
                />
                <p className="text-white font-black text-lg tracking-wider leading-none">
                  D LINK CARD
                </p>
              </div>

              <div className="flex items-center" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 20, 147, 0.6))' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="5" cy="12" r="1.6" fill="#ffffff" />
                  <path d="M9.5 7.5 C12.2 9.8 12.2 14.2 9.5 16.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M14 4.5 C18 8.5 18 15.5 14 19.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M18.5 2 C23.5 7 23.5 17 18.5 22" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
                </svg>
              </div>
            </div>

            {/* Row 2: Chip + Points Only Box */}
            <div className="relative flex items-center justify-between my-3 z-10">
              {/* Realistic Gold EMV Chip */}
              <div
                style={{
                  width: '46px',
                  height: '35px',
                  background: 'linear-gradient(135deg, #ffd84d 0%, #f59e0b 45%, #d97706 100%)',
                  borderRadius: '7px',
                  border: '1.2px solid #b45309',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
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

              {/* Clean Borderless Points Box */}
              <div
                className="px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5"
                style={{
                  background: 'rgba(12, 4, 11, 0.65)',
                }}
              >
                <span className="text-amber-400 text-sm">★</span>
                <span className="text-white font-black text-xl leading-none">
                  {card.points}
                </span>
                <span className="text-[#ff2a8d] font-black text-xs tracking-wider ml-1">
                  PTS
                </span>
              </div>
            </div>

            {/* Row 3: Complete 16-Digit Card Number (4 Groups Evenly Spaced) */}
            <div className="relative my-3 flex items-center justify-between z-10 px-1">
              {(() => {
                const full16 = ('4892' + (rawPhone || '919846333075')).padEnd(16, '9').slice(0, 16);
                const groups = [full16.slice(0, 4), full16.slice(4, 8), full16.slice(8, 12), full16.slice(12, 16)];
                return groups.map((g, i) => (
                  <span
                    key={i}
                    className="text-white font-black text-lg sm:text-xl tracking-wider leading-none"
                    style={{ textShadow: '0 0 10px rgba(255, 20, 147, 0.6)' }}
                  >
                    {g}
                  </span>
                ));
              })()}
            </div>

            {/* Row 4: Cardholder + Member Since */}
            <div className="relative flex items-end justify-between pt-1 z-10">
              <div>
                <p className="text-[8.5px] font-black text-[#ff2a8d] tracking-[1.8px] uppercase mb-1">
                  CARDHOLDER
                </p>
                <p className="text-white font-black text-sm tracking-wider uppercase">
                  {(card.name || user?.name || 'DEVU').slice(0, 24)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8.5px] font-black text-[#ff2a8d] tracking-[1.8px] uppercase mb-1 text-right">
                  MEMBER SINCE
                </p>
                <p className="text-white font-black text-sm tracking-wider text-right">
                  {memberYear}
                </p>
              </div>
            </div>
          </div>

          {/* ── In-Store Digital Barcode Pass ── */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#0F121B', border: '1.2px solid #1F2536' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4" style={{ color: '#F5D061' }} />
                <span className="text-xs font-bold tracking-wider text-white">IN-STORE DIGITAL PASS</span>
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold"
                style={{
                  background: 'rgba(245, 208, 97, 0.12)',
                  border: '1px solid rgba(245, 208, 97, 0.3)',
                  color: copied ? '#4ADE80' : '#F5D061',
                }}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy ID'}
              </button>
            </div>

            {/* Barcode Graphic */}
            <div className="py-2 flex justify-center">
              <svg width="100%" height="48" viewBox="0 0 280 48" className="max-w-xs">
                {[2,1,3,1,2,4,1,3,2,1,1,4,2,3,1,2,1,3,4,1,2,1,3,2,4,1,2,3,1,4,2,1,3,1,2,4,1,2,3,2,1,4,1,3,2,1,2,4,1,3].map((w, idx) => (
                  <rect
                    key={idx}
                    x={idx * 5.4 + 4}
                    y="2"
                    width={w}
                    height="44"
                    fill={idx % 7 === 0 ? '#F5D061' : '#E5E7EB'}
                    rx="0.5"
                  />
                ))}
              </svg>
            </div>

            <p className="text-center font-mono font-bold tracking-widest text-sm text-[#F5D061] mt-1">
              {memberCode}
            </p>

            <div className="flex items-center justify-center gap-1.5 pt-3 mt-3 border-t border-white/5 text-muted text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Show this code or your phone number to cashier at billing counter</span>
            </div>
          </div>

          {/* ── Active Reward Voucher Ready ── */}
          {redeemableCount > 0 && (
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{
                background: 'linear-gradient(135deg, #071F14 0%, #0d3822 100%)',
                border: '1.2px solid #166534',
                boxShadow: '0 8px 24px -6px rgba(5,46,22,0.5)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(245, 208, 97, 0.15)', border: '1px solid rgba(245, 208, 97, 0.3)' }}
              >
                <Gift className="h-6 w-6" style={{ color: '#F5D061' }} />
              </div>
              <div className="flex-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800">
                  READY TO REDEEM
                </span>
                <p className="font-bold text-base mt-1" style={{ color: '#BBF7D0' }}>
                  {formatPrice(redeemableAmount)} Instant Voucher
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#86EFAC' }}>
                  Use at checkout or present your card to the store cashier for instant deduction.
                </p>
              </div>
            </div>
          )}

          {/* ── Progress Milestone Container ── */}
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ backgroundColor: '#0D0F16', border: '1px solid #1E2333' }}
          >
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: '#F5D061' }}>
                  Voucher Milestone
                </p>
                <p className="font-bold text-sm text-white mt-0.5">
                  {pointsAfterRedeem} of {REDEEM_THRESHOLD} points collected
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded text-xs font-bold"
                style={{
                  background: 'rgba(245, 208, 97, 0.12)',
                  border: '1px solid rgba(245, 208, 97, 0.25)',
                  color: '#F5D061',
                }}
              >
                {REDEEM_THRESHOLD - pointsAfterRedeem} pts to ₹200 off
              </span>
            </div>

            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1C2130' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #9b6e1b, #F5D061, #FFF2B2)',
                  boxShadow: '0 0 12px rgba(245,208,97,0.7)',
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted pt-1">
              <span>0 pts</span>
              <span>100 pts</span>
              <span className="font-bold" style={{ color: '#F5D061' }}>200 pts ({formatPrice(REDEEM_VALUE)} off)</span>
            </div>
          </div>

          {/* ── 3 Key Metrics ── */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: '#16140E', border: '1.2px solid #4A3B18' }}
            >
              <Award className="h-5 w-5 mx-auto mb-1.5" style={{ color: '#F5D061' }} />
              <p className="text-xl font-black" style={{ color: '#FFF2B2' }}>{card.points}</p>
              <p className="text-xs font-semibold text-white mt-0.5">Total Points</p>
              <p className="text-[10px] text-muted mt-0.5">Eqv. ₹{card.points} value</p>
            </div>

            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: '#0A1711', border: '1.2px solid #194A2F' }}
            >
              <Gift className="h-5 w-5 mx-auto mb-1.5" style={{ color: '#4ADE80' }} />
              <p className="text-xl font-black" style={{ color: '#86EFAC' }}>{formatPrice(redeemableAmount)}</p>
              <p className="text-xs font-semibold text-white mt-0.5">Ready to Redeem</p>
              <p className="text-[10px] text-muted mt-0.5">{redeemableCount} voucher(s) unlocked</p>
            </div>

            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: '#0E1420', border: '1.2px solid #1E3252' }}
            >
              <TrendingUp className="h-5 w-5 mx-auto mb-1.5" style={{ color: '#93C5FD' }} />
              <p className="text-xl font-black" style={{ color: '#BFDBFE' }}>{formatPrice(card.total_spent)}</p>
              <p className="text-xs font-semibold text-white mt-0.5">Total Spent</p>
              <p className="text-[10px] text-muted mt-0.5">Lifetime orders</p>
            </div>
          </div>

          {/* ── Privilege Benefits ── */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#0F121B', border: '1px solid #1F2536' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4" style={{ color: '#F5D061' }} />
              <p className="text-xs font-bold tracking-wider uppercase text-white">Privilege Membership Benefits</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs font-bold text-white mb-1">🛍️ 20 Points Every ₹500</p>
                <p className="text-xs text-muted leading-relaxed">
                  Earn a generous 4% reward equivalent automatically on every eligible purchase.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs font-bold text-white mb-1">🎁 Instant ₹200 Redemptions</p>
                <p className="text-xs text-muted leading-relaxed">
                  At 200 points, redeem ₹200 off with a single click at checkout or in-store.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs font-bold text-white mb-1">♾️ Never Expiring Points</p>
                <p className="text-xs text-muted leading-relaxed">
                  Your balance stays safe in your wallet indefinitely. Collect at your own pace.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs font-bold text-white mb-1">🏪 One Card Everywhere</p>
                <p className="text-xs text-muted leading-relaxed">
                  Fully synchronized balance between our retail counter and the online mobile store.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {notFound && (
        <div className="card p-8 text-center animate-fade-up">
          <Star className="h-10 w-10 mx-auto mb-3 text-faint" />
          <p className="font-display text-lg text-ink">No loyalty card yet</p>
          <p className="text-sm text-muted mt-1">
            Your privilege card is created automatically with your first purchase online or in our retail store.
          </p>
        </div>
      )}
    </div>
  );
}
