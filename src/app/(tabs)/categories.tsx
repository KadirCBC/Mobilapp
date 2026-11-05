import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, BottomTabInset, Colors, Spacing } from '@/constants/theme';
import { CATEGORIES, CivilizationCategory } from '@/data/categories';
import { MainMenuModal } from '@/components/MainMenuModal';
import { useTheme } from '@/hooks/use-theme';

const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

export default function CategoriesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [mainMenuVisible, setMainMenuVisible] = useState(false);

  // Arama filtresi
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.period.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Medeniyet kartına tıklandığında Vitrin sayfasına filtreli yönlendir
  const handleSelectCivilization = (category: CivilizationCategory) => {
    router.push({
      pathname: '/(tabs)',
      params: { civ: category.shortName },
    } as any);
  };

  // Maden türüne göre renk kodu
  const getMetalColor = (metal: string) => {
    const m = metal.toLowerCase();
    if (m.includes('altın')) return { bg: '#FDF6E2', text: '#9E7B3B', dot: '#D4AF37' };
    if (m.includes('gümüş')) return { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };
    if (m.includes('elektrum')) return { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' };
    return { bg: '#FBF0E4', text: '#9A3412', dot: '#CD7F32' }; // Bronz / Bakır
  };

  const renderCategoryCard = ({ item }: { item: CivilizationCategory }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handleSelectCivilization(item)}
        style={styles.card}>
        {/* Sol / Arka Plan Görsel Alanı */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />
          {/* Eser Sayısı Rozeti (Görsel Üzerinde Vurgulu) */}
          <View style={styles.imageOverlayBadge}>
            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
            <Text style={styles.imageOverlayBadgeText}>{item.coinCount} Eser</Text>
          </View>
        </View>

        {/* Sağ İçerik Alanı */}
        <View style={styles.cardContent}>
          {/* Medeniyet Adı ve Dönem */}
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.civilizationName} numberOfLines={1}>
                {item.name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9E7B3B" />
            </View>

            <View style={styles.periodRow}>
              <Ionicons name="time-outline" size={13} color="#6C757D" />
              <Text style={styles.periodText}>{item.period}</Text>
            </View>
          </View>

          {/* Açıklama */}
          {item.description && (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {/* Alt Maden Hapları: "Altın • Gümüş • Bronz" */}
          <View style={styles.metalsRow}>
            {item.metals.map((metal, idx) => {
              const styleMeta = getMetalColor(metal);
              return (
                <View
                  key={idx}
                  style={[styles.metalPill, { backgroundColor: styleMeta.bg }]}>
                  <View
                    style={[
                      styles.metalPillDot,
                      { backgroundColor: styleMeta.dot },
                    ]}
                  />
                  <Text
                    style={[styles.metalPillText, { color: styleMeta.text }]}>
                    {metal}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* 1. ÜST BAŞLIK ALANI */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerEyebrow}>MEDENİYETLER VE DÖNEMLER</Text>
            <Text style={styles.headerTitle}>Tarihsel Nümismatik Atlası</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.atlasBadge}>
              <Ionicons name="earth" size={13} color="#9E7B3B" />
              <Text style={styles.atlasBadgeText}>{CATEGORIES.length} Çağ</Text>
            </View>

            {/* Üç Çizgili Ana Menü Butonu (Hamburger) */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setMainMenuVisible(true)}
              style={styles.hamburgerBtn}>
              <Ionicons name="menu-outline" size={22} color="#9E7B3B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Arama Çubuğu */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9E7B3B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="İmparatorluk, krallık veya çağ ara..."
            placeholderTextColor="#ADB5BD"
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#6C757D" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. MEDENİYET KARTLARI LİSTESİ */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryCard}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: BottomTabInset + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listSubheader}>
            <Ionicons name="compass-outline" size={14} color="#9E7B3B" />
            <Text style={styles.listSubheaderText}>
              Herhangi bir medeniyeti seçerek müzayede kataloğundaki eserleri filtreleyin
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Eşleşen Medeniyet Bulunamadı</Text>
            <Text style={styles.emptyDesc}>
              Arama kriterini değiştirerek antik çağları ve imparatorlukları tekrar arayın.
            </Text>
          </View>
        }
      />

      {/* ÜÇ ÇİZGİLİ ANA MENÜ ÇEKMECESİ */}
      <MainMenuModal
        visible={mainMenuVisible}
        onClose={() => setMainMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Açık müze zemini
  },

  // Üst Bar
  header: {
    paddingTop: (Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48) + Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    gap: Spacing.sm + 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#9E7B3B', // Antik mat altın
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1D20', // Antrasit
    letterSpacing: -0.3,
  },
  mapShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#9E7B3B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  mapShortcutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  atlasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5EEDB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.25)',
  },
  atlasBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E7B3B',
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(158, 123, 59, 0.45)',
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // Arama Çubuğu
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#1A1D20',
    padding: 0,
  },

  // Liste
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  listSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  listSubheaderText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
    flex: 1,
  },

  // Büyük Yatay Lüks Kart
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrapper: {
    width: 124,
    backgroundColor: '#E9ECEF',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26, 29, 32, 0.82)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageOverlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  civilizationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D20',
    flex: 1,
    marginRight: 4,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  periodText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 11.5,
    color: '#495057',
    lineHeight: 16,
  },

  // Maden Hapları
  metalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  metalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  metalPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metalPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Boş Durum
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D20',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    maxWidth: 260,
  },
});
