import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { MANROPE_FONTS, applyGlobalFont } from './src/theme/typography';

export default function App() {
  const [fontsLoaded] = useFonts(MANROPE_FONTS);

  useEffect(() => { if (fontsLoaded) applyGlobalFont(); }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}><ActivityIndicator color="#E91E8C" /></View>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
