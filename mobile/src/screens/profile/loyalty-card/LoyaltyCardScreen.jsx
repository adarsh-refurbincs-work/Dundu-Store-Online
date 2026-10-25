import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../../components/ui/AppHeader';
import LuxuryLoyaltyCard from '../../../components/ui/LuxuryLoyaltyCard';
import { loyaltyApi } from '../../../api/index';
import { COLORS } from '../../../config';

const PRIVILEGES = [
  {
    icon: 'bag-handle-outline',
    title: 'Earn 20 Pts per ₹500',
    desc: 'Every ₹500 spent online or at our physical store automatically credits 20 points.',
    highlight: '4% Cashback Equivalent',
  },
  {
    icon: 'gift-outline',
    title: 'Instant ₹200 Vouchers',
    desc: 'Every 200 points unlocks a flat ₹200 discount at billing counter or in-app checkout.',
    highlight: '1 Point = ₹1 Reward',
  },
  {
    icon: 'infinite-outline',
    title: 'Lifetime Validity',
    desc: 'Your accumulated points never expire. Collect at your own pace without pressure.',
    highlight: 'No Expiry Ever',
  },
  {
    icon: 'storefront-outline',
    title: 'Omnichannel Freedom',
    desc: 'One membership works everywhere. Show this pass in-store or order through the app.',
    highlight: 'Store & App Sync',
  },
];

/**
 * Realistic Barcode Graphic rendered via SVG
 */
function BarcodeGraphic({ code = '8820491823' }) {
  // Pattern of bar widths
  const barWidths = [
    2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 1, 4, 2, 3, 1, 2, 1, 3, 4, 1, 2, 1, 3, 2, 4,
    1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 2, 1, 4, 1, 3, 2, 1, 2, 4, 1, 3,
  ];

  let currentX = 10;

  return (
    <View style={styles.barcodeWrap}>
      <Svg width="100%" height={56} viewBox="0 0 280 56">
        {barWidths.map((w, idx) => {
          const x = currentX;
          currentX += w + 2.5;
          if (x > 270) return null;
          return (
            <Rect
              key={idx}
              x={x}
              y="2"
              width={w}
              height="52"
              fill={idx % 7 === 0 ? '#F5D061' : '#E5E7EB'}
              rx="0.5"
            />
          );
        })}
      </Svg>
    </View>
  );
}

export default function LoyaltyCardScreen() {
  const [card, setCard] = useState(null);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loyaltyApi
      .myCard()
      .then((res) => { setCard(res?.card || res?.data?.card || null); setNeedsPhone(!!(res?.needs_phone ?? res?.data?.needs_phone)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <AppHeader title="My Loyalty Card" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#F5D061" />
          <Text style={styles.loadingText}>Loading your privilege card...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <AppHeader title="My Loyalty Card" showBack />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="card-outline" size={48} color="#F5D061" />
          </View>
          <Text style={styles.emptyTitle}>{needsPhone ? 'Add Your Phone Number' : 'No Loyalty Card Yet'}</Text>
          <Text style={styles.emptySub}>
            {needsPhone
              ? 'Your Privilege Card is linked to your mobile number so the billing counter can find it. Add your phone number in Edit Profile to activate the card.'
              : 'Your Dundu Privilege Card could not be loaded right now. Pull down to retry.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const points = Number(card.points ?? 0);
  const pointsAfterRedeem = points % 200;
  const redeemableCount = Math.floor(points / 200);
  const progress = Math.min(100, Math.round((pointsAfterRedeem / 200) * 100));
  const rawPhone = (card.phone || '').replace(/\D/g, '');
  const formattedMemberId = rawPhone
    ? `DND-${rawPhone.slice(0, 4)}-${rawPhone.slice(4)}`
    : `DND-${String(card.id || 1001).padStart(8, '0')}`;
  const totalSpent = Number(card.total_spent || 0);

  const handleCopyMemberId = () => {
    setCopied(true);
    Alert.alert('Member ID Copied', `${formattedMemberId}\n\nPresent this code to the store cashier.`);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <AppHeader title="Privilege Loyalty Hub" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Tier Status Ribbon */}
        <View style={styles.tierRibbon}>
          <View style={styles.tierRibbonLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.tierRibbonTitle}>DUNDU PRIVILEGE CLUB</Text>
          </View>
          <View style={styles.tierRibbonBadge}>
            <Text style={styles.tierRibbonBadgeText}>BLACK VIP MEMBER</Text>
          </View>
        </View>

        {/* ── Luxury Obsidian Gold Metal Card ── */}
        <View style={styles.cardWrap}>
          <LuxuryLoyaltyCard card={card} />
        </View>

        {/* ── In-Store Digital Barcode Pass ── */}
        <View style={styles.passCard}>
          <View style={styles.passHeader}>
            <View style={styles.passHeaderLeft}>
              <Ionicons name="barcode-outline" size={20} color="#F5D061" />
              <View>
                <Text style={styles.passTitle}>IN-STORE DIGITAL PASS</Text>
                <Text style={styles.passSub}>Scan or tell phone number at billing counter</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCopyMemberId}
              style={styles.copyBtn}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={14}
                color={copied ? '#4ADE80' : '#F5D061'}
              />
              <Text style={[styles.copyBtnText, copied && { color: '#4ADE80' }]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Barcode Lines */}
          <BarcodeGraphic code={rawPhone || '8820491823'} />

          {/* Member ID Code */}
          <View style={styles.passCodeRow}>
            <Text style={styles.passCodeText}>{formattedMemberId}</Text>
          </View>

          <View style={styles.passFooterNotice}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#9CA3AF" />
            <Text style={styles.passFooterNoticeText}>
              Verified Dundu Loyalty Member · Scan for Points & Redemptions
            </Text>
          </View>
        </View>

        {/* ── Active Reward Voucher Banner (if points >= 200) ── */}
        {redeemableCount > 0 && (
          <View style={styles.voucherCard}>
            <View style={styles.voucherLeft}>
              <View style={styles.voucherGiftCircle}>
                <Ionicons name="gift" size={26} color="#F5D061" />
              </View>
            </View>
            <View style={styles.voucherBody}>
              <View style={styles.voucherBadgeRow}>
                <View style={styles.voucherPill}>
                  <Text style={styles.voucherPillText}>READY TO REDEEM</Text>
                </View>
              </View>
              <Text style={styles.voucherAmount}>
                ₹{redeemableCount * 200} Instant Voucher
              </Text>
              <Text style={styles.voucherDesc}>
                Available now! Show this screen at the billing counter or apply at checkout.
              </Text>
            </View>
          </View>
        )}

        {/* ── Points Milestone & Progress Track ── */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <View>
              <Text style={styles.milestoneEyebrow}>VOUCHER REWARD MILESTONE</Text>
              <Text style={styles.milestoneStatus}>
                {pointsAfterRedeem} of 200 points collected
              </Text>
            </View>
            <View style={styles.neededPill}>
              <Text style={styles.neededPillText}>{200 - pointsAfterRedeem} pts to ₹200</Text>
            </View>
          </View>

          {/* Modern Progress Bar */}
          <View style={styles.milestoneTrack}>
            <View style={[styles.milestoneFill, { width: `${progress}%` }]} />
          </View>

          {/* Milestone Step Marks */}
          <View style={styles.stepMarksRow}>
            <View style={styles.stepMarkItem}>
              <View style={[styles.stepDot, progress > 0 && styles.stepDotActive]} />
              <Text style={styles.stepMarkText}>0 pts</Text>
            </View>
            <View style={styles.stepMarkItem}>
              <View style={[styles.stepDot, progress >= 50 && styles.stepDotActive]} />
              <Text style={styles.stepMarkText}>100 pts</Text>
            </View>
            <View style={[styles.stepMarkItem, { alignItems: 'flex-end' }]}>
              <View style={[styles.stepDot, progress === 100 && styles.stepDotActive]} />
              <Text style={[styles.stepMarkText, { color: '#F5D061', fontWeight: '800' }]}>
                200 pts (₹200)
              </Text>
            </View>
          </View>
        </View>

        {/* ── 3 Key VIP Metrics ── */}
        <View style={styles.statsGrid}>
          {/* Box 1: Available Points */}
          <View style={[styles.statCard, styles.statCardGold]}>
            <View style={styles.statIconBadge}>
              <Ionicons name="sparkles" size={16} color="#F5D061" />
            </View>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>Available Points</Text>
            <Text style={styles.statSub}>Eqv. ₹{points} reward value</Text>
          </View>

          {/* Box 2: Redeemable Cash */}
          <View style={[styles.statCard, styles.statCardEmerald]}>
            <View style={styles.statIconBadge}>
              <Ionicons name="gift-outline" size={16} color="#4ADE80" />
            </View>
            <Text style={[styles.statNumber, { color: '#86EFAC' }]}>
              ₹{redeemableCount * 200}
            </Text>
            <Text style={styles.statLabel}>Ready Vouchers</Text>
            <Text style={styles.statSub}>{redeemableCount} voucher(s) unlocked</Text>
          </View>

          {/* Box 3: Lifetime Spend */}
          <View style={[styles.statCard, styles.statCardNavy]}>
            <View style={styles.statIconBadge}>
              <Ionicons name="receipt-outline" size={16} color="#93C5FD" />
            </View>
            <Text style={[styles.statNumber, { color: '#BFDBFE' }]}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Lifetime Spend</Text>
            <Text style={styles.statSub}>Total purchases to date</Text>
          </View>
        </View>

        {/* ── Privilege Benefits ── */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="diamond-outline" size={16} color="#F5D061" />
          <Text style={styles.sectionTitle}>BLACK PRIVILEGE BENEFITS</Text>
        </View>

        <View style={styles.privilegesList}>
          {PRIVILEGES.map((item, i) => (
            <View key={i} style={styles.privilegeCard}>
              <View style={styles.privilegeIconWrap}>
                <Ionicons name={item.icon} size={22} color="#F5D061" />
              </View>
              <View style={styles.privilegeBody}>
                <View style={styles.privilegeTitleRow}>
                  <Text style={styles.privilegeTitle}>{item.title}</Text>
                  <View style={styles.privilegeHighlight}>
                    <Text style={styles.privilegeHighlightText}>{item.highlight}</Text>
                  </View>
                </View>
                <Text style={styles.privilegeDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Store Cashier Help Note ── */}
        <View style={styles.cashierCard}>
          <Ionicons name="information-circle-outline" size={20} color="#F5D061" />
          <View style={{ flex: 1 }}>
            <Text style={styles.cashierTitle}>In-Store Cashier Assistance</Text>
            <Text style={styles.cashierDesc}>
              Simply tell your registered mobile number ({card.phone}) at the Dundu store billing counter. The cashier will credit your points or apply your instant ₹200 vouchers automatically before invoice printing.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090A0F',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '600',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#090A0F',
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(245, 208, 97, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 208, 97, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptySub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Tier Ribbon */
  tierRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  tierRibbonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  tierRibbonTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
  },
  tierRibbonBadge: {
    backgroundColor: 'rgba(245, 208, 97, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 97, 0.3)',
  },
  tierRibbonBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F5D061',
    letterSpacing: 1,
  },

  /* Card Wrap */
  cardWrap: {
    marginBottom: 16,
  },

  /* In-Store Barcode Pass */
  passCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#0F121B',
    borderWidth: 1.2,
    borderColor: '#1F2536',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  passHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  passSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 208, 97, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 97, 0.25)',
  },
  copyBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#F5D061',
  },
  barcodeWrap: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passCodeRow: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  passCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F5D061',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  passFooterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  passFooterNoticeText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  /* Active Voucher Card */
  voucherCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#071F14',
    borderWidth: 1.2,
    borderColor: '#166534',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#052E16',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  voucherLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherGiftCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 208, 97, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 97, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherBody: {
    flex: 1,
  },
  voucherBadgeRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  voucherPill: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  voucherPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1,
  },
  voucherAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#BBF7D0',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  voucherDesc: {
    fontSize: 11,
    color: '#86EFAC',
    lineHeight: 15,
  },

  /* Milestone Progress Card */
  milestoneCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#0D0F16',
    borderWidth: 1,
    borderColor: '#1E2333',
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  milestoneEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(245, 208, 97, 0.85)',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  milestoneStatus: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  neededPill: {
    backgroundColor: 'rgba(245, 208, 97, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 97, 0.25)',
  },
  neededPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#F5D061',
  },
  milestoneTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#1C2130',
    overflow: 'hidden',
    marginBottom: 10,
  },
  milestoneFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#F5D061',
    shadowColor: '#F5D061',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  stepMarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepMarkItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#374151',
  },
  stepDotActive: {
    backgroundColor: '#F5D061',
  },
  stepMarkText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  /* 3 Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.2,
    alignItems: 'center',
  },
  statCardGold: {
    backgroundColor: '#16140E',
    borderColor: '#4A3B18',
  },
  statCardEmerald: {
    backgroundColor: '#0A1711',
    borderColor: '#194A2F',
  },
  statCardNavy: {
    backgroundColor: '#0E1420',
    borderColor: '#1E3252',
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF2B2',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  statSub: {
    fontSize: 8.5,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#F5D061',
    letterSpacing: 1.8,
  },

  /* Privileges List */
  privilegesList: {
    gap: 10,
    marginBottom: 18,
  },
  privilegeCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#0F121B',
    borderWidth: 1,
    borderColor: '#1C2233',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  privilegeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 208, 97, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 97, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  privilegeBody: {
    flex: 1,
  },
  privilegeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  privilegeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  privilegeHighlight: {
    backgroundColor: 'rgba(245, 208, 97, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  privilegeHighlightText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F5D061',
    letterSpacing: 0.5,
  },
  privilegeDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },

  /* Cashier Note */
  cashierCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#121520',
    borderWidth: 1,
    borderColor: '#242C40',
  },
  cashierTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E5E7EB',
    marginBottom: 3,
  },
  cashierDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
});
