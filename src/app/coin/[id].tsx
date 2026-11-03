import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CoinDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const colors = theme ?? Colors.dark;

  // Ön (avers) / Arka (revers) yüz durumu
  const [activeFace, setActiveFace] = useState<'obverse' | 'reverse'>('obverse');

  // Tam ekran modal önizleme durumu
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Koleksiyonuma Ekle / Favori durumu
  const [isCollected, setIsCollected] = useState(false);

  // Sikkeyi id'ye göre bul
  const coin = MOCK_COINS.find((item) => item.id === id);

  const handleShare = async () => {
    if (!coin) return;
    try {
      await Share.share({
        title: coin.title,
        message: `${coin.title} (${coin.civilization})\n\nDönem: ${coin.period}\nMateryal: ${coin.material}\nTahmini Değer: ${coin.estimatedValue}\n\nAntik Sikke & Tarihi Obje Galerisi`,
      });
    } catch {
      // Paylaşım iptal edildi veya desteklenmiyor
    }
  };

  const toggleCollection = () => {
    setIsCollected((prev) => !prev);
  };

  if (!coin) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={54} color={colors.gold} />
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>
            Sikke Bulunamadı
          </Text>
          <Text style={[styles.notFoundDesc, { color: colors.textSecondary }]}>
            Aradığınız eser arşivde bulunamadı veya kaldırılmış olabilir.
          </Text>
          <TouchableOpacity
            style={[styles.backCatalogButton, { backgroundColor: colors.gold }]}
            onPress={() => router.back()}>
            <Text style={styles.backCatalogText}>Arşive Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentImage =
    activeFace === 'obverse' ? coin.obverseImage : coin.reverseImage;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}>
      <StatusBar style="light" />

      {/* 1. ÜST BAR (Geri Dön, Başlık, Favori, Paylaş) */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.topBarTitleWrapper}>
          <Text style={[styles.topBarSub, { color: colors.gold }]}>
            {coin.civilization.toUpperCase()}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.topBarTitle, { color: colors.text }]}>
            {coin.title}
          </Text>
        </View>

        <View style={styles.topBarActions}>
          {/* Hızlı Favori Butonu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleCollection}
            style={[
              styles.navButton,
              {
                backgroundColor: isCollected ? 'rgba(212, 175, 55, 0.2)' : colors.surface,
                borderColor: isCollected ? colors.gold : colors.border,
              },
            ]}>
            <Ionicons
              name={isCollected ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isCollected ? colors.gold : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Paylaş Butonu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="share-social-outline" size={18} color={colors.gold} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* 2. BÜYÜK GÖRSEL ALANI & ÖN/ARKA YÜZ DEĞİŞTİRİCİ */}
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => setIsModalVisible(true)}
            style={[
              styles.imageContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderGold,
              },
            ]}>
            {/* Rozet gösterge */}
            <View style={[styles.faceBadge, { backgroundColor: 'rgba(18, 20, 23, 0.88)', borderColor: colors.borderGold }]}>
              <Text style={[styles.faceBadgeText, { color: colors.gold }]}>
                {activeFace === 'obverse' ? 'AVERS (ÖN YÜZ)' : 'REVERS (ARKA YÜZ)'}
              </Text>
            </View>

            {/* Büyütme / Tam Ekran Rozeti */}
            <View style={[styles.zoomHintBadge, { backgroundColor: 'rgba(18, 20, 23, 0.88)', borderColor: colors.borderGold }]}>
              <Ionicons name="scan-outline" size={13} color={colors.gold} />
              <Text style={[styles.zoomHintText, { color: colors.textSecondary }]}>
                Tam Ekran İncele
              </Text>
            </View>

            <Image
              source={{ uri: currentImage }}
              style={styles.mainImage}
              contentFit="contain"
              transition={300}
            />
          </TouchableOpacity>

          {/* Ön / Arka Yüz Butonları */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveFace('obverse')}
              style={[
                styles.toggleButton,
                activeFace === 'obverse'
                  ? { backgroundColor: colors.gold, borderColor: colors.goldLight }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons
                name="disc"
                size={16}
                color={activeFace === 'obverse' ? '#121417' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  activeFace === 'obverse'
                    ? { color: '#121417', fontWeight: '700' }
                    : { color: colors.textSecondary, fontWeight: '500' },
                ]}>
                Ön Yüz (Avers)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveFace('reverse')}
              style={[
                styles.toggleButton,
                activeFace === 'reverse'
                  ? { backgroundColor: colors.gold, borderColor: colors.goldLight }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons
                name="disc-outline"
                size={16}
                color={activeFace === 'reverse' ? '#121417' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  activeFace === 'reverse'
                    ? { color: '#121417', fontWeight: '700' }
                    : { color: colors.textSecondary, fontWeight: '500' },
                ]}>
                Arka Yüz (Revers)
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. KOLEKSİYONUMA EKLE / FAVORİYE AL BUTONU */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={toggleCollection}
            style={[
              styles.collectionButton,
              isCollected
                ? {
                    backgroundColor: colors.gold,
                    borderColor: colors.goldLight,
                  }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderGold,
                  },
            ]}>
            <Ionicons
              name={isCollected ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isCollected ? '#121417' : colors.gold}
            />
            <Text
              style={[
                styles.collectionButtonText,
                { color: isCollected ? '#121417' : colors.gold },
              ]}>
              {isCollected ? 'Koleksiyonunuzda Kayıtlı' : 'Koleksiyonuma Ekle'}
            </Text>
            {isCollected && (
              <Ionicons name="checkmark-circle" size={17} color="#121417" />
            )}
          </TouchableOpacity>

          {/* Sikke Başlığı ve Hükümdar */}
          <View style={styles.titleSection}>
            <Text style={[styles.coinTitle, { color: colors.text }]}>
              {coin.title}
            </Text>
            <View style={styles.rulerRow}>
              <Ionicons name="person-outline" size={15} color={colors.gold} />
              <Text style={[styles.rulerName, { color: colors.textSecondary }]}>
                {coin.ruler}
              </Text>
            </View>
          </View>

          {/* 4. DEĞER ALANI (Altın Çerçeveli Özel Kart) */}
          <View
            style={[
              styles.valueCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.gold,
              },
            ]}>
            <View style={styles.valueRow}>
              <View style={styles.valueItem}>
                <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                  TAHMİNİ PİYASA DEĞERİ
                </Text>
                <Text style={[styles.valueAmount, { color: colors.gold }]}>
                  {coin.estimatedValue}
                </Text>
              </View>

              <View style={styles.rarityDivider} />

              <View style={styles.rarityItem}>
                <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                  NADİRLİK
                </Text>
                <View
                  style={[
                    styles.rarityBadge,
                    {
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      borderColor: colors.borderGold,
                    },
                  ]}>
                  <Ionicons name="sparkles" size={12} color={colors.gold} />
                  <Text style={[styles.rarityText, { color: colors.goldLight }]}>
                    {coin.rarity}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 5. BİLGİ KUTUCUKLARI (2x2 Grid) */}
          <View style={styles.gridContainer}>
            {/* Materyal */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="cube-outline" size={20} color={colors.gold} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Materyal
              </Text>
              <Text style={[styles.gridValue, { color: colors.text }]}>
                {coin.material}
              </Text>
            </View>

            {/* Ağırlık */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="scale-outline" size={20} color={colors.gold} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Ağırlık
              </Text>
              <Text style={[styles.gridValue, { color: colors.text }]}>
                {coin.weight}
              </Text>
            </View>

            {/* Çap */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="radio-button-off" size={20} color={colors.gold} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Çap
              </Text>
              <Text style={[styles.gridValue, { color: colors.text }]}>
                {coin.diameter}
              </Text>
            </View>

            {/* Basım Dönemi */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="time-outline" size={20} color={colors.gold} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Dönem
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.gridValue, { color: colors.text }]}>
                {coin.period}
              </Text>
            </View>
          </View>

          {/* 6. METİN ALANLARI (Avers, Revers ve Tarihsel Açıklama) */}
          <View style={styles.descriptionsContainer}>
            {/* Avers Betimlemesi */}
            <View
              style={[
                styles.descCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.descHeader}>
                <Ionicons name="eye-outline" size={18} color={colors.gold} />
                <Text style={[styles.descTitle, { color: colors.goldLight }]}>
                  Avers (Ön Yüz) Betimlemesi
                </Text>
              </View>
              <Text style={[styles.descBody, { color: colors.text }]}>
                {coin.obverseDesc}
              </Text>
            </View>

            {/* Revers Betimlemesi */}
            <View
              style={[
                styles.descCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.descHeader}>
                <Ionicons name="sync-outline" size={18} color={colors.gold} />
                <Text style={[styles.descTitle, { color: colors.goldLight }]}>
                  Revers (Arka Yüz) Betimlemesi
                </Text>
              </View>
              <Text style={[styles.descBody, { color: colors.text }]}>
                {coin.reverseDesc}
              </Text>
            </View>

            {/* Tarihsel Arka Plan ve Nümizmatik Önemi */}
            <View
              style={[
                styles.descCard,
                { backgroundColor: colors.surface, borderColor: colors.borderGold },
              ]}>
              <View style={styles.descHeader}>
                <Ionicons name="book-outline" size={18} color={colors.gold} />
                <Text style={[styles.descTitle, { color: colors.goldLight }]}>
                  Tarihsel Arka Plan & Nümizmatik Önemi
                </Text>
              </View>
              <Text style={[styles.descBody, styles.historyBody, { color: colors.text }]}>
                {coin.description}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 7. TAM EKRAN GÖRSEL İNCELEME MODALI */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalSafeArea}>
            {/* Modal Üst Çubuk */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBlock}>
                <Text style={[styles.modalSub, { color: colors.gold }]}>
                  YÜKSEK ÇÖZÜNÜRLÜKLÜ DETAY İNCELEME
                </Text>
                <Text style={styles.modalTitle}>
                  {activeFace === 'obverse' ? 'ÖN YÜZ (AVERS)' : 'ARKA YÜZ (REVERS)'}
                </Text>
              </View>

              {/* Kapat Butonu */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCloseButton}>
                <Ionicons name="close" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Modal Görsel Alanı */}
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: currentImage }}
                style={styles.modalImage}
                contentFit="contain"
                transition={200}
              />
            </View>

            {/* Modal Alt Çubuk: Yüz Değiştirici ve Bilgi */}
            <View style={styles.modalFooter}>
              <View style={styles.modalToggleRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveFace('obverse')}
                  style={[
                    styles.modalToggleBtn,
                    activeFace === 'obverse'
                      ? { backgroundColor: colors.gold, borderColor: colors.goldLight }
                      : { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' },
                  ]}>
                  <Text
                    style={[
                      styles.modalToggleText,
                      activeFace === 'obverse' ? { color: '#121417', fontWeight: '700' } : { color: '#FFF' },
                    ]}>
                    Ön Yüz (Avers)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveFace('reverse')}
                  style={[
                    styles.modalToggleBtn,
                    activeFace === 'reverse'
                      ? { backgroundColor: colors.gold, borderColor: colors.goldLight }
                      : { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' },
                  ]}>
                  <Text
                    style={[
                      styles.modalToggleText,
                      activeFace === 'reverse' ? { color: '#121417', fontWeight: '700' } : { color: '#FFF' },
                    ]}>
                    Arka Yüz (Revers)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHint}>
                {coin.title} • {coin.material} • {coin.diameter}
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  topBarTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  topBarSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl + 30,
  },
  innerContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 310,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  faceBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    zIndex: 10,
  },
  faceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  zoomHintBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    zIndex: 10,
  },
  zoomHintText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mainImage: {
    width: '88%',
    height: '88%',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 13,
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    marginTop: Spacing.sm + 2,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  collectionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  titleSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  coinTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  rulerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  rulerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  valueCard: {
    marginVertical: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueItem: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  rarityDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    marginHorizontal: Spacing.md,
  },
  rarityItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: 2,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  gridBox: {
    width: '48.5%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  descriptionsContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  descCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  descHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.xs + 2,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  descBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  historyBody: {
    lineHeight: 23,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  notFoundDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  backCatalogButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  backCatalogText: {
    color: '#121417',
    fontWeight: '700',
    fontSize: 14,
  },

  // Modal Stilleri
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 9, 11, 0.96)',
    justifyContent: 'space-between',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  modalHeaderTitleBlock: {
    flex: 1,
  },
  modalSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  modalCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  modalImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
  },
  modalFooter: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    maxWidth: 360,
  },
  modalToggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalToggleText: {
    fontSize: 13,
  },
  modalHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 4,
  },
});
