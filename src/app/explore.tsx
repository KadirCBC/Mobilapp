import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Nümismatik Terimleri Verisi
interface GlossaryTerm {
  id: string;
  term: string;
  category: 'Anatomi' | 'Birim' | 'Maden' | 'Sanat';
  description: string;
  example?: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'avers',
    term: 'Avers (Ön Yüz)',
    category: 'Anatomi',
    description:
      'Sikkenin genellikle hükümdar büstü, tanrı/tanrıça figürü veya devleti temsil eden ana hanedan armasını taşıyan ön yüzüdür.',
    example: 'Örn: Atina Tetradrahmisi üzerindeki Miğferli Athena büstü.',
  },
  {
    id: 'revers',
    term: 'Revers (Arka Yüz)',
    category: 'Anatomi',
    description:
      'Sikkenin arka yüzüdür. Genellikle darphane sembolleri, kutsal hayvanlar, zafer sahneleri, basım yılı veya dini motifleri barındırır.',
    example: 'Örn: Athena sikkesinin arkasındaki kutsal baykuş ve zeytin dalı.',
  },
  {
    id: 'lejant',
    term: 'Lejant (Legend)',
    category: 'Sanat',
    description:
      'Sikke yüzeyine darp edilmiş tüm yazılar, hükümdarın adı, unvanları, dini dualar veya darp yeri ibareleridir.',
    example: 'Örn: "ΑΘΕ" (Atinalıların), "CAESAR AVGVSTVS".',
  },
  {
    id: 'stater',
    term: 'Stater',
    category: 'Birim',
    description:
      'Antik Anadolu (Lidya) ve Antik Yunan dünyasının temel ağırlık ve yüksek değerli sikke standardıdır. Çoğunlukla altın ve elektrumdan basılmıştır.',
    example: 'Örn: Kroisos Altın Stateri (10.7 g).',
  },
  {
    id: 'drahmi',
    term: 'Drahmi (Drachma)',
    category: 'Birim',
    description:
      'Antik Yunan dünyasının en yaygın gümüş sikkesidir. 1 drahmi yaklaşık 4.3 gram saf gümüştür; 4 katına "Tetradrahmi" denir.',
    example: 'Örn: Büyük İskender ve Atina tetradrahmileri.',
  },
  {
    id: 'solidus',
    term: 'Solidus (Nomisma)',
    category: 'Birim',
    description:
      'İmparator I. Constantinus tarafından tedavüle sokulan ve Bizans İmparatorluğu boyunca 700 yılı aşkın süre saflığını koruyan altın rezerv para birimidir.',
    example: 'Örn: I. Justinianus ve Herakleios altın solidusları.',
  },
  {
    id: 'denarius',
    term: 'Denarius',
    category: 'Birim',
    description:
      'Roma Cumhuriyeti ve Erken İmparatorluk döneminin standart gümüş parasıdır. Roma ordusunun ve Akdeniz günlük ticaretinin bel kemiğidir.',
    example: 'Örn: Julius Caesar ve Augustus zafer denariusları.',
  },
  {
    id: 'akce',
    term: 'Akçe',
    category: 'Birim',
    description:
      'Osmanlı Devleti’nin temel gümüş sikkesidir. İlk kez 1326 yılında Orhan Gazi adına Bursa darphanesinde basılmıştır.',
    example: 'Örn: Orhan Gazi, I. Murad ve Fatih gümüş akçeleri.',
  },
  {
    id: 'sultani',
    term: 'Sultani (Hasene / Şerifi)',
    category: 'Birim',
    description:
      'Fatih Sultan Mehmed tarafından 1477’de Kostantiniyye’de darp ettirilen ilk Osmanlı yerli altın sikkesidir. Venedik dukasına eşdeğer saflıktadır.',
    example: 'Örn: Fatih Sultan Mehmed Altın Sultanisi (3.52 g).',
  },
  {
    id: 'elektrum',
    term: 'Elektrum (Electrum)',
    category: 'Maden',
    description:
      'Doğal altın ve gümüş alaşımıdır. İnsanlık tarihindeki en eski Lidya sikkeleri Paktolos (Sart) Çayı yatağından toplanan bu madenden darp edilmiştir.',
    example: 'Örn: Kral Alyattes dönemi aslan başlı ilk elektrum sikkeler.',
  },
  {
    id: 'protom',
    term: 'Protom',
    category: 'Sanat',
    description:
      'Bir hayvanın, insanın veya mitolojik yaratığın yalnızca baş ve ön gövde kısmının işlendiği kabartma sanatsal tasvirdir.',
    example: 'Örn: Lidya staterlerindeki karşı karşıya aslan ve boğa protomları.',
  },
  {
    id: 'monogram',
    term: 'Monogram',
    category: 'Sanat',
    description:
      'Darphane şehrini, sorumlu para memurunu veya basım dönemini belirtmek için harflerin tek bir geometrik sembolde birleştirilmesidir.',
    example: 'Örn: Helenistik ve Roma sikkelerindeki darphane şifreleri.',
  },
];

// Medeniyet Zaman Çizelgesi Verisi
interface TimelineEvent {
  id: string;
  civilization: string;
  era: string;
  color: string;
  keyCoin: string;
  mint: string;
  summary: string;
  impact: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'lydia',
    civilization: 'Lidya Krallığı',
    era: 'M.Ö. 7. – 6. Yüzyıl',
    color: '#D4AF37',
    keyCoin: 'Kroisos Altın Stateri (Karun)',
    mint: 'Sardes (Manisa)',
    summary:
      'Madeni parayı insanlık tarihine kazandıran ilk medeniyettir. Doğal elektrum sikkelerle başlayıp Kral Kroisos döneminde saf altın ve saf gümüşten oluşan ilk bimetalik para sistemi geliştirilmiştir.',
    impact: 'Takas ekonomisini sonlandırıp küresel ticaret devrimini başlattı.',
  },
  {
    id: 'greece',
    civilization: 'Klasik & Helenistik Yunan',
    era: 'M.Ö. 5. – 2. Yüzyıl',
    color: '#60A5FA',
    keyCoin: 'Atina Tetradrahmisi & İskender Stateri',
    mint: 'Atina, Amfipolis, Babil',
    summary:
      'Atina’nın "Baykuşlu" gümüş tetradrahmisi Akdeniz havzasının ilk uluslararası rezerv parası oldu. Büyük İskender’in Asya seferi ile Yunan sikke standardı Hindistan sınırlarına kadar yayıldı.',
    impact: 'Ortak para birimi ve nümizmatikte yüksek heykeltıraşlık estetiği kurdu.',
  },
  {
    id: 'rome',
    civilization: 'Roma İmparatorluğu',
    era: 'M.Ö. 27 – M.S. 476',
    color: '#F87171',
    keyCoin: 'Gümüş Denarius & Altın Aureus',
    mint: 'Roma, Lugdunum (Lyon), Antakya',
    summary:
      'İmparator Augustus’un getirdiği parasal reformla altın, gümüş ve bronz hiyerarşisi oluşturuldu. Sikkeler, imparatorların askeri zaferlerini ve ilahi gücünü duyuran antik çağın en etkili kitle iletişim aracıydı.',
    impact: 'Pax Romana boyunca tüm Akdeniz ve Avrupa’da tek para dolaşımı sağlandı.',
  },
  {
    id: 'byzantine',
    civilization: 'Bizans İmparatorluğu',
    era: 'M.S. 330 – 1453',
    color: '#FBBF24',
    keyCoin: 'Altın Solidus (Nomisma)',
    mint: 'Konstantinopolis, Ravenna, Selanik',
    summary:
      'Konstantinopolis darphanesinde basılan Solidus, yaklaşık sekiz asır boyunca ayarını koruyarak "Orta Çağ’ın Doları" olarak kabul edildi. Sikkelerde Hristiyan ikonografisi ve cepheden imparator portreleri hakim oldu.',
    impact: 'Doğu ile Batı arasındaki İpek Yolu ticaretinin güvenli dayanağı oldu.',
  },
  {
    id: 'ottoman',
    civilization: 'Osmanlı İmparatorluğu',
    era: '1299 – 1922',
    color: '#34D399',
    keyCoin: 'Gümüş Akçe & Altın Sultani',
    mint: 'Bursa, Edirne, Kostantiniyye, Kahire',
    summary:
      'Orhan Gazi’nin gümüş akçesiyle başlayan Osmanlı para geleneği, Fatih’in 1477’de bastırdığı Altın Sultani ile zirveye ulaştı. İslam hat sanatı ve hükümdar tuğraları sikke estetiğinin en görkemli örneklerini oluşturdu.',
    impact: 'Üç kıtada 600 yılı aşkın süre çok darphaneli parasal istikrar sürdürdü.',
  },
];

export default function ExploreScreen() {
  const theme = useTheme();
  const colors = theme ?? Colors.dark;

  const [activeTab, setActiveTab] = useState<'glossary' | 'timeline'>('glossary');
  const [searchTerm, setSearchTerm] = useState('');

  // Terim arama filtrelemesi
  const filteredTerms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return GLOSSARY_TERMS;
    return GLOSSARY_TERMS.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.container}>
        {/* 1. ÜST BAŞLIK */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.gold }]}>
            REHBER & BİLGİ BANKASI
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            NÜMİSMATİK & MEDENİYETLER
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Antik terimler sözlüğü ve para basan medeniyetlerin tarihsel gelişimi
          </Text>
        </View>

        {/* 2. İKİ SEKMELİ KONTROL (Segmented Switcher) */}
        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('glossary')}
            style={[
              styles.segmentButton,
              activeTab === 'glossary' && {
                backgroundColor: colors.gold,
              },
            ]}>
            <Ionicons
              name="book-outline"
              size={16}
              color={activeTab === 'glossary' ? '#121417' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'glossary'
                  ? { color: '#121417', fontWeight: '700' }
                  : { color: colors.textSecondary, fontWeight: '600' },
              ]}>
              Antik Terimler ({GLOSSARY_TERMS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('timeline')}
            style={[
              styles.segmentButton,
              activeTab === 'timeline' && {
                backgroundColor: colors.gold,
              },
            ]}>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={activeTab === 'timeline' ? '#121417' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'timeline'
                  ? { color: '#121417', fontWeight: '700' }
                  : { color: colors.textSecondary, fontWeight: '600' },
              ]}>
              Zaman Çizelgesi ({TIMELINE_EVENTS.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. İÇERİK ALANI */}
        {activeTab === 'glossary' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: BottomTabInset + Spacing.xl + 20 },
            ]}>
            {/* Terim Arama Çubuğu */}
            <View
              style={[
                styles.searchBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.gold}
                style={styles.searchIcon}
              />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Terim, maden veya açıklama ara..."
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text }]}
                clearButtonMode="while-editing"
              />
              {searchTerm.length > 0 && Platform.OS !== 'ios' && (
                <TouchableOpacity onPress={() => setSearchTerm('')} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Terim Kartları Listesi */}
            {filteredTerms.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="help-circle-outline"
                  size={42}
                  color={colors.gold}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Terim Bulunamadı
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  "{searchTerm}" aramasıyla eşleşen bir nümismatik terim bulunamadı.
                </Text>
              </View>
            ) : (
              <View style={styles.termsList}>
                {filteredTerms.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.termCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}>
                    <View style={styles.termHeader}>
                      <Text style={[styles.termTitle, { color: colors.text }]}>
                        {item.term}
                      </Text>
                      <View
                        style={[
                          styles.categoryBadge,
                          {
                            backgroundColor: 'rgba(212, 175, 55, 0.12)',
                            borderColor: colors.borderGold,
                          },
                        ]}>
                        <Text style={[styles.categoryBadgeText, { color: colors.gold }]}>
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.termDesc, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>

                    {item.example && (
                      <View
                        style={[
                          styles.exampleBox,
                          {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                          },
                        ]}>
                        <Ionicons
                          name="sparkles-outline"
                          size={13}
                          color={colors.gold}
                        />
                        <Text style={[styles.exampleText, { color: colors.textMuted }]}>
                          {item.example}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        ) : (
          /* Medeniyet Zaman Çizelgesi */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: BottomTabInset + Spacing.xl + 20 },
            ]}>
            <View style={styles.timelineList}>
              {TIMELINE_EVENTS.map((event, index) => {
                const isLast = index === TIMELINE_EVENTS.length - 1;
                return (
                  <View key={event.id} style={styles.timelineRow}>
                    {/* Sol Sütun: Dikey Çizgi ve İkon Düğümü */}
                    <View style={styles.timelineTrack}>
                      <View
                        style={[
                          styles.timelineNode,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.gold,
                          },
                        ]}>
                        <View
                          style={[
                            styles.timelineInnerDot,
                            { backgroundColor: colors.gold },
                          ]}
                        />
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: 'rgba(212, 175, 55, 0.3)' },
                          ]}
                        />
                      )}
                    </View>

                    {/* Sağ Sütun: Medeniyet Bilgi Kartı */}
                    <View
                      style={[
                        styles.timelineCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}>
                      {/* Dönem Rozeti ve Başlık */}
                      <View style={styles.timelineCardHeader}>
                        <Text
                          style={[styles.civilizationTitle, { color: colors.text }]}>
                          {event.civilization}
                        </Text>
                        <View
                          style={[
                            styles.eraBadge,
                            {
                              backgroundColor: 'rgba(212, 175, 55, 0.12)',
                              borderColor: colors.borderGold,
                            },
                          ]}>
                          <Text style={[styles.eraBadgeText, { color: colors.gold }]}>
                            {event.era}
                          </Text>
                        </View>
                      </View>

                      {/* Özet */}
                      <Text style={[styles.timelineSummary, { color: colors.textSecondary }]}>
                        {event.summary}
                      </Text>

                      {/* Darphane ve Önemli Sikke */}
                      <View style={styles.timelineMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="disc" size={13} color={colors.gold} />
                          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                            Sikke:{' '}
                            <Text style={{ color: colors.text, fontWeight: '600' }}>
                              {event.keyCoin}
                            </Text>
                          </Text>
                        </View>

                        <View style={styles.metaItem}>
                          <Ionicons
                            name="location-outline"
                            size={13}
                            color={colors.gold}
                          />
                          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                            Darphane:{' '}
                            <Text style={{ color: colors.text, fontWeight: '600' }}>
                              {event.mint}
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* Tarihsel Etki Notu */}
                      <View
                        style={[
                          styles.impactBox,
                          {
                            backgroundColor: colors.background,
                            borderColor: 'rgba(212, 175, 55, 0.2)',
                          },
                        ]}>
                        <Ionicons
                          name="flash-outline"
                          size={13}
                          color={colors.gold}
                        />
                        <Text style={[styles.impactText, { color: colors.goldLight }]}>
                          {event.impact}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.md,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs + 4,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  segmentText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingTop: Spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, default: 6 }),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  termsList: {
    gap: Spacing.sm,
  },
  termCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
    marginTop: Spacing.sm,
  },
  exampleText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  timelineList: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineTrack: {
    width: 32,
    alignItems: 'center',
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    zIndex: 2,
  },
  timelineInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -6,
  },
  timelineCard: {
    flex: 1,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
    gap: 4,
  },
  civilizationTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  eraBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
  },
  eraBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timelineSummary: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  timelineMeta: {
    gap: 4,
    marginBottom: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
  },
  impactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
});
