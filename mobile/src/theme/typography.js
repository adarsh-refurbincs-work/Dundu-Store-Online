// App-wide typography: Manrope for every <Text>/<TextInput>, applied once at startup.
// RN does not pick bold files automatically for custom fonts (esp. Android), so the
// global patch maps `fontWeight` → the matching Manrope face and removes fontWeight.
import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import {
  Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

export const MANROPE_FONTS = { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold };

const faceFor = (weight) => {
  const w = String(weight || '400');
  if (w === 'bold' || w === '700') return 'Manrope_700Bold';
  if (w === '800' || w === '900') return 'Manrope_800ExtraBold';
  if (w === '600') return 'Manrope_600SemiBold';
  if (w === '500') return 'Manrope_500Medium';
  return 'Manrope_400Regular';
};

const patch = (Component) => {
  if (!Component || Component.__manropePatched) return;
  const original = Component.render;
  if (typeof original !== 'function') return;
  Component.render = function manropeRender(...args) {
    const el = original.apply(this, args);
    if (!el) return el;
    const flat = StyleSheet.flatten(el.props.style) || {};
    if (flat.fontFamily && !String(flat.fontFamily).startsWith('Manrope')) return el; // explicit custom font (e.g. monospace) wins
    const { fontWeight, ...rest } = flat;
    return React.cloneElement(el, { style: [rest, { fontFamily: faceFor(fontWeight) }] });
  };
  Component.__manropePatched = true;
};

export const applyGlobalFont = () => { patch(Text); patch(TextInput); };
