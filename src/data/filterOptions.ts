/**
 * Nümismatik Standartlarına Uygun Filtre & Kategori Sabitleri
 * Mobil Nümismatik Kataloğu için Detaylı Arama, Derecelendirme ve Sınıflandırma
 */

export interface MetalOption {
  id: string;
  name: string;
  code: string;
  color: string;
  description?: string;
}

export interface CivilizationOption {
  id: string;
  name: string;
  period: string; // M.Ö. / M.S. tarih aralığı
  image: string; // Temsili antik arka plan görseli
  description?: string;
}

export interface SortOptionItem {
  id: FilterState['sortBy'];
  label: string;
  iconName: string;
}

// 1. METALS (Madenler / Nümismatik Kısaltmaları - 8 Resmi Standart)
export const METALS: MetalOption[] = [
  {
    id: 'gold',
    name: 'Altın (AV / AU)',
    code: 'AV',
    color: '#D4AF37',
    description: 'Aurum: Stater, aureus, solidus ve duka serileri gibi altın darplar.',
  },
  {
    id: 'silver',
    name: 'Gümüş (AR)',
    code: 'AR',
    color: '#CBD5E1',
    description: 'Argentum: Drahmi, tetradrahmi, denarius ve obol serisi gümüş madenleri.',
  },
  {
    id: 'bronze',
    name: 'Bronz / Bakır (AE)',
    code: 'AE',
    color: '#CD7F32',
    description: 'Aes: Æ serileri, sestertius, as ve follis gibi yaygın bronz ve bakır sikkeler.',
  },
  {
    id: 'electrum',
    name: 'Elektrum (EL)',
    code: 'EL',
    color: '#E2C974',
    description: 'Electrum: Lidya ve Erken Grek dönemine özgü doğal veya yapay altın-gümüş alaşımı.',
  },
  {
    id: 'billon',
    name: 'Bilyon (BI)',
    code: 'BI',
    color: '#94A3B8',
    description: 'Billon: Gümüş oranı %50 altına düşürülmüş düşük ayarlı gümüş-bakır alaşımı.',
  },
  {
    id: 'brass',
    name: 'Pirinç (OR)',
    code: 'OR',
    color: '#D97706',
    description: 'Orichalcum: Roma İmparatorluğu sestertius ve dupondius darplarında çinko-bakır alaşımı.',
  },
  {
    id: 'lead',
    name: 'Kurşun (PB)',
    code: 'PB',
    color: '#64748B',
    description: 'Plumbum: Mühürler, kurşun ağırlıklar veya test/jeton baskıları.',
  },
  {
    id: 'platinum',
    name: 'Platin (PT)',
    code: 'PT',
    color: '#10B981',
    description: 'Platinum: Rusya ve geç modern dönem nadir platin hatıra darpları.',
  },
];

// 2. CIVILIZATIONS (Medeniyetler / İmparatorluklar)
export const CIVILIZATIONS: CivilizationOption[] = [
  {
    id: 'greek',
    name: 'Antik Yunan (Greek)',
    period: 'M.Ö. 800 – M.Ö. 146',
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80',
    description: 'Atina baykuşluları, Syracuse staterleri ve İyonya şehir devletleri.',
  },
  {
    id: 'roman-empire',
    name: 'Roma İmparatorluğu (Roman)',
    period: 'M.Ö. 27 – M.S. 476',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'Sezarlar, hanedan portreleri ve eyalet darphaneli denarius serileri.',
  },
  {
    id: 'roman-republic',
    name: 'Roma Cumhuriyeti',
    period: 'M.Ö. 509 – M.Ö. 27',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80',
    description: 'Konsüller, aile armaları ve erken dönem cumhuriyet denariusları.',
  },
  {
    id: 'byzantine',
    name: 'Bizans (Byzantine)',
    period: 'M.S. 330 – 1453',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
    description: 'Konstantinopolis darphaneli altın solidus ve bronz follis serileri.',
  },
  {
    id: 'macedon',
    name: 'Makedonya Krallığı',
    period: 'M.Ö. 808 – M.Ö. 168',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80',
    description: 'Büyük İskender zafer tetradrahmileri ve II. Philippos altın staterleri.',
  },
  {
    id: 'lydia',
    name: 'Lidya Krallığı',
    period: 'M.Ö. 7. – M.Ö. 6. Yüzyıl',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    description: 'Sardes darphanesi; madeni paranın doğduğu yer ve Kroisos aslanlı staterleri.',
  },
  {
    id: 'seljuk',
    name: 'Anadolu Selçuklu',
    period: 'M.S. 1077 – 1308',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80',
    description: 'Konya ve Sivas darphaneli aslan & güneş motifli gümüş dirhemler.',
  },
  {
    id: 'ottoman',
    name: 'Osmanlı İmparatorluğu',
    period: 'M.S. 1299 – 1922',
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
    description: 'Tuğralı altın sultani, akçe, kuruş ve mecidiye serileri.',
  },
];

// 3. ERAS (Tarihsel Çağlar)
export const ERAS = [
  'Arkaik Dönem',
  'Klasik Dönem',
  'Helenistik Dönem',
  'Erken Roma',
  'Geç Roma',
  'Erken Bizans',
  'Klasik Osmanlı',
] as const;

export type EraType = (typeof ERAS)[number];

// 4. RARITY (Nadirlik Derecelendirmeleri - Sheldon & Nümismatik Skalası)
export const RARITY = [
  'Tümü',
  'C (Yaygın)',
  'S (Seyrek)',
  'R1 (Nadir)',
  'R2 (Çok Nadir)',
  'R3 - R5 (Ünik / Müzelik)',
] as const;

export type RarityType = (typeof RARITY)[number];

// 5. MINTS_AND_REGIONS (Darphane & Antik Bölgeler)
export const MINTS_AND_REGIONS = [
  'Konstantinopolis (İstanbul)',
  'Roma',
  'Efes (Ephesos)',
  'Bergama (Pergamon)',
  'İskenderiye (Alexandria)',
  'Antakya (Antiochia)',
  'Sardis (Salihli)',
  'Atina',
  'Bursa (Prusa)',
  'Edirne',
] as const;

export type MintAndRegionType = (typeof MINTS_AND_REGIONS)[number];

// 6. CONDITIONS (Kondisyon Derecesi - Uluslararası Nümismatik Standart)
export const CONDITIONS = [
  'FDC / MS (Çil / Mint State - Kusursuz)',
  'EF / XF (Çok Temiz / Extremely Fine)',
  'VF (Temiz / Very Fine)',
  'Fine (Orta / Fine)',
  'Fair / Poor (Aşınmış)',
] as const;

export type ConditionType = (typeof CONDITIONS)[number];

// 7. SMART_PRESETS (Hızlı Akıllı Filtreler)
export const SMART_PRESETS = [
  'Tüm Eserler',
  'Yalnızca Altınlar (AU)',
  'Müzelik / Ünik Eserler',
  'Büyük İskender Dönemi',
  'Roma İmparatorluk Paraları',
  'En Yüksek Değerliler',
] as const;

export type SmartPresetType = (typeof SMART_PRESETS)[number];

// 8. SORT OPTIONS (Sıralama Seçenekleri)
export const SORT_OPTIONS: SortOptionItem[] = [
  { id: 'name', label: 'İsim (A - Z)', iconName: 'text-outline' },
  { id: 'value_desc', label: 'Değer (En Yüksek)', iconName: 'trending-up-outline' },
  { id: 'value_asc', label: 'Değer (En Düşük)', iconName: 'trending-down-outline' },
  { id: 'period', label: 'Tarihsel Kronoloji', iconName: 'time-outline' },
];

// 9. FilterState TypeScript Arayüzü
export interface FilterState {
  search: string;
  metals: string[];
  civilizations: string[];
  eras: string[];
  minYear: number | null;
  maxYear: number | null;
  sortBy: 'name' | 'value_asc' | 'value_desc' | 'period';
  mints: string[];
  conditions: string[];
  minPrice: number | null;
  maxPrice: number | null;
  hasImageBackAndFront: boolean;
  activePreset: string | null;
}

// Varsayılan Başlangıç Filtre Durumu Üretici Fonksiyonu (Referans çakışmalarını önler)
export const createDefaultFilterState = (): FilterState => ({
  search: '',
  metals: [],
  civilizations: [],
  eras: [],
  minYear: null,
  maxYear: null,
  sortBy: 'name',
  mints: [],
  conditions: [],
  minPrice: null,
  maxPrice: null,
  hasImageBackAndFront: false,
  activePreset: null,
});

// Varsayılan Başlangıç Filtre Durumu
export const DEFAULT_FILTER_STATE: FilterState = createDefaultFilterState();
