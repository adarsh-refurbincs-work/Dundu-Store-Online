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
} from 'react-native-svg';

/**
 * 4-Point Sparkle Icon in SVG matching the screenshot badge
 */
function SparkleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 C12 7.5 7.5 12 2 12 C7.5 12 12 16.5 12 22 C12 16.5 16.5 12 22 12 C16.5 12 12 7.5 12 2 Z"
        stroke="#c7d2fe"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <Circle cx="18.5" cy="5.5" r="1.4" fill="#c7d2fe" />
      <Circle cx="5.5" cy="18.5" r="1.1" fill="#c7d2fe" />
    </Svg>
  );
}

/**
 * Contactless Waves Icon matching the screenshot ·)))
 */
function ContactlessIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 22 22" fill="none">
      <Circle cx="5" cy="11" r="1.6" fill="#c7d2fe" />
      <Path
        d="M9 6.5 C11.8 8.8 11.8 13.2 9 15.5"
        stroke="#c7d2fe"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M13 3.8 C17 7.5 17 14.5 13 18.2"
        stroke="#c7d2fe"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Realistic Gold EMV Microchip matching the screenshot
 */
function EmvChip() {
  return (
    <View style={styles.chipWrapper}>
      <Svg width={52} height={40} viewBox="0 0 52 40">
        <Defs>
          <LinearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#ffd84d" />
            <Stop offset="45%" stopColor="#f59e0b" />
            <Stop offset="100%" stopColor="#d97706" />
          </LinearGradient>
        </Defs>

        {/* Outer gold chip base */}
        <Rect
          x="1"
          y="1"
          width="50"
          height="38"
          rx="8"
          fill="url(#chipGrad)"
          stroke="#b45309"
          strokeWidth="1.2"
        />

        {/* Inner circuit contact boundary */}
        <Rect
          x="4.5"
          y="4.5"
          width="43"
          height="31"
          rx="5"
          fill="none"
          stroke="#92400e"
          strokeWidth="0.85"
          opacity="0.85"
        />

        {/* Horizontal contact dividing line */}
        <Path d="M 4.5 20 L 47.5 20" stroke="#92400e" strokeWidth="0.85" opacity="0.85" />

        {/* Vertical contact dividing line */}
        <Path d="M 26 4.5 L 26 35.5" stroke="#92400e" strokeWidth="0.85" opacity="0.85" />

        {/* Center beveled contact core */}
        <Rect
          x="19.5"
          y="14.5"
          width="13"
          height="11"
          rx="3"
          fill="#fbbf24"
          stroke="#92400e"
          strokeWidth="0.8"
          opacity="0.9"
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
}) {
  const points = Number(card?.points ?? 0);
  const redeemableCount = Math.floor(points / 200);
  // App Cash calculation: ₹200 off per 200 points (matches Dundu store rules & user screenshot)
  const appCash = redeemableCount > 0 ? redeemableCount * 200 : points;
  const memberYear = card?.created_at
    ? new Date(card.created_at).getFullYear()
    : new Date().getFullYear();

  // Cardholder name
  const rawName = card?.name || profileName || 'ADARSH SHARMA';
  const displayName = rawName.trim().slice(0, 24).toUpperCase();

  // Phone derived credit card format: 4892 •••• •••• 3210
  const digits = (card?.phone || '').replace(/\D/g, '');
  const firstFour = digits.length >= 8 ? digits.slice(0, 4) : '4892';
  const lastFour = digits.length >= 4 ? digits.slice(-4) : '3210';

  const CardContent = (
    <View style={[styles.cardContainer, style]}>
      {/* ── Background SVG with exact Indigo Gradient & Subtle Border ── */}
      <Svg style={StyleSheet.absoluteFillObject} viewBox="0 0 360 226" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#151b3b" />
            <Stop offset="45%" stopColor="#10142e" />
            <Stop offset="100%" stopColor="#0c0f24" />
          </LinearGradient>
          <RadialGradient id="ambientGlow" cx="18%" cy="16%" r="65%">
            <Stop offset="0%" stopColor="#3c4c8f" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#151b3b" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
            <Stop offset="50%" stopColor="#4f46e5" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Base dark navy/indigo fill */}
        <Rect x="0" y="0" width="360" height="226" rx="26" fill="url(#bgGrad)" />
        {/* Soft diffused ambient glow */}
        <Rect x="0" y="0" width="360" height="226" rx="26" fill="url(#ambientGlow)" />
        {/* Rounded border stroke */}
        <Rect
          x="1"
          y="1"
          width="358"
          height="224"
          rx="25"
          fill="none"
          stroke="url(#borderGrad)"
          strokeWidth="1.5"
        />
      </Svg>

      {/* ── CARD FOREGROUND CONTENT ── */}
      <View style={styles.cardInner}>
        {/* Row 1: Brand & Subtitle + App Member Pill & Contactless */}
        <View style={styles.rowTop}>
          <View style={styles.brandGroup}>
            <View style={styles.sparkleBadge}>
              <SparkleIcon />
            </View>
            <View style={styles.brandTextGroup}>
              <Text style={styles.brandTitle}>DUNDU ONLINE</Text>
              <Text style={styles.brandSubtitle}>APP REWARDS CLUB</Text>
            </View>
          </View>

          <View style={styles.topRightGroup}>
            <View style={styles.memberPill}>
              <Text style={styles.memberPillStar}>★</Text>
              <Text style={styles.memberPillText}>APP MEMBER</Text>
            </View>
            <View style={styles.contactlessWrap}>
              <ContactlessIcon />
            </View>
          </View>
        </View>

        {/* Row 2: Gold EMV Chip + Points & App Cash Box */}
        <View style={styles.rowMiddle}>
          <EmvChip />

          {/* Points & App Cash Badge Box */}
          <View style={styles.pointsBox}>
            <View style={styles.pointsTopRow}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.pointsNumber}>{points}</Text>
              <Text style={styles.ptsLabel}>PTS</Text>
            </View>
            <Text style={styles.appCashText}>≈ ₹{appCash} App Cash</Text>
          </View>
        </View>

        {/* Row 3: Card Number (4892 •••• •••• 3210) */}
        <View style={styles.rowNumber}>
          <Text style={styles.cardNumberText}>
            {firstFour}   ••••   ••••   {lastFour}
          </Text>
        </View>

        {/* Row 4: Cardholder + Member Since */}
        <View style={styles.rowBottom}>
          <View style={styles.cardholderCol}>
            <Text style={styles.fieldLabel}>APP CARDHOLDER</Text>
            <Text style={styles.cardholderName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <View style={styles.sinceCol}>
            <Text style={[styles.fieldLabel, { textAlign: 'right' }]}>MEMBER SINCE</Text>
            <Text style={styles.sinceYear}>{memberYear}</Text>
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
    borderRadius: 26,
    overflow: 'hidden',
    minHeight: 226,
    position: 'relative',
    backgroundColor: '#0c0f24',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 14,
  },
  cardInner: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
    minHeight: 226,
  },

  /* Row 1: Brand & Top Right */
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1b2247',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#818cf8',
    letterSpacing: 2,
    marginTop: 2,
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    gap: 5,
  },
  memberPillStar: {
    fontSize: 11,
    color: '#c7d2fe',
  },
  memberPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#c7d2fe',
    letterSpacing: 1.2,
  },
  contactlessWrap: {
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Row 2: Chip + Points Box */
  rowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  chipWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  pointsBox: {
    backgroundColor: 'rgba(11, 15, 33, 0.88)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.28)',
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    fontSize: 16,
    color: '#fbbf24',
    marginRight: 6,
  },
  pointsNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ptsLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  appCashText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#34d399',
    marginTop: 2,
    letterSpacing: 0.2,
  },

  /* Row 3: Card Number */
  rowNumber: {
    marginTop: 10,
    marginBottom: 14,
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3.5,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },

  /* Row 4: Cardholder + Member Since */
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardholderCol: {
    flex: 1,
    paddingRight: 10,
  },
  fieldLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#818cf8',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardholderName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sinceCol: {
    alignItems: 'flex-end',
  },
  sinceYear: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'right',
  },
});
