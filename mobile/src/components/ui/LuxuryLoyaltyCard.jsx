import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Realistic Gold EMV Microchip built with pure React Native Views.
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

  // Complete 16-digit card number: 4 unmasked groups of 4 digits
  const rawPhone = (card?.phone || '').replace(/\D/g, '');
  const rawNumber = (card?.card_number || '').replace(/\D/g, '');
  const full16 = rawNumber.length >= 16
    ? rawNumber.slice(0, 16)
    : ('4892' + (rawPhone || '882049183210')).padEnd(16, '9').slice(0, 16);

  const g1 = full16.slice(0, 4);
  const g2 = full16.slice(4, 8);
  const g3 = full16.slice(8, 12);
  const g4 = full16.slice(12, 16);
  const fullCardNumber = `${g1}   ${g2}   ${g3}   ${g4}`;

  const CardContent = (
    <View style={[styles.cardContainer, { height: cardHeight, minHeight: cardHeight }, style]}>
      {/* Decorative ambient subtle glow */}
      <View style={styles.ambientGlow} pointerEvents="none" />

      {/* Row 1: Brand + Contactless */}
      <View style={styles.rowTop}>
        <View style={styles.brandGroup}>
          <View style={styles.sparkleBadge}>
            <Ionicons name="sparkles" size={15} color="#c7d2fe" />
          </View>
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>DUNDU ONLINE</Text>
            <Text style={styles.brandSubtitle}>STORE REWARDS CLUB</Text>
          </View>
        </View>

        <View style={styles.topRightGroup}>
          <View style={styles.contactlessWrap}>
            <Ionicons name="wifi-outline" size={19} color="#c7d2fe" />
          </View>
        </View>
      </View>

      {/* Row 2: Gold EMV Chip + Points Only Box (no ≈ or cash value) */}
      <View style={styles.rowMiddle}>
        <EmvChip />

        {/* Clean Points Box */}
        <View style={styles.pointsBox}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.pointsNumber}>{points}</Text>
          <Text style={styles.ptsLabel}>PTS</Text>
        </View>
      </View>

      {/* Row 3: Complete 16-Digit Card Number */}
      <View style={styles.rowNumber}>
        <Text style={styles.cardNumberText} numberOfLines={1} adjustsFontSizeToFit>
          {fullCardNumber}
        </Text>
      </View>

      {/* Thin Horizontal Divider Line */}
      <View style={styles.cardDivider} />

      {/* Row 4: Cardholder + Member Since */}
      <View style={styles.rowBottom}>
        <View style={styles.cardholderCol}>
          <Text style={styles.fieldLabel}>CARDHOLDER</Text>
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
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  ambientGlow: {
    position: 'absolute',
    top: -45,
    left: -45,
    width: 200,
    height: 200,
    borderRadius: 100,
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
    gap: 9,
  },
  sparkleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1c234a',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.4,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#818cf8',
    letterSpacing: 1.8,
    marginTop: 1.5,
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactlessWrap: {
    paddingLeft: 2,
    transform: [{ rotate: '90deg' }],
  },

  /* Row 2: Chip + Clean Points Box */
  rowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  chipOuter: {
    width: 44,
    height: 33,
    borderRadius: 7,
    backgroundColor: '#d97706',
    padding: 2,
    borderWidth: 1,
    borderColor: '#92400e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
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
    opacity: 0.75,
  },
  chipVLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#92400e',
    opacity: 0.75,
  },
  chipCenter: {
    width: 12,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#fbbf24',
    borderWidth: 0.8,
    borderColor: '#92400e',
  },

  /* Points Only Box */
  pointsBox: {
    backgroundColor: 'rgba(11, 15, 33, 0.9)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  starIcon: {
    fontSize: 14,
    color: '#fbbf24',
    marginRight: 5,
  },
  pointsNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ptsLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginLeft: 5,
  },

  /* Row 3: Card Number */
  rowNumber: {
    marginVertical: 4,
  },
  cardNumberText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2.2,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },

  /* Thin Divider Line */
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
    marginBottom: 6,
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
    fontSize: 7.5,
    fontWeight: '700',
    color: '#818cf8',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 2.5,
  },
  cardholderName: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sinceCol: {
    alignItems: 'flex-end',
  },
  sinceYear: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textAlign: 'right',
  },
});
