import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, Spacing } from '@/constants/theme';
import {
  CIVILIZATIONS,
  CivilizationOption,
  CONDITIONS,
  DEFAULT_FILTER_STATE,
  FilterState,
  METALS,
  MetalOption,
  MINTS_AND_REGIONS,
  SORT_OPTIONS,
  SortOptionItem,
} from '@/data/filterOptions';
import { MOCK_COINS } from '@/data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function parseCoinValue(val: string): number {
  const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  currentFilters,
  onApplyFilters,
}) => {
  // Aktif Sekme: 'basic' (Temel Filtreler) veya 'expert' (Uzman / Nümizmat)
  const [activeTab, setActiveTab] = useState<'basic' | 'expert'>('basic');

  // Modal içi taslak filtre durumu
  const [draftFilters, setDraftFilters] = useState<FilterState>(currentFilters);

  // Darphane arama sorgusu
  const [mintSearchQuery, setMintSearchQuery] = useState('');

  // Fiyat metin alanları (String state ile rahat yazım)
  const [minPriceText, setMinPriceText] = useState('');
  const [maxPriceText, setMaxPriceText] = useState('');

  // Modal her açıldığında mevcut filtrelerle senkronize et
  useEffect(() => {
    if (visible) {
      setDraftFilters(currentFilters);
      setMinPriceText(currentFilters.minPrice !== null ? String(currentFilters.minPrice) : '');
      setMaxPriceText(currentFilters.maxPrice !== null ? String(currentFilters.maxPrice) : '');
      setMintSearchQuery('');
    }
  }, [visible, currentFilters]);

  // Sekme 1 filtre sayısı
  const basicFilterCount = useMemo(() => {
    let count = 0;
    if (draftFilters.metals.length > 0) count += draftFilters.metals.length;
    if (draftFilters.civilizations.length > 0) count += draftFilters.civilizations.length;
    if (draftFilters.sortBy !== 'name') count += 1;
    return count;
  }, [draftFilters]);

  // Sekme 2 filtre sayısı
  const expertFilterCount = useMemo(() => {
    let count = 0;
    if (draftFilters.mints.length > 0) count += draftFilters.mints.length;
    if (draftFilters.conditions.length > 0) count += draftFilters.conditions.length;
    if (draftFilters.hasImageBackAndFront) count += 1;
    if (draftFilters.minPrice !== null || draftFilters.maxPrice !== null) count += 1;
    return count;
  }, [draftFilters]);

  // Toplam aktif filtre sayısı
  const totalFilterCount = basicFilterCount + expertFilterCount;

  // Filtrelenen Darphane Listesi (Arama Kutucuğuna göre)
  const filteredMints = useMemo(() => {
    const q = mintSearchQuery.trim().toLowerCase();
    if (!q) return MINTS_AND_REGIONS;
    return MINTS_AND_REGIONS.filter((m) => m.toLowerCase().includes(q));
  }, [mintSearchQuery]);

  // Eşleşen tahmini eser sayısı
  const matchingCount = useMemo(() => {
    return MOCK_COINS.filter((coin) => {
      // 1. Maden / Materyal filtresi
      if (draftFilters.metals.length > 0) {
        const coinMat = coin.material.toLowerCase();
        const matchesMetal = draftFilters.metals.some((metalId) => {
          const metalOpt = METALS.find((m) => m.id === metalId);
          if (!metalOpt) return false;
          return (
            coinMat.includes(metalOpt.code.toLowerCase()) ||
            coinMat.includes(metalOpt.name.toLowerCase().split(' ')[0]) ||
            (metalOpt.code === 'AU' && (coinMat.includes('altın') || coinMat.includes('stater') || coinMat.includes('solidus') || coinMat.includes('dinar'))) ||
            (metalOpt.code === 'AR' && (coinMat.includes('gümüş') || coinMat.includes('denarius') || coinMat.includes('tetradrahmi') || coinMat.includes('drahmi'))) ||
            (metalOpt.code === 'AE' && (coinMat.includes('bronz') || coinMat.includes('bakır') || coinMat.includes('follis') || coinMat.includes('sestertius'))) ||
            (metalOpt.code === 'EL' && coinMat.includes('elektrum')) ||
            (metalOpt.code === 'BI' && coinMat.includes('bilyon'))
          );
        });
        if (!matchesMetal) return false;
      }

      // 2. Medeniyet / İmparatorluk filtresi
      if (draftFilters.civilizations.length > 0) {
        const coinCiv = coin.civilization.toLowerCase();
        const matchesCiv = draftFilters.civilizations.some((civId) => {
          if (civId === 'greek') {
            return coinCiv.includes('yunan') || coinCiv.includes('sicilya') || coinCiv.includes('grek') || coinCiv.includes('makedonya');
          }
          if (civId === 'roman-empire' || civId === 'roman-republic') {
            return coinCiv.includes('roma');
          }
          if (civId === 'byzantine') {
            return coinCiv.includes('bizans');
          }
          if (civId === 'macedon') {
            return coinCiv.includes('makedonya');
          }
          if (civId === 'lydia') {
            return coinCiv.includes('lidya');
          }
          if (civId === 'seljuk') {
            return coinCiv.includes('selçuklu') || coinCiv.includes('islam');
          }
          if (civId === 'ottoman') {
            return coinCiv.includes('osmanlı');
          }
          const opt = CIVILIZATIONS.find((c) => c.id === civId);
          return opt ? coinCiv.includes(opt.name.toLowerCase()) : false;
        });
        if (!matchesCiv) return false;
      }

      // 3. Darphane filtresi
      if (draftFilters.mints.length > 0) {
        const coinMint = (coin.mint || '').toLowerCase();
        const matchesMint = draftFilters.mints.some((m) => {
          const root = m.split('(')[0].trim().toLowerCase();
          return coinMint.includes(root) || coin.description.toLowerCase().includes(root);
        });
        if (!matchesMint) return false;
      }

      // 4. Kondisyon filtresi
      if (draftFilters.conditions.length > 0) {
        const coinCond = (coin.condition || '').toLowerCase();
        const matchesCond = draftFilters.conditions.some((c) => {
          const code = c.split('/')[0].trim().toLowerCase();
          return coinCond.includes(code);
        });
        if (!matchesCond) return false;
      }

      // 5. Fiyat Aralığı
      const price = coin.numericPrice ?? parseCoinValue(coin.estimatedValue);
      if (draftFilters.minPrice !== null && price < draftFilters.minPrice) {
        return false;
      }
      if (draftFilters.maxPrice !== null && price > draftFilters.maxPrice) {
        return false;
      }

      // 6. Ön ve Arka Yüz Görseli Eksiksiz
      if (draftFilters.hasImageBackAndFront && (!coin.obverseImage || !coin.reverseImage)) {
        return false;
      }

      return true;
    }).length;
  }, [draftFilters]);

  // Çoklu seçim toggle fonksiyonları
  const toggleMetal = (metalId: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      metals: prev.metals.includes(metalId)
        ? prev.metals.filter((id) => id !== metalId)
        : [...prev.metals, metalId],
    }));
  };

  const toggleCivilization = (civId: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      civilizations: prev.civilizations.includes(civId)
        ? prev.civilizations.filter((id) => id !== civId)
        : [...prev.civilizations, civId],
    }));
  };

  const toggleMint = (mintName: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      mints: prev.mints.includes(mintName)
        ? prev.mints.filter((m) => m !== mintName)
        : [...prev.mints, mintName],
    }));
  };

  const toggleCondition = (condName: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condName)
        ? prev.conditions.filter((c) => c !== condName)
        : [...prev.conditions, condName],
    }));
  };

  const handleSelectSort = (sortBy: FilterState['sortBy']) => {
    setDraftFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleMinPriceChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setMinPriceText(clean);
    setDraftFilters((prev) => ({
      ...prev,
      minPrice: clean === '' ? null : parseInt(clean, 10),
    }));
  };

  const handleMaxPriceChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setMaxPriceText(clean);
    setDraftFilters((prev) => ({
      ...prev,
      maxPrice: clean === '' ? null : parseInt(clean, 10),
    }));
  };

  const handleQuickPricePreset = (min: number | null, max: number | null) => {
    setMinPriceText(min !== null ? String(min) : '');
    setMaxPriceText(max !== null ? String(max) : '');
    setDraftFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTER_STATE);
    setMinPriceText('');
    setMaxPriceText('');
    setMintSearchQuery('');
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}>
          <View style={styles.modalSheet}>
            {/* Çekme Tutamacı (Pull Indicator) */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* 1. ÜST BAŞLIK BARI */}
            <View style={styles.headerBar}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.headerIconBox}>
                  <Ionicons name="options" size={17} color="#9E7B3B" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Gelişmiş Nümismatik Filtreler</Text>
                  <Text style={styles.headerSubtitle}>Katalog ve Müzayede Ölçütleri</Text>
                </View>
                {totalFilterCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{totalFilterCount}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={onClose}
                style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#1A1D20" />
              </TouchableOpacity>
            </View>

            {/* 2. İKİ SEKMELİ KONTROL ÇUBUĞU (TAB SWITCHER) */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setActiveTab('basic')}
                style={[
                  styles.tabBtn,
                  activeTab === 'basic' && styles.tabBtnActive,
                ]}>
                <Ionicons
                  name="filter-outline"
                  size={15}
                  color={activeTab === 'basic' ? '#9E7B3B' : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'basic' && styles.tabBtnTextActive,
                  ]}>
                  Temel Filtreler
                </Text>
                {basicFilterCount > 0 && (
                  <View style={styles.tabCountPill}>
                    <Text style={styles.tabCountPillText}>{basicFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setActiveTab('expert')}
                style={[
                  styles.tabBtn,
                  activeTab === 'expert' && styles.tabBtnActive,
                ]}>
                <Ionicons
                  name="ribbon-outline"
                  size={15}
                  color={activeTab === 'expert' ? '#9E7B3B' : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'expert' && styles.tabBtnTextActive,
                  ]}>
                  Uzman / Nümizmat
                </Text>
                {expertFilterCount > 0 && (
                  <View style={styles.tabCountPill}>
                    <Text style={styles.tabCountPillText}>{expertFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* 3. KAYDIRILABİLİR FİLTRE İÇERİĞİ */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {/* ==================== SEKME 1: TEMEL FİLTRELER ==================== */}
              {activeTab === 'basic' && (
                <>
                  {/* BÖLÜM 1: MATERYAL / MADEN SEÇİMİ */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Ionicons name="diamond-outline" size={16} color="#9E7B3B" />
                        <Text style={styles.sectionTitle}>Maden & Metal Türü</Text>
                      </View>
                      {draftFilters.metals.length > 0 && (
                        <Text style={styles.sectionSelectedInfo}>
                          {draftFilters.metals.length} seçili
                        </Text>
                      )}
                    </View>
                    <Text style={styles.sectionDesc}>
                      Sikkenin darp edildiği ana metal alaşımı (birden fazla seçilebilir).
                    </Text>

                    <View style={styles.metalsGrid}>
                      {METALS.map((metal: MetalOption) => {
                        const isSelected = draftFilters.metals.includes(metal.id);
                        return (
                          <TouchableOpacity
                            key={metal.id}
                            activeOpacity={0.75}
                            onPress={() => toggleMetal(metal.id)}
                            style={[
                              styles.metalChip,
                              isSelected && styles.metalChipSelected,
                            ]}>
                            <View
                              style={[
                                styles.metalColorDot,
                                { backgroundColor: metal.color },
                              ]}
                            />
                            <Text
                              style={[
                                styles.metalChipText,
                                isSelected && styles.metalChipTextSelected,
                              ]}>
                              {metal.name}
                            </Text>
                            {isSelected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={15}
                                color="#9E7B3B"
                                style={styles.checkIcon}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* BÖLÜM 2: MEDENİYET / İMPARATORLUK SEÇİMİ */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Ionicons name="earth" size={16} color="#9E7B3B" />
                        <Text style={styles.sectionTitle}>Medeniyet & İmparatorluk</Text>
                      </View>
                      {draftFilters.civilizations.length > 0 && (
                        <Text style={styles.sectionSelectedInfo}>
                          {draftFilters.civilizations.length} seçili
                        </Text>
                      )}
                    </View>
                    <Text style={styles.sectionDesc}>
                      Tarihsel basım otoritesi ve krallık coğrafyası.
                    </Text>

                    <View style={styles.civGrid}>
                      {CIVILIZATIONS.map((civ: CivilizationOption) => {
                        const isSelected = draftFilters.civilizations.includes(civ.id);
                        return (
                          <TouchableOpacity
                            key={civ.id}
                            activeOpacity={0.82}
                            onPress={() => toggleCivilization(civ.id)}
                            style={[
                              styles.civCard,
                              isSelected && styles.civCardSelected,
                            ]}>
                            <Image
                              source={{ uri: civ.image }}
                              style={styles.civThumbnail}
                              contentFit="cover"
                              transition={180}
                            />
                            <View style={styles.civInfo}>
                              <Text
                                style={[
                                  styles.civName,
                                  isSelected && styles.civNameSelected,
                                ]}
                                numberOfLines={1}>
                                {civ.name}
                              </Text>
                              <Text style={styles.civPeriod} numberOfLines={1}>
                                {civ.period}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.civCheckbox,
                                isSelected && styles.civCheckboxSelected,
                              ]}>
                              {isSelected && (
                                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* BÖLÜM 3: SIRALAMA ÖLÇÜTÜ (SORT) */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Ionicons name="swap-vertical" size={16} color="#9E7B3B" />
                        <Text style={styles.sectionTitle}>Sıralama Düzeni</Text>
                      </View>
                    </View>

                    <View style={styles.sortGrid}>
                      {SORT_OPTIONS.map((sortOpt: SortOptionItem) => {
                        const isSelected = draftFilters.sortBy === sortOpt.id;
                        return (
                          <TouchableOpacity
                            key={sortOpt.id}
                            activeOpacity={0.8}
                            onPress={() => handleSelectSort(sortOpt.id)}
                            style={[
                              styles.sortOptionBtn,
                              isSelected && styles.sortOptionBtnSelected,
                            ]}>
                            <View style={styles.sortLeftCol}>
                              <Ionicons
                                name={sortOpt.iconName as any}
                                size={16}
                                color={isSelected ? '#9E7B3B' : '#6C757D'}
                              />
                              <Text
                                style={[
                                  styles.sortOptionText,
                                  isSelected && styles.sortOptionTextSelected,
                                ]}>
                                {sortOpt.label}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.radioCircle,
                                isSelected && styles.radioCircleSelected,
                              ]}>
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}

              {/* ==================== SEKME 2: UZMAN / NÜMİZMAT FİLTRESİ ==================== */}
              {activeTab === 'expert' && (
                <>
                  {/* BÖLÜM 1: DARPHANE & ANTİK KENT SEÇİMİ (ARAMA KUTUCUKLU) */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Ionicons name="location-outline" size={16} color="#9E7B3B" />
                        <Text style={styles.sectionTitle}>Darphane & Antik Kent</Text>
                      </View>
                      {draftFilters.mints.length > 0 && (
                        <Text style={styles.sectionSelectedInfo}>
                          {draftFilters.mints.length} seçili
                        </Text>
                      )}
                    </View>
                    <Text style={styles.sectionDesc}>
                      Sikkenin basıldığı antik darphane atölyesi ve kenti.
                    </Text>

                    {/* Arama Kutusu */}
                    <View style={styles.mintSearchRow}>
                      <Ionicons name="search" size={15} color="#9E7B3B" style={{ marginRight: 6 }} />
                      <TextInput
                        value={mintSearchQuery}
                        onChangeText={setMintSearchQuery}
                        placeholder="Darphane ara (Efes, Roma, Bergama, Atina...)"
                        placeholderTextColor="#94A3B8"
                        style={styles.mintSearchInput}
                        clearButtonMode="while-editing"
                      />
                      {mintSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setMintSearchQuery('')} hitSlop={8}>
                          <Ionicons name="close-circle" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Çoklu Seçim Çipleri */}
                    <View style={styles.mintsChipsWrap}>
                      {filteredMints.map((mint: string) => {
                        const isSelected = draftFilters.mints.includes(mint);
                        return (
                          <TouchableOpacity
                            key={mint}
                            activeOpacity={0.76}
                            onPress={() => toggleMint(mint)}
                            style={[
                              styles.mintChip,
                              isSelected && styles.mintChipSelected,
                            ]}>
                            <Ionicons
                              name={isSelected ? 'checkmark-circle' : 'location-outline'}
                              size={13}
                              color={isSelected ? '#9E7B3B' : '#64748B'}
                            />
                            <Text
                              style={[
                                styles.mintChipText,
                                isSelected && styles.mintChipTextSelected,
                              ]}>
                              {mint}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* BÖLÜM 2: KONDİSYON DERECELERİ (SHELDON STANDART) */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Ionicons name="ribbon-outline" size={16} color="#9E7B3B" />
                        <Text style={styles.sectionTitle}>Kondisyon Derecesi</Text>
                      </View>
                      {draftFilters.conditions.length > 0 && (
                        <Text style={styles.sectionSelectedInfo}>
                          {draftFilters.conditions.length} seçili
                        </Text>
                      )}
                    </View>
                    <Text style={styles.sectionDesc}>
                      Uluslararası nümismatik aşınma ve yüzey koruma ölçeği.
                    </Text>

                    <View style={styles.conditionsCol}>
                      {CONDITIONS.map((cond: string) => {
                        const isSelected = draftFilters.conditions.includes(cond);
                        return (
                          <TouchableOpacity
                            key={cond}
                            activeOpacity={0.8}
                            onPress={() => toggleCondition(cond)}
                            style={[
                              styles.conditionRowBtn,
                              isSelected && styles.conditionRowBtnSelected,
                            ]}>
                            <View style={styles.conditionLeftCol}>
                              <View
                                style={[
                                  styles.conditionIconSquare,
                                  isSelected && styles.conditionIconSquareSelected,
                                ]}>
                                <Ionicons
                                  name="shield-checkmark"
                                  size={14}
                                  color={isSelected ? '#9E7B3B' : '#6C757D'}
                                />
                              </View>
                              <Text
                                style={[
                                  styles.conditionText,
                                  isSelected && styles.conditionTextSelected,
                                ]}>
                                {cond}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.civCheckbox,
                                isSelected && styles.civCheckboxSelected,
                              ]}>
                              {isSelected && (
                                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* BÖLÜM 3: SADECE ÖN VE ARKA YÜZÜ FOTOĞRAFLANMIŞ OLANLAR (TOGGLE) */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        hasImageBackAndFront: !prev.hasImageBackAndFront,
                      }))
                    }
                    style={[
                      styles.sectionCard,
                      styles.toggleCard,
                      draftFilters.hasImageBackAndFront && styles.toggleCardActive,
                    ]}>
                    <View style={styles.toggleLeftCol}>
                      <View
                        style={[
                          styles.toggleIconCircle,
                          draftFilters.hasImageBackAndFront && styles.toggleIconCircleActive,
                        ]}>
                        <Ionicons
                          name="images-outline"
                          size={18}
                          color={draftFilters.hasImageBackAndFront ? '#9E7B3B' : '#6C757D'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>
                          Ön & Arka Yüzü Eksiksiz Olanlar
                        </Text>
                        <Text style={styles.toggleSubtitle}>
                          Yalnızca çift yönlü (Avers + Revers) yüksek çözünürlüklü arşivi bulunanları göster
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.toggleSwitch,
                        draftFilters.hasImageBackAndFront && styles.toggleSwitchActive,
                      ]}>
                      <View
                        style={[
                          styles.toggleThumb,
                          draftFilters.hasImageBackAndFront && styles.toggleThumbActive,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* BÖLÜM 4: DEĞER ARALIĞI (MİN & MAX FİYAT) */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Ionicons name="pricetag-outline" size={16} color="#9E7B3B" />
                        <Text style={styles.sectionTitle}>Tahmini Piyasa Değeri ($)</Text>
                      </View>
                      {(draftFilters.minPrice !== null || draftFilters.maxPrice !== null) && (
                        <Text style={styles.sectionSelectedInfo}>Aktif</Text>
                      )}
                    </View>
                    <Text style={styles.sectionDesc}>
                      Eserlerin müzayede ve koleksiyon piyasası tahmini fiyat aralığı.
                    </Text>

                    {/* Min ve Max Input Satırı */}
                    <View style={styles.priceInputsRow}>
                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>En Az ($)</Text>
                        <View style={styles.priceInputFieldWrapper}>
                          <Text style={styles.priceCurrencySymbol}>$</Text>
                          <TextInput
                            value={minPriceText}
                            onChangeText={handleMinPriceChange}
                            placeholder="0"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            style={styles.priceInputText}
                          />
                        </View>
                      </View>

                      <View style={styles.priceDividerLine} />

                      <View style={styles.priceInputBox}>
                        <Text style={styles.priceInputLabel}>En Çok ($)</Text>
                        <View style={styles.priceInputFieldWrapper}>
                          <Text style={styles.priceCurrencySymbol}>$</Text>
                          <TextInput
                            value={maxPriceText}
                            onChangeText={handleMaxPriceChange}
                            placeholder="Limitsiz"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            style={styles.priceInputText}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Hızlı Aralık Seçenekleri */}
                    <View style={styles.pricePresetsRow}>
                      <TouchableOpacity
                        onPress={() => handleQuickPricePreset(null, 500)}
                        style={styles.pricePresetChip}>
                        <Text style={styles.pricePresetText}>0 - 500 $</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleQuickPricePreset(500, 1500)}
                        style={styles.pricePresetChip}>
                        <Text style={styles.pricePresetText}>500 - 1.500 $</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleQuickPricePreset(1500, null)}
                        style={styles.pricePresetChip}>
                        <Text style={styles.pricePresetText}>1.500 $+ (Lüks)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* 4. ALT SABİT EYLEM BARI */}
            <SafeAreaView edges={['bottom']} style={styles.bottomBarWrapper}>
              <View style={styles.bottomBar}>
                {/* Sıfırla / Temizle Butonu */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleResetFilters}
                  style={styles.clearBtn}>
                  <Ionicons name="trash-outline" size={16} color="#64748B" />
                  <Text style={styles.clearBtnText}>Temizle</Text>
                </TouchableOpacity>

                {/* [X] Sonucu Listele Ana Butonu */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleApply}
                  style={styles.applyBtn}>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  <Text style={styles.applyBtnText}>
                    [{matchingCount}] Sonucu Listele
                  </Text>
                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetWrapper: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.90,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(158, 123, 59, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
    maxHeight: '100%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },

  // Üst Başlık Barı
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(158, 123, 59, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D20',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  filterBadge: {
    backgroundColor: '#9E7B3B',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Tab Switcher Barı
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 4,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#9E7B3B',
    fontWeight: '700',
  },
  tabCountPill: {
    backgroundColor: '#9E7B3B',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabCountPillText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Kaydırılabilir İçerik
  scrollArea: {
    flexGrow: 1,
    maxHeight: SCREEN_HEIGHT * 0.62,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl + 20,
    gap: Spacing.md,
  },

  // Bölüm Kartları
  sectionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1A1D20',
  },
  sectionSelectedInfo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E7B3B',
  },
  sectionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: Spacing.sm + 2,
    lineHeight: 15,
  },

  // Maden Seçimi (Chips Grid)
  metalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metalChipSelected: {
    backgroundColor: 'rgba(158, 123, 59, 0.12)',
    borderColor: '#9E7B3B',
  },
  metalColorDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  metalChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  metalChipTextSelected: {
    color: '#9E7B3B',
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: 2,
  },

  // Medeniyet Kartları
  civGrid: {
    gap: 7,
  },
  civCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  civCardSelected: {
    backgroundColor: 'rgba(158, 123, 59, 0.08)',
    borderColor: '#9E7B3B',
  },
  civThumbnail: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  civInfo: {
    flex: 1,
  },
  civName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  civNameSelected: {
    color: '#9E7B3B',
  },
  civPeriod: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  civCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  civCheckboxSelected: {
    backgroundColor: '#9E7B3B',
    borderColor: '#9E7B3B',
  },

  // Sıralama Grid
  sortGrid: {
    gap: 7,
  },
  sortOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortOptionBtnSelected: {
    backgroundColor: 'rgba(158, 123, 59, 0.08)',
    borderColor: '#9E7B3B',
  },
  sortLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortOptionText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '600',
  },
  sortOptionTextSelected: {
    color: '#9E7B3B',
    fontWeight: '700',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#9E7B3B',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#9E7B3B',
  },

  // Darphane Arama ve Çipler
  mintSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 7 : 4,
    marginBottom: 10,
  },
  mintSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1A1D20',
  },
  mintsChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  mintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mintChipSelected: {
    backgroundColor: 'rgba(158, 123, 59, 0.12)',
    borderColor: '#9E7B3B',
  },
  mintChipText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
  },
  mintChipTextSelected: {
    color: '#9E7B3B',
    fontWeight: '700',
  },

  // Kondisyon Listesi
  conditionsCol: {
    gap: 7,
  },
  conditionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  conditionRowBtnSelected: {
    backgroundColor: 'rgba(158, 123, 59, 0.08)',
    borderColor: '#9E7B3B',
  },
  conditionLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  conditionIconSquare: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionIconSquareSelected: {
    backgroundColor: 'rgba(158, 123, 59, 0.15)',
  },
  conditionText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  conditionTextSelected: {
    color: '#9E7B3B',
    fontWeight: '700',
  },

  // Görsel Switch Kartı
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
  },
  toggleCardActive: {
    backgroundColor: 'rgba(158, 123, 59, 0.08)',
    borderColor: '#9E7B3B',
  },
  toggleLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  toggleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleIconCircleActive: {
    borderColor: 'rgba(158, 123, 59, 0.4)',
    backgroundColor: 'rgba(158, 123, 59, 0.12)',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  toggleSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  toggleSwitch: {
    width: 44,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#CBD5E1',
    padding: 2.5,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#9E7B3B',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  // Fiyat Aralığı Inputları
  priceInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  priceInputBox: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  priceInputFieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
  },
  priceCurrencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9E7B3B',
    marginRight: 4,
  },
  priceInputText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  priceDividerLine: {
    width: 12,
    height: 1.5,
    backgroundColor: '#CBD5E1',
    marginTop: 16,
  },
  pricePresetsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  pricePresetChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  pricePresetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Sabit Alt Aksiyon Barı
  bottomBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#9E7B3B',
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
