import React from 'react';
import { Tabs } from 'expo-router';
import { CurvedTabBar } from '@/components/CurvedTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CurvedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}>
      {/* 1. SEKME: VİTRİN & ANA SAYFA */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vitrin',
        }}
      />

      {/* 2. SEKME: KATEGORİLER & MEDENİYETLER */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Medeniyetler',
        }}
      />

      {/* 3. SEKME: SİKKE TARA (KAMERA / AI TANIMA) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Sikke Tara',
        }}
      />

      {/* 4. SEKME: TERİMLER & SÖZLÜK */}
      <Tabs.Screen
        name="glossary"
        options={{
          title: 'Sözlük',
        }}
      />
    </Tabs>
  );
}
