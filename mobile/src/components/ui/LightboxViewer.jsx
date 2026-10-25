import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Full-screen image viewer with pinch-to-zoom. Renders nothing when `uri` is falsy.
// Used by the product and combo detail pages (gallery + review photos).
export default function LightboxViewer({ uri, onClose }) {
  const scale     = React.useRef(new Animated.Value(1)).current;
  const scaleBase = React.useRef(1);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], { useNativeDriver: true });
  const onPinchStateChange = (e) => {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      scaleBase.current *= e.nativeEvent.scale;
      const next = Math.min(Math.max(scaleBase.current, 1), 5);
      scaleBase.current = next;
      scale.setValue(next);
    }
  };

  if (!uri) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
          <Animated.Image source={{ uri }} style={[styles.image, { transform: [{ scale }] }]} resizeMode="contain" />
        </PinchGestureHandler>
        <TouchableOpacity style={styles.close} onPress={onClose} accessibilityLabel="Close image">
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Pinch to zoom · tap outside to close</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  image: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2 },
  close: {
    position: 'absolute', top: 48, right: 20, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  closeText: { fontSize: 18, color: '#fff', fontWeight: '600' },
  hint: { position: 'absolute', bottom: 40, color: 'rgba(255,255,255,0.6)', fontSize: 12 },
});
