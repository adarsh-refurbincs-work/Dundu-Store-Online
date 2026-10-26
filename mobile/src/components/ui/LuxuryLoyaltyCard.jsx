import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

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

/**
 * Sparkle Logo Badge (3 white 4-pointed stars inside glowing pink circle)
 */
function SparkleLogo() {
  return (
    <View style={styles.sparkleBadge}>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        {/* Center sparkle */}
        <Path
          d="M12 4 C12 8.5 8.5 12 4 12 C8.5 12 12 15.5 12 20 C12 15.5 15.5 12 20 12 C15.5 12 12 8.5 12 4 Z"
          fill="#ffffff"
        />
        {/* Top-left small sparkle */}
        <Path
          d="M5.5 4 C5.5 5.5 4.5 6.5 3 6.5 C4.5 6.5 5.5 7.5 5.5 9 C5.5 7.5 6.5 6.5 8 6.5 C6.5 6.5 5.5 5.5 5.5 4 Z"
          fill="#ffffff"
        />
        {/* Bottom-right small sparkle */}
        <Path
          d="M19 15 C19 16.2 18.2 17 17 17 C18.2 17 19 17.8 19 19 C19 17.8 19.8 17 21 17 C19.8 17 19 16.2 19 15 Z"
          fill="#ffffff"
        />
      </Svg>
    </View>
  );
}

/**
 * Contactless Waves (dot + 3 curved radiating arcs bowing to the right)
 */
function ContactlessWaves() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="5" cy="12" r="1.6" fill="#ffffff" />
      <Path
        d="M9.5 7.5 C12.2 9.8 12.2 14.2 9.5 16.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Path
        d="M14 4.5 C18 8.5 18 15.5 14 19.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Path
        d="M18.5 2 C23.5 7 23.5 17 18.5 22"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeOpacity={0.85}
      />
    </Svg>
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
  const rawName = card?.name || profileName || 'DEVU';
  const displayName = rawName.trim().slice(0, 24).toUpperCase();

  // Complete 16-digit card number: 4 unmasked groups of 4 digits
  const rawPhone = (card?.phone || '').replace(/\D/g, '');
  const rawNumber = (card?.card_number || '').replace(/\D/g, '');
  const full16 = rawNumber.length >= 16
    ? rawNumber.slice(0, 16)
    : ('4892' + (rawPhone || '919846333075')).padEnd(16, '9').slice(0, 16);

  const g1 = full16.slice(0, 4);
  const g2 = full16.slice(4, 8);
  const g3 = full16.slice(8, 12);
  const g4 = full16.slice(12, 16);

  const CardContent = (
    <View style={[styles.cardContainer, { height: cardHeight, minHeight: cardHeight }, style]}>
      {/* ── Background: Glowing Neon Pink Swooshes & Ambient Aura ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Soft diffused top-left radial aura */}
        <View style={styles.ambientGlow} />

        {/* Left prominent curved crescent */}
        <View style={styles.leftCrescentGlow} />
        <View style={styles.leftCrescent} />

        {/* Bottom-right corner crescent */}
        <View style={styles.rightCrescentGlow} />
        <View style={styles.rightCrescent} />
      </View>

      {/* ── Row 1: Brand Logo & Title + Shop Member Pill & Waves ── */}
      <View style={styles.rowTop}>
        <View style={styles.brandGroup}>
          <SparkleLogo />
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>DUNDU ONLINE</Text>
            <Text style={styles.brandSubtitle}>STORE REWARDS CLUB</Text>
          </View>
        </View>

        <View style={styles.topRightGroup}>
          <View style={styles.contactlessWrap}>
            <ContactlessWaves />
          </View>
        </View>
      </View>

      {/* ── Row 2: Gold EMV Chip + Points Box ── */}
      <View style={styles.rowMiddle}>
        <EmvChip />

        {/* Glowing Neon Pink Points Box */}
        <View style={styles.pointsBox}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.pointsNumber}>{points}</Text>
          <Text style={styles.ptsLabel}>PTS</Text>
        </View>
      </View>

      {/* ── Row 3: Complete 16-Digit Card Number (4 Groups Evenly Spaced) ── */}
      <View style={styles.rowNumber}>
        <Text style={styles.cardNumberText}>{g1}</Text>
        <Text style={styles.cardNumberText}>{g2}</Text>
        <Text style={styles.cardNumberText}>{g3}</Text>
        <Text style={styles.cardNumberText}>{g4}</Text>
      </View>

      {/* ── Thin Glowing Neon Pink Divider Line ── */}
      <View style={styles.cardDivider} />

      {/* ── Row 4: Cardholder + Member Since ── */}
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
    borderRadius: 26,
    backgroundColor: '#070208',
    borderWidth: 2,
    borderColor: '#ff1493',
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 10,
  },

  /* Glowing Neon Background Swooshes */
  ambientGlow: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#ff1493',
    opacity: 0.16,
  },
  leftCrescent: {
    position: 'absolute',
    left: -90,
    top: -30,
    width: 290,
    height: 290,
    borderRadius: 145,
    borderWidth: 2,
    borderColor: 'rgba(255, 20, 147, 0.75)',
    backgroundColor: 'rgba(255, 20, 147, 0.07)',
  },
  leftCrescentGlow: {
    position: 'absolute',
    left: -105,
    top: -45,
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 8,
    borderColor: 'rgba(255, 20, 147, 0.12)',
  },
  rightCrescent: {
    position: 'absolute',
    right: -80,
    bottom: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(255, 20, 147, 0.75)',
    backgroundColor: 'rgba(255, 20, 147, 0.08)',
  },
  rightCrescentGlow: {
    position: 'absolute',
    right: -95,
    bottom: -105,
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 8,
    borderColor: 'rgba(255, 20, 147, 0.12)',
  },

  /* Row 1: Brand & Top Right */
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
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
    backgroundColor: '#1b0212',
    borderWidth: 1.5,
    borderColor: '#ff1493',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 7,
    elevation: 4,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.4,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#ff2a8d',
    letterSpacing: 2,
    marginTop: 2,
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactlessWrap: {
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },

  /* Row 2: Chip + Points Box */
  rowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    zIndex: 2,
  },
  chipOuter: {
    width: 46,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#d97706',
    padding: 2.5,
    borderWidth: 1.2,
    borderColor: '#92400e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
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
    opacity: 0.85,
  },
  chipVLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#92400e',
    opacity: 0.85,
  },
  chipCenter: {
    width: 13,
    height: 11,
    borderRadius: 3.5,
    backgroundColor: '#fbbf24',
    borderWidth: 0.8,
    borderColor: '#92400e',
  },

  /* Glowing Neon Pink Points Box */
  pointsBox: {
    backgroundColor: 'rgba(12, 4, 11, 0.95)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ff1493',
    paddingVertical: 6,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 5,
  },
  starIcon: {
    fontSize: 16,
    color: '#fbbf24',
    marginRight: 6,
  },
  pointsNumber: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ptsLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ff2a8d',
    letterSpacing: 1.5,
    marginLeft: 6,
  },

  /* Row 3: Card Number (4 Groups Evenly Spaced) */
  rowNumber: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginVertical: 3,
    zIndex: 2,
  },
  cardNumberText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 20, 147, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  /* Thin Glowing Neon Pink Divider Line */
  cardDivider: {
    height: 1.2,
    backgroundColor: 'rgba(255, 20, 147, 0.65)',
    marginTop: 4,
    marginBottom: 6,
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    zIndex: 2,
  },

  /* Row 4: Cardholder + Member Since */
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  cardholderCol: {
    flex: 1,
    paddingRight: 10,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#ff2a8d',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 2.5,
  },
  cardholderName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sinceCol: {
    alignItems: 'flex-end',
  },
  sinceYear: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textAlign: 'right',
  },
});
