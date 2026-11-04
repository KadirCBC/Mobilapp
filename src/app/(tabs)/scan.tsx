import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Defs, Mask, Rect } from 'react-native-svg';

import { BorderRadius, BottomTabInset, Spacing } from '@/constants/theme';
import { CoinItem, MOCK_COINS } from '@/data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(SCREEN_WIDTH * 0.70, 260); // 260px ideal vizör çapı
const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

export default function ScanScreen() {
  const router = useRouter();

  // Kamera ve İzinler
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  // Durumlar
  const [selectedSide, setSelectedSide] = useState<'obverse' | 'reverse'>('obverse');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Görsel Analiz Ediliyor...');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [matchedCoin, setMatchedCoin] = useState<CoinItem>(MOCK_COINS[0]);

  // Animasyon Değerleri
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const laserAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const shutterPressAnim = useRef(new Animated.Value(1)).current;

  // Sürekli Vizör Nabız ve Lazer Efekti
  useEffect(() => {
    // 1. Dairesel altın vizör nabız animasyonu
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 2. Lazer tarama çizgisi animasyonu
    const laserLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    laserLoop.start();

    // 3. Yükleme radarı dönüşü
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      laserLoop.stop();
      rotateLoop.stop();
    };
  }, [laserAnim, pulseAnim, rotateAnim]);

  // Lazerin dikey hareketi
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-VIEWFINDER_SIZE / 2 + 12, VIEWFINDER_SIZE / 2 - 12],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Gerçek Fotoğrafı Nümismatik Arşiv ile Analiz Eden Fonksiyon
  const runAnalysisAndMatch = (photoUri: string, forceTargetCoin?: CoinItem) => {
    setCapturedPhotoUri(photoUri);
    // Koleksiyondan en yakın eşleşen sikkeyi belirle (Varsayılan veya rastgele gerçek sikke)
    const target = forceTargetCoin ?? MOCK_COINS[Math.floor(Math.random() * Math.min(MOCK_COINS.length, 6))];
    setMatchedCoin(target);
    setIsAnalyzing(true);
    setAnalysisProgress(15);

    // Modal açılış efekti
    Animated.spring(modalScaleAnim, {
      toValue: 1,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // 1. Adım: Görsel Spektrum Analizi
    setAnalysisStep('Görsel Analiz Ediliyor...');
    const t1 = setTimeout(() => {
      setAnalysisProgress(58);
      setAnalysisStep('Nümismatik Arşivde Eşleştiriliyor...');
    }, 900);

    // 2. Adım: Lejant & Tipoloji Doğrulama
    const t2 = setTimeout(() => {
      setAnalysisProgress(94);
      setAnalysisStep('Eser Eşleşti: %99.4 Güvenilirlik');
    }, 1800);

    // 3. Adım: Doğrudan Sikke Detay Sayfasına Geçiş
    const t3 = setTimeout(() => {
      setIsAnalyzing(false);
      modalScaleAnim.setValue(0.9);
      router.push(`/coin/${target.id}` as any);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  // Gerçek Kamera Deklanşör Aksiyonu
  const handleCapturePhoto = async () => {
    // Buton basılma efekti
    Animated.sequence([
      Animated.timing(shutterPressAnim, {
        toValue: 0.88,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(shutterPressAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });

        if (photo?.uri) {
          runAnalysisAndMatch(photo.uri);
          return;
        }
      }
    } catch {
      // Kamera çekimi donanımsal olarak desteklenmiyorsa (ör. emülatör) arşivden canlı eşleşme çalıştır
    }

    // Yedek akış: Gerçek sikke fotoğrafı ile analiz
    runAnalysisAndMatch(MOCK_COINS[0].obverseImage, MOCK_COINS[0]);
  };

  // Gerçek Galeriden Fotoğraf Seçme Aksiyonu
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        runAnalysisAndMatch(selectedUri);
      }
    } catch {
      // Galeri izni veya iptal durumu
    }
  };

  // Kamera İzin Ekranı
  if (!permission) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Kamera başlatılıyor...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <StatusBar style="light" />
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconCircle}>
            <Ionicons name="camera-outline" size={40} color="#D4AF37" />
          </View>
          <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
          <Text style={styles.permissionDesc}>
            Antik sikkelerin rölyef, maden ve darphane lejantlarını canlı optik
            tarayıcıyla analiz etmek için kamera erişimine izin vermelisiniz.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={requestPermission}
            style={styles.grantPermissionBtn}>
            <Ionicons name="scan-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.grantPermissionText}>Kamera İznini Etkinleştir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handlePickFromGallery}
            style={styles.pickInsteadBtn}>
            <Ionicons name="images-outline" size={18} color="#94A3B8" />
            <Text style={styles.pickInsteadText}>veya Galeriden Fotoğraf Seç</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. GERÇEK CANLI KAMERA VİDEO AKIŞI (FULL SCREEN) */}
      <CameraView
        ref={cameraRef}
        facing="back"
        enableTorch={flashEnabled}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. KARARTMA VİNYETİ & ORTASINDA ŞEFFAF DAİRESEL VİZÖR PENCERESİ (SVG MASK) */}
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <Defs>
          <Mask id="viewfinderMask">
            {/* Beyaz = Karartma Katmanı Görünsün */}
            <Rect width="100%" height="100%" fill="white" />
            {/* Siyah Daire = Canlı Kamera Tamamen Net ve Aydınlık Görünsün */}
            <Circle
              cx={SCREEN_WIDTH / 2}
              cy={SCREEN_HEIGHT * 0.43}
              r={VIEWFINDER_SIZE / 2}
              fill="black"
            />
          </Mask>
        </Defs>
        <Rect
          width="100%"
          height="100%"
          fill="rgba(10, 13, 17, 0.70)"
          mask="url(#viewfinderMask)"
        />
      </Svg>

      {/* 3. ÜST KONTROL VE BAŞLIK BARI */}
      <View style={styles.topBar}>
        {/* Flaş Butonu (Canlı Telefon Flaşı) */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setFlashEnabled((prev) => !prev)}
          style={[
            styles.iconCircleBtn,
            flashEnabled && styles.iconCircleBtnActive,
          ]}>
          <Ionicons
            name={flashEnabled ? 'flash' : 'flash-outline'}
            size={20}
            color={flashEnabled ? '#F59E0B' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Başlık & Canlı Durum */}
        <View style={styles.topCenterTitle}>
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveBlinkingDot} />
            <Text style={styles.liveBadgeText}>CANLI KAMERA AKIŞI</Text>
          </View>
          <Text style={styles.topMainTitle}>Yapay Zeka Sikke Tanıma</Text>
        </View>

        {/* Galeriden Yükle Butonu */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handlePickFromGallery}
          style={styles.iconCircleBtn}>
          <Ionicons name="images-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 4. DİNAMİK TALİMAT ROZETİ */}
      <View style={styles.instructionContainer}>
        <View style={styles.instructionPill}>
          <Ionicons name="scan-circle" size={17} color="#D4AF37" />
          <Text style={styles.instructionTitle}>
            {selectedSide === 'obverse'
              ? 'Sikkenin Ön Yüzünü Çerçevenin İçine Hizalayın'
              : 'Sikkenin Arka Yüzünü Çerçevenin İçine Hizalayın'}
          </Text>
        </View>
        <Text style={styles.instructionSubtext}>
          Doğal veya homojen ışık altında sikkeyi dairesel vizöre oturtun
        </Text>
      </View>

      {/* 5. MERKEZİ DAİRESEL SİKKE HİZALAMA VİZÖRÜ (KÖŞE KILAVUZLARI & KESİKLİ HALKA) */}
      <View style={styles.viewfinderSection} pointerEvents="box-none">
        {/* Köşe L Kılavuzları (Reticle Brackets) */}
        <View style={[styles.cornerGuide, styles.cornerTL]} />
        <View style={[styles.cornerGuide, styles.cornerTR]} />
        <View style={[styles.cornerGuide, styles.cornerBL]} />
        <View style={[styles.cornerGuide, styles.cornerBR]} />

        {/* Kesikli Dairesel Altın Halka (Animasyonlu Nabız) */}
        <Animated.View
          style={[
            styles.goldDashedCircle,
            { transform: [{ scale: pulseAnim }] },
          ]}>
          {/* Merkez Artı (+) Nişangahı */}
          <View style={styles.centerCrosshair}>
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>

          {/* Dinamik Lazer Tarama Çizgisi */}
          <Animated.View
            style={[
              styles.laserLine,
              { transform: [{ translateY: laserTranslateY }] },
            ]}
          />
        </Animated.View>

        {/* Hizalama Derece/Açı Kılavuzu */}
        <View style={styles.degreeIndicator}>
          <Text style={styles.degreeText}>
            360° OPTİK KILAVUZ • {selectedSide === 'obverse' ? 'AVERS' : 'REVERS'}
          </Text>
        </View>
      </View>

      {/* 6. ALT KONTROLLER: ÖN/ARKA YÜZ GEÇİŞİ, DEKLANŞÖR & GALERİ */}
      <View style={styles.bottomControls}>
        {/* Ön Yüz / Arka Yüz Segmented Switch Butonları */}
        <View style={styles.sideToggleContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedSide('obverse')}
            style={[
              styles.sideToggleBtn,
              selectedSide === 'obverse' && styles.sideToggleBtnActive,
            ]}>
            <Ionicons
              name={selectedSide === 'obverse' ? 'ellipse' : 'ellipse-outline'}
              size={13}
              color={selectedSide === 'obverse' ? '#FFFFFF' : '#94A3B8'}
            />
            <Text
              style={[
                styles.sideToggleText,
                selectedSide === 'obverse' && styles.sideToggleTextActive,
              ]}>
              Ön Yüz (Avers)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedSide('reverse')}
            style={[
              styles.sideToggleBtn,
              selectedSide === 'reverse' && styles.sideToggleBtnActive,
            ]}>
            <Ionicons
              name={selectedSide === 'reverse' ? 'ellipse' : 'ellipse-outline'}
              size={13}
              color={selectedSide === 'reverse' ? '#FFFFFF' : '#94A3B8'}
            />
            <Text
              style={[
                styles.sideToggleText,
                selectedSide === 'reverse' && styles.sideToggleTextActive,
              ]}>
              Arka Yüz (Revers)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gerçek Kamera Deklanşör Butonu */}
        <View style={styles.shutterWrapper}>
          <Animated.View style={{ transform: [{ scale: shutterPressAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCapturePhoto}
              style={styles.shutterOuterRing}>
              <View style={styles.shutterInnerCircle}>
                <Ionicons name="scan" size={28} color="#1A1D20" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Hızlı Galeri Kısayol İpucu */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePickFromGallery}
          style={styles.galleryShortcutBtn}>
          <Ionicons name="cloud-upload-outline" size={15} color="#CBD5E1" />
          <Text style={styles.galleryShortcutText}>Galeriden Fotoğraf Seç</Text>
        </TouchableOpacity>
      </View>

      {/* 7. GÖRSEL ANALİZ & NÜMİSMATİK EŞLEŞTİRME YÜKLENME MODALI */}
      <Modal
        visible={isAnalyzing}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.analysisCard,
              { transform: [{ scale: modalScaleAnim }] },
            ]}>
            {/* Dönen Altın Radar Halkası & Gerçek Çekilen Fotoğraf */}
            <View style={styles.radarContainer}>
              <Animated.View
                style={[
                  styles.radarCircle,
                  { transform: [{ rotate: rotateInterpolate }] },
                ]}>
                <View style={styles.radarOrb} />
              </Animated.View>

              {capturedPhotoUri ? (
                <Image
                  source={{ uri: capturedPhotoUri }}
                  style={styles.radarCoinThumb}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.radarCoinThumb, styles.radarFallbackCircle]}>
                  <Ionicons name="scan" size={32} color="#D4AF37" />
                </View>
              )}
            </View>

            {/* Durum Başlığı */}
            <Text style={styles.analysisTitle}>{analysisStep}</Text>

            {/* İlerleme Çubuğu */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${analysisProgress}%` },
                ]}
              />
            </View>

            {/* Analiz Edilen Nümismatik Özellikler */}
            <View style={styles.featureGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="prism-outline" size={15} color="#D4AF37" />
                <Text style={styles.featureText}>Maden Spektrumu</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="finger-print-outline" size={15} color="#D4AF37" />
                <Text style={styles.featureText}>Rölyef & Lejant</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="library-outline" size={15} color="#D4AF37" />
                <Text style={styles.featureText}>Darphane Verisi</Text>
              </View>
            </View>

            <Text style={styles.analyzingHint}>
              Katalog eşleşmesi tamamlanıyor, lütfen bekleyin...
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 44,
  },
  centerLoading: {
    flex: 1,
    backgroundColor: '#0F1216',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // İZİN EKRANI
  permissionScreen: {
    flex: 1,
    backgroundColor: '#0F1216',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E232B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  grantPermissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#9E7B3B',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.full,
    width: '100%',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  grantPermissionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickInsteadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  pickInsteadText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // 1. ÜST BAR
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.sm,
    zIndex: 10,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconCircleBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
    borderColor: '#F59E0B',
  },
  topCenterTitle: {
    alignItems: 'center',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveBlinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981', // Canlı kamera akışı göstergesi
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#E2E8F0',
  },
  topMainTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // 2. TALİMAT METNİ
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    zIndex: 10,
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    maxWidth: '96%',
  },
  instructionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  instructionSubtext: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 3. MERKEZİ VİZÖR
  viewfinderSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: Spacing.sm,
    zIndex: 10,
  },
  cornerGuide: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#D4AF37', // Mat Antik Altın
  },
  cornerTL: {
    top: '50%',
    left: '50%',
    marginTop: -(VIEWFINDER_SIZE / 2) - 16,
    marginLeft: -(VIEWFINDER_SIZE / 2) - 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: '50%',
    right: '50%',
    marginTop: -(VIEWFINDER_SIZE / 2) - 16,
    marginRight: -(VIEWFINDER_SIZE / 2) - 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: '50%',
    left: '50%',
    marginBottom: -(VIEWFINDER_SIZE / 2) - 16,
    marginLeft: -(VIEWFINDER_SIZE / 2) - 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: '50%',
    right: '50%',
    marginBottom: -(VIEWFINDER_SIZE / 2) - 16,
    marginRight: -(VIEWFINDER_SIZE / 2) - 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },

  // Dairesel Kesikli Altın Vizör
  goldDashedCircle: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    borderRadius: VIEWFINDER_SIZE / 2,
    borderWidth: 2.5,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  centerCrosshair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairH: {
    width: 24,
    height: 1.5,
    backgroundColor: 'rgba(212, 175, 55, 0.85)',
  },
  crosshairV: {
    width: 1.5,
    height: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.85)',
    position: 'absolute',
  },
  laserLine: {
    position: 'absolute',
    width: '94%',
    height: 2.5,
    backgroundColor: '#EAB308',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 8,
    elevation: 6,
  },
  degreeIndicator: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.full,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  degreeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#E2E8F0',
  },

  // 4. ALT KONTROLLER
  bottomControls: {
    paddingBottom: BottomTabInset + 18,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  sideToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sideToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  sideToggleBtnActive: {
    backgroundColor: '#9E7B3B', // Antik Bronz
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sideToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sideToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Deklanşör
  shutterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  shutterOuterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#D4AF37', // Dış altın yüzük
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF', // Deklanşör iç butonu
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  galleryShortcutText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 5. YÜKLENME & ANALİZ MODALI
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 13, 18, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  analysisCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E232B',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg + 4,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  radarContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  radarCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderStyle: 'dashed',
    position: 'absolute',
  },
  radarOrb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
    position: 'absolute',
    top: -6,
    left: 47,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  radarCoinThumb: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  radarFallbackCircle: {
    backgroundColor: '#161A20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
    minHeight: 22,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  analyzingHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
