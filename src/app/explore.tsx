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
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface GlossaryItem {
  id: string;
  term: string;
  category: 'Anatomi' | 'Birim' | 'Maden' | 'Üretim' | 'Sanat';
  icon: keyof typeof Ionicons.glyphMap;
  shortDesc: string;
  fullDesc: string;
  historicalSignificance: string;
  example: string;
}

const GLOSSARY_DATA: GlossaryItem[] = [
  {
    id: 'avers',
    term: 'Avers (Ön Yüz)',
    category: 'Anatomi',
    icon: 'disc',
    shortDesc: 'Sikkenin hükümdar portresi veya ana sembolü taşıyan ön yüzü.',
    fullDesc:
      'Nümizmatikte sikkenin birincil veya ön yüzünü ifade eder. Genellikle basımı yaptıran imparator, kral veya tiranın büstünü, şehir devletinin koruyucu tanrısını (Athena, Zeus, Apollon) veya devlet armasını barındırır. Antik darp tekniğinde alt kalıba (örs kalıbına) yerleştirildiği için genellikle daha yüksek rölyefli ve dayanıklıdır.',
    historicalSignificance:
      'Hükümdarın meşruiyetini, egemenliğini ve siyasi propagandasını halka ve lejyonlara ulaştıran en etkili antik kitle iletişim aracıdır.',
    example: 'Örn: Atina Tetradrahmisi üzerindeki miğferli Tanrıça Athena profili.',
  },
  {
    id: 'revers',
    term: 'Revers (Arka Yüz)',
    category: 'Anatomi',
    icon: 'disc-outline',
    shortDesc: 'Sikkenin ikincil detayları ve darphane mühürlerini içeren arka yüzü.',
    fullDesc:
      'Sikkenin arka yüzüdür. Antik çağda hareketli üst kalıp (çekiç kalıbı) ile darp edilirdi. Bu yüzde genellikle koruyucu kutsal hayvanlar (baykuş, kartal, aslan), zafer tanrıçası Nike, mitolojik sahneler, darp yılı, darphane monogramları ve memur adları yer alır.',
    historicalSignificance:
      'Sikkenin nerede, ne zaman ve hangi otorite denetiminde basıldığını kanıtlayan tarihi ve coğrafi belgedir.',
    example: 'Örn: Atina sikkesinin arka yüzündeki kutsal baykuş (glaux) ve zeytin dalı.',
  },
  {
    id: 'lejant',
    term: 'Lejant (Legend / Kitabe)',
    category: 'Sanat',
    icon: 'text-outline',
    shortDesc: 'Sikke üzerindeki harf, unvan, darp yeri ve kitabe yazıları.',
    fullDesc:
      'Sikke yüzeyine darp edilmiş tüm alfabetik veya epigrafik yazılardır. Hükümdarın tam unvanlarını ("Pater Patriae", "Basileus", "Sultanü’l-Berreyn"), sikkeyi basan topluluğun adını ("ΑΘΕ - Atinalıların") veya darp yeri ile basım tarihini belirtir.',
    historicalSignificance:
      'Antik dillerin, unvan hiyerarşisinin ve kronolojinin çözümlenmesinde arkeologlar ve tarihçiler için en kesin yazılı kanıttır.',
    example: 'Örn: Augustus denariusu üzerindeki "CAESAR AVGVSTVS DIVI F" yazıtı.',
  },
  {
    id: 'darphane',
    term: 'Darphane (Mint / Darp Yeri)',
    category: 'Üretim',
    icon: 'business-outline',
    shortDesc: 'Devlet denetiminde resmi madeni para basılan tarihi atölye.',
    fullDesc:
      'Madeni paraların eritme, pul (flan) hazırlama, ağırlık tartımı ve çekiçle darp edilme süreçlerinin yürütüldüğü resmi devlet kurumudur. Antik dünyada Sardes, Atina, Roma, Konstantinopolis ve İskenderiye; Osmanlı döneminde ise Bursa, Edirne ve Kostantiniyye gibi merkezler dünyanın en büyük darphaneleriydi.',
    historicalSignificance:
      'Darphaneler, sikkenin gramaj ve ayar güvencesini sağlayan imparatorluk hazinesinin kalbi konumundaydı.',
    example: 'Örn: Bizans sikkelerindeki "CONOB" (Konstantinopolis darphanesi saf altın garantisi).',
  },
  {
    id: 'stater',
    term: 'Stater',
    category: 'Birim',
    icon: 'shield-outline',
    shortDesc: 'Antik Anadolu ve Yunan dünyasının temel yüksek değerli sikke birimi.',
    fullDesc:
      'Grekçe "tartı / denge" anlamına gelen "histemi" kökünden türemiştir. Lidya Krallığı ve Antik Yunan dünyasında altın ve elektrum sikkeler için kullanılan temel ağırlık ve para standardıdır. Genellikle 8.4 ile 14 gram arasında değişen yüksek alım gücüne sahip prestij paralarıdır.',
    historicalSignificance:
      'Kroisos ve Büyük İskender’in ordularını finanse ettiği ve Akdeniz ticaretini yönlendirdiği altın para standardıdır.',
    example: 'Örn: Lidya Kralı Kroisos’un 10.76 gramlık ağır altın stateri.',
  },
  {
    id: 'drahmi',
    term: 'Drahmi (Drachma)',
    category: 'Birim',
    icon: 'cash-outline',
    shortDesc: 'Antik Yunan dünyasının günlük ve ticari temel gümüş para birimi.',
    fullDesc:
      'Kelime anlamı "bir avuç dolusu" (drapsein) demektir. Antik Yunanistan’da bir askerin veya ustanın yaklaşık günlük yevmiyesine denk gelen yaklaşık 4.3 gramlık gümüş para birimidir. 4 katı ağırlığındaki 17.2 gramlık "Tetradrahmi" ise uluslararası ticaretin ana aracıydı.',
    historicalSignificance:
      'Yunan şehir devletleri arasındaki ticari entegrasyonu sağlamış, Helenistik çağ boyunca Yakın Doğu’da geçerliliğini korumuştur.',
    example: 'Örn: Klasik Dönem Atina ve Korint gümüş drahmi serileri.',
  },
  {
    id: 'denarius',
    term: 'Denarius',
    category: 'Birim',
    icon: 'wallet-outline',
    shortDesc: 'Roma Cumhuriyeti ve İmparatorluğu’nun efsanevi standart gümüş parası.',
    fullDesc:
      'M.Ö. 211 yılında İkinci Pön Savaşı sırasında Roma’da tedavüle çıkarılmıştır. Adı Latince "onluk" (deni) anlamına gelir çünkü başlangıçta 10 bronz as değerindeydi. Yaklaşık 3.9 gram saf gümüşten basılan denarius, Roma lejyonerlerinin standart maaş birimiydi.',
    historicalSignificance:
      'Britanya’dan Fırat kıyılarına kadar tüm Roma İmparatorluğu’nda kullanılan, tarihin en uzun ömürlü gümüş para sistemidir.',
    example: 'Örn: Julius Caesar’ın fil tasvirli askeri karargah denariusu.',
  },
  {
    id: 'solidus',
    term: 'Solidus (Nomisma)',
    category: 'Birim',
    icon: 'diamond-outline',
    shortDesc: 'Bizans İmparatorluğu’nun 700 yıl değerini koruyan saf altın parası.',
    fullDesc:
      'İmparator I. Constantinus tarafından M.S. 312 civarında darp edilmeye başlanmıştır. 1/72 Roma libresi (yaklaşık 4.48-4.50 gram) saf altından üretilirdi. Bizans İmparatorluğu boyunca ayarı bozulmadan 11. yüzyıla kadar korunmuş ve "Orta Çağ’ın Doları" olarak anılmıştır.',
    historicalSignificance:
      'Konstantinopolis’in ticari üstünlüğünü ve İpek Yolu üzerindeki Doğu-Batı ticaretinin istikrarını yüzyıllarca tek başına sırtlamıştır.',
    example: 'Örn: İmparator I. Justinianus ve Herakleios altın solidusları.',
  },
  {
    id: 'akce',
    term: 'Akçe',
    category: 'Birim',
    icon: 'layers-outline',
    shortDesc: 'Osmanlı Devleti’nin ilk ve temel gümüş sikkesi.',
    fullDesc:
      'Kelime anlamı "akça / beyaz para" olan gümüş sikkedir. İlk kez 1326 yılında Orhan Gazi adına Bursa’da darp edilmiştir. Başlangıçta 1.15 gram saf gümüş olan akçe, devletin vergi toplama, asker maaşı ödeme ve çarşı pazar alışverişlerindeki ana para birimiydi.',
    historicalSignificance:
      'Osmanlı iktisat tarihinin kuruluş ve yükseliş dönemlerindeki ekonomik büyümesinin ve fiyat hareketlerinin temel göstergesidir.',
    example: 'Örn: Fatih Sultan Mehmed’in Edirne ve İstanbul darplı akçeleri.',
  },
  {
    id: 'sultani',
    term: 'Sultani (Hasene / Şerifi)',
    category: 'Birim',
    icon: 'ribbon-outline',
    shortDesc: 'Fatih Sultan Mehmed döneminde basılan ilk Osmanlı yerli altın sikkesi.',
    fullDesc:
      'İstanbul’un fethinden sonra 1477 (Hicri 882) yılında Kostantiniyye darphanesinde basılan ilk yerli Osmanlı altın parasıdır. 3.52 gram ağırlığında ve 24 ayara yakın saflıktadır. Venedik dukasıyla rekabet edebilecek kalitede darp edilmiştir.',
    historicalSignificance:
      'Osmanlı İmparatorluğu’nun Akdeniz deniz ticaretinde Batı Avrupa altın paralarına olan bağımlılığını sona erdirmiştir.',
    example: 'Örn: Fatih Sultan Mehmed Han’ın "İki karanın ve iki denizin sultanı" unvanlı altın sultanisi.',
  },
  {
    id: 'elektrum',
    term: 'Elektrum (Electrum)',
    category: 'Maden',
    icon: 'sparkles-outline',
    shortDesc: 'Doğal altın ve gümüş alaşımı; tarihin ilk sikkelerinin hammaddesi.',
    fullDesc:
      'Doğada altın ve gümüşün kendiliğinden birleşmesiyle oluşan açık sarı renkli kıymetli metal alaşımıdır. İnsanlık tarihindeki en eski madeni paralar M.Ö. 7. yüzyılda Lidya’da, Sart (Paktolos) Çayı yatağından çıkarılan elektrum tanecikleriyle üretilmiştir.',
    historicalSignificance:
      'Doğal madenin standart ağırlıkta pullara dökülüp devlet garantili damga vurulmasıyla "para" kavramı doğmuştur.',
    example: 'Örn: Lidya Kralı Alyattes’in kükreyen aslan başlı ilk elektrum staterleri.',
  },
  {
    id: 'protom',
    term: 'Protom',
    category: 'Sanat',
    icon: 'color-palette-outline',
    shortDesc: 'Bir hayvan veya mitolojik yaratığın yalnızca ön gövdesinin kabartma tasviri.',
    fullDesc:
      'Heykeltıraşlık ve nümizmatikte bir hayvanın (aslan, boğa, at, koç, grifon) baş, boyun ve ön bacaklarını içeren yarım gövde kabartmasına verilen addır. Karşı karşıya duran aslan ve boğa protomları Lidya kraliyet kudretinin en bilinen simgesidir.',
    historicalSignificance:
      'Antik sikkelerdeki protomlar, şehirlerin koruyucu totem hayvanlarını ve hükümdarlık armalarını sembolize eder.',
    example: 'Örn: Kroisos sikkelerindeki karşı karşıya duran aslan ve boğa protomu.',
  },
  {
    id: 'monogram',
    term: 'Monogram',
    category: 'Sanat',
    icon: 'git-merge-outline',
    shortDesc: 'Harflerin birleştirilmesiyle oluşturulan darphane veya para memuru şifresi.',
    fullDesc:
      'İki veya daha fazla harfin tek bir görsel figür veya sembol oluşturacak biçimde sanatsal olarak kaynaştırılmasıdır. Helenistik ve Roma dönemi sikkelerinde basımdan sorumlu magistratın (para memurunun) adını veya darphaneyi kısaltmak için kullanılırdı.',
    historicalSignificance:
      'Bir sikkenin basıldığı yılı ve sorumlu memuru belirleyerek darphane içi sahtecilik ve gramaj hilelerini engellemeye yaramıştır.',
    example: 'Örn: Büyük İskender sikkelerinin reversinde yer alan iç içe geçmiş şehir monogramları.',
  },
  {
    id: 'incuse',
    term: 'İncuse (Darp Çukuru)',
    category: 'Üretim',
    icon: 'grid-outline',
    shortDesc: 'Çekiç darbesinin oluşturduğu çukur veya negatif iz (Erken Dönem).',
    fullDesc:
      'En erken arkaik sikkelerin arka yüzünde kabartma bir desen yerine, çekiç zımbasının (punch) oluşturduğu bir veya iki adet derin kare ya da dikdörtgen çukura "incuse square" denir. Metal pulun darp sırasında kaymasını engellemek için tasarlanmıştır.',
    historicalSignificance:
      'Sikke darp teknolojisinin ilk gelişim evresini ve metal şekillendirme ustalığının başlangıcını simgeler.',
    example: 'Örn: Lidya Kroiseios staterlerinin arkasındaki ikili darp çukurları.',
  },
  {
    id: 'patina',
    term: 'Patina (Asil Oksitlenme)',
    category: 'Maden',
    icon: 'leaf-outline',
    shortDesc: 'Sikkenin toprak altında yüzyıllar boyunca kazandığı doğal koruyucu tabaka.',
    fullDesc:
      'Özellikle bronz, bakır ve gümüş sikkelerin toprak altındaki mineraller ve nem ile kimyasal tepkimeye girmesiyle yüzeyinde oluşan koruyucu mineral tabakasıdır. Yeşil (malakit), koyu kahverengi, mavi (azurit) tonlarında oluşur ve sikkenin orijinal olduğunu belgeler.',
    historicalSignificance:
      'Nümizmatikte asil patina bir sikkenin orijinalliğini, yaşını ve koleksiyon değerini katlayan en önemli görsel unsurdur.',
    example: 'Örn: Roma İmparatorluk sestertiuslarının zümrüt yeşili pürüzsüz patinası.',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.dark;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  // Açık olan terimin ID'si (Akordeon durumu)
  const [expandedId, setExpandedId] = useState<string | null>('avers');

  const categories = ['Tümü', 'Anatomi', 'Birim', 'Maden', 'Üretim', 'Sanat'];

  // Terim Arama ve Kategori Filtresi
  const filteredTerms = useMemo(() => {
    return GLOSSARY_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Tümü' || item.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        item.term.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.fullDesc.toLowerCase().includes(q) ||
        item.historicalSignificance.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.container}>
        {/* 1. ÜST BAŞLIK ALANI */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={20} color={colors.gold} />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={[styles.eyebrow, { color: colors.gold }]}>
                NÜMİSMATİK REHBERİ
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                ANTİK TERİMLER SÖZLÜĞÜ
              </Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sikke anatomisi, para birimleri, darphane teknikleri ve nümizmatik terminolojisi
          </Text>
        </View>

        {/* 2. ARAMA ÇUBUĞU */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.gold}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Terim, birim veya tanım ara (Örn: Avers, Drahmi)..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. KATEGORİ FİLTRE HAPLARI */}
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.75}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.filterPill,
                    isSelected
                      ? {
                          backgroundColor: colors.gold,
                          borderColor: colors.goldLight,
                        }
                      : {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                  ]}>
                  <Text
                    style={[
                      styles.filterText,
                      isSelected
                        ? { color: '#121417', fontWeight: '700' }
                        : { color: colors.textSecondary, fontWeight: '500' },
                    ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. SAYAÇ / DURUM ÇUBUĞU */}
        <View style={styles.countRow}>
          <Text style={[styles.countText, { color: colors.textMuted }]}>
            {filteredTerms.length} Terim Listeleniyor
          </Text>
          {expandedId && (
            <TouchableOpacity onPress={() => setExpandedId(null)}>
              <Text style={[styles.collapseAllText, { color: colors.gold }]}>
                Hepsini Kapat
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 5. AKORDEON KART LİSTESİ */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollList,
            { paddingBottom: BottomTabInset + Spacing.xl + 20 },
          ]}>
          {filteredTerms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderGold,
                  },
                ]}>
                <Ionicons
                  name="book-outline"
                  size={40}
                  color={colors.gold}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Terim Bulunamadı
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                "{searchQuery}" aramasına uygun bir nümizmatik terim bulunamadı.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('Tümü');
                }}
                style={[
                  styles.resetBtn,
                  { borderColor: colors.gold, backgroundColor: 'rgba(212, 175, 55, 0.1)' },
                ]}>
                <Text style={[styles.resetBtnText, { color: colors.gold }]}>
                  Aramayı Sıfırla
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTerms.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isExpanded ? colors.gold : colors.border,
                    },
                    isExpanded && styles.cardExpandedGlow,
                  ]}>
                  {/* Kart Başlığı / Tıklanabilir Akordeon Çubuğu */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleAccordion(item.id)}
                    style={styles.cardHeader}>
                    {/* Sol Bölüm: İkon ve İsim */}
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.termIconCircle,
                          {
                            backgroundColor: isExpanded
                              ? 'rgba(212, 175, 55, 0.2)'
                              : colors.background,
                            borderColor: isExpanded ? colors.gold : colors.border,
                          },
                        ]}>
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={isExpanded ? colors.gold : colors.textSecondary}
                        />
                      </View>
                      <View style={styles.termTitleBlock}>
                        <Text
                          style={[
                            styles.termTitle,
                            { color: isExpanded ? colors.goldLight : colors.text },
                          ]}>
                          {item.term}
                        </Text>
                        {!isExpanded && (
                          <Text
                            numberOfLines={1}
                            style={[styles.termShortDesc, { color: colors.textSecondary }]}>
                            {item.shortDesc}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Sağ Bölüm: Kategori Rozeti ve Açılır Ok */}
                    <View style={styles.cardHeaderRight}>
                      <View
                        style={[
                          styles.catBadge,
                          {
                            backgroundColor: 'rgba(212, 175, 55, 0.12)',
                            borderColor: colors.borderGold,
                          },
                        ]}>
                        <Text style={[styles.catBadgeText, { color: colors.gold }]}>
                          {item.category}
                        </Text>
                      </View>

                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={isExpanded ? colors.gold : colors.textMuted}
                        style={styles.chevron}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Genişletilmiş Akordeon İçeriği */}
                  {isExpanded && (
                    <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                      {/* Ayrıntılı Açıklama */}
                      <Text style={[styles.fullDescription, { color: colors.text }]}>
                        {item.fullDesc}
                      </Text>

                      {/* Tarihsel Önemi Kutusu */}
                      <View
                        style={[
                          styles.significanceBox,
                          {
                            backgroundColor: colors.background,
                            borderColor: colors.borderGold,
                          },
                        ]}>
                        <View style={styles.sectionHeadingRow}>
                          <Ionicons name="sparkles" size={13} color={colors.gold} />
                          <Text
                            style={[
                              styles.sectionHeadingTitle,
                              { color: colors.goldLight },
                            ]}>
                            Tarihsel Önemi & İşlevi
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.significanceText,
                            { color: colors.textSecondary },
                          ]}>
                          {item.historicalSignificance}
                        </Text>
                      </View>

                      {/* Örnek Eser Bilgisi */}
                      <View
                        style={[
                          styles.exampleBox,
                          {
                            backgroundColor: 'rgba(212, 175, 55, 0.08)',
                            borderColor: 'rgba(212, 175, 55, 0.25)',
                          },
                        ]}>
                        <Ionicons
                          name="compass-outline"
                          size={14}
                          color={colors.gold}
                        />
                        <Text
                          style={[styles.exampleText, { color: colors.goldLight }]}>
                          {item.example}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, default: 8 }),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  filterRow: {
    marginBottom: Spacing.xs,
  },
  filterContent: {
    gap: Spacing.xs + 2,
    paddingRight: Spacing.md,
    paddingVertical: 4,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    marginBottom: Spacing.xs,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  collapseAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollList: {
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardExpandedGlow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  termIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  termTitleBlock: {
    flex: 1,
  },
  termTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  termShortDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  catBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  chevron: {
    marginLeft: 2,
  },
  expandedContent: {
    borderTopWidth: 1,
    padding: Spacing.md,
    paddingTop: Spacing.sm + 4,
    gap: Spacing.sm,
  },
  fullDescription: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  significanceBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionHeadingTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  significanceText: {
    fontSize: 13,
    lineHeight: 19,
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exampleText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  resetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
