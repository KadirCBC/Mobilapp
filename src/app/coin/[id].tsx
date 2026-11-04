import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { getCoinById, MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 6;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dairesel sikke boyutu (Mobil genişliğine göre optimum ölçekleme)
const COIN_DIAMETER = Math.min(SCREEN_WIDTH * 0.62, 240);
const COMPOSITE_IMG_WIDTH = COIN_DIAMETER * 2.05; // 2:1 panoramik çift yüz görseli için ölçekli genişlik

export default function CoinDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  // Ön (avers) / Arka (revers) yüz durumu
  const [activeFace, setActiveFace] = useState<'obverse' | 'reverse'>('obverse');

  // Tam ekran modal önizleme durumu
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Koleksiyonuma Ekle / Favori durumu
  const [isCollected, setIsCollected] = useState(false);

  // 3D Dönme (Coin Flip) animasyon değeri
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isFlipping = useRef(false);

  // Sikkeyi id'ye göre bul (Dinamik taranan veya arşivdeki sikke)
  const coin = id ? getCoinById(id) : undefined;

  const handleShare = async () => {
    if (!coin) return;
    try {
      await Share.share({
        title: coin.title,
        message: `${coin.title} (${coin.civilization})\n\nDönem: ${coin.period}\nMateryal: ${coin.material}\nTahmini Değer: ${coin.estimatedValue}\n\nAntik Sikke & Tarihi Nümismatik Kataloğu`,
      });
    } catch {
      // Paylaşım iptal edildi
    }
  };

  const toggleCollection = () => {
    setIsCollected((prev) => !prev);
  };

  // Gerçekçi 3D Dönme / Çevirme Efekti
  const flipToFace = (targetFace: 'obverse' | 'reverse') => {
    if (targetFace === activeFace || isFlipping.current) return;
    isFlipping.current = true;

    // 1. Aşama: 0 dereceden 90 dereceye dönüş (sikke kenar çizgisine gelir, incelir)
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Tam 90 derecede (görünmez kenar anında) yüzü değiştir
      setActiveFace(targetFace);
      flipAnim.setValue(2);

      // 2. Aşama: -90 dereceden 0 dereceye dönüş (yeni yüz dönerek açılır)
      Animated.timing(flipAnim, {
        toValue: 3,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        flipAnim.setValue(0);
        isFlipping.current = false;
      });
    });
  };

  // Sikke görseline doğrudan tıklandığında da yüzü çevir
  const handleCoinTap = () => {
    flipToFace(activeFace === 'obverse' ? 'reverse' : 'obverse');
  };

  if (!coin) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={54} color={colors.primary} />
          <Text style={[styles.notFoundTitle, { color: colors.textPrimary }]}>
            Sikke Bulunamadı
          </Text>
          <Text style={[styles.notFoundDesc, { color: colors.textSecondary }]}>
            Aradığınız eser arşivde bulunamadı veya kaldırılmış olabilir.
          </Text>
          <TouchableOpacity
            style={[styles.backCatalogButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}>
            <Text style={styles.backCatalogText}>Arşive Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3D Dönme Dönüşümleri
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['0deg', '90deg', '-90deg', '0deg'],
  });

  const scale = flipAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 1.08, 1.08, 1],
  });

  // Tek karede çift yüz kompozit görseli kontrolü (Harici taranan tekil fotoğraflar için tam kaplama)
  const isComposite = coin.obverseImage === coin.reverseImage && !(coin as any).isScanned;
  const currentImage = activeFace === 'obverse' ? coin.obverseImage : coin.reverseImage;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* 1. ÜST BAR (Geri Dön, Medeniyet / Başlık, Favori, Paylaş) */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[
            styles.navButton,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarTitleWrapper}>
          <Text numberOfLines={1} style={[styles.topBarSub, { color: colors.primary }]}>
            {coin.civilization.toUpperCase()}
          </Text>
          <Text numberOfLines={1} style={[styles.topBarTitle, { color: colors.textPrimary }]}>
            {coin.title}
          </Text>
        </View>

        <View style={styles.topBarActions}>
          {/* Favoriye Ekle Butonu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleCollection}
            style={[
              styles.navButton,
              {
                backgroundColor: isCollected ? colors.primaryLight : colors.surfaceSubtle,
                borderColor: isCollected ? colors.primary : colors.border,
              },
            ]}>
            <Ionicons
              name={isCollected ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isCollected ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Paylaş Butonu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={[
              styles.navButton,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}>
            <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* 2. TEK YUVARLAK VİTRİN VE 3D DÖNME ALANI */}
          <View
            style={[
              styles.showcaseTray,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            {/* Üst Bilgi Rozeti & Tam Ekran Butonu */}
            <View style={styles.showcaseHeader}>
              <View
                style={[
                  styles.faceBadge,
                  {
                    backgroundColor: colors.primaryLight,
                    borderColor: 'rgba(158, 123, 59, 0.25)',
                  },
                ]}>
                <Ionicons name="sparkles" size={11} color={colors.primary} />
                <Text style={[styles.faceBadgeText, { color: colors.primary }]}>
                  {activeFace === 'obverse' ? 'ÖN YÜZ (AVERS)' : 'ARKA YÜZ (REVERS)'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setIsModalVisible(true)}
                style={[
                  styles.zoomButton,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}>
                <Ionicons name="scan-outline" size={13} color={colors.primary} />
                <Text style={[styles.zoomButtonText, { color: colors.textSecondary }]}>
                  Tam Ekran
                </Text>
              </TouchableOpacity>
            </View>

            {/* TEK YUVARLAK SİKKE ÇERÇEVESİ (3D DÖNME ANİMASYONLU) */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={handleCoinTap}
              style={styles.coinTouchArea}>
              <Animated.View
                style={[
                  styles.singleCoinFrame,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.surfaceSubtle,
                    transform: [{ rotateY }, { scale }],
                  },
                ]}>
                {isComposite ? (
                  // Çift Yüzlü Görseller İçin Tek Yuvarlak Maskeleme
                  <Image
                    source={{ uri: currentImage }}
                    style={activeFace === 'obverse' ? styles.compositeLeft : styles.compositeRight}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  // Bağımsız Avers/Revers URL'leri İçin Standart Kaplama
                  <Image
                    source={{ uri: currentImage }}
                    style={styles.singleCoinImage}
                    contentFit="cover"
                    transition={150}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Dokunma & Çevirme İpucu */}
            <View style={styles.tapHintRow}>
              <Ionicons name="sync-outline" size={13} color={colors.primary} />
              <Text style={[styles.tapHintText, { color: colors.textSecondary }]}>
                Sikkryi çevirmek için üzerine dokunun veya butonları kullanın
              </Text>
            </View>

            {/* Ön / Arka Yüz Seçim Butonları (Dönme Efekti Tetikler) */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => flipToFace('obverse')}
                style={[
                  styles.toggleButton,
                  activeFace === 'obverse'
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}>
                <Ionicons
                  name="disc"
                  size={16}
                  color={activeFace === 'obverse' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    activeFace === 'obverse'
                      ? { color: '#FFFFFF', fontWeight: '700' }
                      : { color: colors.textSecondary, fontWeight: '600' },
                  ]}>
                  Ön Yüz (Avers)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => flipToFace('reverse')}
                style={[
                  styles.toggleButton,
                  activeFace === 'reverse'
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}>
                <Ionicons
                  name="disc-outline"
                  size={16}
                  color={activeFace === 'reverse' ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    activeFace === 'reverse'
                      ? { color: '#FFFFFF', fontWeight: '700' }
                      : { color: colors.textSecondary, fontWeight: '600' },
                  ]}>
                  Arka Yüz (Revers)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. KOLEKSİYONUMA EKLE BUTONU */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleCollection}
            style={[
              styles.collectionButton,
              isCollected
                ? {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
            ]}>
            <Ionicons
              name={isCollected ? 'bookmark' : 'bookmark-outline'}
              size={19}
              color={isCollected ? '#FFFFFF' : colors.primary}
            />
            <Text
              style={[
                styles.collectionButtonText,
                { color: isCollected ? '#FFFFFF' : colors.primary },
              ]}>
              {isCollected ? 'Koleksiyonunuzda Kayıtlı' : 'Koleksiyonuma Ekle'}
            </Text>
            {isCollected && <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />}
          </TouchableOpacity>

          {/* 4. SİKKE BAŞLIĞI VE HÜKÜMDAR */}
          <View style={styles.titleSection}>
            <Text style={[styles.coinTitle, { color: colors.textPrimary }]}>
              {coin.title}
            </Text>
            <View style={styles.rulerRow}>
              <Ionicons name="person-outline" size={15} color={colors.primary} />
              <Text style={[styles.rulerName, { color: colors.textSecondary }]}>
                {coin.ruler}
              </Text>
            </View>
          </View>

          {/* 5. DEĞER & NADİRLİK ALANI (Altın Vurgulu Özel Kart) */}
          <View
            style={[
              styles.valueCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.valueRow}>
              <View style={styles.valueItem}>
                <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                  TAHMİNİ PİYASA DEĞERİ
                </Text>
                <Text style={[styles.valueAmount, { color: colors.primary }]}>
                  {coin.estimatedValue}
                </Text>
              </View>

              <View style={[styles.rarityDivider, { backgroundColor: colors.border }]} />

              <View style={styles.rarityItem}>
                <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                  NADİRLİK DERECESİ
                </Text>
                <View
                  style={[
                    styles.rarityBadge,
                    {
                      backgroundColor: colors.primaryLight,
                      borderColor: 'rgba(158, 123, 59, 0.25)',
                    },
                  ]}>
                  <Ionicons name="sparkles" size={12} color={colors.primary} />
                  <Text style={[styles.rarityText, { color: colors.primary }]}>
                    {coin.rarity}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 6. TEKNİK ÖZELLİK KUTULARI (2x2 Grid) */}
          <View style={styles.gridContainer}>
            {/* Materyal */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="cube-outline" size={19} color={colors.primary} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Materyal
              </Text>
              <Text style={[styles.gridValue, { color: colors.textPrimary }]}>
                {coin.material}
              </Text>
            </View>

            {/* Ağırlık */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="scale-outline" size={19} color={colors.primary} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Ağırlık
              </Text>
              <Text style={[styles.gridValue, { color: colors.textPrimary }]}>
                {coin.weight}
              </Text>
            </View>

            {/* Çap */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="radio-button-off" size={19} color={colors.primary} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Çap
              </Text>
              <Text style={[styles.gridValue, { color: colors.textPrimary }]}>
                {coin.diameter}
              </Text>
            </View>

            {/* Dönem */}
            <View
              style={[
                styles.gridBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="time-outline" size={19} color={colors.primary} />
              <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
                Dönem
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.gridValue, { color: colors.textPrimary }]}>
                {coin.period}
              </Text>
            </View>
          </View>

          {/* 7. DETAYLI AÇIKLAMALAR (Avers, Revers ve Tarihsel Önemi) */}
          <View style={styles.descriptionsContainer}>
            {/* Avers Betimlemesi */}
            <View
              style={[
                styles.descCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.descHeader}>
                <Ionicons name="eye-outline" size={18} color={colors.primary} />
                <Text style={[styles.descTitle, { color: colors.primary }]}>
                  Avers (Ön Yüz) Betimlemesi
                </Text>
              </View>
              <Text style={[styles.descBody, { color: colors.textPrimary }]}>
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
                <Ionicons name="sync-outline" size={18} color={colors.primary} />
                <Text style={[styles.descTitle, { color: colors.primary }]}>
                  Revers (Arka Yüz) Betimlemesi
                </Text>
              </View>
              <Text style={[styles.descBody, { color: colors.textPrimary }]}>
                {coin.reverseDesc}
              </Text>
            </View>

            {/* Tarihsel Arka Plan & Nümismatik Önemi */}
            <View
              style={[
                styles.descCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: 'rgba(158, 123, 59, 0.35)',
                },
              ]}>
              <View style={styles.descHeader}>
                <Ionicons name="book-outline" size={18} color={colors.primary} />
                <Text style={[styles.descTitle, { color: colors.primary }]}>
                  Tarihsel Arka Plan & Nümismatik Önemi
                </Text>
              </View>
              <Text style={[styles.descBody, styles.historyBody, { color: colors.textPrimary }]}>
                {coin.description}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 8. TAM EKRAN GÖRSEL İNCELEME MODALI */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSafeArea}>
            {/* Modal Üst Çubuk */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBlock}>
                <Text style={[styles.modalSub, { color: colors.primaryLight }]}>
                  YÜKSEK ÇÖZÜNÜRLÜKLÜ DETAY İNCELEME
                </Text>
                <Text style={styles.modalTitle}>
                  {activeFace === 'obverse' ? 'ÖN YÜZ (AVERS)' : 'ARKA YÜZ (REVERS)'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Modal Görsel Alanı (Tam Ekran) */}
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: currentImage }}
                style={styles.modalImage}
                contentFit="contain"
                transition={200}
              />
            </View>

            {/* Modal Alt Çubuk: Yüz Değiştirici */}
            <View style={styles.modalFooter}>
              <View style={styles.modalToggleRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveFace('obverse');
                  }}
                  style={[
                    styles.modalToggleBtn,
                    activeFace === 'obverse'
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : {
                          backgroundColor: 'rgba(255,255,255,0.12)',
                          borderColor: 'rgba(255,255,255,0.25)',
                        },
                  ]}>
                  <Text
                    style={[
                      styles.modalToggleText,
                      activeFace === 'obverse'
                        ? { color: '#FFFFFF', fontWeight: '700' }
                        : { color: '#FFFFFF' },
                    ]}>
                    Ön Yüz (Avers)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveFace('reverse');
                  }}
                  style={[
                    styles.modalToggleBtn,
                    activeFace === 'reverse'
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : {
                          backgroundColor: 'rgba(255,255,255,0.12)',
                          borderColor: 'rgba(255,255,255,0.25)',
                        },
                  ]}>
                  <Text
                    style={[
                      styles.modalToggleText,
                      activeFace === 'reverse'
                        ? { color: '#FFFFFF', fontWeight: '700' }
                        : { color: '#FFFFFF' },
                    ]}>
                    Arka Yüz (Revers)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHint}>
                {coin.title} • {coin.material} • {coin.diameter}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
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
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl + 40,
  },
  innerContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // 2. TEK YUVARLAK VİTRİN VE PLATFORM
  showcaseTray: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  showcaseHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  faceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
  },
  faceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  zoomButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // TEK YUVARLAK SİKKE
  coinTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  singleCoinFrame: {
    width: COIN_DIAMETER,
    height: COIN_DIAMETER,
    borderRadius: COIN_DIAMETER / 2,
    borderWidth: 3.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },
  singleCoinImage: {
    width: '100%',
    height: '100%',
  },
  // Panoramik Kompozit Görselde Sol Yarı (Avers)
  compositeLeft: {
    width: COMPOSITE_IMG_WIDTH,
    height: COIN_DIAMETER,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  // Panoramik Kompozit Görselde Sağ Yarı (Revers)
  compositeRight: {
    width: COMPOSITE_IMG_WIDTH,
    height: COIN_DIAMETER,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm + 2,
    marginBottom: Spacing.xs,
  },
  tapHintText: {
    fontSize: 11,
    fontWeight: '500',
  },

  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 13,
  },

  // 3. KOLEKSİYONUMA EKLE
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  collectionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  titleSection: {
    marginTop: Spacing.lg,
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

  // 5. DEĞER & NADİRLİK
  valueCard: {
    marginVertical: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  rarityDivider: {
    width: 1,
    height: 38,
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
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
    marginTop: 2,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // 6. TEKNİK ÖZELLİKLER (2x2 GRID)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  gridBox: {
    width: '48.5%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 3,
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

  // 7. DETAYLI AÇIKLAMALAR
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
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // MODAL
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 20, 23, 0.95)',
    justifyContent: 'space-between',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    height: SCREEN_HEIGHT * 0.55,
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
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    marginTop: 4,
  },
});
