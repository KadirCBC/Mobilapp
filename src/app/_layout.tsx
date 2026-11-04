import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';

// Native splash screen'in aniden kapanmasını önleyip pürüzsüz devral
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // JS ayağa kalkınca native splash'i kapat, animasyonlu giriş ekranı devralır
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8F9FA' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="map" options={{ headerShown: false }} />
        <Stack.Screen name="dynasties" options={{ headerShown: false }} />
        <Stack.Screen name="coin/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="certificate/[id]" options={{ headerShown: false }} />
      </Stack>

      {!splashFinished && (
        <AnimatedSplashScreen
          onAnimationComplete={() => setSplashFinished(true)}
          minDisplayTimeMs={2000}
        />
      )}
    </SafeAreaProvider>
  );
}
