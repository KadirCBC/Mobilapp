import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { CoinCard } from '@/components/CoinCard';
import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { CoinItem, MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES = [
  'Tümü',
  'Lidya',
  'Antik Yunan',
  'Makedonya',
  'Roma',
  'Bizans',
  'Osmanlı',
];

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.dark;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Arama ve Kategori Filtreleme
  const filteredCoins = useMemo(() => {
    return MOCK_COINS.filter((coin) => {
      // Kategori kontrolü
      const matchesCategory =
        selectedCategory === 'Tümü' ||
        coin.civilization.toLowerCase().includes(selectedCategory.toLowerCase());

      // Arama kutusu kontrolü (başlık, hükümdar, medeniyet ve dönem)
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        coin.title.toLowerCase().includes(query) ||
        coin.ruler.toLowerCase().includes(query) ||
        coin.civilization.toLowerCase().includes(query) ||
        coin.period.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <View style={styles.rootContainer}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="light" />

        <View style={styles.container}>
          {/* 1. Üst Kurumsal Başlık ve Sözlük Butonu */}
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={[styles.eyebrow, { color: colors.gold }]}>
                MÜZE & NUMİZMATİK KOLEKSİYONU
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                TARİHİ ESER & SİKKE ARŞİVİ
              </Text>
            </View>

            {/* Sözlük sayfasına geçiş butonu */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/explore')}
              style={[
                styles.dictionaryButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderGold,
                },
              ]}>
              <Ionicons name="book-outline" size={19} color={colors.gold} />
              <Text style={[styles.dictionaryButtonText, { color: colors.gold }]}>
                Sözlük
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2. Arama Çubuğu */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.gold}
              style={styles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Sikke, hükümdar veya medeniyet ara..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS !== 'ios' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* 3. Kategori Filtre Butonları (Yatay Kaydırılabilir) */}
          <View style={styles.categoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}>
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    activeOpacity={0.75}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryPill,
                      isSelected
                        ? {
                            backgroundColor: colors.gold,
                            borderColor: colors.goldLight,
                          }
                        : {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                    ]}>
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected
                          ? {
                              color: '#121417',
                              fontWeight: '700',
                            }
                          : {
                              color: colors.textSecondary,
                              fontWeight: '500',
                            },
                      ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 4. Sikke Listesi (FlatList + CoinCard) */}
          <FlatList
            data={filteredCoins}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CoinCard
                item={item}
                onPress={() => router.push(`/coin/${item.id}` as any)}
              />
            )}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingBottom: BottomTabInset + Spacing.lg + 20,
              },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="shield-outline"
                  size={42}
                  color={colors.gold}
                  style={styles.emptyIcon}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Sonuç Bulunamadı
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Aramanıza veya seçilen kategoriye uygun sikke bulunamadı.
                </Text>
                {(searchQuery.length > 0 || selectedCategory !== 'Tümü') && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tümü');
                    }}
                    style={[
                      styles.resetButton,
                      {
                        borderColor: colors.gold,
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      },
                    ]}>
                    <Text style={[styles.resetButtonText, { color: colors.gold }]}>
                      Filtreleri Sıfırla
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#121417',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#121417',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dictionaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dictionaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, default: 8 }),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  categoriesWrapper: {
    marginBottom: Spacing.md,
  },
  categoriesContent: {
    gap: Spacing.xs + 2,
    paddingRight: Spacing.md,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  listContent: {
    paddingTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  resetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
