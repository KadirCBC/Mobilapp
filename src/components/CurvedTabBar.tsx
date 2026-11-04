import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

export interface CurvedTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: any }>;
  };
  descriptors?: any;
  navigation?: any;
  navigateToTab?: (routeKey: string) => void;
  emitter?: any;
  insets?: any;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_ACTION_HEIGHT = 66; // İkonların yer aldığı üst buton bölgesi
const CORNER_RADIUS = 18; // Üst omuzların kavis yarıçapı
const NOTCH_RADIUS = 38; // Çentik kavis yarıçapı (genişlik 76px)
const NOTCH_DEPTH = 30; // Çentiğin vadi derinliği
const CIRCLE_SIZE = 58; // Büyütülmüş belirgin dairesel aktif buton boyutu
const HORIZONTAL_PADDING = 20; // İlk ve son sekmenin kenarlara olan mesafesi

// Gri Tonlarında Zarif Müze Teması
const THEME = {
  barBackground: '#ECEFF3', // Hafif gri/platin müze kaidesi zemini
  barBorder: '#94A3B8', // Belirgin, net ve zarif çerçeve rengi (Slate 400)
  activeBubble: Colors.light.primary, // #9E7B3B Antik Bronz / Mat Altın
  activeIcon: '#FFFFFF', // Beyaz parlak ikon
  inactiveIcon: '#334155', // Net ve okunaklı koyu grafit kontur ikonları (Slate 700)
  shadowColor: '#0F172A', // Yukarıya doğru derinlik gölgesi
};

// Sekme ikon haritası (Nümismatik & Müze Konsepti)
const TAB_ICONS: Record<
  string,
  {
    active: keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> = {
  index: {
    active: 'albums',
    inactive: 'albums-outline',
    label: 'Vitrin',
  },
  categories: {
    active: 'earth',
    inactive: 'earth-outline',
    label: 'Medeniyetler',
  },
  scan: {
    active: 'scan',
    inactive: 'scan-outline',
    label: 'Sikke Tara',
  },
  glossary: {
    active: 'book',
    inactive: 'book-outline',
    label: 'Sözlük',
  },
};

/**
 * Sekme merkez koordinatlarını kenar kıvrımlarına taşmayacak şekilde simetrik dağıtır.
 */
function getTabCenters(width: number, count: number): number[] {
  if (count <= 0) return [];
  const available = width - HORIZONTAL_PADDING * 2;
  const tabW = available / count;
  return Array.from(
    { length: count },
    (_, i) => HORIZONTAL_PADDING + (i + 0.5) * tabW
  );
}

/**
 * Ekranın en tabanına kadar uzanan (boşluksuz), üstünde kavisli çentik ve çerçeve olan SVG yolu.
 */
function createFullBottomCurvedPath(
  w: number,
  h: number,
  cx: number,
  cr: number = CORNER_RADIUS,
  r: number = NOTCH_RADIUS,
  depth: number = NOTCH_DEPTH
): string {
  const x0 = Math.max(cr, cx - r);
  const x1 = Math.min(w - cr, cx + r);

  // Akıcı ve doğal Bezier kontrol noktaları
  const cp1x = (x0 + (cx - x0) * 0.45).toFixed(1);
  const cp2x = (cx - (cx - x0) * 0.45).toFixed(1);
  const cp3x = (cx + (x1 - cx) * 0.45).toFixed(1);
  const cp4x = (x1 - (x1 - cx) * 0.45).toFixed(1);

  return `M 0 ${cr}
    A ${cr} ${cr} 0 0 1 ${cr} 0
    L ${x0.toFixed(1)} 0
    C ${cp1x} 0, ${cp2x} ${depth}, ${cx.toFixed(1)} ${depth}
    C ${cp3x} ${depth}, ${cp4x} 0, ${x1.toFixed(1)} 0
    L ${(w - cr).toFixed(1)} 0
    A ${cr} ${cr} 0 0 1 ${w} ${cr}
    L ${w} ${h}
    L 0 ${h}
    Z`;
}

export function CurvedTabBar({
  state,
  navigation,
  navigateToTab,
  emitter,
  insets,
}: CurvedTabBarProps) {
  // Güvenli alan alt boşluğu (Home Bar) hesabı
  let bottomInset = Platform.OS === 'ios' ? 24 : 12;
  try {
    const safeInsets = useSafeAreaInsets();
    if (safeInsets?.bottom != null && safeInsets.bottom > 0) {
      bottomInset = safeInsets.bottom;
    } else if (insets?.bottom != null && insets.bottom > 0) {
      bottomInset = insets.bottom;
    }
  } catch {
    if (insets?.bottom != null && insets.bottom > 0) {
      bottomInset = insets.bottom;
    }
  }

  const totalBarHeight = BAR_ACTION_HEIGHT + bottomInset;
  const [barWidth, setBarWidth] = useState(() => Dimensions.get('window').width);
  const tabCount = state?.routes?.length ?? 4;

  // Tüm sekmelerin tam simetrik merkez noktaları
  const tabCenters = useMemo(
    () => getTabCenters(barWidth, tabCount),
    [barWidth, tabCount]
  );

  const activeIndex = state?.index ?? 0;
  const targetCenterX = tabCenters[activeIndex] ?? barWidth / 2;

  // Animasyon değerleri
  const animValue = useRef(new Animated.Value(targetCenterX)).current;
  const [currentNotchX, setCurrentNotchX] = useState(targetCenterX);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Çentik pozisyonunu 60fps akıcı SVG güncellemesi için dinle
  useEffect(() => {
    const listenerId = animValue.addListener(({ value }) => {
      setCurrentNotchX(value);
    });
    return () => {
      animValue.removeListener(listenerId);
    };
  }, [animValue]);

  // Sekme değiştiğinde yaylanarak kayma animasyonu (Spring physics)
  useEffect(() => {
    Animated.parallel([
      Animated.spring(animValue, {
        toValue: targetCenterX,
        useNativeDriver: false,
        tension: 75,
        friction: 10,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.88,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 85,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeIndex, targetCenterX, animValue, scaleAnim]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - barWidth) > 1) {
      setBarWidth(width);
    }
  };

  // Dinamik kavisli arka plan SVG yolu
  const pathD = useMemo(() => {
    return createFullBottomCurvedPath(barWidth, totalBarHeight, currentNotchX);
  }, [barWidth, totalBarHeight, currentNotchX]);

  // Aktif sekme ikonu
  const activeRouteName = state?.routes?.[activeIndex]?.name || 'index';
  const activeIconDef = TAB_ICONS[activeRouteName] || {
    active: 'albums',
    inactive: 'albums-outline',
    label: '',
  };

  const slotWidth = barWidth / (tabCount || 1);

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View
        style={[styles.barWrapper, { height: totalBarHeight }]}
        onLayout={handleLayout}>
        {/* 1. GRİ TONLU, AŞAĞIYA KADAR UZANAN VE BELİRGİN ÇERÇEVELİ SVG ARKA PLAN */}
        <Svg
          width={barWidth}
          height={totalBarHeight}
          viewBox={`0 0 ${barWidth} ${totalBarHeight}`}
          style={styles.svgBackground}>
          <Path
            d={pathD}
            fill={THEME.barBackground}
            stroke={THEME.barBorder}
            strokeWidth={2}
          />
        </Svg>

        {/* 2. DİKEY ÇENTİĞİN İÇİNDE YÜZEN BÜYÜTÜLMÜŞ AKTİF BUTON */}
        <Animated.View
          style={[
            styles.floatingCircle,
            {
              left: currentNotchX - CIRCLE_SIZE / 2,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          pointerEvents="none">
          <Ionicons
            name={activeIconDef.active}
            size={27}
            color={THEME.activeIcon}
          />
        </Animated.View>

        {/* 3. DOKUNMATİK SEKME BUTONLARI & PASİF İKONLAR */}
        <View style={[styles.tabsRow, { height: BAR_ACTION_HEIGHT }]}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const iconDef = TAB_ICONS[route.name] || {
              active: 'albums',
              inactive: 'albums-outline',
              label: '',
            };

            const onPress = () => {
              if (emitter) {
                const event = emitter.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (event?.defaultPrevented) return;
              } else if (navigation?.emit) {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (event?.defaultPrevented) return;
              }

              if (!isFocused) {
                if (navigateToTab) {
                  navigateToTab(route.key);
                } else if (navigation?.navigate) {
                  navigation.navigate(route.name);
                } else {
                  const targetPath = route.name === 'index' ? '/' : `/${route.name}`;
                  router.push(targetPath as any);
                }
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                activeOpacity={0.7}
                style={[styles.tabButton, { width: slotWidth }]}>
                {/* Aktif olmayan sekmelerde belirgin koyu gri/grafit kontur ikon */}
                <View
                  style={[
                    styles.iconSlot,
                    isFocused && { opacity: 0 }, // Aktifken yerini yukarıdaki floating buton alır
                  ]}>
                  <Ionicons
                    name={iconDef.inactive}
                    size={24}
                    color={THEME.inactiveIcon}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 25,
  },
  barWrapper: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
    // Sayfa içeriğine karşı yukarı doğru belirgin derinlik gölgesi
    shadowColor: THEME.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 12,
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  floatingCircle: {
    position: 'absolute',
    top: -15, // Büyütülmüş butonun kavis merkezine oturması
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: THEME.activeBubble, // Antik Bronz / Mat Altın
    borderWidth: 3,
    borderColor: '#FFFFFF', // Daha kalın saf beyaz yüzük çerçevesi
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    // Aktif buton ışıma gölgesi
    shadowColor: THEME.activeBubble,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  tabButton: {
    height: BAR_ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
});
