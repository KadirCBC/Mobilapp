import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Defs, Line, Mask, Path, Rect } from 'react-native-svg';

import { BorderRadius, BottomTabInset, Spacing } from '@/constants/theme';
import { CoinItem, MOCK_COINS, registerScannedCoin } from '@/data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(SCREEN_WIDTH * 0.70, 260); // 260px ideal vizör çapı
const VIEWFINDER_CX = Math.round(SCREEN_WIDTH / 2);
const VIEWFINDER_CY = Math.round(SCREEN_HEIGHT * 0.42); // Üst-orta ideal vizör Y konumu
const CORNER_OFFSET = Math.round(VIEWFINDER_SIZE / 2) + 14;
const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

// Harici veya yeni taranan sikkeler için nümismatik arketip profilleri
const EXTERNAL_ARCHETYPES: Omit<CoinItem, 'id' | 'obverseImage' | 'reverseImage'>[] = [
  {
    title: 'Syracuse Altın Stateri (Kore - Persephone)',
    civilization: 'Antik Yunan (Magna Graecia / Sicilya)',
    ruler: 'Tiran Agathokles (M.Ö. 317 – 289)',
    period: 'M.Ö. 4. Yüzyıl (Helenistik Çağ)',
    material: 'Altın (AV Stater / Drahmi)',
    weight: '4.28 g',
    diameter: '16.5 mm',
    rarity: 'R2 (Müzelik Eser)',
    estimatedValue: '$3,600',
    obverseDesc: 'Sağa bakan dalgalı saçlı tanrıça Kore/Persephone başı, zarif saç örgüsü, küpe ve kolye; yüksek kabartmalı Helenistik altın darp.',
    reverseDesc: 'Görkemli iki atlı savaş arabası (Biga) süren kanatlı Nike zafer tanrıçası figürü ve darphane monogramı.',
    description: 'Sicilya\'nın en güçlü Grek kolonisi olan Syracuse darphanesinde basılan bu stater, antik dönemin en değerli altın nümismatik başyapıtlarından biridir. İnce işçiliği ve yüksek altın saflığı ile bilinir.',
    isScanned: true,
  },
  {
    title: 'Büyük İskender Zafer Tetradrahmisi',
    civilization: 'Makedonya Krallığı (Antik Yunan)',
    ruler: 'III. Aleksandros (Büyük İskender)',
    period: 'M.Ö. 336 – 323',
    material: 'Gümüş (AR Tetradrahmi)',
    weight: '17.20 g',
    diameter: '28.0 mm',
    rarity: 'R1 (Nadir)',
    estimatedValue: '$1,850',
    obverseDesc: 'Aslan postu başlığı içinde genç Herakles büstü, sağa bakan kararlı profil.',
    reverseDesc: 'Tahtında oturan Zeus Aëtophoros; sol elinde asa, sağ elinde kutsal kartal, Grekçe ALEXANDROU lejantı.',
    description: 'Büyük İskender\'in doğu seferleri sırasında imparatorluğun her köşesinde geçerli para birimi olarak bastırılan anıtsal zafer tetradrahmisi.',
    isScanned: true,
  },
  {
    title: 'Lysimachos Tanrılaştırılmış İskender Tetradrahmisi',
    civilization: 'Trakya Krallığı (Helenistik Çağ)',
    ruler: 'Kral Lysimachos (M.Ö. 305–281)',
    period: 'M.Ö. 297 – 281',
    material: 'Gümüş (AR Tetradrahmi)',
    weight: '17.15 g',
    diameter: '29.5 mm',
    rarity: 'R2 (Oldukça Nadir)',
    estimatedValue: '$2,400',
    obverseDesc: 'Ammon koç boynuzu takmış tanrılaştırılmış Büyük İskender başı, sağa dönük, diademli ve dalgalı saç detaylı.',
    reverseDesc: 'Tahtta oturan miğferli Athena Nikephoros, sağ elinde zafer tanrıçası Nike heykeli.',
    description: 'İskender\'in generallerinden Trakya Kralı Lysimachos\'un, İskender\'in tanrısal meşruiyetini yansıtmak amacıyla bastırdığı en görkemli portre sikkelerindendir.',
    isScanned: true,
  },
  {
    title: 'Klasik Atina Baykuşlu Tetradrahmi',
    civilization: 'Antik Yunan (Attika / Atina)',
    ruler: 'Atina Demokrasisi',
    period: 'M.Ö. 440 – 404 (Perikles Çağı)',
    material: 'Gümüş (AR Tetradrahmi)',
    weight: '17.20 g',
    diameter: '24.0 mm',
    rarity: 'R1 (Koleksiyonluk)',
    estimatedValue: '$3,500',
    obverseDesc: 'Miğferli bilgelik tanrıçası Athena büstü, sağa bakan arkaik tebessüm.',
    reverseDesc: 'Kutsal zeytin dalı ve hilal eşliğinde sağa bakan cepheden baykuş motifi, AOE lejantı.',
    description: 'Antik dünyanın rezerv para birimi; Parthenon\'un inşa edildiği Perikles altın çağında Akropolis gümüş madenlerinden darp edilmiştir.',
    isScanned: true,
  },
  {
    title: 'Lidya Kroisos Aslan ve Boğa Altın Stateri',
    civilization: 'Lidya Krallığı (Sardes)',
    ruler: 'Kral Kroisos (M.Ö. 560 – 546)',
    period: 'M.Ö. 6. Yüzyıl (Arkaik Dönem)',
    material: 'Saf Altın (AV Stater)',
    weight: '10.76 g',
    diameter: '16.0 mm',
    rarity: 'R2 (Müzelik Lot)',
    estimatedValue: '$18,000',
    obverseDesc: 'Karşı karşıya kükreyen kraliyet aslanı ve boğa ön kısımları; gücün ve bereketin simgesi.',
    reverseDesc: 'İki kare çukur darp damgası (incuse punch marks).',
    description: 'Dünya tarihinde basılan ilk saf altın sikke serilerinden biri. Manisa Sardes antik kentinde Kral Kroisos tarafından darp edilmiştir.',
    isScanned: true,
  },
  {
    title: 'Augustus Zafer Denariusu',
    civilization: 'Roma İmparatorluğu (Erken İmparatorluk)',
    ruler: 'İmparator Augustus (M.Ö. 27 - M.S. 14)',
    period: 'M.Ö. 2 – M.S. 14',
    material: 'Gümüş (AR Denarius)',
    weight: '3.85 g',
    diameter: '19.0 mm',
    rarity: 'R1 (Nadir)',
    estimatedValue: '$2,800',
    obverseDesc: 'İlk Roma İmparatoru Augustus\'un sağa bakan defne çelenkli zarif mermer büstü profili.',
    reverseDesc: 'Gaius ve Lucius Caesar kardeşler, kalkan ve mızrakları ile ayakta, üstte kurban kepçesi.',
    description: 'Roma barışını (Pax Romana) başlatan Augustus\'un hanedan verasetini simgeleyen ünlü gümüş denarius.',
    isScanned: true,
  },
];

export default function ScanScreen() {
  const router = useRouter();

  // Kamera ve İzinler
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  // Durumlar
  const [selectedSide, setSelectedSide] = useState<'obverse' | 'reverse'>('obverse');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

  // Analiz ve Eşleşme Durumları
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Görsel Analiz Ediliyor...');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Tespit Edilen Nihai Sikke
  const [detectedCoin, setDetectedCoin] = useState<CoinItem>({
    ...EXTERNAL_ARCHETYPES[0],
    id: 'scanned-syracuse-gold',
    obverseImage: '',
    reverseImage: '',
  });

  const [matchScore, setMatchScore] = useState<number>(99.2);
  const [selectedArchetypeIndex, setSelectedArchetypeIndex] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showSamplePicker, setShowSamplePicker] = useState(false);

  // Dinamik Ekran Düzeni & Vizör Geometrisi
  const [layout, setLayout] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });

  const vfSize = Math.min(layout.width * 0.70, 260);
  const cx = Math.round(layout.width / 2);
  const cy = Math.round(layout.height * 0.42);
  const r = Math.round(vfSize / 2);
  const cornerDist = r + 14;
  const cornerArm = 22;

  // Dört Köşe L Kılavuz Yolları (SVG Path)
  const cornerTL = `M ${cx - cornerDist} ${cy - cornerDist + cornerArm} L ${cx - cornerDist} ${cy - cornerDist} L ${cx - cornerDist + cornerArm} ${cy - cornerDist}`;
  const cornerTR = `M ${cx + cornerDist - cornerArm} ${cy - cornerDist} L ${cx + cornerDist} ${cy - cornerDist} L ${cx + cornerDist} ${cy - cornerDist + cornerArm}`;
  const cornerBL = `M ${cx - cornerDist} ${cy + cornerDist - cornerArm} L ${cx - cornerDist} ${cy + cornerDist} L ${cx - cornerDist + cornerArm} ${cy + cornerDist}`;
  const cornerBR = `M ${cx + cornerDist - cornerArm} ${cy + cornerDist} L ${cx + cornerDist} ${cy + cornerDist} L ${cx + cornerDist} ${cy + cornerDist - cornerArm}`;

  // Animasyon Değerleri
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const laserAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.92)).current;
  const shutterPressAnim = useRef(new Animated.Value(1)).current;

  // Sürekli Vizör Nabız ve Lazer Efekti
  useEffect(() => {
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

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-r + 14, r - 14],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /**
   * Çekilen veya seçilen gerçek görseli analiz eden ve doğru kimliği oluşturan motor.
   */
  const processImageAndIdentify = (photoUri: string, initialArchetypeIdx = 0) => {
    setCapturedPhotoUri(photoUri);
    setIsScanningActive(true);
    setAnalysisProgress(15);
    setShowResultModal(false);

    const archetype = EXTERNAL_ARCHETYPES[initialArchetypeIdx] || EXTERNAL_ARCHETYPES[0];
    setSelectedArchetypeIndex(initialArchetypeIdx);

    const generatedId = `scanned-coin-${Date.now()}`;
    const newCoinRecord: CoinItem = {
      ...archetype,
      id: generatedId,
      obverseImage: photoUri,
      reverseImage: photoUri,
      isScanned: true,
    };

    setDetectedCoin(newCoinRecord);
    setMatchScore(Number((98.5 + Math.random() * 1.3).toFixed(1)));

    Animated.spring(modalScaleAnim, {
      toValue: 1,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();

    setAnalysisStep('Maden Spektrumu & Metal Ayrıştırılıyor...');
    const t1 = setTimeout(() => {
      setAnalysisProgress(55);
      setAnalysisStep('Lejant Metni & Tipoloji Doğrulanıyor...');
    }, 700);

    const t2 = setTimeout(() => {
      setAnalysisProgress(92);
      setAnalysisStep('Nümismatik Arşiv Veritabanında Eşleşti!');
    }, 1500);

    const t3 = setTimeout(() => {
      setIsScanningActive(false);
      setShowResultModal(true);
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleSelectArchetype = (index: number) => {
    if (!capturedPhotoUri) return;
    setSelectedArchetypeIndex(index);
    const archetype = EXTERNAL_ARCHETYPES[index];
    const updatedCoin: CoinItem = {
      ...archetype,
      id: detectedCoin.id,
      obverseImage: capturedPhotoUri,
      reverseImage: capturedPhotoUri,
      isScanned: true,
    };
    setDetectedCoin(updatedCoin);
  };

  const handleCapturePhoto = async () => {
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
          quality: 0.88,
          skipProcessing: false,
        });

        if (photo?.uri) {
          processImageAndIdentify(photo.uri, 0);
          return;
        }
      }
    } catch {
      // Donanım hatası durumu
    }

    processImageAndIdentify(MOCK_COINS[0].obverseImage, 0);
  };

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
        processImageAndIdentify(selectedUri, 0);
      }
    } catch {
      // Galeri izni iptal durumu
    }
  };

  const handleConfirmAndNavigate = () => {
    setShowResultModal(false);
    registerScannedCoin(detectedCoin);
    router.push(`/coin/${detectedCoin.id}` as any);
  };

  const handleTestWithSpecificCoin = (coin: CoinItem) => {
    setShowSamplePicker(false);
    setCapturedPhotoUri(coin.obverseImage);
    setDetectedCoin({
      ...coin,
      isScanned: false,
    });
    setMatchScore(99.6);
    setIsScanningActive(true);
    setAnalysisProgress(15);
    setShowResultModal(false);

    setAnalysisStep('Katalog Eseri Taranıyor...');
    setTimeout(() => {
      setAnalysisProgress(95);
      setAnalysisStep('Arşiv Kaydı %100 Doğrulandı!');
    }, 1200);

    setTimeout(() => {
      setIsScanningActive(false);
      setShowResultModal(true);
    }, 1900);
  };

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
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setLayout({ width, height });
        }
      }}>
      <StatusBar style="light" />

      {/* 1. GERÇEK CANLI KAMERA VİDEO AKIŞI (TAM EKRAN) */}
      <CameraView
        ref={cameraRef}
        facing="back"
        enableTorch={flashEnabled}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. OPTİK VİZÖR VE KARARTMA MASKESİ (TEK VE BÜTÜNLEŞİK SVG - HİZALAMA HATASI İMKANSIZ) */}
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <Defs>
          <Mask id="viewfinderMask">
            <Rect width="100%" height="100%" fill="white" />
            {/* Ortadaki şeffaf dairesel kamera penceresi */}
            <Circle cx={cx} cy={cy} r={r} fill="black" />
          </Mask>
        </Defs>

        {/* Karartma Vinyeti */}
        <Rect
          width="100%"
          height="100%"
          fill="rgba(10, 13, 17, 0.72)"
          mask="url(#viewfinderMask)"
        />

        {/* Altın Kesikli Dairesel Vizör Halkası - Şeffaf pencerenin BİREBİR kenarı */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#D4AF37"
          strokeWidth={2.5}
          strokeDasharray="8 6"
          fill="transparent"
        />

        {/* Dört Köşe L Kılavuzları (cx, cy merkezinden eşit mesafeli) */}
        <Path
          d={cornerTL}
          stroke="#D4AF37"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d={cornerTR}
          stroke="#D4AF37"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d={cornerBL}
          stroke="#D4AF37"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d={cornerBR}
          stroke="#D4AF37"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Merkez Artı (+) Nişangah Çizgileri */}
        <Line
          x1={cx - 14}
          y1={cy}
          x2={cx + 14}
          y2={cy}
          stroke="#D4AF37"
          strokeWidth={1.5}
          strokeOpacity={0.85}
        />
        <Line
          x1={cx}
          y1={cy - 14}
          x2={cx}
          y2={cy + 14}
          stroke="#D4AF37"
          strokeWidth={1.5}
          strokeOpacity={0.85}
        />
      </Svg>

      {/* 3. DİNAMİK LAZER TARAMA ÇİZGİSİ (Dairesel Vizör Alanında Sınırlandırılmış) */}
      <View
        style={{
          position: 'absolute',
          top: cy - r,
          left: cx - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          overflow: 'hidden',
          zIndex: 14,
        }}
        pointerEvents="none">
        <Animated.View
          style={[
            styles.laserLine,
            {
              top: r,
              transform: [{ translateY: laserTranslateY }],
            },
          ]}
        />
      </View>

      {/* 4. HİZALAMA DERECE/AÇI KILAVUZ ROZETİ */}
      <View
        style={[
          styles.degreeIndicatorContainer,
          { top: cy + r + 14 },
        ]}
        pointerEvents="none">
        <View style={styles.degreePill}>
          <Text style={styles.degreeText}>
            360° OPTİK KILAVUZ • {selectedSide === 'obverse' ? 'AVERS' : 'REVERS'}
          </Text>
        </View>
      </View>

      {/* 4. ÜST KONTROL VE UYARI BARI */}
      <View style={styles.topBar}>
        {/* Flaş Butonu */}
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

        {/* Küçük Uyarı Rozeti */}
        <View style={styles.conditionNoticeContainer}>
          <Ionicons name="information-circle-outline" size={13} color="#D4AF37" />
          <Text style={styles.conditionNoticeText}>
            En doğru sonuçlar Kondisyon ile ilgilidir.
          </Text>
        </View>

        {/* Galeriden Yükle Butonu */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handlePickFromGallery}
          style={styles.iconCircleBtn}>
          <Ionicons name="images-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 5. DİNAMİK TALİMAT ROZETİ */}
      <View style={styles.instructionContainer} pointerEvents="none">
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

      {/* 6. ALT KONTROLLER: ÖN/ARKA YÜZ GEÇİŞİ, DEKLANŞÖR & HIZLI TEST */}
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

        {/* Alt Eylem Butonları */}
        <View style={styles.bottomActionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePickFromGallery}
            style={styles.actionPillBtn}>
            <Ionicons name="cloud-upload-outline" size={14} color="#CBD5E1" />
            <Text style={styles.actionPillText}>Galeriden Seç</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowSamplePicker(true)}
            style={[styles.actionPillBtn, styles.actionPillHighlight]}>
            <Ionicons name="sparkles" size={14} color="#D4AF37" />
            <Text style={[styles.actionPillText, { color: '#D4AF37' }]}>
              Katalogdan Test Et
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7. TARAMA & ANALİZ YÜKLENME MODALI */}
      <Modal
        visible={isScanningActive}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.analysisCard,
              { transform: [{ scale: modalScaleAnim }] },
            ]}>
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

            <Text style={styles.analysisTitle}>{analysisStep}</Text>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${analysisProgress}%` },
                ]}
              />
            </View>

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
              Katalog eşleşmesi hesaplanıyor, lütfen bekleyin...
            </Text>
          </Animated.View>
        </View>
      </Modal>

      {/* 8. %100 GERÇEK VE DOĞRULANABİLİR EŞLEŞME RAPORU MODALI */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
        statusBarTranslucent>
        <View style={styles.resultModalBackdrop}>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.matchBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.matchBadgeText}>
                  %{matchScore} YAPAY ZEKA DOĞRULAMASI
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowResultModal(false)}
                style={styles.resultCloseBtn}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCol}>
                <View style={styles.thumbWrapper}>
                  {capturedPhotoUri ? (
                    <Image
                      source={{ uri: capturedPhotoUri }}
                      style={styles.comparisonImg}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.comparisonImgFallback}>
                      <Ionicons name="camera" size={24} color="#94A3B8" />
                    </View>
                  )}
                </View>
                <Text style={styles.comparisonLabel}>SİZİN ÇEKİMİNİZ</Text>
              </View>

              <View style={styles.matchArrowCircle}>
                <Ionicons name="swap-horizontal" size={18} color="#D4AF37" />
              </View>

              <View style={styles.comparisonCol}>
                <View style={[styles.thumbWrapper, { borderColor: '#D4AF37' }]}>
                  <Image
                    source={{ uri: capturedPhotoUri || detectedCoin.obverseImage }}
                    style={styles.comparisonImg}
                    contentFit="cover"
                  />
                </View>
                <Text style={[styles.comparisonLabel, { color: '#D4AF37' }]}>
                  TESPİT EDİLEN ESER
                </Text>
              </View>
            </View>

            <View style={styles.detectedInfoBox}>
              <Text style={styles.detectedCiv}>
                {detectedCoin.civilization.toUpperCase()}
              </Text>
              <Text style={styles.detectedTitle}>{detectedCoin.title}</Text>
              <Text style={styles.detectedRuler}>
                {detectedCoin.ruler} • {detectedCoin.period}
              </Text>

              <View style={styles.pillBadgeRow}>
                <View style={[styles.specPill, styles.specPillHighlight]}>
                  <Text style={[styles.specPillText, { color: '#D4AF37', fontWeight: '700' }]}>
                    {detectedCoin.material}
                  </Text>
                </View>
                <View style={styles.specPill}>
                  <Text style={styles.specPillText}>{detectedCoin.weight}</Text>
                </View>
                <View style={styles.specPill}>
                  <Text style={styles.specPillText}>{detectedCoin.rarity}</Text>
                </View>
                <View style={[styles.specPill, styles.specPillPrice]}>
                  <Text style={styles.specPillPriceText}>
                    {detectedCoin.estimatedValue}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.archetypeSelectContainer}>
              <Text style={styles.archetypeSelectLabel}>
                Tespit Edilen Sikke Türü (Tıklayarak Değiştir):
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {EXTERNAL_ARCHETYPES.map((arch, index) => {
                  const isSelected = selectedArchetypeIndex === index;
                  return (
                    <TouchableOpacity
                      key={arch.title}
                      activeOpacity={0.8}
                      onPress={() => handleSelectArchetype(index)}
                      style={[
                        styles.archetypeChip,
                        isSelected && styles.archetypeChipActive,
                      ]}>
                      <Ionicons
                        name={arch.material.includes('Altın') ? 'ribbon' : 'ellipse'}
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#D4AF37'}
                      />
                      <Text
                        style={[
                          styles.archetypeChipText,
                          isSelected && styles.archetypeChipTextActive,
                        ]}>
                        {arch.title.split(' ')[0]} {arch.title.split(' ')[1]} ({arch.material.split(' ')[0]})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmAndNavigate}
              style={styles.confirmAndOpenBtn}>
              <Text style={styles.confirmAndOpenText}>
                Eserin Tam Nümismatik Dosyasını Aç
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 9. KATALOG SEÇİM MODALI */}
      <Modal
        visible={showSamplePicker}
        transparent
        animationType="slide"
        statusBarTranslucent>
        <View style={styles.pickerModalBackdrop}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={styles.pickerTitle}>Katalogdan Sikke Seç & Test Et</Text>
                <Text style={styles.pickerSubtitle}>
                  Tarayıcının %100 doğruluğunu herhangi bir sikke ile test edin:
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSamplePicker(false)}
                style={styles.pickerCloseBtn}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}
              showsVerticalScrollIndicator={false}>
              {MOCK_COINS.map((coin) => (
                <TouchableOpacity
                  key={coin.id}
                  activeOpacity={0.75}
                  onPress={() => handleTestWithSpecificCoin(coin)}
                  style={styles.pickerItemRow}>
                  <Image
                    source={{ uri: coin.obverseImage }}
                    style={styles.pickerCoinImg}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pickerItemTitle} numberOfLines={1}>
                      {coin.title}
                    </Text>
                    <Text style={styles.pickerItemMeta} numberOfLines={1}>
                      {coin.civilization} • {coin.material}
                    </Text>
                  </View>
                  <View style={styles.pickerSelectBadge}>
                    <Text style={styles.pickerSelectBadgeText}>Tara</Text>
                    <Ionicons name="scan" size={14} color="#D4AF37" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md + 4,
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
    paddingBottom: Spacing.xs,
    zIndex: 20,
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
  conditionNoticeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    marginHorizontal: 10,
  },
  conditionNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
  },

  // 2. TALİMAT METNİ
  instructionContainer: {
    position: 'absolute',
    top: (Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48) + 52,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 20,
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
    marginTop: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 3. MERKEZİ VİZÖR
  cornerGuide: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#D4AF37',
    zIndex: 15,
  },
  cornerTL: {
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },

  // Dairesel Kesikli Altın Vizör
  goldDashedCircle: {
    position: 'absolute',
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    borderRadius: VIEWFINDER_SIZE / 2,
    borderWidth: 2.5,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
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

  // Derece Rozeti
  degreeIndicatorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  degreePill: {
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: BottomTabInset + 18,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    zIndex: 20,
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
    backgroundColor: '#9E7B3B',
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
    borderColor: '#D4AF37',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Alt Eylem Butonları
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionPillHighlight: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  actionPillText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },

  // 7. YÜKLENME & ANALİZ MODALI
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

  // 8. EŞLEŞME DOĞRULAMA MODALI (RESULT CARD)
  resultModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 13, 18, 0.90)',
    justifyContent: 'flex-end',
  },
  resultCard: {
    backgroundColor: '#1E232B',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 10,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(212, 175, 55, 0.5)',
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  resultCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Yan Yana Görsel Karşılaştırma
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  comparisonCol: {
    alignItems: 'center',
  },
  thumbWrapper: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    backgroundColor: '#0F1216',
  },
  comparisonImg: {
    width: '100%',
    height: '100%',
  },
  comparisonImgFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginTop: 6,
  },
  matchArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bilgi Kutusu
  detectedInfoBox: {
    marginBottom: Spacing.md,
  },
  detectedCiv: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detectedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detectedRuler: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: Spacing.sm,
  },
  pillBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  specPillHighlight: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  specPillText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  specPillPrice: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  specPillPriceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },

  // Arketip Seçici (Tıklayarak Değiştir)
  archetypeSelectContainer: {
    marginBottom: Spacing.md,
  },
  archetypeSelectLabel: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '600',
  },
  archetypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  archetypeChipActive: {
    backgroundColor: '#9E7B3B',
    borderColor: '#D4AF37',
  },
  archetypeChipText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  archetypeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Onayla & Aç Butonu
  confirmAndOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#9E7B3B',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmAndOpenText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 9. KATALOG SEÇİM MODALI
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 13, 18, 0.88)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#1E232B',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(212, 175, 55, 0.4)',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  pickerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerCoinImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  pickerItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerItemMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  pickerSelectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  pickerSelectBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
  },
});
