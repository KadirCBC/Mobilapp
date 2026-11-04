import React, { useMemo, useState } from 'react';
import {
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
import { BorderRadius, BottomTabInset, Colors, Spacing } from '@/constants/theme';
import {
  CIVILIZATION_TABS,
  CivilizationTab,
  DYNASTY_GROUPS,
  DynastyGroup,
  RulerNode,
} from '@/data/dynasties';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

/**
 * Wikimedia Commons ve harici görselleri yüksek hızlı, önbellekli CDN (wsrv.nl) üzerinden
 * optimize eden ve mobil 403 Forbidden engellemelerini ortadan kaldıran akıllı dönüştürücü.
 */
export function getOptimizedImageUrl(url: string): string {
  if (!url) return '';
  if (url.includes('upload.wikimedia.org')) {
    // Thumbnail karmaşasını temizle ve orijinal Wikimedia Commons görsel yoluna dönüştür
    let clean = url.replace('https://upload.wikimedia.org/wikipedia/commons/thumb/', 'upload.wikimedia.org/wikipedia/commons/');
    clean = clean.replace('http://upload.wikimedia.org/wikipedia/commons/thumb/', 'upload.wikimedia.org/wikipedia/commons/');
    // Sondaki /400px- dosya adı tekrarını temizle
    clean = clean.replace(/\/[^/]+px-[^/]+$/, '');
    clean = clean.replace(/^https?:\/\//, '');
    return `https://wsrv.nl/?url=${encodeURIComponent(clean)}&w=400&fit=cover&output=webp`;
  }
  return url;
}

/**
 * 2:1 Panoramik / Çift Yüzlü Sikke Görsellerini Kusursuz Dairesel Yüze Çeviren Akıllı Bileşen
 * VCoins veya çift yönlü görsellerde sol taraf Ön Yüz (Avers), sağ taraf Arka Yüz (Revers) olarak
 * merkezlenir; portreler ise 1:1 tam kadrajda gösterilir.
 * Hata veya yükleme gecikmesinde kademeli olarak secondaryUri ve asil imparatorluk monogramına geçer.
 */
interface CoinFaceProps {
  uri: string;
  size: number;
  face?: 'obverse' | 'reverse' | 'full';
  borderColor?: string;
  borderWidth?: number;
  fallbackInitials?: string;
  secondaryUri?: string;
}

function CoinFace({
  uri,
  size,
  face = 'obverse',
  borderColor = '#9E7B3B',
  borderWidth = 1.5,
  fallbackInitials,
  secondaryUri,
}: CoinFaceProps) {
  const [activeUri, setActiveUri] = useState<string>(() => getOptimizedImageUrl(uri));
  const [triedSecondary, setTriedSecondary] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // URI değiştiğinde durumu sıfırla
  React.useEffect(() => {
    setActiveUri(getOptimizedImageUrl(uri));
    setTriedSecondary(false);
    setLoadError(false);
  }, [uri]);

  const handleImageError = () => {
    if (secondaryUri && !triedSecondary && secondaryUri !== uri) {
      setTriedSecondary(true);
      setActiveUri(getOptimizedImageUrl(secondaryUri));
    } else {
      setLoadError(true);
    }
  };

  const isComposite = activeUri.includes('vcoins.com') || activeUri.includes('product_image');
  // Portre için secondaryUri sikkesine geçilmişse, sikkenin ön yüzünü (imparator büstü) göster
  const effectiveFace = face === 'full' && isComposite ? 'obverse' : face;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        borderWidth,
        borderColor,
        backgroundColor: '#FBF5E8',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      {!loadError && activeUri ? (
        isComposite && effectiveFace !== 'full' ? (
          <Image
            source={{
              uri: activeUri,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            }}
            style={{
              width: size * 2.05,
              height: size,
              position: 'absolute',
              left: effectiveFace === 'obverse' ? 0 : undefined,
              right: effectiveFace === 'reverse' ? 0 : undefined,
              top: 0,
            }}
            contentFit="cover"
            transition={150}
            onError={handleImageError}
          />
        ) : (
          <Image
            source={{
              uri: activeUri,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            contentPosition="center"
            transition={150}
            onError={handleImageError}
          />
        )
      ) : null}

      {/* Görsel Yüklenemezse veya Fallback İkon / Monogramı */}
      {(loadError || !activeUri) && (
        <View style={styles.fallbackMonogramOverlay} pointerEvents="none">
          <Ionicons name="ribbon-outline" size={Math.round(size * 0.32)} color="#9E7B3B" />
          <Text
            style={[
              styles.fallbackMonogramText,
              { fontSize: Math.max(8, Math.round(size * 0.22)) },
            ]}>
            {fallbackInitials || 'NUM'}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function DynastiesScreen() {
  const router = useRouter();

  // 1. Seçili Medeniyet Sekmesi (Varsayılan: Roma)
  const [selectedCivId, setSelectedCivId] = useState<'rome' | 'byzantine' | 'greek' | 'ottoman'>('rome');

  // 2. Seçili Hanedan Filtresi ('all' veya spesifik dynastyId)
  const [selectedDynastyId, setSelectedDynastyId] = useState<string>('all');

  // 3. Görünüm Modu: Dikey Silsile (vertical) veya Yatay Ağaç (horizontal)
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');

  // 4. Detay Modalı / Açılan Hükümdar Kartı
  const [selectedRuler, setSelectedRuler] = useState<RulerNode | null>(null);

  // Aktif medeniyete ait hanedan grupları
  const currentDynastyGroups = useMemo(() => {
    return DYNASTY_GROUPS.filter((group) => group.civilizationId === selectedCivId);
  }, [selectedCivId]);

  // Filtrelenmiş veya tüm hükümdarlar
  const displayGroups = useMemo(() => {
    if (selectedDynastyId === 'all') return currentDynastyGroups;
    return currentDynastyGroups.filter((g) => g.id === selectedDynastyId);
  }, [currentDynastyGroups, selectedDynastyId]);

  // Aktif sekme bilgisi
  const activeCivTab = useMemo(() => {
    return CIVILIZATION_TABS.find((tab) => tab.id === selectedCivId) || CIVILIZATION_TABS[0];
  }, [selectedCivId]);

  // Toplam gösterilen hükümdar sayısı
  const totalRulerCount = useMemo(() => {
    return displayGroups.reduce((acc, g) => acc + g.rulers.length, 0);
  }, [displayGroups]);

  // Medeniyet değiştirildiğinde hanedan filtresini sıfırla
  const handleSelectCiv = (civId: 'rome' | 'byzantine' | 'greek' | 'ottoman') => {
    setSelectedCivId(civId);
    setSelectedDynastyId('all');
    setSelectedRuler(null);
  };

  // Hükümdara dokunulduğunda
  const handleRulerPress = (ruler: RulerNode) => {
    setSelectedRuler(ruler);
  };

  // Kataloğa yönlendir ("Bu Hükümdarın X Eserini İncele")
  const handleExploreRulerCoins = (ruler: RulerNode) => {
    setSelectedRuler(null);
    router.push({
      pathname: '/(tabs)',
      params: { ruler: ruler.searchQuery },
    } as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. ÜST BAŞLIK VE GERİ DÖNÜŞ ÇUBUĞU */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1A1D20" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <View style={styles.headerTagRow}>
            <Ionicons name="git-network-outline" size={13} color="#9E7B3B" />
            <Text style={styles.headerTagText}>NÜMİZMATİK VERASETSİLSİLESİ</Text>
          </View>
          <Text style={styles.headerMainTitle}>Hanedanlar & İmparatorlar</Text>
        </View>

        <View style={styles.statPill}>
          <Text style={styles.statPillCount}>{totalRulerCount}</Text>
          <Text style={styles.statPillLabel}>Hükümdar</Text>
        </View>
      </View>

      {/* 2. DÖRT BÜYÜK MEDENİYET ÜST SEKMESİ (ROMA, BİZANS, ANTİK YUNAN, OSMANLI) */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}>
          {CIVILIZATION_TABS.map((tab) => {
            const isActive = selectedCivId === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => handleSelectCiv(tab.id)}
                style={[
                  styles.tabItem,
                  isActive && styles.tabItemActive,
                ]}>
                <View
                  style={[
                    styles.tabIconBox,
                    isActive && { backgroundColor: '#9E7B3B' },
                  ]}>
                  <Ionicons
                    name={tab.icon as any}
                    size={15}
                    color={isActive ? '#FFFFFF' : '#64748B'}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.tabTitle,
                      isActive && styles.tabTitleActive,
                    ]}>
                    {tab.name}
                  </Text>
                  <Text style={styles.tabEraText}>{tab.era}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. DİNAMİK AÇIKLAMA VE GÖRÜNÜM MODU GEÇİŞİ */}
      <View style={styles.subBar}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.civDescriptionText} numberOfLines={2}>
            {activeCivTab.description}
          </Text>
        </View>

        {/* Dikey / Yatay Görünüm Anahtarı */}
        <View style={styles.viewModeSwitch}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('vertical')}
            style={[
              styles.viewModeBtn,
              viewMode === 'vertical' && styles.viewModeBtnActive,
            ]}>
            <Ionicons
              name="list-outline"
              size={15}
              color={viewMode === 'vertical' ? '#FFFFFF' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('horizontal')}
            style={[
              styles.viewModeBtn,
              viewMode === 'horizontal' && styles.viewModeBtnActive,
            ]}>
            <Ionicons
              name="git-branch-outline"
              size={15}
              color={viewMode === 'horizontal' ? '#FFFFFF' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. HANEDAN ALT KATEGORİ FİLTRELEME ÇİPLERİ */}
      {currentDynastyGroups.length > 1 && (
        <View style={styles.dynastyFilterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dynastyFilterScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedDynastyId('all')}
              style={[
                styles.dynastyChip,
                selectedDynastyId === 'all' && styles.dynastyChipActive,
              ]}>
              <Text
                style={[
                  styles.dynastyChipText,
                  selectedDynastyId === 'all' && styles.dynastyChipTextActive,
                ]}>
                Tüm Hanedanlar ({activeCivTab.totalRulers})
              </Text>
            </TouchableOpacity>

            {currentDynastyGroups.map((group) => {
              const isSelected = selectedDynastyId === group.id;
              return (
                <TouchableOpacity
                  key={group.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDynastyId(group.id)}
                  style={[
                    styles.dynastyChip,
                    isSelected && styles.dynastyChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.dynastyChipText,
                      isSelected && styles.dynastyChipTextActive,
                    ]}>
                    {group.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 5. İNTERAKTİF SOYAĞACI DİYAGRAMI ALANI */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.treeScrollContent,
          { paddingBottom: BottomTabInset + 40 },
        ]}>
        {viewMode === 'vertical' ? (
          // DİKEY AKIŞ (DİKEY SİLSİLE VE NESİL DÜĞÜMLERİ)
          displayGroups.map((group) => (
            <View key={group.id} style={styles.dynastySectionCard}>
              {/* Hanedan Başlık Kartı */}
              <View style={styles.dynastySectionHeader}>
                <View style={styles.dynastySectionTitleBlock}>
                  <View style={styles.dynastyBadge}>
                    <Ionicons name="shield" size={11} color="#9E7B3B" />
                    <Text style={styles.dynastyBadgeText}>{group.period}</Text>
                  </View>
                  <Text style={styles.dynastySectionName}>{group.name}</Text>
                  <Text style={styles.dynastySectionDesc}>{group.description}</Text>
                </View>
              </View>

              {/* Hükümdarların Dikey Ağaç Dallanması */}
              <View style={styles.verticalTreeWrapper}>
                {group.rulers.map((ruler, index) => {
                  const isLast = index === group.rulers.length - 1;
                  const isSelected = selectedRuler?.id === ruler.id;

                  return (
                    <View key={ruler.id} style={styles.treeNodeRow}>
                      {/* Sol Hiyerarşi Çizgisi ve Düğüm Noktası */}
                      <View style={styles.treeSpineCol}>
                        <View
                          style={[
                            styles.treeSpineNode,
                            isSelected && styles.treeSpineNodeActive,
                          ]}>
                          <Text style={styles.treeSpineNumber}>{ruler.generation}</Text>
                        </View>
                        {!isLast && <View style={styles.treeSpineLine} />}
                      </View>

                      {/* Sağ: İnteraktif Hükümdar Kartı */}
                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => handleRulerPress(ruler)}
                        style={[
                          styles.nodeCard,
                          isSelected && styles.nodeCardSelected,
                        ]}>
                        {/* Üst Kısım: Orijinal Portre, İsim ve Saltanat Yılları */}
                        <View style={styles.nodeCardHeader}>
                          <View style={styles.portraitWrapper}>
                            <CoinFace
                              uri={ruler.portrait}
                              secondaryUri={ruler.famousCoin.image}
                              size={52}
                              face="full"
                              borderColor="#9E7B3B"
                              borderWidth={1.5}
                              fallbackInitials={ruler.initials}
                            />
                          </View>

                          <View style={styles.nodeInfoBlock}>
                            <View style={styles.nodeGenPillRow}>
                              <Text style={styles.nodeGenText}>
                                {ruler.generation === 1
                                  ? 'Kurucu / 1. Kuşak'
                                  : `${ruler.generation}. Kuşak Halef`}
                              </Text>
                              <View style={styles.nodeDotSeparator} />
                              <Text style={styles.nodeMintCenterText}>{ruler.mintCenter}</Text>
                            </View>

                            <Text style={styles.nodeRulerName} numberOfLines={1}>
                              {ruler.name}
                            </Text>

                            <View style={styles.reignPeriodRow}>
                              <Ionicons name="hourglass-outline" size={12} color="#9E7B3B" />
                              <Text style={styles.reignPeriodText}>
                                {ruler.reignPeriod} ({ruler.reignYears})
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Orta: Darp Ettirdiği En Meşhur Sikke (ÖN & ARKA YÜZ ÇİFT DİSK GÖRÜNÜMÜ) */}
                        <View style={styles.famousCoinBox}>
                          <View style={styles.famousCoinDualContainer}>
                            {/* Ön Yüz (Avers) */}
                            <View style={styles.dualCoinWrapper}>
                              <CoinFace
                                uri={ruler.famousCoin.image}
                                size={36}
                                face="obverse"
                                borderColor="#9E7B3B"
                                borderWidth={1}
                                fallbackInitials={ruler.initials}
                              />
                              <View style={styles.faceLabelMini}>
                                <Text style={styles.faceLabelMiniText}>Ön</Text>
                              </View>
                            </View>

                            {/* Bağlantı Oku */}
                            <View style={styles.coinFaceSwapBadge}>
                              <Ionicons name="swap-horizontal" size={10} color="#9E7B3B" />
                            </View>

                            {/* Arka Yüz (Revers) */}
                            <View style={styles.dualCoinWrapper}>
                              <CoinFace
                                uri={ruler.famousCoin.image}
                                size={36}
                                face="reverse"
                                borderColor="rgba(158, 123, 59, 0.45)"
                                borderWidth={1}
                                fallbackInitials={ruler.initials}
                              />
                              <View style={styles.faceLabelMini}>
                                <Text style={styles.faceLabelMiniText}>Arka</Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.famousCoinInfo}>
                            <View style={styles.famousCoinBadgeRow}>
                              <Ionicons name="sparkles" size={11} color="#9E7B3B" />
                              <Text style={styles.famousCoinBadgeTitle}>
                                EN MEŞHUR SİKKE DARBI
                              </Text>
                            </View>
                            <Text style={styles.famousCoinName} numberOfLines={1}>
                              {ruler.famousCoin.name}
                            </Text>
                            <Text style={styles.famousCoinMetalTag}>
                              {ruler.famousCoin.metal} • {ruler.famousCoin.nominal}
                            </Text>
                          </View>
                        </View>

                        {/* Alt Bilgi ve Tıklama Aksiyonu Barı */}
                        <View style={styles.nodeCardFooter}>
                          <View style={styles.coinCountPill}>
                            <Ionicons name="albums-outline" size={12} color="#15803D" />
                            <Text style={styles.coinCountPillText}>
                              {ruler.coinCount} Eser Mevcut
                            </Text>
                          </View>

                          <View style={styles.inspectActionPill}>
                            <Text style={styles.inspectActionText}>İncele & Filtrele</Text>
                            <Ionicons name="chevron-forward" size={13} color="#9E7B3B" />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          // YATAY AĞAÇ DALLANMASI (HORIZONTAL TREE CANVAS)
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalTreeCanvas}>
              {displayGroups.map((group) => (
                <View key={group.id} style={styles.horizontalGroupCol}>
                  <View style={styles.horizontalGroupHeader}>
                    <Text style={styles.horizontalGroupTitle}>{group.name}</Text>
                    <Text style={styles.horizontalGroupPeriod}>{group.period}</Text>
                  </View>

                  <View style={styles.horizontalRulersStack}>
                    {group.rulers.map((ruler, rIdx) => {
                      const isSelected = selectedRuler?.id === ruler.id;
                      return (
                        <View key={ruler.id} style={styles.horizontalBranchItem}>
                          {rIdx > 0 && <View style={styles.horizontalBranchConnector} />}
                          <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => handleRulerPress(ruler)}
                            style={[
                              styles.horizontalNodeCard,
                              isSelected && styles.nodeCardSelected,
                            ]}>
                            <CoinFace
                              uri={ruler.portrait}
                              secondaryUri={ruler.famousCoin.image}
                              size={40}
                              face="full"
                              borderColor="#9E7B3B"
                              borderWidth={1.5}
                              fallbackInitials={ruler.initials}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.horizontalRulerName} numberOfLines={1}>
                                {ruler.name}
                              </Text>
                              <Text style={styles.horizontalRulerPeriod}>
                                {ruler.reignPeriod}
                              </Text>
                              <View style={styles.horizontalCoinTag}>
                                <Text style={styles.horizontalCoinTagText} numberOfLines={1}>
                                  {ruler.famousCoin.badgeText}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.horizontalCountBadge}>
                              <Text style={styles.horizontalCountText}>{ruler.coinCount}</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </ScrollView>

      {/* 6. DOKUNULAN HÜKÜMDARIN DETAY SHEET PANELİ (DOĞRUDAN KATALOG FİLTRELEME) */}
      {selectedRuler && (
        <View style={styles.sheetOverlayBackdrop}>
          <View style={styles.sheetContainer}>
            {/* Sheet Tutamacı */}
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderInfo}>
                <View style={styles.sheetTag}>
                  <Ionicons name="ribbon" size={12} color="#9E7B3B" />
                  <Text style={styles.sheetTagText}>HÜKÜMDAR NÜMİZMATİK PROFİLİ</Text>
                </View>
                <Text style={styles.sheetRulerTitle}>{selectedRuler.name}</Text>
                <Text style={styles.sheetOfficialTitle}>{selectedRuler.officialTitle}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedRuler(null)}
                style={styles.sheetCloseBtn}>
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Profil & Meşhur Sikke Yan Yana */}
              <View style={styles.sheetBioCard}>
                <View style={styles.sheetPortraitBox}>
                  <CoinFace
                    uri={selectedRuler.portrait}
                    secondaryUri={selectedRuler.famousCoin.image}
                    size={64}
                    face="full"
                    borderColor="#9E7B3B"
                    borderWidth={2}
                    fallbackInitials={selectedRuler.initials}
                  />
                  <View style={styles.sheetReignPill}>
                    <Text style={styles.sheetReignText}>{selectedRuler.reignPeriod}</Text>
                  </View>
                </View>

                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={styles.sheetHighlightFact}>
                    💡 {selectedRuler.highlightFact}
                  </Text>
                  <Text style={styles.sheetBioText}>{selectedRuler.bio}</Text>
                </View>
              </View>

              {/* Darp Ettirdiği En Meşhur Sikke Detay Kartı (Ön ve Arka Yüz Yan Yana) */}
              <View style={styles.sheetCoinHighlight}>
                <View style={styles.sheetCoinHeader}>
                  <Ionicons name="sparkles" size={14} color="#9E7B3B" />
                  <Text style={styles.sheetCoinHeaderTitle}>
                    Koleksiyonluk Başyapıt Sikkesi
                  </Text>
                  <View style={styles.sheetCoinRarityBadge}>
                    <Text style={styles.sheetCoinRarityText}>
                      {selectedRuler.famousCoin.rarity}
                    </Text>
                  </View>
                </View>

                <View style={styles.sheetCoinBody}>
                  {/* Ön & Arka Yüz Çift Disk */}
                  <View style={styles.sheetCoinDiscsRow}>
                    <View style={{ alignItems: 'center' }}>
                      <CoinFace
                        uri={selectedRuler.famousCoin.image}
                        size={52}
                        face="obverse"
                        borderColor="#9E7B3B"
                        borderWidth={1.5}
                        fallbackInitials={selectedRuler.initials}
                      />
                      <Text style={styles.sheetFaceDiscLabel}>Ön (Avers)</Text>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                      <CoinFace
                        uri={selectedRuler.famousCoin.image}
                        size={52}
                        face="reverse"
                        borderColor="rgba(158, 123, 59, 0.45)"
                        borderWidth={1.5}
                        fallbackInitials={selectedRuler.initials}
                      />
                      <Text style={styles.sheetFaceDiscLabel}>Arka (Revers)</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetCoinName}>{selectedRuler.famousCoin.name}</Text>
                    <Text style={styles.sheetCoinMetal}>
                      {selectedRuler.famousCoin.metal} • {selectedRuler.famousCoin.nominal}
                    </Text>
                    <View style={styles.sheetCoinPriceBox}>
                      <Text style={styles.sheetCoinPriceLabel}>Müzayede Referansı:</Text>
                      <Text style={styles.sheetCoinPriceValue}>
                        {selectedRuler.famousCoin.estimatedPrice}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* ANA AKSİYON BUTONU: BU HÜKÜMDARIN X ESERİNİ İNCELE */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => handleExploreRulerCoins(selectedRuler)}
              style={styles.exploreRulerBtn}>
              <View style={styles.exploreRulerBtnContent}>
                <View style={styles.exploreBtnIconCircle}>
                  <Ionicons name="search" size={17} color="#9E7B3B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exploreRulerBtnTitle}>
                    Bu Hükümdarın {selectedRuler.coinCount} Eserini İncele
                  </Text>
                  <Text style={styles.exploreRulerBtnSubtitle}>
                    Müze kataloğunda filtreyi otomatik uygula
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // 1. ÜST BAŞLIK ALANI
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 52,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  headerTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.6,
  },
  headerMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1D20',
    letterSpacing: -0.3,
  },
  statPill: {
    alignItems: 'center',
    backgroundColor: '#FBF5E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.25)',
  },
  statPillCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9E7B3B',
  },
  statPillLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },

  // 2. DÖRT BÜYÜK MEDENİYET SEKMESİ
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: '#FBF5E8',
    borderColor: '#9E7B3B',
  },
  tabIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  tabTitleActive: {
    color: '#1A1D20',
  },
  tabEraText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '500',
  },

  // 3. ALT BİLGİ VE GÖRÜNÜM MODU
  subBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  civDescriptionText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  viewModeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewModeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeBtnActive: {
    backgroundColor: '#9E7B3B',
  },

  // 4. HANEDAN ÇİPLERİ
  dynastyFilterRow: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dynastyFilterScroll: {
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  dynastyChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dynastyChipActive: {
    backgroundColor: '#9E7B3B',
    borderColor: '#9E7B3B',
  },
  dynastyChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  dynastyChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 5. AĞAÇ ALANI
  treeScrollContent: {
    padding: Spacing.md,
    gap: 20,
  },
  dynastySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dynastySectionHeader: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dynastySectionTitleBlock: {
    gap: 3,
  },
  dynastyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBF5E8',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  dynastyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9E7B3B',
  },
  dynastySectionName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
    marginTop: 2,
  },
  dynastySectionDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // Dikey Ağaç Omurga ve Düğümler
  verticalTreeWrapper: {
    gap: 12,
  },
  treeNodeRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  treeSpineCol: {
    width: 28,
    alignItems: 'center',
  },
  treeSpineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#9E7B3B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  treeSpineNodeActive: {
    backgroundColor: '#9E7B3B',
  },
  treeSpineNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1D20',
  },
  treeSpineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(158, 123, 59, 0.25)',
    marginVertical: 2,
  },

  // Hükümdar Kartı (Düğüm)
  nodeCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  nodeCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#9E7B3B',
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nodeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  portraitWrapper: {
    position: 'relative',
  },
  nodeInfoBlock: {
    flex: 1,
  },
  nodeGenPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  nodeGenText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9E7B3B',
  },
  nodeDotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  nodeMintCenterText: {
    fontSize: 9.5,
    color: '#64748B',
  },
  nodeRulerName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1A1D20',
    letterSpacing: -0.2,
  },
  reignPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  reignPeriodText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  // Darp Ettirdiği En Meşhur Sikke (Çift Disk / Ön & Arka Yüz)
  famousCoinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  famousCoinDualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dualCoinWrapper: {
    alignItems: 'center',
  },
  faceLabelMini: {
    marginTop: 2,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  faceLabelMiniText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#64748B',
  },
  coinFaceSwapBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  famousCoinInfo: {
    flex: 1,
  },
  famousCoinBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  famousCoinBadgeTitle: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.5,
  },
  famousCoinName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A1D20',
  },
  famousCoinMetalTag: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  // Kart Altı Barı
  nodeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  coinCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  coinCountPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  inspectActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  inspectActionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9E7B3B',
  },

  // Yatay Ağaç Dallanması Stilleri
  horizontalTreeCanvas: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: Spacing.sm,
  },
  horizontalGroupCol: {
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  horizontalGroupHeader: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  horizontalGroupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1D20',
  },
  horizontalGroupPeriod: {
    fontSize: 11,
    color: '#9E7B3B',
    fontWeight: '600',
  },
  horizontalRulersStack: {
    gap: 10,
  },
  horizontalBranchItem: {
    position: 'relative',
  },
  horizontalBranchConnector: {
    width: 2,
    height: 10,
    backgroundColor: '#9E7B3B',
    alignSelf: 'center',
    marginVertical: -2,
  },
  horizontalNodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  horizontalRulerName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1D20',
  },
  horizontalRulerPeriod: {
    fontSize: 10,
    color: '#64748B',
  },
  horizontalCoinTag: {
    marginTop: 2,
  },
  horizontalCoinTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9E7B3B',
  },
  horizontalCountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  horizontalCountText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },

  // 6. DETAY SHEET MODALI (AÇILAN PANEL)
  sheetOverlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + (Platform.OS === 'ios' ? 24 : 16),
    borderTopWidth: 2,
    borderTopColor: '#9E7B3B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sheetHeaderInfo: {
    flex: 1,
    paddingRight: 8,
  },
  sheetTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBF5E8',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginBottom: 4,
  },
  sheetTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9E7B3B',
  },
  sheetRulerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D20',
  },
  sheetOfficialTitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Biyografi ve Portre
  sheetBioCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  sheetPortraitBox: {
    alignItems: 'center',
    width: 76,
  },
  sheetReignPill: {
    marginTop: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  sheetReignText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#475569',
  },
  sheetHighlightFact: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E7B3B',
    marginBottom: 4,
    lineHeight: 15,
  },
  sheetBioText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },

  // Meşhur Sikke Detayı (Çift Disk / Ön & Arka)
  sheetCoinHighlight: {
    backgroundColor: '#FBF5E8',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
    marginBottom: Spacing.md,
  },
  sheetCoinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetCoinHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9E7B3B',
    flex: 1,
    marginLeft: 4,
  },
  sheetCoinRarityBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.4)',
  },
  sheetCoinRarityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9E7B3B',
  },
  sheetCoinBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetCoinDiscsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetFaceDiscLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  sheetCoinName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  sheetCoinMetal: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  sheetCoinPriceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sheetCoinPriceLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  sheetCoinPriceValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },

  // Fallback Monogram & Asil Madalyon
  fallbackMonogramOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    zIndex: 1,
  },
  fallbackMonogramText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E7B3B',
    marginTop: 1,
    letterSpacing: 0.5,
  },

  // Ana Aksiyon Butonu
  exploreRulerBtn: {
    backgroundColor: '#9E7B3B',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreRulerBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exploreBtnIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreRulerBtnTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exploreRulerBtnSubtitle: {
    fontSize: 10.5,
    color: '#FDE68A',
    marginTop: 1,
  },
});
