import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Realistic Gold EMV Microchip built with pure React Native Views.
 * Guaranteed 100% cross-platform rendering with zero SVG layering or occluding issues.
 */
function EmvChip() {
  return (
    <View style={styles.chipOuter}>
      <View style={styles.chipInner}>
        <View style={styles.chipHLine} />
        <View style={styles.chipVLine} />
        <View style={styles.chipCenter} />
      </View>
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
  const appCash = redeemableCount > 0 ? redeemableCount * 200 : points;
  const memberYear = card?.created_at
    ? new Date(card.created_at).getFullYear()
    : new Date().getFullYear();

  // Dynamic card dimensions following ISO ID-1 credit card ratio (1.586)
  const { width: winW } = useWindowDimensions();
  const cardWidth = Math.max(280, winW - 32);
  const cardHeight = Math.round(cardWidth / 1.586);

  // Cardholder name
  const rawName = card?.name || profileName || 'ADARSH SHARMA';
  const displayName = rawName.trim().slice(0, 24).toUpperCase();

  // 16-digit card number format: 4892 •••• •••• 3210
  const digits = (card?.phone || '').replace(/\D/g, '');
  const firstFour = digits.length >= 8 ? digits.slice(0, 4) : '4892';
  const lastFour = digits.length >= 4 ? digits.slice(-4) : '3210';

  const CardContent = (
    <View style={[styles.cardContainer, { height: cardHeight, minHeight: cardHeight }, style]}>
      {/* Decorative ambient subtle glow */}
      <View style={styles.ambientGlow} pointerEvents="none" />

      {/* Row 1: Brand (DUNDU ONLINE / APP REWARDS CLUB) + Member Pill & Contactless */}
      <View style={styles.rowTop}>
        <View style={styles.brandGroup}>
          <View style={styles.sparkleBadge}>
            <Ionicons name="sparkles" size={17} color="#c7d2fe" />
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
            <Ionicons name="wifi-outline" size={19} color="#c7d2fe" />
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
    borderRadius: 24,
    backgroundColor: '#0f142e',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.42)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#3b82f6',
    opacity: 0.12,
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
    gap: 10,
  },
  sparkleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1c234a',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.5)',
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
    letterSpacing: 1.6,
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
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    gap: 5,
  },
  memberPillStar: {
    fontSize: 11,
    color: '#c7d2fe',
  },
  memberPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#c7d2fe',
    letterSpacing: 1.2,
  },
  contactlessWrap: {
    paddingLeft: 2,
    transform: [{ rotate: '90deg' }],
  },

  /* Row 2: Chip + Points Box */
  rowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  chipOuter: {
    width: 48,
    height: 36,
    borderRadius: 7,
    backgroundColor: '#d97706',
    padding: 2,
    borderWidth: 1,
    borderColor: '#92400e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  chipInner: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#f59e0b',
    borderWidth: 0.8,
    borderColor: '#b45309',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipHLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#92400e',
    opacity: 0.8,
  },
  chipVLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#92400e',
    opacity: 0.8,
  },
  chipCenter: {
    width: 13,
    height: 11,
    borderRadius: 3,
    backgroundColor: '#fbbf24',
    borderWidth: 0.8,
    borderColor: '#92400e',
  },

  pointsBox: {
    backgroundColor: 'rgba(11, 15, 33, 0.92)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    paddingVertical: 7,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 135,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  pointsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    fontSize: 15,
    color: '#fbbf24',
    marginRight: 5,
  },
  pointsNumber: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ptsLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginLeft: 5,
  },
  appCashText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
    marginTop: 2,
    letterSpacing: 0.2,
  },

  /* Row 3: Card Number */
  rowNumber: {
    marginVertical: 4,
  },
  cardNumberText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3.2,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
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
    fontSize: 8,
    fontWeight: '700',
    color: '#818cf8',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  cardholderName: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sinceCol: {
    alignItems: 'flex-end',
  },
  sinceYear: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'right',
  },
});
