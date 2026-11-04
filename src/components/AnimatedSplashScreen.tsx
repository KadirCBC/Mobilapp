import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 8 adet antik altın toz/ışık zerreciği için koordinatlar
const DUST_PARTICLES = [
  { x: -90, y: -80, size: 3.5, delay: 0 },
  { x: 85, y: -70, size: 2.5, delay: 400 },
  { x: -110, y: 30, size: 4, delay: 800 },
  { x: 105, y: 45, size: 3, delay: 200 },
  { x: -60, y: 110, size: 2.5, delay: 600 },
  { x: 70, y: 115, size: 3.5, delay: 1000 },
  { x: 0, y: -130, size: 3, delay: 300 },
  { x: -40, y: -120, size: 2, delay: 700 },
];

interface AnimatedSplashScreenProps {
  onAnimationComplete?: () => void;
  minDisplayTimeMs?: number;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationComplete,
  minDisplayTimeMs = 2100,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // 1. Giriş ve Çıkış Ana Animasyonları
  const masterFade = useRef(new Animated.Value(0)).current;
  const masterScale = useRef(new Animated.Value(0.92)).current;
  const exitFade = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  // 2. Işık Hüzmesi (Light Shimmer Sweep) Efekti - Sikke üzerinden kayan ışık
  const shimmerSweep = useRef(new Animated.Value(-180)).current;

  // 3. Arka Plan Altın Halosu ve Dalga Halkaları (Pulsing Aura - Düz yumuşak dalga)
  const auraScale = useRef(new Animated.Value(0.85)).current;
  const auraOpacity = useRef(new Animated.Value(0.4)).current;
  const ringScale = useRef(new Animated.Value(0.75)).current;
  const ringOpacity = useRef(new Animated.Value(0.7)).current;
  const ringScale2 = useRef(new Animated.Value(0.6)).current;
  const ringOpacity2 = useRef(new Animated.Value(0.5)).current;

  // 4. Sikke Nefes Alma (Float / Breathing) Hareketi
  const coinFloat = useRef(new Animated.Value(0)).current;

  // 5. İlerleme Çubuğu (Hairline Golden Progress)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 6. Işık Zerrecikleri Animasyonu
  const dustAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // A. Giriş: Yumuşak belirme ve büyüme
    Animated.parallel([
      Animated.timing(masterFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(masterScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // B. Sikke Yüzeyinde Gezen Işık Parıltısı (Shimmer Sweep)
    const sweepLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(shimmerSweep, {
          toValue: 240,
          duration: 1100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(shimmerSweep, {
          toValue: -180,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    sweepLoop.start();

    // C. Arka Plan Altın Işık Halosu (Pulsing Glow)
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(auraScale, {
            toValue: 1.25,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(auraOpacity, {
            toValue: 0.85,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(auraScale, {
            toValue: 0.95,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(auraOpacity, {
            toValue: 0.4,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    auraLoop.start();

    // D. Pürüzsüz Dairesel Yayılma Dalgaları (Smooth Concentric Shockwaves - Kesikli değil)
    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.45,
            duration: 2200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    ringLoop.start();

    const ringLoop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(ringScale2, {
            toValue: 1.65,
            duration: 2400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity2, {
            toValue: 0,
            duration: 2400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale2, {
            toValue: 0.75,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity2, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    ringLoop2.start();

    // E. Sikke Süzülme (Floating)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(coinFloat, {
          toValue: -7,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(coinFloat, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // F. Zerreciklerin Hareketi (Ambient Golden Dust)
    const dustLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dustAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dustAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    dustLoop.start();

    // G. İlerleme Çizgisi
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: minDisplayTimeMs - 350,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // H. Kapanış & Pürüzsüz Ayrılma (Cinematic Exit)
    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(exitFade, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.06,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
        sweepLoop.stop();
        auraLoop.stop();
        ringLoop.stop();
        ringLoop2.stop();
        floatLoop.stop();
        dustLoop.stop();
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }, minDisplayTimeMs);

    return () => {
      clearTimeout(exitTimer);
      sweepLoop.stop();
      auraLoop.stop();
      ringLoop.stop();
      ringLoop2.stop();
      floatLoop.stop();
      dustLoop.stop();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      pointerEvents={exitFade ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          opacity: exitFade,
          transform: [{ scale: exitScale }],
        },
      ]}>
      <StatusBar style="light" />

      {/* 1. MÜZE ANTRASİT & GRİ DENGELİ RADIAL ZEMİN */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient
              id="bgGrad"
              cx="50%"
              cy="48%"
              r="65%"
              fx="50%"
              fy="48%">
              <Stop offset="0%" stopColor="#252B33" stopOpacity="1" />
              <Stop offset="45%" stopColor="#1B1F25" stopOpacity="1" />
              <Stop offset="80%" stopColor="#13161A" stopOpacity="1" />
              <Stop offset="100%" stopColor="#0B0D10" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGrad)" />
        </Svg>
      </View>

      {/* 2. MERKEZİ HALKASAL IŞIK HALOLARI (YUMUŞAK, KESİKSİZ DALGALAR) */}
      <View style={styles.centerStage} pointerEvents="none">
        {/* En Dıştaki Yayılma Dairesi */}
        <Animated.View
          style={[
            styles.smoothRing,
            {
              width: 290,
              height: 290,
              borderRadius: 145,
              borderColor: 'rgba(201, 160, 80, 0.28)',
              borderWidth: 1,
              opacity: ringOpacity2,
              transform: [{ scale: ringScale2 }],
            },
          ]}
        />

        {/* İç Yayılma Dairesi */}
        <Animated.View
          style={[
            styles.smoothRing,
            {
              width: 220,
              height: 220,
              borderRadius: 110,
              borderColor: 'rgba(229, 192, 123, 0.42)',
              borderWidth: 1.5,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Sikke Arkasındaki Ethereal Sıcak Işıma (Amber-Gold Glow) */}
        <Animated.View
          style={[
            styles.auraGlow,
            {
              opacity: auraOpacity,
              transform: [{ scale: auraScale }],
            },
          ]}
        />

        {/* Uçuşan Minik Altın Zerrecikler (Ambient Dust) */}
        {DUST_PARTICLES.map((dust, index) => {
          const translateY = dustAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -12],
          });
          const opacity = dustAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.2, 0.85, 0.2],
          });
          return (
            <Animated.View
              key={index}
              style={[
                styles.dustParticle,
                {
                  left: '50%',
                  top: '50%',
                  marginLeft: dust.x,
                  marginTop: dust.y,
                  width: dust.size,
                  height: dust.size,
                  borderRadius: dust.size / 2,
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* 3. MERKEZİ SİKKE AMBLEMİ + IŞIK YANSIMA (SHIMMER) EFEKTİ */}
      <Animated.View
        style={[
          styles.emblemContainer,
          {
            opacity: masterFade,
            transform: [{ scale: masterScale }, { translateY: coinFloat }],
          },
        ]}>
        {/* Sikke Çerçevesi (Temiz, Tek Katmanlı, Gölgesi Yüksek) */}
        <View style={styles.coinFrame}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.coinImage}
            contentFit="contain"
            priority="high"
          />

          {/* Sikke Üzerinden Çapraz Akan Işık Hüzmesi (Light Beam Sweep) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmerBeam,
              {
                transform: [
                  { translateX: shimmerSweep },
                  { rotate: '30deg' },
                ],
              },
            ]}
          />
        </View>

        {/* (İŞARETLENEN ALAN VE METİNLER TAMAMEN KALDIRILDI) */}
      </Animated.View>

      {/* 4. ALT BÖLÜM: ZARİF ALTIN İLERLEME ÇUBUĞU & MİNİMAL STATUS */}
      <Animated.View style={[styles.bottomSection, { opacity: masterFade }]}>
        <View style={styles.loadingTrack}>
          <Animated.View
            style={[
              styles.loadingFill,
              {
                width: progressBarWidth,
              },
            ]}
          />
        </View>

        <Text style={styles.loadingStatusText}>KOLEKSİYON HAZIRLANIYOR</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1215',
  },
  centerStage: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smoothRing: {
    position: 'absolute',
  },
  auraGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 12,
  },
  dustParticle: {
    position: 'absolute',
    backgroundColor: '#F3D27E',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinFrame: {
    width: 154,
    height: 154,
    borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C22',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 18,
    position: 'relative',
  },
  coinImage: {
    width: 146,
    height: 146,
  },
  shimmerBeam: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    width: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  bottomSection: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 56 : 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingTrack: {
    width: 130,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#C9A050',
    borderRadius: 2,
    shadowColor: '#E5C07B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  loadingStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8A95A5',
    textTransform: 'uppercase',
  },
});
