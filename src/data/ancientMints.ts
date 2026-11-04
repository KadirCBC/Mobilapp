import { CoinItem, MOCK_COINS } from './mockData';

export type ChronologicalEraId =
  | 'all'
  | 'archaic_classical'
  | 'hellenistic'
  | 'roman'
  | 'byzantine';

export interface ChronologicalEra {
  id: ChronologicalEraId;
  label: string;
  subtitle: string;
}

export const CHRONOLOGICAL_ERAS: ChronologicalEra[] = [
  {
    id: 'all',
    label: 'Tüm Çağlar',
    subtitle: 'Tarihsel Nümismatik Atlası',
  },
  {
    id: 'archaic_classical',
    label: 'M.Ö. 6. - 4. Yy',
    subtitle: 'Arkaik & Klasik',
  },
  {
    id: 'hellenistic',
    label: 'M.Ö. 330 - 30',
    subtitle: 'Helenistik Çağ',
  },
  {
    id: 'roman',
    label: 'M.Ö. 27 - M.S. 476',
    subtitle: 'Roma İmparatorluğu',
  },
  {
    id: 'byzantine',
    label: 'M.S. 491+',
    subtitle: 'Bizans / Doğu Roma',
  },
];

export interface AncientMint {
  id: string;
  name: string;
  ancientName: string;
  region: string;
  founded: string;
  primaryMetal: string;
  famousCoin: string;
  famousRuler: string;
  filterKeyword: string;
  description: string;
  historicalSignificance: string;
  eras: ChronologicalEraId[];
  coinEmbossImage: string;
  coordinates: {
    xPercent: number; // Harita genişliğinin %'si (0-100)
    yPercent: number; // Harita yüksekliğinin %'si (0-100)
  };
  image: string;
}

export const ANCIENT_MINTS: AncientMint[] = [
  {
    id: 'sardis',
    name: 'Sardis (Sardes)',
    ancientName: 'Σάρδεις / Sardis',
    region: 'Lidya Krallığı (Manisa / Salihli)',
    founded: 'M.Ö. 7. Yüzyıl',
    primaryMetal: 'Elektrum & Saf Altın (AU)',
    famousCoin: 'Kroisos Aslan ve Boğa Altın Stateri',
    famousRuler: 'Kral Kroisos (Krezüs)',
    filterKeyword: 'Sardis',
    eras: ['archaic_classical', 'hellenistic', 'roman'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/314/Y/6/Yr5wdjC48oHMJx9q3mFPD7zawb6F2Q.jpg',
    description:
      "Tarihte ilk madeni paranın basıldığı, nümismatik biliminin beşiği sayılan darphane. Paktolos (Sart) Çayı'ndan çıkarılan doğal elektrum ve saf altın madenleri burada ilk devlet garantili paraya dönüştürülmüştür.",
    historicalSignificance: 'Dünyanın ilk bimetalik para sistemi (altın/gümüş oranı) burada kurulmuştur.',
    coordinates: {
      xPercent: 67,
      yPercent: 43,
    },
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ephesos',
    name: 'Efes (Ephesos)',
    ancientName: 'Ἔφεσος / Ephesos',
    region: 'İyonya Eyaleti (İzmir / Selçuk)',
    founded: 'M.Ö. 6. Yüzyıl',
    primaryMetal: 'Gümüş (AR) & Bronz (AE)',
    famousCoin: 'Artemis ve Bal Arısı Gümüş Didrahmisi',
    famousRuler: 'İyon Birliği & Roma Valileri',
    filterKeyword: 'Efes',
    eras: ['archaic_classical', 'hellenistic', 'roman'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/33/Z/6/zJB2F7i5kS8trEQ9A5zo4iyDX3Sn6F.jpg',
    description:
      "Antik dünyanın 7 harikasından biri olan Artemis Tapınağı'nın gölgesinde faaliyet gösteren devasa darphane. Efes'in simgesi olan 'Bal Arısı' ve kutsal geyik motifli sikkeler tüm Akdeniz havzasında geçerli kılınmıştır.",
    historicalSignificance: 'Grek ve Roma eyalet nümismatiğinin en yüksek tirajlı ticaret merkezidir.',
    coordinates: {
      xPercent: 64,
      yPercent: 51,
    },
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pergamon',
    name: 'Bergama (Pergamon)',
    ancientName: 'Πέργαμον / Pergamon',
    region: 'Mysia Krallığı (İzmir / Bergama)',
    founded: 'M.Ö. 3. Yüzyıl',
    primaryMetal: 'Gümüş (Cistophoric AR) & Bronz',
    famousCoin: 'Lysimachos Tanrılaştırılmış İskender Tetradrahmisi',
    famousRuler: 'Lysimachos & Attalos Hanedanı',
    filterKeyword: 'Bergama',
    eras: ['hellenistic', 'roman'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/9/K/6/kLn5Re9wp3oPEy342yAmjK79P6eST5.jpg',
    description:
      "Helenistik dönemin bilim ve sanat başkenti Pergamon'un darphanesi, tanrılaştırılmış Büyük İskender portreleri ve yılanlı sepet (Cistophorus) serileriyle nümismatik gravür sanatının zirvesi olarak kabul edilir.",
    historicalSignificance: 'Antik dönemin en zarif yüksek kabartmalı portre kalıpları burada üretilmiştir.',
    coordinates: {
      xPercent: 62,
      yPercent: 35,
    },
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'constantinople',
    name: 'Konstantinopolis (İstanbul)',
    ancientName: 'Constantinopolis / Byzantion',
    region: 'Doğu Roma & Bizans İmparatorluğu',
    founded: 'M.S. 330',
    primaryMetal: 'Altın (Solidus/Nomisma) & Bronz (Follis)',
    famousCoin: 'Büyük Constantinus & Justinianus Altın Solidusu',
    famousRuler: 'I. Constantinus & Justinianus',
    filterKeyword: 'Konstantinopolis',
    eras: ['roman', 'byzantine'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/307/X/6/xx4Rj3WwmGq7Bc6d5Jana9AoSc8GfK.jpg',
    description:
      'Bin yıldan uzun süre boyunca dünyanın rezerv para birimi olan saf altın Solidus darphanesi. CONOB lejantıyla tanınan başkent darphanesi, Orta Çağ Akdeniz ticaretinin altın standardını belirlemiştir.',
    historicalSignificance: 'Orta Çağ boyunca paranın küresel altın standardını belirleyen baş darphane.',
    coordinates: {
      xPercent: 71,
      yPercent: 21,
    },
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rome',
    name: 'Roma (Moneta Caesaris)',
    ancientName: 'Roma / Caput Mundi',
    region: 'İtalya (Başkent)',
    founded: 'M.Ö. 269',
    primaryMetal: 'Altın (Aureus), Gümüş (Denarius), Bronz (Sestertius)',
    famousCoin: 'Augustus & Sezar Portreli Cumhuriyet/İmparatorluk Denariusu',
    famousRuler: 'Julius Caesar, Augustus, Trajan',
    filterKeyword: 'Roma',
    eras: ['archaic_classical', 'hellenistic', 'roman'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/18/Z/6/zJ3EF4nLycY5gP7q8x2JeSQ29wmSWo.jpg',
    description:
      "Juno Moneta Tapınağı yanında kurulan ve modern 'Money/Moneta' kelimesine adını veren ana darphane. Roma İmparatorluğu'nun tüm eyaletlerine dağıtılan milyonlarca askeri ve ticari denarius burada darp edilmiştir.",
    historicalSignificance: 'Modern para (Moneta/Money) sözcüğünün doğduğu, tarihin en büyük imparatorluk darphanesidir.',
    coordinates: {
      xPercent: 18,
      yPercent: 27,
    },
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'athens',
    name: 'Atina (Attika Darphanesi)',
    ancientName: 'Ἀθῆναι / Athenai',
    region: 'Attika Yarımadası / Yunanistan',
    founded: 'M.Ö. 6. Yüzyıl',
    primaryMetal: 'Gümüş (Laurion AR Tetradrahmi)',
    famousCoin: 'Athena & Baykuşlu Klasik Tetradrahmi (Owl Tetradrachm)',
    famousRuler: 'Perikles & Atina Demokrasisi',
    filterKeyword: 'Atina',
    eras: ['archaic_classical', 'hellenistic', 'roman'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/9/K/6/kLn5Re9wp3oPEy342yAmjK79P6eST5.jpg',
    description:
      "Laurion gümüş madenlerinin zenginliğiyle beslenen Atina darphanesi, arka yüzündeki kutsal baykuş ve zeytin dalı motifiyle antik dünyanın en tanınan ve en çok güvenilen rezerv gümüş parasını üretmiştir.",
    historicalSignificance: 'Akdeniz ticaretinde 400 yıl boyunca değeri hiç düşmeyen antik dünyanın dolarıdır.',
    coordinates: {
      xPercent: 43,
      yPercent: 49,
    },
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'alexandria',
    name: 'İskenderiye (Alexandria)',
    ancientName: 'Ἀλεξάνδρεια / Alexandria ad Aegyptum',
    region: 'Ptolemaios Krallığı / Mısır Eyaleti',
    founded: 'M.Ö. 331',
    primaryMetal: 'Gümüş & Bilyon Tetradrahmi, Altın Oktadrahmi',
    famousCoin: 'I. Ptolemaios Kartallı Tetradrahmi & Kleopatra Portresi',
    famousRuler: 'Büyük İskender, Ptolemaioslar & Kleopatra',
    filterKeyword: 'İskenderiye',
    eras: ['hellenistic', 'roman', 'byzantine'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/18/M/6/mCt42x8QYig5zG7WS6jajD9aLoo2w3.jpg',
    description:
      "Nil Nehri'nin Akdeniz'e açılan kapısında Büyük İskender tarafından kurulan darphane. Ptolemaios hanedanının devasa altın oktadrahmileri ve Roma döneminin ünlü kalın bilyon tetradrahmileri burada basılmıştır.",
    historicalSignificance: 'Doğu ile Batı arasındaki devasa deniz ticaretinin Mısır finansal omurgasıdır.',
    coordinates: {
      xPercent: 68,
      yPercent: 81,
    },
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'antioch',
    name: 'Antakya (Antiochia)',
    ancientName: 'Ἀντιόχεια / Antiochia ad Orontem',
    region: 'Seleukos Krallığı & Roma Suriye Eyaleti',
    founded: 'M.Ö. 300',
    primaryMetal: 'Gümüş (AR Tetradrahmi) & Bronz',
    famousCoin: 'Nero & Vespasian Lejyon Kartallı Tetradrahmi',
    famousRuler: 'I. Seleukos Nikator, Nero, Vespasian',
    filterKeyword: 'Antakya',
    eras: ['hellenistic', 'roman', 'byzantine'],
    coinEmbossImage: 'https://images.vcoins.com/product_image/18/2/6/2pTKe9DxbZH8C75g4mcSN7w9tF6qr3.jpg',
    description:
      'Roma İmparatorluğu\'nun Roma ve İskenderiye\'den sonraki 3. büyük metropolü. Doğu sınır lejyonlarının maaşları ve İpek Yolu ticaretinin altın-gümüş sikke basımı bu devasa darphanede gerçekleştirilmiştir.',
    historicalSignificance: 'Roma\'nın doğu seferlerinin lojistik ve nümismatik finansman kalbidir.',
    coordinates: {
      xPercent: 88,
      yPercent: 55,
    },
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * Belirli bir darphaneye ait arşivdeki sikke sayısını döner
 */
export function getMintCoinCount(filterKeyword: string): number {
  const keyword = filterKeyword.toLowerCase();
  return MOCK_COINS.filter((coin) => {
    const mintStr = (coin.mint || '').toLowerCase();
    const descStr = (coin.description || '').toLowerCase();
    const titleStr = (coin.title || '').toLowerCase();
    return mintStr.includes(keyword) || descStr.includes(keyword) || titleStr.includes(keyword);
  }).length;
}

/**
 * Belirli bir darphaneye ait arşivdeki tüm sikkeleri döner
 */
export function getMintCoins(filterKeyword: string, limit = 12): CoinItem[] {
  const keyword = filterKeyword.toLowerCase();
  return MOCK_COINS.filter((coin) => {
    const mintStr = (coin.mint || '').toLowerCase();
    const descStr = (coin.description || '').toLowerCase();
    const titleStr = (coin.title || '').toLowerCase();
    return mintStr.includes(keyword) || descStr.includes(keyword) || titleStr.includes(keyword);
  }).slice(0, limit);
}
