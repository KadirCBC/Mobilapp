import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { CoinItem, MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TARGET_SIZE = Math.min(SCREEN_WIDTH * 0.4, 150);

export default function ScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  // Analiz durumları: 'idle' | 'scanning' | 'matched'
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'matched'>('idle');
  const [activeStep, setActiveStep] = useState<'obverse' | 'reverse'>('obverse');
  const [recognizedCoin, setRecognizedCoin] = useState<CoinItem>(MOCK_COINS[0]);
  const [matchPercentage, setMatchPercentage] = useState(98.6);

  // Lazer tarama çizgisi animasyonu
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Dairesel vizörün sürekli hafif nabız efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Tarama simülasyonunu başlat
  const startScanSimulation = (sampleCoin?: CoinItem) => {
    const target = sampleCoin ?? MOCK_COINS[Math.floor(Math.random() * Math.min(MOCK_COINS.length, 6))];
    setRecognizedCoin(target);
    setScanState('scanning');

    // Lazer dikey tarama animasyonu
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 2 }
    ).start();

    // 2.4 saniye sonra yapay zeka eşleşmesini göster
    setTimeout(() => {
      setMatchPercentage(Number((97.5 + Math.random() * 2.2).toFixed(1)));
      setScanState('matched');
    }, 2400);
  };

  const handleReset = () => {
    setScanState('idle');
    setActiveStep('obverse');
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-TARGET_SIZE / 2, TARGET_SIZE / 2],
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* 1. ÜST BAŞLIK */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              OPTİK ARKEOLOJİ & YAPAY ZEKA
            </Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Sikke Tanıma & Tarama
            </Text>
          </View>
          <View
            style={[
              styles.aiBadge,
              { backgroundColor: colors.primaryLight, borderColor: 'rgba(158, 123, 59, 0.3)' },
            ]}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI v4.2</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + Spacing.xxl },
        ]}>
        {/* 2. VİZÖR VE KAMERA ALANI */}
        <View
          style={[
            styles.viewfinderCard,
            { backgroundColor: '#1A1D20', borderColor: colors.border },
          ]}>
          {/* Vizör Üst Başlığı */}
          <View style={styles.viewfinderTopRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>KAMERA VİZÖRÜ (CANLI)</Text>
            </View>
            <Text style={styles.guideStepText}>
              {activeStep === 'obverse' ? '1. Adım: Ön Yüz' : '2. Adım: Arka Yüz'}
            </Text>
          </View>

          {/* İKİ DAİRESEL HİZALAMA ÇEMBERİ (AVERS & REVERS) */}
          <View style={styles.reticleContainer}>
            {/* Ön Yüz Çerçevesi */}
            <View style={styles.targetWrapper}>
              <Animated.View
                style={[
                  styles.circleTarget,
                  activeStep === 'obverse'
                    ? { borderColor: colors.primary, transform: [{ scale: pulseAnim }] }
                    : { borderColor: 'rgba(255, 255, 255, 0.3)' },
                ]}>
                <Image
                  source={{ uri: recognizedCoin.obverseImage }}
                  style={[
                    styles.targetCoinImg,
                    scanState === 'idle' && { opacity: 0.25 },
                  ]}
                  contentFit="cover"
                />
                {/* Lazer Tarama Çizgisi */}
                {scanState === 'scanning' && activeStep === 'obverse' && (
                  <Animated.View
                    style={[
                      styles.laserLine,
                      { transform: [{ translateY: scanLineTranslateY }] },
                    ]}
                  />
                )}
                {/* Köşe Nişangahları */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </Animated.View>
              <Text style={styles.targetLabel}>ÖN YÜZ (AVERS)</Text>
            </View>

            {/* Arka Yüz Çerçevesi */}
            <View style={styles.targetWrapper}>
              <Animated.View
                style={[
                  styles.circleTarget,
                  activeStep === 'reverse'
                    ? { borderColor: colors.primary, transform: [{ scale: pulseAnim }] }
                    : { borderColor: 'rgba(255, 255, 255, 0.3)' },
                ]}>
                <Image
                  source={{ uri: recognizedCoin.reverseImage }}
                  style={[
                    styles.targetCoinImg,
                    scanState === 'idle' && { opacity: 0.25 },
                  ]}
                  contentFit="cover"
                />
                {/* Lazer Tarama Çizgisi */}
                {scanState === 'scanning' && activeStep === 'reverse' && (
                  <Animated.View
                    style={[
                      styles.laserLine,
                      { transform: [{ translateY: scanLineTranslateY }] },
                    ]}
                  />
                )}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </Animated.View>
              <Text style={styles.targetLabel}>ARKA YÜZ (REVERS)</Text>
            </View>
          </View>

          {/* Tarama Kılavuz Açıklaması */}
          <Text style={styles.viewfinderInstructions}>
            {scanState === 'scanning'
              ? 'Yapay zeka rölyef, maden spektrometresi ve lejant analizi yapıyor...'
              : 'Sikkenin ön ve arka yüzünü yukarıdaki dairesel kılavuz halkalarına hizalayın.'}
          </Text>

          {/* Deklanşör & Tarama Butonu */}
          {scanState !== 'matched' && (
            <View style={styles.shutterRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => startScanSimulation()}
                style={[
                  styles.shutterBtn,
                  { backgroundColor: colors.primary },
                  scanState === 'scanning' && { opacity: 0.7 },
                ]}>
                <Ionicons
                  name={scanState === 'scanning' ? 'sync' : 'scan'}
                  size={22}
                  color="#FFFFFF"
                />
                <Text style={styles.shutterBtnText}>
                  {scanState === 'scanning' ? 'Analiz Ediliyor...' : 'Sikkeyi Tara & Tanı'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. YAPAY ZEKA EŞLEŞME SONUCU (MATCHED CARD) */}
        {scanState === 'matched' && (
          <View
            style={[
              styles.matchCard,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}>
            {/* Eşleşme Oranı Rozeti */}
            <View style={styles.matchHeaderRow}>
              <View
                style={[
                  styles.matchPill,
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                ]}>
                <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                <Text style={[styles.matchPillText, { color: colors.primary }]}>
                  %{matchPercentage} Doğrulukla Eşleşti
                </Text>
              </View>
              <Text style={[styles.matchRarity, { color: colors.primary }]}>
                {recognizedCoin.rarity}
              </Text>
            </View>

            {/* Sikke Başlığı & Dönem */}
            <Text style={[styles.matchCoinTitle, { color: colors.textPrimary }]}>
              {recognizedCoin.title}
            </Text>
            <Text style={[styles.matchCoinRuler, { color: colors.textSecondary }]}>
              {recognizedCoin.ruler} • {recognizedCoin.civilization}
            </Text>

            {/* Algılanan Teknik Nitelikler */}
            <View
              style={[
                styles.specSummaryBox,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              ]}>
              <View style={styles.specMiniItem}>
                <Text style={[styles.specMiniLabel, { color: colors.textSecondary }]}>
                  Maden Tespiti
                </Text>
                <Text style={[styles.specMiniVal, { color: colors.textPrimary }]}>
                  {recognizedCoin.material}
                </Text>
              </View>
              <View style={[styles.specMiniDivider, { backgroundColor: colors.border }]} />
              <View style={styles.specMiniItem}>
                <Text style={[styles.specMiniLabel, { color: colors.textSecondary }]}>
                  Tahmini Ağırlık/Çap
                </Text>
                <Text style={[styles.specMiniVal, { color: colors.textPrimary }]}>
                  {recognizedCoin.weight} • {recognizedCoin.diameter}
                </Text>
              </View>
              <View style={[styles.specMiniDivider, { backgroundColor: colors.border }]} />
              <View style={styles.specMiniItem}>
                <Text style={[styles.specMiniLabel, { color: colors.textSecondary }]}>
                  Müzayede Değeri
                </Text>
                <Text style={[styles.specMiniVal, { color: colors.primary }]}>
                  {recognizedCoin.estimatedValue}
                </Text>
              </View>
            </View>

            {/* Butonlar: Detaya Git ve Yeniden Tara */}
            <View style={styles.matchActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleReset}
                style={[
                  styles.rescanBtn,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}>
                <Ionicons name="refresh" size={16} color={colors.textSecondary} />
                <Text style={[styles.rescanBtnText, { color: colors.textSecondary }]}>
                  Yeniden Tara
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push(`/coin/${recognizedCoin.id}` as any)}
                style={[styles.inspectMatchBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.inspectMatchBtnText}>Eser Detayını Aç</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 4. HIZLI ÖRNEK SİKKELER İLE TEST ET */}
        <View style={styles.samplesSection}>
          <Text style={[styles.samplesEyebrow, { color: colors.primary }]}>
            HIZLI TEST MODU
          </Text>
          <Text style={[styles.samplesTitle, { color: colors.textPrimary }]}>
            Hazır Sikkelerle Simüle Edin
          </Text>
          <Text style={[styles.samplesDesc, { color: colors.textSecondary }]}>
            Elinizde henüz fiziksel sikke yoksa aşağıdaki tarihi eserlere dokunarak yapay zeka tanıma motorunu hemen deneyin:
          </Text>

          <View style={styles.sampleChipsGrid}>
            {MOCK_COINS.slice(0, 4).map((coin) => (
              <TouchableOpacity
                key={coin.id}
                activeOpacity={0.78}
                onPress={() => startScanSimulation(coin)}
                style={[
                  styles.sampleChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Image
                  source={{ uri: coin.obverseImage }}
                  style={styles.sampleChipThumb}
                  contentFit="cover"
                />
                <View style={styles.sampleChipInfo}>
                  <Text numberOfLines={1} style={[styles.sampleChipTitle, { color: colors.textPrimary }]}>
                    {coin.title}
                  </Text>
                  <Text numberOfLines={1} style={[styles.sampleChipCiv, { color: colors.primary }]}>
                    {coin.civilization}
                  </Text>
                </View>
                <Ionicons name="scan-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    marginTop: 2,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  viewfinderCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewfinderTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  liveText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  guideStepText: {
    color: '#ADB5BD',
    fontSize: 11,
    fontWeight: '600',
  },
  reticleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: Spacing.sm,
  },
  targetWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  circleTarget: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F1115',
  },
  targetCoinImg: {
    width: '100%',
    height: '100%',
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
  corner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: '#D4AF37',
  },
  cornerTL: {
    top: 4,
    left: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 4,
    right: 4,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 4,
    left: 4,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 4,
    right: 4,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  targetLabel: {
    color: '#E9ECEF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewfinderInstructions: {
    color: '#CED4DA',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  shutterRow: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  shutterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
  },
  shutterBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  matchCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: Spacing.xs + 2,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  matchPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  matchRarity: {
    fontSize: 11,
    fontWeight: '700',
  },
  matchCoinTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },
  matchCoinRuler: {
    fontSize: 13,
    fontWeight: '500',
  },
  specSummaryBox: {
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
    marginVertical: 4,
  },
  specMiniItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specMiniLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  specMiniVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  specMiniDivider: {
    height: 1,
    width: '100%',
  },
  matchActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  rescanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  rescanBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inspectMatchBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
  },
  inspectMatchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  samplesSection: {
    gap: 4,
    marginTop: Spacing.xs,
  },
  samplesEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  samplesTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  samplesDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.xs,
  },
  sampleChipsGrid: {
    gap: Spacing.sm,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  sampleChipThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sampleChipInfo: {
    flex: 1,
  },
  sampleChipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  sampleChipCiv: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

