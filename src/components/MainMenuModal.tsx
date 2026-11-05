import React from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.86, 360);
const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

export interface MainMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: string;
  badgeColor?: string;
  isExternal?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dynasties',
    title: 'Hanedanlar Soyağacı',
    subtitle: 'Roma, Bizans, Antik Grek & Osmanlı silsilesi',
    icon: 'git-network-outline',
    route: '/dynasties',
    badge: 'Soyağacı',
    badgeColor: '#9E7B3B',
  },
  {
    id: 'map',
    title: 'Darphaneler Coğrafi Haritası',
    subtitle: 'Akdeniz & Anadolu antik darp merkezleri atlası',
    icon: 'map-outline',
    route: '/map',
    badge: 'İnteraktif',
    badgeColor: '#1E40AF',
  },
  {
    id: 'legal-guide',
    title: 'Mevzuat & Tescil Rehberi',
    subtitle: '2863 S.K., Müze envanter kaydı ve UNESCO kuralları',
    icon: 'shield-checkmark-outline',
    route: '/legal-guide',
    badge: 'Resmi',
    badgeColor: '#15803D',
  },
  {
    id: 'glossary',
    title: 'Nümizmatik Sözlüğü',
    subtitle: 'Sheldon skalası, darp teknikleri & nümizmatik terimler',
    icon: 'book-outline',
    route: '/(tabs)/glossary',
    badge: 'Rehber',
    badgeColor: '#854D0E',
  },
  {
    id: 'categories',
    title: 'Medeniyetler & Dönemler',
    subtitle: 'Tarihsel kronoloji ve imparatorluk sikke koleksiyonları',
    icon: 'earth-outline',
    route: '/(tabs)/categories',
  },
  {
    id: 'scan',
    title: 'Yapay Zeka Spektro Tarayıcı',
    subtitle: 'Patina mineralizasyonu & NGC tipoloji analizi',
    icon: 'scan-circle-outline',
    route: '/(tabs)/scan',
    badge: 'Canlı AI',
    badgeColor: '#D97706',
  },
];

export function MainMenuModal({ visible, onClose }: MainMenuModalProps) {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 120);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Karartılmış Arka Plan - Tıklayınca Kapanır */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sağdan Açılan Müze Menü Çekmecesi */}
        <View style={styles.drawerContainer}>
          {/* 1. ÇEKMECE ÜST BAŞLIĞI & UYGULAMA LOGOSU */}
          <View style={styles.drawerHeader}>
            <View style={styles.headerBrandRow}>
              <View style={styles.brandLogoContainer}>
                <Image
                  source={require('../../assets/images/brand-logo.png')}
                  style={styles.brandLogoImage}
                  contentFit="contain"
                  priority="high"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={onClose}
                style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. MENÜ İÇERİK LİSTESİ */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollContent}>
            <Text style={styles.menuGroupTitle}>ANA KEŞİF & MODÜLLER</Text>

            <View style={styles.menuList}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.82}
                  onPress={() => handleNavigate(item.route)}
                  style={styles.menuItemCard}>
                  <View style={styles.menuItemIconBox}>
                    <Ionicons name={item.icon} size={20} color="#9E7B3B" />
                  </View>

                  <View style={styles.menuItemInfo}>
                    <View style={styles.menuItemTitleRow}>
                      <Text style={styles.menuItemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.badge && (
                        <View
                          style={[
                            styles.itemBadge,
                            { backgroundColor: `${item.badgeColor || '#9E7B3B'}18` },
                          ]}>
                          <Text
                            style={[
                              styles.itemBadgeText,
                              { color: item.badgeColor || '#9E7B3B' },
                            ]}>
                            {item.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.menuItemSubtitle} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },

  // 1. ÜST BAŞLIK
  drawerHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLogoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandLogoImage: {
    width: 170,
    height: 40,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // 2. İÇERİK SCROLL
  menuScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: 14,
  },
  menuGroupTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#9E7B3B',
    marginBottom: -4,
  },
  menuList: {
    gap: 8,
  },
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
    flexShrink: 1,
  },
  itemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  itemBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  menuItemSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
});

