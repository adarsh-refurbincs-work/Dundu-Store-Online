import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

/**
 * Realistic Gold EMV Microchip rendered via SVG
 */
function EmvChip() {
  return (
    <View style={styles.chipWrapper}>
      <Svg width={48} height={36} viewBox="0 0 48 36">
        <Defs>
          <LinearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#fae7a5" />
            <Stop offset="30%" stopColor="#cf9f3f" />
            <Stop offset="65%" stopColor="#f3d77d" />
            <Stop offset="100%" stopColor="#9b6e1b" />
          </LinearGradient>
          <LinearGradient id="chipCore" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#f7e29a" />
            <Stop offset="100%" stopColor="#b88a2c" />
          </LinearGradient>
        </Defs>

        {/* Outer chip base with soft corner radius */}
        <Rect
          x="1"
          y="1"
          width="46"
          height="34"
          rx="6"
          fill="url(#chipGrad)"
          stroke="#704d0c"
          strokeWidth="0.8"
        />

        {/* Inner circuit boundary */}
        <Rect
          x="3.5"
          y="3.5"
          width="41"
          height="29"
          rx="4"
          fill="none"
          stroke="#704d0c"
          strokeWidth="0.75"
        />

        {/* Horizontal dividing tracks */}
        <Path d="M 3.5 18 L 18 18 M 30 18 L 44.5 18" stroke="#704d0c" strokeWidth="0.8" />

        {/* Vertical dividing tracks */}
        <Path d="M 24 3.5 L 24 12 M 24 24 L 24 32.5" stroke="#704d0c" strokeWidth="0.8" />

        {/* Micro contact pin lines */}
        <Path d="M 12 3.5 L 12 12 M 36 3.5 L 36 12" stroke="#704d0c" strokeWidth="0.6" opacity="0.75" />
        <Path d="M 12 24 L 12 32.5 M 36 24 L 36 32.5" stroke="#704d0c" strokeWidth="0.6" opacity="0.75" />

        {/* Central processor contact pad */}
        <Rect
          x="18"
          y="12"
          width="12"
          height="12"
          rx="3"
          fill="url(#chipCore)"
          stroke="#704d0c"
          strokeWidth="0.8"
        />
      </Svg>
    </View>
  );
}

export default function LuxuryLoyaltyCard({
  card,
  profileName,
  onPress,
  style,
  compact = false,
}) {
  const points = Number(card?.points ?? 0);
  const pointsAfterRedeem = points % 200;
  const redeemableCount = Math.floor(points / 200);
  const memberYear = card?.created_at
    ? new Date(card.created_at).getFullYear()
    : new Date().getFullYear();

  const rawName = card?.name || profileName || 'DUNDU MEMBER';
  const displayName = rawName.trim().slice(0, 22).toUpperCase();

  const phone = (card?.phone || '').replace(/\D/g, '');
  const lastFour = phone ? phone.slice(-4) : '8820';

  const CardContent = (
    <View style={[styles.cardContainer, style]}>
      {/* ── SVG Luxury Dark Background with Guilloche Lines ── */}
      <Svg style={StyleSheet.absoluteFillObject} viewBox="0 0 360 220" preserveAspectRatio="none">
        <Defs>
          {/* Deep Matte Carbon Obsidian Gradient */}
          <LinearGradient id="obsidianGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#1a1d28" />
            <Stop offset="30%" stopColor="#0f1118" />
            <Stop offset="70%" stopColor="#141722" />
            <Stop offset="100%" stopColor="#07080b" />
          </LinearGradient>

          {/* Champagne Gold Ambient Warmth */}
          <RadialGradient id="goldGlowTR" cx="88%" cy="16%" r="68%">
            <Stop offset="0%" stopColor="#F5D061" stopOpacity="0.22" />
            <Stop offset="45%" stopColor="#D4AF37" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Deep Steel-Navy Depth Glow */}
          <RadialGradient id="steelGlowBL" cx="12%" cy="88%" r="60%">
            <Stop offset="0%" stopColor="#2e3852" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Luxury Metallic Champagne Gold Hairline Border */}
          <LinearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#F7E29A" stopOpacity="0.75" />
            <Stop offset="25%" stopColor="#96752C" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#F5D061" stopOpacity="0.85" />
            <Stop offset="75%" stopColor="#75551A" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#E5C163" stopOpacity="0.7" />
          </LinearGradient>

          {/* Subtle Card Diagonal Sheen */}
          <LinearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="0.6">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
            <Stop offset="35%" stopColor="#ffffff" stopOpacity="0.02" />
            <Stop offset="70%" stopColor="#000000" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </LinearGradient>
        </Defs>

        {/* Base dark fill */}
        <Rect x="0" y="0" width="360" height="220" rx="20" fill="url(#obsidianGrad)" />
        <Rect x="0" y="0" width="360" height="220" rx="20" fill="url(#goldGlowTR)" />
        <Rect x="0" y="0" width="360" height="220" rx="20" fill="url(#steelGlowBL)" />
        <Rect x="0" y="0" width="360" height="220" rx="20" fill="url(#sheenGrad)" />

        {/* Luxury Guilloche Security Wave Lines in faint gold */}
        <G opacity="0.12">
          <Circle cx="330" cy="35" r="145" fill="none" stroke="#F5D061" strokeWidth="0.9" strokeDasharray="3 4" />
          <Circle cx="330" cy="35" r="110" fill="none" stroke="#F5D061" strokeWidth="0.8" />
          <Circle cx="330" cy="35" r="75" fill="none" stroke="#F5D061" strokeWidth="0.6" />
          <Circle cx="30" cy="195" r="120" fill="none" stroke="#F5D061" strokeWidth="0.75" strokeDasharray="4 6" />
          <Path d="M -20 165 Q 180 95 380 25" fill="none" stroke="#F5D061" strokeWidth="0.9" opacity="0.7" />
          <Path d="M -20 185 Q 180 115 380 45" fill="none" stroke="#F5D061" strokeWidth="0.7" opacity="0.5" />
          <Path d="M -20 145 Q 180 75 380 5" fill="none" stroke="#F5D061" strokeWidth="0.5" opacity="0.4" />
        </G>

        {/* Precision hairline gold metallic frame */}
        <Rect
          x="1"
          y="1"
          width="358"
          height="218"
          rx="19"
          fill="none"
          stroke="url(#goldBorder)"
          strokeWidth="1.2"
        />
      </Svg>

      {/* ── CARD FOREGROUND CONTENT ── */}
      <View style={styles.cardInner}>
        {/* Row 1: Brand & VIP Tier + Contactless */}
        <View style={styles.rowTop}>
          <View style={styles.brandGroup}>
            <Text style={styles.brandTitle}>DUNDU</Text>
            <View style={styles.vipBadge}>
              <Text style={styles.vipStar}>★</Text>
              <Text style={styles.vipText}>BLACK PRIVILEGE</Text>
            </View>
          </View>
          <View style={styles.contactlessContainer}>
            <Ionicons
              name="wifi-outline"
              size={20}
              color="rgba(245, 208, 97, 0.85)"
              style={styles.contactlessIcon}
            />
          </View>
        </View>

        {/* Row 2: Gold EMV Chip + Points Display */}
        <View style={styles.rowMiddle}>
          <EmvChip />

          <View style={styles.pointsGroup}>
            <View style={styles.pointsLabelRow}>
              <Ionicons name="sparkles" size={10} color="#F5D061" style={{ marginRight: 4 }} />
              <Text style={styles.pointsLabel}>REWARD BALANCE</Text>
            </View>
            <View style={styles.pointsValueRow}>
              <Text style={styles.pointsStar}>★</Text>
              <Text style={styles.pointsNumber}>{points}</Text>
            </View>
            <Text style={styles.pointsSubText}>
              {redeemableCount > 0
                ? `₹${redeemableCount * 200} READY TO REDEEM`
                : `${200 - pointsAfterRedeem} PTS TO ₹200 OFF`}
            </Text>
          </View>
        </View>

        {/* Row 3: Cardholder + Member Since + Masked Number */}
        <View style={styles.rowBottom}>
          <View style={styles.memberCol}>
            <Text style={styles.fieldLabel}>CARDHOLDER</Text>
            <Text style={styles.memberName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.cardNumber}>•••• {lastFour}</Text>
            <View style={styles.sinceRow}>
              <Text style={styles.fieldLabel}>SINCE </Text>
              <Text style={styles.memberSinceYear}>{memberYear}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 212,
    position: 'relative',
    backgroundColor: '#0a0c10',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
  },
  cardInner: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    justifyContent: 'space-between',
    minHeight: 212,
  },

  /* Row 1: Header */
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4.5,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 208, 97, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 97, 0.35)',
    gap: 3,
  },
  vipStar: {
    fontSize: 9,
    color: '#F5D061',
  },
  vipText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F5D061',
    letterSpacing: 1.2,
  },
  contactlessContainer: {
    padding: 4,
  },
  contactlessIcon: {
    transform: [{ rotate: '90deg' }],
  },

  /* Row 2: Chip + Balance */
  rowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  chipWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  pointsGroup: {
    alignItems: 'flex-end',
  },
  pointsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: 'rgba(245, 208, 97, 0.85)',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  pointsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsStar: {
    fontSize: 22,
    color: '#F5D061',
    marginRight: 4,
    textShadowColor: 'rgba(245, 208, 97, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pointsNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFF2B2',
    lineHeight: 42,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  pointsSubText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1.2,
    marginTop: 2,
  },

  /* Row 3: Footer */
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  memberCol: {
    flex: 1,
    paddingRight: 12,
  },
  fieldLabel: {
    fontSize: 7.5,
    fontWeight: '700',
    color: 'rgba(245, 208, 97, 0.7)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaCol: {
    alignItems: 'flex-end',
  },
  cardNumber: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  sinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSinceYear: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
