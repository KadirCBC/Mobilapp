import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
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
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { BorderRadius, Spacing } from '@/constants/theme';
import { generateDigitalPassport } from '@/data/certificateData';
import { getCoinById } from '@/data/mockData';
import { fetchImageAsBase64, generateCertificateHtml } from '@/utils/generateCertificateHtml';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 6;

const CERT_COLORS = {
  parchmentBg: '#FDFBF7', // Lüks sıcak sertifika parşömeni
  borderGold: '#9E7B3B', // Müzayede altın bronz
  goldBright: '#D4AF37',
  goldLight: '#FBF5E8',
  darkText: '#181B1F',
  secondaryText: '#475569',
  mutedText: '#94A3B8',
  sealBg: '#1E232B',
  greenSuccess: '#15803D',
  greenLight: '#DCFCE7',
  surfaceCard: '#FFFFFF',
};

export default function DigitalPassportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Sikke bilgisi
  const coin = id ? getCoinById(id) : undefined;
  const isComposite = Boolean(
    coin &&
    coin.obverseImage &&
    coin.reverseImage &&
    coin.obverseImage === coin.reverseImage &&
    !(coin as any).isScanned
  );
  const passport = useMemo(() => {
    return coin ? generateDigitalPassport(coin) : null;
  }, [coin]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState(false);

  // PDF Hazırlama: Görselleri base64 formatında embed ederek CORS ve ağ engellerini aşar
  const preparePdfHtml = async (): Promise<string> => {
    if (!coin || !passport) return '';
    try {
      if (coin.obverseImage === coin.reverseImage && coin.obverseImage) {
        const b64 = await fetchImageAsBase64(coin.obverseImage);
        return generateCertificateHtml(coin, passport, {
          obverseBase64: b64,
          reverseBase64: b64,
        });
      }

      const [obverseBase64, reverseBase64] = await Promise.all([
        fetchImageAsBase64(coin.obverseImage),
        fetchImageAsBase64(coin.reverseImage),
      ]);

      return generateCertificateHtml(coin, passport, {
        obverseBase64,
        reverseBase64,
      });
    } catch (err) {
      console.warn('PDF image preload error, using direct URLs:', err);
      return generateCertificateHtml(coin, passport);
    }
  };

  // 1. Gerçek PDF Dosyası Üret ve İndir / Paylaş (expo-print + expo-sharing)
  const handleDownloadAndSharePdf = async () => {
    if (!coin || !passport) return;
    setIsExportingPdf(true);

    try {
      const htmlContent = await preparePdfHtml();

      if (Platform.OS === 'web') {
        // Web ortamında doğrudan PDF yazdırma ve indirme penceresi
        await Print.printAsync({ html: htmlContent });
      } else {
        // Mobil ortamında: Gerçek A4 PDF dosyası üret
        const pdfFile = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        // Üretilen gerçek .pdf dosyasını sistem paylaşım / kaydetme servisiyle aç
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(pdfFile.uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: `Sikkelobedi Pasaport - ${passport.certificateNumber}.pdf`,
          });
        } else {
          // Alternatif: Doğrudan işletim sistemi yazdırma / PDF kaydetme penceresini aç
          await Print.printAsync({ html: htmlContent });
        }
      }

      setPdfSuccessMessage(true);
      setTimeout(() => setPdfSuccessMessage(false), 4000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      Alert.alert(
        'PDF Oluşturma',
        'PDF hazırlanırken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 2. Doğrudan Yazdır / PDF Olarak Kaydet (Native Android/iOS Print Spooler)
  const handleDirectPrintPdf = async () => {
    if (!coin || !passport) return;
    try {
      const htmlContent = await preparePdfHtml();
      await Print.printAsync({ html: htmlContent });
    } catch (err: any) {
      console.error('Direct print error:', err);
    }
  };

  if (!coin || !passport) {
    return (
      <View style={styles.errorScreen}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={54} color={CERT_COLORS.borderGold} />
        <Text style={styles.errorTitle}>Sertifika Verisi Bulunamadı</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* 1. ÜST NAVİGASYON BARI */}
      <View style={styles.navBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.navIconBtn}>
          <Ionicons name="chevron-back" size={20} color={CERT_COLORS.darkText} />
        </TouchableOpacity>

        <View style={styles.navTitleGroup}>
          <Text style={styles.navEyebrow}>RESMİ TESCİL BELGESİ</Text>
          <Text style={styles.navTitle}>Dijital Nümizmatik Pasaportu</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDownloadAndSharePdf}
          style={styles.navIconBtn}>
          <Ionicons name="download-outline" size={19} color={CERT_COLORS.borderGold} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ==================== RESMİ PASAPORT / SERTİFİKA BELGESİ KARTI ==================== */}
        <View style={styles.passportCard}>
          {/* Altın Çerçeve Çizgisi ve Köşe Guilloche Detayları */}
          <View style={styles.guillocheBorder} />

          {/* 1. KURUM MÜHRÜ VE SERTİFİKA NUMARASI */}
          <View style={styles.certHeader}>
            <View style={styles.institutionSealBox}>
              <View style={styles.sealEmboss}>
                <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sealSubtitle}>ULUSLARARASI NÜMİSMATİK OTORİTESİ</Text>
                <Text style={styles.sealTitle}>Sikkelobedi Nümizmatik Enstitüsü</Text>
                <Text style={styles.sealStandard}>ISO / NGC Ancients Standartlarında Tescil</Text>
              </View>
            </View>

            {/* Benzersiz Sertifika Numarası Rozeti */}
            <View style={styles.certBadgeBox}>
              <View style={styles.certBadgeTagRow}>
                <Ionicons name="key-outline" size={11} color={CERT_COLORS.borderGold} />
                <Text style={styles.certBadgeTag}>SERTİFİKA NO</Text>
              </View>
              <Text style={styles.certBadgeNumber}>{passport.certificateNumber}</Text>
              <Text style={styles.certIssueDate}>Tescil: {passport.issueDate}</Text>
            </View>
          </View>

          {/* 2. ESER BAŞLIĞI & MEDENİYET KİMLİĞİ */}
          <View style={styles.coinHeaderBlock}>
            <View style={styles.coinCivRow}>
              <Ionicons name="ribbon-outline" size={13} color={CERT_COLORS.borderGold} />
              <Text style={styles.coinCivText}>{coin.civilization.toUpperCase()}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.coinPeriodText}>{coin.period}</Text>
            </View>
            <Text style={styles.coinMainTitle}>{coin.title}</Text>
            <Text style={styles.coinMintInfo}>
              Basım Darphanesi: <Text style={{ fontWeight: '700' }}>{coin.mint || 'İmparatorluk Merkez Darphanesi'}</Text>
            </Text>
          </View>

          {/* 3. ÖN VE ARKA YÜZ YÜKSEK ÇÖZÜNÜRLÜKLÜ MAKRO FOTOĞRAFLAR */}
          <View style={styles.photosSection}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="camera-outline" size={15} color={CERT_COLORS.borderGold} />
              <Text style={styles.sectionHeaderTitle}>1200 DPI Spektro-Makro Görseller</Text>
            </View>

            <View style={styles.photosRow}>
              {/* Ön Yüz (Avers) */}
              <View style={styles.photoCol}>
                <View style={styles.coinFrameBox}>
                  <Image
                    source={{ uri: coin.obverseImage }}
                    style={styles.macroCoinImage}
                    contentFit="cover"
                    contentPosition={isComposite ? 'left' : 'center'}
                    transition={200}
                  />
                  <View style={styles.macroZoomBadge}>
                    <Ionicons name="scan" size={10} color="#FFFFFF" />
                    <Text style={styles.macroZoomText}>AVERS</Text>
                  </View>
                </View>
                <Text style={styles.photoCaptionTitle}>Ön Yüz (Avers)</Text>
                <Text style={styles.photoCaptionSub} numberOfLines={2}>
                  {coin.obverseDesc}
                </Text>
              </View>

              {/* Arka Yüz (Revers) */}
              <View style={styles.photoCol}>
                <View style={styles.coinFrameBox}>
                  <Image
                    source={{ uri: coin.reverseImage }}
                    style={styles.macroCoinImage}
                    contentFit="cover"
                    contentPosition={isComposite ? 'right' : 'center'}
                    transition={200}
                  />
                  <View style={styles.macroZoomBadge}>
                    <Ionicons name="scan" size={10} color="#FFFFFF" />
                    <Text style={styles.macroZoomText}>REVERS</Text>
                  </View>
                </View>
                <Text style={styles.photoCaptionTitle}>Arka Yüz (Revers)</Text>
                <Text style={styles.photoCaptionSub} numberOfLines={2}>
                  {coin.reverseDesc}
                </Text>
              </View>
            </View>
          </View>

          {/* 4. TÜM SPEKTROMETRE VE METALURJİ VERİLERİ (XRF LABORATUVAR ANALİZİ) */}
          <View style={styles.specSection}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flask-outline" size={15} color={CERT_COLORS.borderGold} />
              <Text style={styles.sectionHeaderTitle}>XRF Spektrometre & Metalurjik Veriler</Text>
            </View>

            <View style={styles.specGrid}>
              {/* Maden Saflığı */}
              <View style={[styles.specCard, { width: '100%' }]}>
                <Text style={styles.specLabel}>MADEN SAFLIĞI & ALAŞIM BİLEŞİMİ</Text>
                <View style={styles.specValueRow}>
                  <Ionicons name="shield" size={14} color={CERT_COLORS.borderGold} />
                  <Text style={[styles.specValueText, { color: CERT_COLORS.borderGold }]}>
                    {passport.metallurgy.purity}
                  </Text>
                </View>
              </View>

              {/* Gramaj Ölçümü */}
              <View style={styles.specCard}>
                <Text style={styles.specLabel}>HASSAS AĞIRLIK</Text>
                <Text style={styles.specValueText}>{passport.metallurgy.weightExact}</Text>
              </View>

              {/* Çap & Kalınlık */}
              <View style={styles.specCard}>
                <Text style={styles.specLabel}>ÇAP & KALINLIK</Text>
                <Text style={styles.specValueText}>{passport.metallurgy.diameterExact}</Text>
              </View>

              {/* Özgül Ağırlık / Yoğunluk */}
              <View style={styles.specCard}>
                <Text style={styles.specLabel}>ÖZGÜL AĞIRLIK (YOĞUNLUK)</Text>
                <Text style={styles.specValueText}>{passport.metallurgy.specificGravity}</Text>
              </View>

              {/* Darp Ekseni (Die Axis) */}
              <View style={styles.specCard}>
                <Text style={styles.specLabel}>DARP EKSENİ (DIE AXIS)</Text>
                <Text style={styles.specValueText}>{passport.metallurgy.dieAxis}</Text>
              </View>

              {/* Kondisyon ve Sheldon Derecesi */}
              <View style={[styles.specCard, { width: '100%', backgroundColor: CERT_COLORS.goldLight }]}>
                <Text style={[styles.specLabel, { color: CERT_COLORS.borderGold }]}>
                  KONDİSYON DERECESİ (SHELDON STANDART)
                </Text>
                <View style={styles.specGradeRow}>
                  <Text style={styles.specGradeTitle}>{passport.sheldonGrade}</Text>
                  <View style={styles.gradeScores}>
                    <Text style={styles.gradeScorePill}>Vuruş: {passport.strikeScore.split(' ')[0]}</Text>
                    <Text style={styles.gradeScorePill}>Yüzey: {passport.surfaceScore.split(' ')[0]}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 5. SAHTELİK RİSK TARAMA RAPORU (YAPAY ZEKA VE NÜMİZMAT HEYETİ) */}
          <View style={styles.securityReportBox}>
            <View style={styles.securityHeader}>
              <View style={styles.securityIconBox}>
                <Ionicons name="checkmark-done-circle" size={22} color={CERT_COLORS.greenSuccess} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.securityBadgeRow}>
                  <Text style={styles.securityBadge}>GÖRSEL YAPAY ZEKA İLE DOĞRULANMIŞTIR</Text>
                </View>
                <Text style={styles.securityScoreTitle}>
                  Orijinallik Güvencesi: %{passport.authenticity.aiScore}
                </Text>
              </View>
            </View>

            <View style={styles.securityDetailsList}>
              <View style={styles.securityDetailRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={CERT_COLORS.greenSuccess} />
                <Text style={styles.securityDetailText}>{passport.authenticity.dieMatch}</Text>
              </View>
              <View style={styles.securityDetailRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={CERT_COLORS.greenSuccess} />
                <Text style={styles.securityDetailText}>{passport.authenticity.patinaAge}</Text>
              </View>
              <View style={styles.securityDetailRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={CERT_COLORS.greenSuccess} />
                <Text style={styles.securityDetailText}>{passport.authenticity.metallurgicConsistency}</Text>
              </View>
            </View>

            <View style={styles.verifiedByFooter}>
              <Ionicons name="finger-print" size={13} color={CERT_COLORS.secondaryText} />
              <Text style={styles.verifiedByText}>Doğrulayan: {passport.authenticity.verifiedBy}</Text>
            </View>
          </View>

          {/* 6. DİNAMİK KAREKOD (QR CODE) VE BLOKZİNCİR HASH DOĞRULAMA ALANI */}
          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              {/* SVG Tabanlı Temsili Karekod Çizimi */}
              <Svg width={96} height={96} viewBox="0 0 96 96">
                <Defs>
                  <LinearGradient id="qrGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#1E232B" />
                    <Stop offset="100%" stopColor="#0B0D10" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="96" height="96" fill="#FFFFFF" rx="8" />
                {/* Dış Köşe Kareleri (Finder Patterns) */}
                <Rect x="8" y="8" width="26" height="26" fill="url(#qrGrad)" rx="4" />
                <Rect x="13" y="13" width="16" height="16" fill="#FFFFFF" rx="2" />
                <Rect x="17" y="17" width="8" height="8" fill="url(#qrGrad)" />

                <Rect x="62" y="8" width="26" height="26" fill="url(#qrGrad)" rx="4" />
                <Rect x="67" y="13" width="16" height="16" fill="#FFFFFF" rx="2" />
                <Rect x="71" y="17" width="8" height="8" fill="url(#qrGrad)" />

                <Rect x="8" y="62" width="26" height="26" fill="url(#qrGrad)" rx="4" />
                <Rect x="13" y="67" width="16" height="16" fill="#FFFFFF" rx="2" />
                <Rect x="17" y="71" width="8" height="8" fill="url(#qrGrad)" />

                {/* İç Rastgele Veri Blokları */}
                <Rect x="40" y="12" width="6" height="18" fill="url(#qrGrad)" />
                <Rect x="50" y="8" width="7" height="6" fill="url(#qrGrad)" />
                <Rect x="42" y="38" width="12" height="12" fill={CERT_COLORS.borderGold} rx="2" />
                <Rect x="12" y="42" width="18" height="6" fill="url(#qrGrad)" />
                <Rect x="62" y="42" width="14" height="6" fill="url(#qrGrad)" />
                <Rect x="80" y="40" width="8" height="18" fill="url(#qrGrad)" />
                <Rect x="40" y="62" width="8" height="12" fill="url(#qrGrad)" />
                <Rect x="54" y="66" width="14" height="8" fill="url(#qrGrad)" />
                <Rect x="48" y="80" width="18" height="8" fill="url(#qrGrad)" />
                <Rect x="74" y="76" width="14" height="12" fill="url(#qrGrad)" />
              </Svg>
            </View>

            <View style={{ flex: 1, paddingLeft: 14 }}>
              <View style={styles.qrTitleRow}>
                <Ionicons name="qr-code" size={14} color={CERT_COLORS.borderGold} />
                <Text style={styles.qrTitle}>KAREKODLA ORİJİNALLİK SORGULAMA</Text>
              </View>
              <Text style={styles.qrDesc}>
                Kameranızı karekoda tutarak eserin Sikkelobedi global sicil kaydını ve müze veritabanı eşleşmesini anında doğrulayın.
              </Text>
              <Text style={styles.registryHashText} numberOfLines={1}>
                Sicil Kodu: {passport.registryHash}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. BUTONLAR: "PDF İNDİR VE PAYLAŞ", "DOĞRUDAN YAZDIR" VE "SİGORTA RAPORU" */}
        <View style={styles.actionButtonsContainer}>
          {/* 1. Gerçek PDF Dosyası İndir ve Paylaş */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDownloadAndSharePdf}
            style={styles.exportPdfButton}>
            <Ionicons name="download" size={18} color="#FFFFFF" />
            <Text style={styles.exportPdfButtonText}>
              {isExportingPdf ? 'PDF Dosyası Hazırlanıyor...' : 'PDF İndir ve Paylaş (Resmi Belge)'}
            </Text>
          </TouchableOpacity>

          {/* 2. Doğrudan Yazdır / PDF Olarak Kaydet (Sistem Print Spooler) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDirectPrintPdf}
            style={styles.printPdfButton}>
            <Ionicons name="print-outline" size={18} color="#1E232B" />
            <Text style={styles.printPdfButtonText}>
              Doğrudan Yazdır / PDF Olarak Kaydet
            </Text>
          </TouchableOpacity>

        </View>

        {pdfSuccessMessage && (
          <View style={styles.toastSuccess}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.toastSuccessText}>
              A4 Resmi PDF belgesi oluşturuldu ve paylaşım menüsüne aktarıldı.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
  },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: CERT_COLORS.borderGold,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navTitleGroup: {
    alignItems: 'center',
  },
  navEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: CERT_COLORS.borderGold,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: CERT_COLORS.darkText,
    letterSpacing: -0.2,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 48,
  },
  // Pasaport Sertifika Kartı
  passportCard: {
    backgroundColor: CERT_COLORS.parchmentBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 2,
    borderColor: CERT_COLORS.borderGold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  guillocheBorder: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.2)',
    borderRadius: BorderRadius.md,
    pointerEvents: 'none',
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm + 2,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(158, 123, 59, 0.25)',
    gap: 10,
  },
  institutionSealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sealEmboss: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CERT_COLORS.sealBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CERT_COLORS.borderGold,
  },
  sealSubtitle: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: CERT_COLORS.borderGold,
  },
  sealTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: CERT_COLORS.darkText,
    marginTop: 1,
  },
  sealStandard: {
    fontSize: 8.5,
    color: CERT_COLORS.secondaryText,
    marginTop: 1,
  },
  certBadgeBox: {
    backgroundColor: CERT_COLORS.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.35)',
    alignItems: 'flex-end',
  },
  certBadgeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  certBadgeTag: {
    fontSize: 8,
    fontWeight: '800',
    color: CERT_COLORS.borderGold,
    letterSpacing: 0.5,
  },
  certBadgeNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: CERT_COLORS.borderGold,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  certIssueDate: {
    fontSize: 8.5,
    color: CERT_COLORS.secondaryText,
    marginTop: 1,
  },
  coinHeaderBlock: {
    marginVertical: Spacing.sm + 2,
    paddingBottom: Spacing.xs,
  },
  coinCivRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  coinCivText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: CERT_COLORS.borderGold,
    letterSpacing: 0.8,
  },
  dotSeparator: {
    color: CERT_COLORS.mutedText,
    fontSize: 10,
  },
  coinPeriodText: {
    fontSize: 9.5,
    color: CERT_COLORS.secondaryText,
  },
  coinMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: CERT_COLORS.darkText,
    letterSpacing: -0.3,
  },
  coinMintInfo: {
    fontSize: 11,
    color: CERT_COLORS.secondaryText,
    marginTop: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: CERT_COLORS.darkText,
    letterSpacing: -0.2,
  },
  // Makro Fotoğraflar
  photosSection: {
    marginBottom: Spacing.md,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoCol: {
    flex: 1,
    alignItems: 'center',
  },
  coinFrameBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(158, 123, 59, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  macroCoinImage: {
    width: '100%',
    height: '100%',
  },
  macroZoomBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(26, 29, 32, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  macroZoomText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  photoCaptionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: CERT_COLORS.darkText,
    marginTop: 6,
  },
  photoCaptionSub: {
    fontSize: 9.5,
    color: CERT_COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
  },
  // Spektrometre Tablosu
  specSection: {
    marginBottom: Spacing.md,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specCard: {
    width: (SCREEN_WIDTH - 84) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: CERT_COLORS.mutedText,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  specValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: CERT_COLORS.darkText,
  },
  specGradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  specGradeTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: CERT_COLORS.borderGold,
  },
  gradeScores: {
    flexDirection: 'row',
    gap: 4,
  },
  gradeScorePill: {
    fontSize: 9,
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: CERT_COLORS.borderGold,
  },
  // Sahtelik Raporu
  securityReportBox: {
    backgroundColor: CERT_COLORS.greenLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
    marginBottom: Spacing.md,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  securityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityBadgeRow: {
    flexDirection: 'row',
  },
  securityBadge: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: CERT_COLORS.greenSuccess,
  },
  securityScoreTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#14532D',
    marginTop: 1,
  },
  securityDetailsList: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 128, 61, 0.15)',
    paddingTop: 6,
    marginBottom: 6,
  },
  securityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  securityDetailText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  verifiedByFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 128, 61, 0.12)',
  },
  verifiedByText: {
    fontSize: 9,
    color: '#15803D',
    fontWeight: '600',
  },
  // QR Kod Alanı
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrContainer: {
    width: 96,
    height: 96,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  qrTitle: {
    fontSize: 8.5,
    fontWeight: '800',
    color: CERT_COLORS.borderGold,
    letterSpacing: 0.5,
  },
  qrDesc: {
    fontSize: 10,
    color: CERT_COLORS.secondaryText,
    lineHeight: 14,
  },
  registryHashText: {
    fontSize: 8.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: CERT_COLORS.mutedText,
    marginTop: 4,
  },
  // Alt Aksiyon Butonları
  actionButtonsContainer: {
    marginTop: Spacing.md,
    gap: 10,
  },
  exportPdfButton: {
    backgroundColor: CERT_COLORS.borderGold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    shadowColor: CERT_COLORS.goldBright,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  exportPdfButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  printPdfButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#1E232B',
  },
  printPdfButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E232B',
  },
  toastSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CERT_COLORS.greenSuccess,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginTop: 10,
  },
  toastSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
});

