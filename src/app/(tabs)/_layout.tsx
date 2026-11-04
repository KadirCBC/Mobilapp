import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  const activeColor = '#9E7B3B'; // Antik Bronz / Mat Altın
  const inactiveColor = '#ADB5BD'; // Açık Nötr Gri

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}>
      {/* 1. SEKME: VİTRİN & ANA SAYFA */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vitrin',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'albums' : 'albums-outline'}
              size={22}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />

      {/* 2. SEKME: KATEGORİLER & MEDENİYETLER */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Medeniyetler',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'earth' : 'earth-outline'}
              size={22}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />

      {/* 3. SEKME: SİKKE TARA (KAMERA / AI TANIMA) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Sikke Tara',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.scanIconWrapper,
                focused && {
                  backgroundColor: 'rgba(158, 123, 59, 0.12)',
                  borderColor: activeColor,
                },
              ]}>
              <Ionicons
                name={focused ? 'scan-circle' : 'scan-circle-outline'}
                size={25}
                color={focused ? activeColor : inactiveColor}
              />
            </View>
          ),
        }}
      />

      {/* 4. SEKME: TERİMLER & SÖZLÜK */}
      <Tabs.Screen
        name="glossary"
        options={{
          title: 'Sözlük',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={21}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 8,
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  scanIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
