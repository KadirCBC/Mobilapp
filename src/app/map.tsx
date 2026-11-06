import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Pattern,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { BorderRadius, Spacing } from '@/constants/theme';
import { api } from '@/services/api';
import {
  ANCIENT_MINTS,
  AncientMint,
  CHRONOLOGICAL_ERAS,
  ChronologicalEraId,
  getMintCoinCount,
  getMintCoins,
} from '@/data/ancientMints';
import { CoinItem } from '@/data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 6;

// British Museum & National Geographic Standartlarında Parşömen Paleti
const MUSEUM = {
  parchmentBg: '#F4EEDD', // Doğal antik parşömen kâğıdı
  parchmentDark: '#E8DFC8', // Gölgeli eskitme parşömen tonu
  parchmentBorder: '#C8BA9C', // Antik harita gravür çizgileri
  seaTint: '#E3ECF0', // Antik Akdeniz & Ege su tonu
  seaLines: 'rgba(112, 145, 168, 0.28)', // Rhumb / kerte seyir çizgileri
  goldAccent: '#9E7B3B', // Mat Antik Bronz & Altın
  goldBright: '#D4AF37', // Parlak Sikke Vurgusu
  inkDark: '#1E232B', // Gravür mürekkep siyahı
  inkMuted: '#64748B', // Açıklama gri tonu
  cardBg: '#FFFFFF', // Saf beyaz kart zeminleri
  cardBorder: 'rgba(158, 123, 59, 0.22)',
};

// Bottom Sheet Yükseklik Seviyeleri
const SHEET_COLLAPSED_HEIGHT = 210;
const SHEET_EXPANDED_HEIGHT = Math.min(SCREEN_HEIGHT * 0.74, 580);

export default function AncientMintsAtlasScreen() {
  const router = useRouter();

  // 1. Canlı Darphaneler & Zaman Çizelgesi
  const [mintsList, setMintsList] = useState<AncientMint[]>(ANCIENT_MINTS);
  const [activeEra, setActiveEra] = useState<ChronologicalEraId>('all');

  // 2. Seçili Antik Darphane (Varsayılan Sardis)
  const [selectedMint, setSelectedMint] = useState<AncientMint>(ANCIENT_MINTS[0]);

  // Canlı backend API'den darphaneleri senkronize et
  useEffect(() => {
    let isMounted = true;
    api.mints.list().then((serverMints) => {
      if (!isMounted || !serverMints || serverMints.length === 0) return;
      setMintsList((prev) => {
        return prev.map((localMint) => {
          const match = serverMints.find(
            (sm) =>
              sm.name.toLowerCase() === localMint.name.toLowerCase() ||
              (sm.ancient_name && localMint.ancientName && sm.ancient_name.toLowerCase() === localMint.ancientName.toLowerCase())
          );
          if (match && match.description) {
            return {
              ...localMint,
              description: match.description,
            };
          }
          return localMint;
        });
      });
    }).catch((err) => {
      console.warn('Backend mints sync failed, using local cache:', err);
    });
    return () => { isMounted = false; };
  }, []);

  // 3. Bottom Sheet Durumu & PanResponder
  const [isExpanded, setIsExpanded] = useState(false);
  const sheetHeightAnim = useRef(new Animated.Value(SHEET_COLLAPSED_HEIGHT)).current;

  // 4. Pin Nabız (Pulse) Animasyonu
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.55,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim, pulseOpacity]);

  // Bottom Sheet Pan Sürükleme Mantığı
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy < -40) {
            // Yukarı sürüklendi -> Genişlet
            toggleSheet(true);
          } else if (gestureState.dy > 40) {
            // Aşağı sürüklendi -> Daralt
            toggleSheet(false);
          }
        },
      }),
    [isExpanded]
  );

  const toggleSheet = (expand: boolean) => {
    setIsExpanded(expand);
    Animated.spring(sheetHeightAnim, {
      toValue: expand ? SHEET_EXPANDED_HEIGHT : SHEET_COLLAPSED_HEIGHT,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  // Seçili Darphanenin Arşivdeki Tüm Sikkeleri
  const mintCoins = useMemo(
    () => getMintCoins(selectedMint.filterKeyword, 20),
    [selectedMint]
  );
  const mintCoinCount = useMemo(
    () => getMintCoinCount(selectedMint.filterKeyword),
    [selectedMint]
  );

  // Bir darphane seçildiğinde
  const handleSelectMint = (mint: AncientMint) => {
    setSelectedMint(mint);
    // Yeni şehir seçilince pimi öne çıkar, kartı kompakt konumda tazele
    toggleSheet(false);
  };

  // Seçili çağda aktif olan darphane kontrolü
  const isMintActiveInEra = (mint: AncientMint) => {
    if (activeEra === 'all') return true;
    return mint.eras.includes(activeEra);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. ÜST ANTİK ATLAS BAŞLIĞI */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.back()}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={MUSEUM.inkDark} />
        </TouchableOpacity>

        <View style={styles.topTitleCenter}>
          <View style={styles.topAtlasBadgeRow}>
            <Ionicons name="compass-outline" size={12} color={MUSEUM.goldAccent} />
            <Text style={styles.topAtlasBadgeText}>BRITISH MUSEUM STANDARDI</Text>
          </View>
          <Text style={styles.topMainTitle}>Antik Darphaneler Atlası</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            router.push({
              pathname: '/(tabs)',
              params: { mint: selectedMint.filterKeyword },
            } as any);
          }}
          style={styles.catalogShortcutBtn}>
          <Ionicons name="albums-outline" size={17} color={MUSEUM.goldAccent} />
        </TouchableOpacity>
      </View>

      {/* 2. ZAMAN ÇİZELGESİ & ÇAĞ SEÇİCİ (CHRONOLOGICAL SLIDER) */}
      <View style={styles.eraSliderContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eraSliderContent}>
          {CHRONOLOGICAL_ERAS.map((era) => {
            const isSelected = era.id === activeEra;
            return (
              <TouchableOpacity
                key={era.id}
                activeOpacity={0.8}
                onPress={() => setActiveEra(era.id)}
                style={[
                  styles.eraChip,
                  isSelected && styles.eraChipActive,
                ]}>
                <View
                  style={[
                    styles.eraChipDot,
                    isSelected && { backgroundColor: '#FFFFFF' },
                  ]}
                />
                <View>
                  <Text
                    style={[
                      styles.eraChipLabel,
                      isSelected && styles.eraChipLabelActive,
                    ]}>
                    {era.label}
                  </Text>
                  <Text
                    style={[
                      styles.eraChipSub,
                      isSelected && styles.eraChipSubActive,
                    ]}>
                    {era.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. ANTİK KARTOGRAFİK HARİTA KANVASI (DETAYLI AKDENİZ & ANADOLU SVG) */}
      <View style={styles.mapCanvasWrapper}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 420 500"
          style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Parşömen Kâğıt Dokusu Geçişi */}
            <LinearGradient id="parchmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F7F1E1" />
              <Stop offset="50%" stopColor="#F4EEDD" />
              <Stop offset="100%" stopColor="#EBE1CA" />
            </LinearGradient>

            {/* Antik Deniz Dalgası Deseni */}
            <Pattern id="seaPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <Path
                d="M 0 10 Q 5 7 10 10 T 20 10"
                fill="none"
                stroke="rgba(112, 145, 168, 0.12)"
                strokeWidth="0.8"
              />
            </Pattern>
          </Defs>

          {/* Deniz Tabanı */}
          <Rect width="420" height="500" fill={MUSEUM.seaTint} />
          <Rect width="420" height="500" fill="url(#seaPattern)" />

          {/* Antik Kartografik Izgara & Rhumb Seyir Çizgileri */}
          <G stroke={MUSEUM.seaLines} strokeWidth="0.75">
            {/* Enlem ve Boylam Çizgileri */}
            <Line x1="0" y1="110" x2="420" y2="110" strokeDasharray="3 4" />
            <Line x1="0" y1="225" x2="420" y2="225" strokeDasharray="3 4" />
            <Line x1="0" y1="340" x2="420" y2="340" strokeDasharray="3 4" />
            <Line x1="105" y1="0" x2="105" y2="500" strokeDasharray="3 4" />
            <Line x1="210" y1="0" x2="210" y2="500" strokeDasharray="3 4" />
            <Line x1="315" y1="0" x2="315" y2="500" strokeDasharray="3 4" />

            {/* Antik Seyir Kerte Hatları (Nautical Rhumb Lines) */}
            <Line x1="190" y1="230" x2="10" y2="70" />
            <Line x1="190" y1="230" x2="410" y2="90" />
            <Line x1="190" y1="230" x2="90" y2="490" />
            <Line x1="190" y1="230" x2="360" y2="490" />
            <Line x1="190" y1="230" x2="415" y2="340" />
            <Line x1="190" y1="230" x2="5" y2="320" />
            <Line x1="190" y1="230" x2="220" y2="10" />
          </G>

          {/* GERÇEKÇİ ANTİK KARA KÜTLELERİ (PARŞÖMEN DOKULU) */}

          {/* 1. İtalya Yarımadası & Roma */}
          <Path
            d="M 10 50 Q 55 60 75 95 T 72 155 Q 60 190 48 215 L 75 235 Q 92 210 98 175 Q 102 125 72 65 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1.2"
          />
          {/* Sicilya (Trinacria) */}
          <Path
            d="M 44 230 L 78 240 L 62 262 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1"
          />

          {/* 2. Yunanistan / Attika / Makedonya */}
          <Path
            d="M 135 75 Q 185 65 210 100 Q 185 150 178 198 Q 168 235 180 255 L 158 268 Q 142 235 148 185 Q 138 135 135 75 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1.2"
          />
          {/* Peloponnesos (Mora Yarımadası) */}
          <Path
            d="M 155 265 Q 185 250 188 280 Q 170 300 150 288 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1"
          />

          {/* 3. Trakya, Boğazlar & Anadolu (Asia Minor - Lydia, Ionia, Mysia) */}
          <Path
            d="M 235 75 Q 295 70 380 60 Q 415 100 405 180 Q 390 220 365 242 L 320 258 Q 268 252 250 215 Q 260 175 245 150 Q 232 110 235 75 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1.2"
          />

          {/* 4. Girit Adası (Creta) */}
          <Path
            d="M 175 315 Q 225 310 265 315 Q 245 328 180 326 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1"
          />

          {/* 5. Kıbrıs Adası (Cyprus) */}
          <Path
            d="M 335 285 Q 365 278 385 282 Q 365 296 335 288 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1"
          />

          {/* 6. Levant / Suriye / Antakya Kıyısı */}
          <Path
            d="M 368 245 Q 390 240 420 250 L 420 360 Q 385 355 372 330 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1.2"
          />

          {/* 7. Mısır & Nil Deltası (Aegyptus / Alexandria) */}
          <Path
            d="M 230 395 Q 285 388 350 400 L 420 405 L 420 500 L 195 500 Q 205 430 230 395 Z"
            fill="url(#parchmentGrad)"
            stroke={MUSEUM.parchmentBorder}
            strokeWidth="1.2"
          />

          {/* ANTİK DENİZ VE BÖLGE İSİMLERİ (KLASİK LATİN LEJANTLARI) */}
          <SvgText
            x="60"
            y="320"
            fill="rgba(100, 116, 139, 0.45)"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="2">
            MARE INTERNUM
          </SvgText>
          <SvgText
            x="192"
            y="210"
            fill="rgba(100, 116, 139, 0.48)"
            fontSize="8"
            fontWeight="bold"
            letterSpacing="1.8">
            MARE AEGAEUM
          </SvgText>
          <SvgText
            x="300"
            y="48"
            fill="rgba(100, 116, 139, 0.42)"
            fontSize="7.5"
            fontWeight="bold"
            letterSpacing="1.5">
            PONTUS EUXINUS
          </SvgText>
          <SvgText
            x="280"
            y="135"
            fill="rgba(158, 123, 59, 0.45)"
            fontSize="9.5"
            fontWeight="bold"
            letterSpacing="2">
            ASIA MINOR
          </SvgText>
          <SvgText
            x="275"
            y="445"
            fill="rgba(158, 123, 59, 0.4)"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="2">
            AEGYPTUS
          </SvgText>

          {/* ANTİK PUSULA GÜLÜ (ORNATE 16-POINT COMPASS ROSE) */}
          <G transform="translate(68, 385)">
            <Circle cx="0" cy="0" r="26" stroke={MUSEUM.goldAccent} strokeWidth="1" fill="none" opacity="0.4" />
            <Circle cx="0" cy="0" r="18" stroke={MUSEUM.goldAccent} strokeWidth="0.8" fill="none" opacity="0.3" />
            <Path d="M 0 -26 L 5 -8 L 0 0 L -5 -8 Z" fill={MUSEUM.goldBright} />
            <Path d="M 0 26 L 5 8 L 0 0 L -5 8 Z" fill="rgba(158, 123, 59, 0.5)" />
            <Path d="M 26 0 L 8 5 L 0 0 L 8 -5 Z" fill={MUSEUM.goldBright} />
            <Path d="M -26 0 L -8 5 L 0 0 L -8 -5 Z" fill="rgba(158, 123, 59, 0.5)" />
            <Circle cx="0" cy="0" r="3.5" fill={MUSEUM.goldAccent} />
            <SvgText x="-3" y="-30" fill={MUSEUM.goldAccent} fontSize="8" fontWeight="bold">
              N
            </SvgText>
          </G>
        </Svg>

        {/* 4. ANTİK MADEN ROZETİ PİNLERİ (SİKKE KABARTMALI & NABIZ EFEKTLİ) */}
        {mintsList.map((mint) => {
          const isSelected = mint.id === selectedMint.id;
          const isActive = isMintActiveInEra(mint);

          return (
            <TouchableOpacity
              key={mint.id}
              activeOpacity={0.88}
              onPress={() => handleSelectMint(mint)}
              style={[
                styles.mapPinAnchor,
                {
                  left: `${mint.coordinates.xPercent}%`,
                  top: `${mint.coordinates.yPercent}%`,
                  opacity: isActive ? 1 : 0.28,
                  transform: [{ scale: isSelected ? 1.08 : 0.95 }],
                },
              ]}>
              {/* Seçili Pinde Dışa Doğru Yayılan Altın Nabız (Pulse) Halkası */}
              {isSelected && (
                <Animated.View
                  style={[
                    styles.pinPulseRing,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: pulseOpacity,
                    },
                  ]}
                  pointerEvents="none"
                />
              )}

              {/* Antik Sikke Kabartması Madalyon Rozeti */}
              <View
                style={[
                  styles.pinMedallionFrame,
                  isSelected && styles.pinMedallionFrameSelected,
                ]}>
                <Image
                  source={{ uri: mint.coinEmbossImage }}
                  style={styles.pinCoinImg}
                  contentFit="cover"
                />
              </View>

              {/* Şehir İsim Bayrağı */}
              <View
                style={[
                  styles.pinNamePill,
                  isSelected && styles.pinNamePillSelected,
                ]}>
                <Text
                  style={[
                    styles.pinNameText,
                    isSelected && styles.pinNameTextSelected,
                  ]}>
                  {mint.name.split(' ')[0]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 5. MODERN DRAGGABLE BOTTOM SHEET (SİKKE KEŞİF ÇEKMECESİ) */}
      <Animated.View
        style={[
          styles.bottomSheetCard,
          { height: sheetHeightAnim },
        ]}>
        {/* Çekmece Tutamaç Barı (Draggable PanResponder & Dokunma Alanı) */}
        <View {...panResponder.panHandlers} style={styles.sheetHandleBar}>
          <View style={styles.sheetHandlePill} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSheet(!isExpanded)}
            style={styles.sheetToggleBtn}>
            <Text style={styles.sheetToggleText}>
              {isExpanded ? 'Haritayı Göster' : 'Kataloğu Genişlet'}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-up'}
              size={13}
              color={MUSEUM.goldAccent}
            />
          </TouchableOpacity>
        </View>

        {/* KOMPAKT / BAŞLIK BÖLÜMÜ */}
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.sheetTagRow}>
              <View style={styles.sheetRegionBadge}>
                <Ionicons name="business-outline" size={11} color={MUSEUM.goldAccent} />
                <Text style={styles.sheetRegionText}>{selectedMint.region}</Text>
              </View>
              <Text style={styles.sheetEraText}>{selectedMint.founded}</Text>
            </View>

            <Text style={styles.sheetMintTitle}>{selectedMint.name}</Text>
            <Text style={styles.sheetAncientName}>{selectedMint.ancientName}</Text>
          </View>

          {/* Arşiv Eser Sayısı Rozeti */}
          <View style={styles.sheetCountBadge}>
            <Text style={styles.sheetCountNumber}>{mintCoinCount}</Text>
            <Text style={styles.sheetCountLabel}>Eser</Text>
          </View>
        </View>

        {/* EN ÜNLÜ SİKKE SERİSİ ROZETİ */}
        <View style={styles.sheetFamousBox}>
          <View style={styles.sheetFamousImgBox}>
            <Image
              source={{ uri: selectedMint.coinEmbossImage }}
              style={styles.sheetFamousImg}
              contentFit="cover"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetFamousTag}>EN MEŞHUR SİKKE SERİSİ</Text>
            <Text style={styles.sheetFamousCoinTitle} numberOfLines={1}>
              {selectedMint.famousCoin}
            </Text>
            <Text style={styles.sheetFamousMeta}>
              {selectedMint.primaryMetal} • {selectedMint.famousRuler}
            </Text>
          </View>
        </View>

        {/* GENİŞLETİLMİŞ İÇERİK: 2 SÜTUNLU ZENGİN SİKKE IZGARASI */}
        {isExpanded && (
          <ScrollView
            style={styles.sheetExpandedScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetExpandedScrollContent}>
            <View style={styles.historyNoteBox}>
              <Ionicons name="book-outline" size={14} color={MUSEUM.goldAccent} />
              <Text style={styles.historyNoteText}>{selectedMint.description}</Text>
            </View>

            <View style={styles.gridSectionHeader}>
              <Text style={styles.gridSectionTitle}>
                {selectedMint.name.split(' ')[0]} Darphanesinin Eserleri ({mintCoins.length})
              </Text>
              <Text style={styles.gridSectionSub}>
                Avers ve revers yüksek çözünürlüklü arşiv kayıtları
              </Text>
            </View>

            {/* 2 Sütunlu Sikke Listesi */}
            <View style={styles.coinsTwoColGrid}>
              {mintCoins.map((coin) => (
                <TouchableOpacity
                  key={coin.id}
                  activeOpacity={0.82}
                  onPress={() => router.push(`/coin/${coin.id}` as any)}
                  style={styles.coinGridCard}>
                  {/* Çift Yüz Önizleme (Avers & Revers) */}
                  <View style={styles.coinFacesRow}>
                    <Image
                      source={{ uri: coin.obverseImage }}
                      style={styles.coinFaceThumb}
                      contentFit="cover"
                    />
                    <Image
                      source={{ uri: coin.reverseImage }}
                      style={styles.coinFaceThumb}
                      contentFit="cover"
                    />
                  </View>

                  <Text style={styles.coinGridTitle} numberOfLines={2}>
                    {coin.title}
                  </Text>
                  <Text style={styles.coinGridRuler} numberOfLines={1}>
                    {coin.ruler}
                  </Text>

                  <View style={styles.coinGridFooter}>
                    <View style={styles.rarityPill}>
                      <Text style={styles.rarityPillText}>{coin.rarity.split(' ')[0]}</Text>
                    </View>
                    <Text style={styles.coinGridPrice}>{coin.estimatedValue}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ALT ANA EYLEM BUTONU */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            router.push({
              pathname: '/(tabs)',
              params: { mint: selectedMint.filterKeyword },
            } as any);
          }}
          style={styles.exploreMintBtn}>
          <View style={styles.exploreBtnContent}>
            <Ionicons name="scan-outline" size={17} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>
              Bu Darphanenin Tüm Sikkelerini Vitrinde İncele ({mintCoinCount})
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // 1. Üst Başlık Barı
  topBar: {
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    zIndex: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  topTitleCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  topAtlasBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  topAtlasBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: MUSEUM.goldAccent,
    letterSpacing: 1,
  },
  topMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: MUSEUM.inkDark,
    letterSpacing: -0.2,
  },
  catalogShortcutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(158, 123, 59, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.25)',
  },

  // 2. Zaman Çizelgesi & Çağ Seçici (Chronological Slider)
  eraSliderContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  eraSliderContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  eraChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  eraChipActive: {
    backgroundColor: MUSEUM.goldAccent,
    borderColor: MUSEUM.goldBright,
    shadowColor: MUSEUM.goldAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  eraChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MUSEUM.goldAccent,
  },
  eraChipLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  eraChipLabelActive: {
    color: '#FFFFFF',
  },
  eraChipSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 0.5,
  },
  eraChipSubActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // 3. Harita Kanvası
  mapCanvasWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: MUSEUM.seaTint,
  },
  mapPinAnchor: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 10,
  },
  pinPulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: MUSEUM.goldBright,
    top: -4,
  },
  pinMedallionFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: MUSEUM.goldAccent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 6,
  },
  pinMedallionFrameSelected: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: MUSEUM.goldBright,
    shadowColor: MUSEUM.goldAccent,
    shadowOpacity: 0.65,
    shadowRadius: 9,
    elevation: 9,
  },
  pinCoinImg: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  pinNamePill: {
    marginTop: 3,
    backgroundColor: 'rgba(26, 29, 36, 0.88)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pinNamePillSelected: {
    backgroundColor: MUSEUM.goldAccent,
    borderColor: '#FFFFFF',
  },
  pinNameText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  pinNameTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // 4. Modern Draggable Bottom Sheet
  bottomSheetCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.md,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(158, 123, 59, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 30,
  },
  sheetHandleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 4,
  },
  sheetToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetToggleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: MUSEUM.goldAccent,
    letterSpacing: 0.2,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  sheetTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  sheetRegionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(158, 123, 59, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sheetRegionText: {
    fontSize: 10,
    fontWeight: '700',
    color: MUSEUM.goldAccent,
  },
  sheetEraText: {
    fontSize: 10,
    color: MUSEUM.inkMuted,
    fontWeight: '600',
  },
  sheetMintTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: MUSEUM.inkDark,
    letterSpacing: -0.2,
  },
  sheetAncientName: {
    fontSize: 11,
    fontStyle: 'italic',
    color: MUSEUM.goldAccent,
    marginTop: 1,
  },
  sheetCountBadge: {
    backgroundColor: 'rgba(158, 123, 59, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
  },
  sheetCountNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: MUSEUM.goldAccent,
    lineHeight: 18,
  },
  sheetCountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: MUSEUM.inkMuted,
    textTransform: 'uppercase',
  },

  // En Ünlü Sikke Serisi Kutusu
  sheetFamousBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: Spacing.xs + 2,
  },
  sheetFamousImgBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: MUSEUM.goldBright,
    overflow: 'hidden',
  },
  sheetFamousImg: {
    width: '100%',
    height: '100%',
  },
  sheetFamousTag: {
    fontSize: 8.5,
    fontWeight: '800',
    color: MUSEUM.goldAccent,
    letterSpacing: 0.8,
  },
  sheetFamousCoinTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: MUSEUM.inkDark,
    marginTop: 1,
  },
  sheetFamousMeta: {
    fontSize: 10,
    color: MUSEUM.inkMuted,
    marginTop: 1,
  },

  // Genişletilmiş Çekmece Bölümü
  sheetExpandedScroll: {
    flex: 1,
    marginVertical: 4,
  },
  sheetExpandedScrollContent: {
    paddingBottom: Spacing.md,
  },
  historyNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(158, 123, 59, 0.08)',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.25)',
    marginBottom: Spacing.sm,
  },
  historyNoteText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    flex: 1,
  },
  gridSectionHeader: {
    marginBottom: 8,
  },
  gridSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: MUSEUM.inkDark,
  },
  gridSectionSub: {
    fontSize: 10.5,
    color: MUSEUM.inkMuted,
    marginTop: 1,
  },

  // 2 Sütunlu Sikke Izgarası
  coinsTwoColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  coinGridCard: {
    width: (SCREEN_WIDTH - Spacing.md * 2 - 10) / 2,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  coinFacesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  coinFaceThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
    backgroundColor: '#1E232B',
  },
  coinGridTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MUSEUM.inkDark,
    lineHeight: 14,
    minHeight: 28,
  },
  coinGridRuler: {
    fontSize: 9.5,
    color: MUSEUM.inkMuted,
    marginTop: 2,
  },
  coinGridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  rarityPill: {
    backgroundColor: 'rgba(158, 123, 59, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: MUSEUM.goldAccent,
  },
  coinGridPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },

  // İncele Butonu
  exploreMintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MUSEUM.goldAccent,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: 6,
    shadowColor: MUSEUM.goldAccent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  exploreBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  exploreBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
