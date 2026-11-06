import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { BorderRadius, Spacing } from '@/constants/theme';
import { CoinItem } from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AuctionSaleRecord {
  id: string;
  auctionHouse: string;
  date: string;
  lotNumber: string;
  conditionGrade: string;
  hammerPrice: number;
  currency: string;
}

export interface YearPricePoint {
  year: number;
  price: number;
  salesCount: number;
}

// Renk Sabitleri
const PALETTE = {
  goldPrimary: '#9E7B3B',
  goldBright: '#D4AF37',
  goldLight: '#FBF5E8',
  goldBorder: 'rgba(158, 123, 59, 0.28)',
  darkText: '#1A1D20',
  secondaryText: '#64748B',
  mutedText: '#94A3B8',
  cardBg: '#FFFFFF',
  surfaceSubtle: '#F8F9FA',
  greenSuccess: '#16A34A',
  greenLight: '#DCFCE7',
  borderColor: '#E2E8F0',
};

export function getCoinAuctionData(coin: CoinItem) {
  const basePrice =
    coin.numericPrice ??
    parseInt(coin.estimatedValue.replace(/[^0-9]/g, '') || '1200', 10);

  // Son 5 Yıl (2021-2025) gerçekçi nümizmatik getiri serisi
  const p2021 = Math.round(basePrice * 0.67);
  const p2022 = Math.round(basePrice * 0.75);
  const p2023 = Math.round(basePrice * 0.85);
  const p2024 = Math.round(basePrice * 0.94);
  const p2025 = basePrice;

  const yearPoints: YearPricePoint[] = [
    { year: 2021, price: p2021, salesCount: 6 },
    { year: 2022, price: p2022, salesCount: 9 },
    { year: 2023, price: p2023, salesCount: 14 },
    { year: 2024, price: p2024, salesCount: 18 },
    { year: 2025, price: p2025, salesCount: 23 },
  ];

  const salesRecords: AuctionSaleRecord[] = [
    {
      id: 'sale-1',
      auctionHouse: 'CNG Auction 124',
      date: '18 Eki 2024',
      lotNumber: 'Lot 412',
      conditionGrade: 'Ch VF, Strike 4/5, Surface 3/5',
      hammerPrice: Math.round(basePrice * 0.98),
      currency: '$',
    },
    {
      id: 'sale-2',
      auctionHouse: 'Nomos 28',
      date: '04 May 2024',
      lotNumber: 'Lot 189',
      conditionGrade: 'NGC Choice AU, Strike 5/5',
      hammerPrice: Math.round(basePrice * 1.08),
      currency: '$',
    },
    {
      id: 'sale-3',
      auctionHouse: 'Gorny & Mosch 298',
      date: '14 Kas 2023',
      lotNumber: 'Lot 503',
      conditionGrade: 'EF / XF (Extremely Fine)',
      hammerPrice: Math.round(basePrice * 0.88),
      currency: '$',
    },
    {
      id: 'sale-4',
      auctionHouse: 'Leu Numismatik 14',
      date: '12 Haz 2023',
      lotNumber: 'Lot 271',
      conditionGrade: 'VF (Temiz / Well-Centered)',
      hammerPrice: Math.round(basePrice * 0.82),
      currency: '$',
    },
    {
      id: 'sale-5',
      auctionHouse: 'Heritage Auctions 3096',
      date: '21 Oca 2022',
      lotNumber: 'Lot 31082',
      conditionGrade: 'Good VF, Light Toning',
      hammerPrice: Math.round(basePrice * 0.74),
      currency: '$',
    },
  ];

  const growthPercent = Math.round(((p2025 - p2021) / p2021) * 100);
  const averagePrice = Math.round((p2021 + p2022 + p2023 + p2024 + p2025) / 5);

  return {
    yearPoints,
    salesRecords,
    growthPercent,
    averagePrice,
    currentPrice: p2025,
  };
}

interface AuctionValueIndexProps {
  coin: CoinItem;
}

export const AuctionValueIndex: React.FC<AuctionValueIndexProps> = ({ coin }) => {
  const data = useMemo(() => getCoinAuctionData(coin), [coin]);

  // Seçili Grafik Noktası (varsayılan en son yıl)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(4);

  // Grafik Boyutları
  const chartWidth = Math.max(SCREEN_WIDTH - 64, 300);
  const chartHeight = 175;
  const paddingLeft = 36;
  const paddingRight = 24;
  const paddingTop = 26;
  const paddingBottom = 32;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Min ve Max Fiyat
  const prices = data.yearPoints.map((p) => p.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.9);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.08);

  // Nokta Koordinatları Hesabı
  const points = data.yearPoints.map((p, index) => {
    const x = paddingLeft + (index / (data.yearPoints.length - 1)) * innerWidth;
    const y =
      paddingTop +
      innerHeight -
      ((p.price - minPrice) / (maxPrice - minPrice)) * innerHeight;
    return { ...p, x, y };
  });

  // SVG Çizgi Yolu ve Alan Doldurma Yolu
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, curr, index) => {
      if (index === 0) return `M ${curr.x} ${curr.y}`;
      // Pürüzsüz kıvrım için kontrol noktaları
      const prev = points[index - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = chartHeight - paddingBottom;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [linePath, points]);

  const activePoint = points[selectedPointIndex] || points[points.length - 1];

  return (
    <View style={styles.container}>
      {/* 1. BİLEŞEN ÜST BAŞLIĞI */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconBox}>
          <Ionicons name="trending-up" size={18} color={PALETTE.goldPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.headerTagRow}>
            <Text style={styles.headerTagText}>MÜZAYEDE SATIŞ İNDEKSİ</Text>
            <View style={styles.livePulseDot} />
          </View>
          <Text style={styles.headerTitle}>Değer Trendi & Çekiç Fiyatları</Text>
        </View>
      </View>

      {/* 2. ÖZET GETİRİ & METRİK KARTLARI */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>5 YILLIK ARTIŞ (ROI)</Text>
          <View style={styles.growthRow}>
            <Ionicons name="arrow-up-circle" size={16} color={PALETTE.greenSuccess} />
            <Text style={styles.growthText}>
              {coin.roi5y ? (coin.roi5y.startsWith('+') ? coin.roi5y : `+${coin.roi5y}`) : `+${data.growthPercent}%`}
            </Text>
          </View>
          <Text style={styles.metricSub}>2021 – 2025 Dönemi</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ORT. ÇEKİÇ FİYATI</Text>
          <Text style={styles.metricValue}>
            ${(coin.avgHammerPrice || data.averagePrice).toLocaleString()}
          </Text>
          <Text style={styles.metricSub}>Son 5 Yıldaki Müzayedeler</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>LİKİDİTE DERECESİ</Text>
          <View style={styles.liquidityRow}>
            <Ionicons name="star" size={13} color={PALETTE.goldBright} />
            <Text style={styles.liquidityValue}>{coin.liquidityGrade || 'A+ Üstün'}</Text>
          </View>
          <Text style={styles.metricSub}>Yüksek Alıcı Talebi</Text>
        </View>
      </View>

      {/* 3. ZAMAN SERİSİ GRAFİĞİ (SON 5 YIL ÇEKİÇ FİYATI EĞRİSİ) */}
      <View style={styles.chartWrapper}>
        <View style={styles.chartTitleBar}>
          <View>
            <Text style={styles.chartSectionTitle}>Yıllara Göre Değer Eğrisi</Text>
            <Text style={styles.chartSectionSubtitle}>
              Noktalara dokunarak o yılın çekiç fiyatını inceleyin
            </Text>
          </View>

          {/* Aktif Seçili Fiyat Balonu */}
          <View style={styles.activePriceBadge}>
            <Text style={styles.activePriceYear}>{activePoint.year}</Text>
            <Text style={styles.activePriceValue}>
              ${activePoint.price.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* SVG Çizgi Grafiği */}
        <View style={styles.svgContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#D4AF37" stopOpacity="0.32" />
                <Stop offset="70%" stopColor="#9E7B3B" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#9E7B3B" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Yatay Rehber Kılavuz Çizgileri */}
            {[0.2, 0.5, 0.8].map((ratio, idx) => {
              const y = paddingTop + innerHeight * ratio;
              return (
                <Line
                  key={idx}
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={PALETTE.borderColor}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Alan Doldurması */}
            <Path d={areaPath} fill="url(#goldAreaGrad)" />

            {/* Altın-Bronz Çizgi Grafiği */}
            <Path
              d={linePath}
              fill="none"
              stroke={PALETTE.goldPrimary}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Yıllar ve Noktalar */}
            {points.map((pt, index) => {
              const isSelected = index === selectedPointIndex;
              return (
                <G key={pt.year}>
                  {/* Nokta Dış Parıltısı */}
                  {isSelected && (
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="rgba(212, 175, 55, 0.25)"
                    />
                  )}
                  {/* Nokta Çemberi */}
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6.5 : 4.5}
                    fill={isSelected ? '#FFFFFF' : PALETTE.goldPrimary}
                    stroke={PALETTE.goldPrimary}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* X Ekseni Yıl Yazıları */}
                  <SvgText
                    x={pt.x}
                    y={chartHeight - 10}
                    fontSize="11"
                    fontWeight={isSelected ? '800' : '500'}
                    fill={isSelected ? PALETTE.goldPrimary : PALETTE.secondaryText}
                    textAnchor="middle">
                    {pt.year}
                  </SvgText>
                </G>
              );
            })}
          </Svg>

          {/* Dokunmatik Nokta Seçicileri */}
          <View style={styles.touchOverlay} pointerEvents="box-none">
            {points.map((pt, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => setSelectedPointIndex(index)}
                style={[
                  styles.touchTarget,
                  {
                    left: pt.x - 22,
                    top: pt.y - 22,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* 4. SON MÜZAYEDE SATIŞLARI TABLOSU */}
      <View style={styles.tableSection}>
        <View style={styles.tableHeaderRow}>
          <View>
            <Text style={styles.tableTitle}>Son Müzayede Satışları</Text>
            <Text style={styles.tableSubtitle}>
              Uluslararası çekiç fiyatları ve sertifikalı kondisyon notları
            </Text>
          </View>
          <View style={styles.tableBadge}>
            <Text style={styles.tableBadgeText}>
              {data.salesRecords.length} Tescilli Satış
            </Text>
          </View>
        </View>

        {/* Satış Listesi Kartları */}
        <View style={styles.salesList}>
          {data.salesRecords.map((sale, index) => (
            <View
              key={sale.id}
              style={[
                styles.saleRowCard,
                index === 0 && styles.saleRowCardLatest,
              ]}>
              <View style={styles.saleLeftCol}>
                <View style={styles.auctionGavelBox}>
                  <Ionicons name="hammer" size={14} color={PALETTE.goldPrimary} />
                </View>
                <View>
                  <View style={styles.auctionHouseRow}>
                    <Text style={styles.auctionHouseName}>{sale.auctionHouse}</Text>
                    {index === 0 && (
                      <View style={styles.latestTag}>
                        <Text style={styles.latestTagText}>SON SATIŞ</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.saleMetaText}>
                    {sale.date} • {sale.lotNumber}
                  </Text>
                  <View style={styles.conditionChip}>
                    <Ionicons name="ribbon-outline" size={11} color="#64748B" />
                    <Text style={styles.conditionChipText} numberOfLines={1}>
                      {sale.conditionGrade}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Çekiç Fiyatı Rozeti */}
              <View style={styles.hammerPriceBox}>
                <Text style={styles.hammerPriceLabel}>ÇEKİÇ FİYATI</Text>
                <Text style={styles.hammerPriceAmount}>
                  {sale.currency}
                  {sale.hammerPrice.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(158, 123, 59, 0.22)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: PALETTE.goldLight,
    borderWidth: 1,
    borderColor: PALETTE.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  headerTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: PALETTE.goldPrimary,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.greenSuccess,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PALETTE.darkText,
    letterSpacing: -0.2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: PALETTE.cardBg,
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: PALETTE.secondaryText,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 15,
    fontWeight: '800',
    color: PALETTE.greenSuccess,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: PALETTE.goldPrimary,
  },
  liquidityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  liquidityValue: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.darkText,
  },
  metricSub: {
    fontSize: 9,
    color: PALETTE.mutedText,
    marginTop: 3,
  },
  chartWrapper: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: PALETTE.darkText,
  },
  chartSectionSubtitle: {
    fontSize: 10.5,
    color: PALETTE.secondaryText,
    marginTop: 2,
  },
  activePriceBadge: {
    backgroundColor: PALETTE.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: PALETTE.goldBorder,
    alignItems: 'flex-end',
  },
  activePriceYear: {
    fontSize: 9,
    fontWeight: '700',
    color: PALETTE.goldPrimary,
  },
  activePriceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: PALETTE.goldPrimary,
  },
  svgContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  touchOverlay: {
    ...StyleSheet.absoluteFill,
  },
  touchTarget: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tableSection: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
    marginBottom: Spacing.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: PALETTE.darkText,
  },
  tableSubtitle: {
    fontSize: 10.5,
    color: PALETTE.secondaryText,
    marginTop: 2,
  },
  tableBadge: {
    backgroundColor: PALETTE.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
  },
  tableBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.secondaryText,
  },
  salesList: {
    gap: 8,
  },
  saleRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: PALETTE.surfaceSubtle,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
  },
  saleRowCardLatest: {
    backgroundColor: PALETTE.goldLight,
    borderColor: PALETTE.goldBorder,
  },
  saleLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  auctionGavelBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
  },
  auctionHouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auctionHouseName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: PALETTE.darkText,
  },
  latestTag: {
    backgroundColor: PALETTE.goldPrimary,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  latestTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  saleMetaText: {
    fontSize: 10,
    color: PALETTE.secondaryText,
    marginTop: 1,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  conditionChipText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  hammerPriceBox: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
  },
  hammerPriceLabel: {
    fontSize: 7.5,
    fontWeight: '700',
    color: PALETTE.mutedText,
    letterSpacing: 0.6,
  },
  hammerPriceAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: PALETTE.goldPrimary,
    marginTop: 1,
  },
  ctaWrapper: {
    backgroundColor: '#1E232B',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  ctaIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PALETTE.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  ctaDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 15,
  },
  ctaButton: {
    backgroundColor: PALETTE.goldPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    shadowColor: PALETTE.goldBright,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.borderColor,
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: PALETTE.darkText,
  },
  modalSubtitleText: {
    fontSize: 11,
    color: PALETTE.secondaryText,
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: PALETTE.secondaryText,
    marginBottom: 8,
    marginTop: 10,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: PALETTE.surfaceSubtle,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
  },
  optionChipActive: {
    backgroundColor: PALETTE.goldLight,
    borderColor: PALETTE.goldPrimary,
  },
  optionChipText: {
    fontSize: 11,
    color: PALETTE.secondaryText,
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: PALETTE.goldPrimary,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: PALETTE.borderColor,
    backgroundColor: PALETTE.surfaceSubtle,
  },
  textInput: {
    flex: 1,
    fontSize: 12.5,
    color: PALETTE.darkText,
  },
  modalSubmitButton: {
    backgroundColor: PALETTE.goldPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: 18,
    marginBottom: 6,
  },
  modalSubmitButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PALETTE.greenSuccess,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: PALETTE.darkText,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 12,
    color: PALETTE.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
});
