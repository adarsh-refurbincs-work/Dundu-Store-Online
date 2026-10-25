import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Wishlist heart: white outline sitting directly on the product photo (no bubble),
// solid red when saved, with a short "pop" when it turns on. Used on product cards
// and the product page.
export const WISHLIST_RED = '#FF4343';
const OUTLINE_WHITE = '#FFFFFF';

export default function WishlistHeart({ active, onPress, disabled, size = 18, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) {
      scale.setValue(0.6);
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 140, useNativeDriver: true }).start();
    }
    wasActive.current = active;
  }, [active, scale]);

  const box = Math.round(size * 1.8);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from wishlist' : 'Add to wishlist'}
      style={[styles.bubble, { width: box, height: box, borderRadius: box / 2 }, style]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={active ? 'heart' : 'heart-outline'}
          size={size}
          color={active ? WISHLIST_RED : OUTLINE_WHITE}
          style={styles.icon}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Soft shadow under the glyph so the white outline stays readable on light photos.
  icon: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
