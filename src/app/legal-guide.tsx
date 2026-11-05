import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, BottomTabInset, Colors, Spacing } from '@/constants/theme';
import {
  CHECKLIST_STEPS,
  ChecklistStep,
  FaqItem,
  LEGAL_CARDS,
  LegalCardItem,
  LEGAL_FAQS,
  OFFICIAL_CONTACTS,
} from '@/data/legalGuideData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

type SectionTab = 'all' | 'license' | 'inventory' | 'unesco' | 'faq' | 'checklist';

export default function LegalGuideScreen() {
  const router = useRouter();

  // Aktif Sekme Filtresi
  const [activeTab, setActiveTab] = useState<SectionTab>('all');

  // Arama Sorgusu
  const [searchQuery, setSearchQuery] = useState('');

  // Akordeon Açık/Kapalı Durumu (FAQ Id listesi)
  const [expandedFaqIds, setExpandedFaqIds] = useState<Record<string, boolean>>({
    'faq-1': true, // İlk soru varsayılan açık
  });

  // Kontrol Listesi Tamamlanan Adımlar (İnteraktif Checklist)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Akordeon Aç/Kapa
  const toggleFaq = (id: string) => {
    setExpandedFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Checklist Adım İşaretle/Kaldır
  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // İlerleme Oranı
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / CHECKLIST_STEPS.length) * 100);

  // Filtrelenmiş Kurumsal Bilgi Kartları
  const filteredCards = useMemo(() => {
    let list = LEGAL_CARDS;
    if (activeTab === 'license') list = list.filter((c) => c.category === 'license');
    if (activeTab === 'inventory') list = list.filter((c) => c.category === 'inventory');
    if (activeTab === 'unesco') list = list.filter((c) => c.category === 'unesco');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.lawReference.toLowerCase().includes(q) ||
          c.keyPoints.some((p) => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeTab, searchQuery]);

  // Filtrelenmiş FAQ Listesi
  const filteredFaqs = useMemo(() => {
    let list = LEGAL_FAQS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.tag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery]);

  const handleOpenContactUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (e) {
      // Hata durumunda yutulur
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* 1. ÜST BAR & HERO HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#1A1D20" />
          </TouchableOpacity>

          <View style={styles.headerTitleBlock}>
            <View style={styles.officialPill}>
              <Ionicons name="shield-checkmark" size={11} color="#9E7B3B" />
              <Text style={styles.officialPillText}>2863 S.K. & UNESCO 1970 REHBERİ</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Mevzuat & Tescil Rehberi
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleOpenContactUrl('tel:176')}
            style={styles.callSupportBtn}>
            <Ionicons name="call-outline" size={16} color="#9E7B3B" />
          </TouchableOpacity>
        </View>

        {/* Alt Açıklama */}
        <Text style={styles.headerSubtitle}>
          Kültür varlığı niteliğindeki antik sikkelerin yasal tescili, koleksiyonculuk izin belgesi ve
          uluslararası nümizmatik koruma kuralları.
        </Text>

        {/* Arama Çubuğu */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#9E7B3B" />
          <TextInput
            placeholder="Mevzuat maddesi, tescil süresi veya soru ara..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. KATEGORİ & BÖLÜM GEÇİŞ SEKMELERİ */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('all')}
            style={[styles.tabChip, activeTab === 'all' && styles.tabChipActive]}>
            <Ionicons
              name="apps-outline"
              size={13}
              color={activeTab === 'all' ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.tabChipText, activeTab === 'all' && styles.tabChipTextActive]}>
              Tümü
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('license')}
            style={[styles.tabChip, activeTab === 'license' && styles.tabChipActive]}>
            <Ionicons
              name="ribbon-outline"
              size={13}
              color={activeTab === 'license' ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.tabChipText, activeTab === 'license' && styles.tabChipTextActive]}>
              Koleksiyonculuk Belgesi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('inventory')}
            style={[styles.tabChip, activeTab === 'inventory' && styles.tabChipActive]}>
            <Ionicons
              name="library-outline"
              size={13}
              color={activeTab === 'inventory' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[styles.tabChipText, activeTab === 'inventory' && styles.tabChipTextActive]}>
              Müze Tescil & Bildirim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('unesco')}
            style={[styles.tabChip, activeTab === 'unesco' && styles.tabChipActive]}>
            <Ionicons
              name="globe-outline"
              size={13}
              color={activeTab === 'unesco' ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.tabChipText, activeTab === 'unesco' && styles.tabChipTextActive]}>
              UNESCO & İhracat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('checklist')}
            style={[styles.tabChip, activeTab === 'checklist' && styles.tabChipActive]}>
            <Ionicons
              name="checkbox-outline"
              size={13}
              color={activeTab === 'checklist' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[styles.tabChipText, activeTab === 'checklist' && styles.tabChipTextActive]}>
              Başvuru Kontrol Listesi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('faq')}
            style={[styles.tabChip, activeTab === 'faq' && styles.tabChipActive]}>
            <Ionicons
              name="help-circle-outline"
              size={13}
              color={activeTab === 'faq' ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.tabChipText, activeTab === 'faq' && styles.tabChipTextActive]}>
              Sıkça Sorulan Sorular ({LEGAL_FAQS.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. ANA İÇERİK SCROLL ALANI */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* RESMİ DİKKAT UYARISI BANNERI */}
        <View style={styles.officialNoticeCard}>
          <View style={styles.officialNoticeIconBox}>
            <Ionicons name="shield-checkmark" size={24} color="#9E7B3B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.officialNoticeTitle}>Yasal Koruma & Arşivleme İlkesi</Text>
            <Text style={styles.officialNoticeDesc}>
              Sikkelobedi platformunda yer alan tüm ekspertiz, patina mineralizasyonu ve nümizmatik
              veriler yalnızca akademik/katalog tescil destek amaçlıdır. Kültür varlıklarının nihai
              tasarruf yetkisi T.C. Kültür ve Turizm Bakanlığı denetimindedir.
            </Text>
          </View>
        </View>

        {/* 1. BÖLÜM: KURUMSAL BİLGİ KARTLARI */}
        {activeTab !== 'faq' && activeTab !== 'checklist' && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="document-text-outline" size={18} color="#9E7B3B" />
                <Text style={styles.sectionTitle}>Kurumsal Mevzuat & Tescil Kılavuzu</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Bakanlık yönetmelikleri ve kanuni haklar doğrultusunda hazırlanmış resmi süreçler.
              </Text>
            </View>

            {filteredCards.map((card) => (
              <View key={card.id} style={styles.legalCard}>
                {/* Üst Rozet & Yasal Dayanak */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardBadge}>
                    <Ionicons name={card.badgeIcon as any} size={11} color="#9E7B3B" />
                    <Text style={styles.cardBadgeText}>{card.badge}</Text>
                  </View>
                </View>

                {/* Başlık ve Özet */}
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSummary}>{card.summary}</Text>

                {/* Kanuni Dayanak Çipi */}
                <View style={styles.lawChip}>
                  <Ionicons name="scale-outline" size={13} color="#9E7B3B" />
                  <Text style={styles.lawChipText}>{card.lawReference}</Text>
                </View>

                {/* Temel Kriterler / Maddeler Listesi */}
                <View style={styles.keyPointsContainer}>
                  {card.keyPoints.map((point, pIdx) => (
                    <View key={pIdx} style={styles.keyPointRow}>
                      <View style={styles.keyPointIconCircle}>
                        <Ionicons name={point.icon as any} size={14} color="#9E7B3B" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.keyPointTitle}>{point.title}</Text>
                        <Text style={styles.keyPointDesc}>{point.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* İkaz / Uyarı Notu */}
                {card.alertNotice && (
                  <View
                    style={[
                      styles.cardAlertBox,
                      card.alertType === 'warning'
                        ? styles.cardAlertWarning
                        : styles.cardAlertInfo,
                    ]}>
                    <Ionicons
                      name={card.alertType === 'warning' ? 'alert-circle' : 'information-circle'}
                      size={18}
                      color={card.alertType === 'warning' ? '#B45309' : '#0369A1'}
                    />
                    <Text
                      style={[
                        styles.cardAlertText,
                        { color: card.alertType === 'warning' ? '#92400E' : '#075985' },
                      ]}>
                      {card.alertNotice}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 2. BÖLÜM: RESMİ BAŞVURU ADIMLARI KONTROL LİSTESİ (CHECKLIST) */}
        {(activeTab === 'all' || activeTab === 'checklist') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="checkbox-outline" size={18} color="#9E7B3B" />
                <Text style={styles.sectionTitle}>
                  Koleksiyonculuk Başvuru Kontrol Listesi
                </Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Adım adım resmi koleksiyoncu izin belgesi alma ve envanter tescil protokolü.
              </Text>
            </View>

            {/* İlerleme Çubuğu Kartı */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressTitle}>Başvuru Hazırlık Durumunuz</Text>
                  <Text style={styles.progressDesc}>
                    {CHECKLIST_STEPS.length} aşamadan {completedCount} tanesi tamamlandı
                  </Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>%{progressPercent}</Text>
                </View>
              </View>

              {/* Progress Bar Track */}
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            {/* Adım Kartları */}
            <View style={styles.checklistStepsWrapper}>
              {CHECKLIST_STEPS.map((step) => {
                const isChecked = !!completedSteps[step.id];
                return (
                  <TouchableOpacity
                    key={step.id}
                    activeOpacity={0.88}
                    onPress={() => toggleStep(step.id)}
                    style={[
                      styles.checkStepCard,
                      isChecked && styles.checkStepCardCompleted,
                    ]}>
                    <View style={styles.checkStepTopRow}>
                      <View style={styles.checkStepLeft}>
                        {/* Checkbox Kutusu */}
                        <View
                          style={[
                            styles.checkboxBox,
                            isChecked && styles.checkboxBoxChecked,
                          ]}>
                          {isChecked ? (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          ) : (
                            <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                          )}
                        </View>

                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text
                            style={[
                              styles.checkStepTitle,
                              isChecked && styles.checkStepTitleCompleted,
                            ]}>
                            {step.title}
                          </Text>
                          <View style={styles.stepMetaRow}>
                            <Ionicons name="time-outline" size={11} color="#64748B" />
                            <Text style={styles.stepMetaText}>{step.timeline}</Text>
                            <Text style={styles.stepMetaDot}>•</Text>
                            <Ionicons name="business-outline" size={11} color="#64748B" />
                            <Text style={styles.stepMetaText}>{step.department}</Text>
                          </View>
                        </View>
                      </View>

                      <Ionicons
                        name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={isChecked ? '#15803D' : '#CBD5E1'}
                      />
                    </View>

                    <Text style={styles.checkStepDesc}>{step.description}</Text>

                    {/* Gereken Evraklar Listesi */}
                    <View style={styles.requiredDocsBox}>
                      <Text style={styles.requiredDocsHeader}>Gereken Evrak & Standartlar:</Text>
                      {step.requiredDocuments.map((doc, dIdx) => (
                        <View key={dIdx} style={styles.docItemRow}>
                          <Ionicons
                            name="document-outline"
                            size={12}
                            color={isChecked ? '#15803D' : '#9E7B3B'}
                          />
                          <Text
                            style={[
                              styles.docItemText,
                              isChecked && styles.docItemTextChecked,
                            ]}>
                            {doc}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 3. BÖLÜM: SIKÇA SORULAN SORULAR (AKORDEON FAQ) */}
        {(activeTab === 'all' || activeTab === 'faq') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="help-circle-outline" size={18} color="#9E7B3B" />
                <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular (Mevzuat FAQ)</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Yasal alım-satım kriterleri, müzayede sertifikalarının geçerliliği ve miras intikali.
              </Text>
            </View>

            <View style={styles.faqListWrapper}>
              {filteredFaqs.map((faq) => {
                const isOpen = !!expandedFaqIds[faq.id];
                return (
                  <View key={faq.id} style={styles.faqCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleFaq(faq.id)}
                      style={styles.faqHeaderBtn}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={styles.faqTagRow}>
                          <View style={styles.faqTagBadge}>
                            <Text style={styles.faqTagText}>{faq.tag}</Text>
                          </View>
                          {faq.lawArticle && (
                            <Text style={styles.faqLawArticle}>{faq.lawArticle}</Text>
                          )}
                        </View>
                        <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      </View>

                      <View
                        style={[
                          styles.faqChevronCircle,
                          isOpen && styles.faqChevronCircleOpen,
                        ]}>
                        <Ionicons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={15}
                          color={isOpen ? '#FFFFFF' : '#64748B'}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Akordeon Açılır Gövde */}
                    {isOpen && (
                      <View style={styles.faqBody}>
                        <View style={styles.faqAnswerContainer}>
                          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 4. BÖLÜM: RESMİ KURUMLAR VE İLETİŞİM KANALLARI */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="call-outline" size={18} color="#9E7B3B" />
              <Text style={styles.sectionTitle}>Resmi Merci & İletişim Kanalları</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Yetkili müdürlükler, çağrı merkezleri ve kültür varlığı ihbar hatları.
            </Text>
          </View>

          <View style={styles.contactsGrid}>
            {OFFICIAL_CONTACTS.map((item, idx) => (
              <View key={idx} style={styles.contactCard}>
                <View style={styles.contactTopRow}>
                  <View style={styles.contactIconCircle}>
                    <Ionicons name={item.icon as any} size={18} color="#9E7B3B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactTitle}>{item.title}</Text>
                    {item.phone && <Text style={styles.contactPhone}>{item.phone}</Text>}
                  </View>
                </View>

                <Text style={styles.contactDesc}>{item.description}</Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenContactUrl(item.actionUrl)}
                  style={styles.contactActionBtn}>
                  <Text style={styles.contactActionBtnText}>{item.actionText}</Text>
                  <Ionicons name="open-outline" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Alt Bilgi & Telif */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
          <Text style={styles.footerNoteText}>
            Bu kılavuz, 2863 Sayılı Kanun ve UNESCO ilkeleri çerçevesinde bilgilendirme amacıyla
            hazırlanmıştır. İdari işlemlerde yürürlükteki en güncel Resmi Gazete metinleri esastır.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // 1. ÜST BAR & HERO HEADER
  header: {
    paddingTop: (Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48) + Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleBlock: {
    flex: 1,
  },
  officialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  officialPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D20',
    letterSpacing: -0.3,
  },
  callSupportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.35)',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Platform.OS === 'ios' ? 9 : 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#1A1D20',
  },

  // 2. KATEGORİ & BÖLÜM GEÇİŞ SEKMELERİ
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#9E7B3B',
    borderColor: '#9E7B3B',
  },
  tabChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 3. ANA İÇERİK
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: BottomTabInset + 40,
    gap: 22,
  },

  // Resmi Uyarı Bannerı
  officialNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FBF5E8',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.35)',
  },
  officialNoticeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.25)',
  },
  officialNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#785A24',
    marginBottom: 3,
  },
  officialNoticeDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Bölüm Blokları
  sectionBlock: {
    gap: 12,
  },
  sectionHeader: {
    gap: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1A1D20',
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
  },

  // Kurumsal Bilgi Kartları
  legalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBF5E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  cardBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9E7B3B',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
    letterSpacing: -0.2,
  },
  cardSummary: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  lawChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  lawChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },

  // Temel Kriterler
  keyPointsContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  keyPointIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.25)',
  },
  keyPointTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 2,
  },
  keyPointDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Kart İkaz Kutusu
  cardAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
  },
  cardAlertWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  cardAlertInfo: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  cardAlertText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  // 2. CHECKLIST İLERLEME VE ADIMLAR
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
  },
  progressDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: '#FBF5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.35)',
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9E7B3B',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#9E7B3B',
    borderRadius: 4,
  },

  checklistStepsWrapper: {
    gap: 10,
  },
  checkStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  checkStepCardCompleted: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  checkStepTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkStepLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  checkboxBoxChecked: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  checkStepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1A1D20',
  },
  checkStepTitleCompleted: {
    color: '#15803D',
  },
  stepMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stepMetaText: {
    fontSize: 10,
    color: '#64748B',
  },
  stepMetaDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  checkStepDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  requiredDocsBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.sm,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  requiredDocsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docItemText: {
    fontSize: 10.5,
    color: '#334155',
    flex: 1,
  },
  docItemTextChecked: {
    color: '#166534',
  },

  // 3. SIKÇA SORULAN SORULAR (FAQ AKORDEON)
  faqListWrapper: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  faqTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  faqTagBadge: {
    backgroundColor: '#FBF5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  faqTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#9E7B3B',
  },
  faqLawArticle: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
    lineHeight: 18,
  },
  faqChevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqChevronCircleOpen: {
    backgroundColor: '#9E7B3B',
  },
  faqBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqAnswerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9E7B3B',
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  // 4. RESMİ KURUMLAR VE İLETİŞİM
  contactsGrid: {
    gap: 10,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  contactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBF5E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
  },
  contactPhone: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E7B3B',
    marginTop: 1,
  },
  contactDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  contactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#9E7B3B',
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    marginTop: 4,
  },
  contactActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Alt Bilgi Notu
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 10.5,
    color: '#94A3B8',
    lineHeight: 15,
  },
});
