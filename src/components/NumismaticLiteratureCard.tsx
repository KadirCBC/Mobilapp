import React, { useState } from 'react';
import {
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { CoinItem } from '@/data/mockData';
import {
  getCoinLiteratureReference,
  NumismaticLiteratureData,
  ReferenceCodeItem,
} from '@/data/coinReferences';
import { useTheme } from '@/hooks/use-theme';

export interface NumismaticLiteratureCardProps {
  coin: CoinItem;
}

export function NumismaticLiteratureCard({ coin }: NumismaticLiteratureCardProps) {
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [citationCopied, setCitationCopied] = useState(false);

  const literature: NumismaticLiteratureData = getCoinLiteratureReference(coin);

  const handleCopyCode = async (item: ReferenceCodeItem) => {
    try {
      setCopiedKey(item.catalogKey);
      await Share.share({
        message: `${item.catalogName}: ${item.code} (${item.detail}) • Eser: ${coin.title}`,
      });
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleShareCitation = async () => {
    try {
      setCitationCopied(true);
      await Share.share({
        title: literature.citation.bookTitle,
        message: `Akademik Nümizmatik Künyesi:\n${literature.apaCitation}\n\nStandart Referans: ${literature.primaryReference}\nKatalog: Sikkelobedi Nümizmatik Veritabanı`,
      });
      setTimeout(() => setCitationCopied(false), 2500);
    } catch {
      setCitationCopied(false);
    }
  };

  const handleOpenLibrarySearch = async () => {
    // Öncelik: OCRE (Online Coins of the Roman Empire) veya WorldCat veya Google Scholar
    const targetUrl =
      literature.citation.ocreUrl ||
      literature.citation.worldCatUrl ||
      literature.citation.britishMuseumUrl ||
      `https://scholar.google.com/scholar?q=${encodeURIComponent(
        literature.citation.searchQuery
      )}`;

    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      }
    } catch {
      // Hata durumunda yutulur
    }
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* 1. ÜST BAŞLIK ALANI */}
      <View style={styles.cardHeader}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="library-outline" size={18} color="#9E7B3B" />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <View style={styles.scholarlyBadge}>
              <Ionicons name="ribbon-outline" size={10} color="#9E7B3B" />
              <Text style={styles.scholarlyBadgeText}>STANDART NÜMİZMATİK KORPUS</Text>
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Standart Literatür & Referanslar
          </Text>
          <Text style={styles.cardSubtitle}>
            Müze envanterlerinde, uluslararası müzayede evlerinde ve akademik yayınlarda tescilli tipoloji kayıtları.
          </Text>
        </View>
      </View>

      {/* 2. BİRİNCİL REFERANS KODU VURGUSU */}
      <View style={styles.primaryRefBox}>
        <View style={styles.primaryRefLeft}>
          <Ionicons name="sparkles" size={14} color="#9E7B3B" />
          <Text style={styles.primaryRefLabel}>BİRİNCİL REFERANS KODU:</Text>
        </View>
        <Text style={styles.primaryRefValue}>{literature.primaryReference}</Text>
      </View>

      {/* 3. REFERANS KODLARI IZGARASI (GRID: RIC, BMC, SEAR, SNG / RPC) */}
      <View style={styles.gridContainer}>
        {literature.referenceCodes.map((ref, idx) => {
          const isCopied = copiedKey === ref.catalogKey;
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.82}
              onPress={() => handleCopyCode(ref)}
              style={styles.gridBox}>
              <View style={styles.gridBoxHeader}>
                <View style={styles.catalogTag}>
                  <Text style={styles.catalogTagText}>{ref.catalogKey}</Text>
                </View>
                <Ionicons
                  name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                  size={13}
                  color={isCopied ? '#15803D' : '#94A3B8'}
                />
              </View>

              <Text style={styles.gridCodeText} numberOfLines={1}>
                {ref.code}
              </Text>
              <Text style={styles.gridCatalogName} numberOfLines={1}>
                {ref.catalogName}
              </Text>
              <Text style={styles.gridDetailText} numberOfLines={2}>
                {ref.detail}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. AKADEMİK YAYIN VE KİTAP KÜNYESİ KARTI */}
      <View style={styles.publicationCard}>
        <View style={styles.pubHeaderRow}>
          <View style={styles.pubBookIconCircle}>
            <Ionicons name="book-outline" size={16} color="#9E7B3B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pubCardLabel}>İLGİLİ TEMEL AKADEMİK YAYIN KÜNYESİ</Text>
            <Text style={styles.pubBookTitle}>
              {literature.citation.bookTitle}
            </Text>
          </View>
        </View>

        <View style={styles.pubMetadataList}>
          {/* Yazarlar */}
          <View style={styles.pubMetaItem}>
            <Ionicons name="create-outline" size={13} color="#9E7B3B" />
            <Text style={styles.pubMetaLabel}>Müellif / Heyet:</Text>
            <Text style={styles.pubMetaValue} numberOfLines={1}>
              {literature.citation.authors}
            </Text>
          </View>

          {/* Yayıncı & Yıl */}
          <View style={styles.pubMetaItem}>
            <Ionicons name="business-outline" size={13} color="#9E7B3B" />
            <Text style={styles.pubMetaLabel}>Yayınevi & Yıl:</Text>
            <Text style={styles.pubMetaValue} numberOfLines={1}>
              {literature.citation.publisher} ({literature.citation.publicationYear})
            </Text>
          </View>

          {/* Cilt ve Standart Numara */}
          <View style={styles.pubMetaItem}>
            <Ionicons name="barcode-outline" size={13} color="#9E7B3B" />
            <Text style={styles.pubMetaLabel}>Standart Kod:</Text>
            <Text style={styles.pubMetaValue}>
              {literature.citation.isbnOrDoi}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. KÜRATOR KONKORDANS NOTU */}
      <View style={styles.concordanceBox}>
        <Ionicons name="information-circle-outline" size={15} color="#9E7B3B" />
        <Text style={styles.concordanceText}>
          {literature.concordanceNote}
        </Text>
      </View>

      {/* 6. AKSİYON BUTONLARI: KÜTÜPHANEDE ARA & KÜNYEYİ KOPYALA */}
      <View style={styles.actionsRow}>
        {/* Tek Tıkla Kütüphane / Kaynakça Arama Butonu */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenLibrarySearch}
          style={styles.searchLibraryBtn}>
          <Ionicons name="search" size={15} color="#FFFFFF" />
          <Text style={styles.searchLibraryBtnText}>
            OCRE & Uluslararası Kütüphanede Ara
          </Text>
          <Ionicons name="open-outline" size={13} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Akademik Künyeyi Kopyala Butonu */}
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleShareCitation}
          style={styles.copyCitationBtn}>
          <Ionicons
            name={citationCopied ? 'checkmark-circle' : 'share-social-outline'}
            size={15}
            color={citationCopied ? '#15803D' : '#9E7B3B'}
          />
          <Text style={[styles.copyCitationBtnText, citationCopied && { color: '#15803D' }]}>
            {citationCopied ? 'Paylaşıldı' : 'Künyeyi Al'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginVertical: Spacing.sm,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // 1. ÜST BAŞLIK
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  scholarlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBF5E8',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.35)',
  },
  scholarlyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 2,
  },

  // 2. BİRİNCİL REFERANS KODU
  primaryRefBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBF5E8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  primaryRefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  primaryRefLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.5,
  },
  primaryRefValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1D20',
  },

  // 3. REFERANS KODLARI GRID (2x2)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBox: {
    flexBasis: '48.5%',
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 3,
  },
  gridBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  catalogTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catalogTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.5,
  },
  gridCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
  },
  gridCatalogName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  gridDetailText: {
    fontSize: 9.5,
    color: '#94A3B8',
    lineHeight: 13,
    marginTop: 2,
  },

  // 4. AKADEMİK YAYIN KÜNYESİ
  publicationCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  pubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pubBookIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pubCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.6,
  },
  pubBookTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1A1D20',
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 1,
  },
  pubMetadataList: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  pubMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pubMetaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  pubMetaValue: {
    fontSize: 10.5,
    color: '#334155',
    flex: 1,
  },

  // 5. KÜRATÖR NOTU
  concordanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#FBF5E8',
    borderRadius: BorderRadius.sm,
    padding: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.25)',
  },
  concordanceText: {
    flex: 1,
    fontSize: 10.5,
    color: '#785A24',
    lineHeight: 15,
  },

  // 6. AKSİYON BUTONLARI
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchLibraryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#9E7B3B',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  searchLibraryBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  copyCitationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  copyCitationBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});

