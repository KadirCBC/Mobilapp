export interface CoinItem {
  id: string;
  title: string;
  civilization: string;
  ruler: string;
  period: string;
  material: string;
  weight: string;
  diameter: string;
  obverseImage: string;
  reverseImage: string;
  obverseDesc: string;
  reverseDesc: string;
  rarity: string;
  estimatedValue: string;
  description: string;
}

export const MOCK_COINS: CoinItem[] = [
  {
    id: 'croeseid-gold-stater',
    title: 'Kroisos Ağır Altın Stateri',
    civilization: 'Lidya Krallığı',
    ruler: 'Kral Kroisos (Karun)',
    period: 'M.Ö. 560 – 546 (Arkaik Dönem)',
    material: 'Saf Altın (Au)',
    weight: '10.76 g',
    diameter: '16.5 mm',
    obverseImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    reverseImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    obverseDesc: 'Karşı karşıya duran aslan ve boğa protomları. Aslan kraliyet gücünü ve cesareti, boğa ise bereketi ve tarımsal zenginliği temsil eder.',
    reverseDesc: 'Çekiç darbesi tekniğiyle oluşturulmuş yan yana iki düzensiz derin kare darp çukuru (incuse punches).',
    rarity: 'R2 (Oldukça Nadir)',
    estimatedValue: '$18,000 - $24,000',
    description: 'Sardes darphanesinde darp edilen bu stater, insanlık tarihindeki ilk saf altın standart sikke serilerindendir. Kral Kroisos, doğal elektrum alaşımını ayrıştırarak saf altın ve saf gümüşten oluşan bimetalik para sistemini dünya ticaretine kazandırmıştır.',
  },
  {
    id: 'athenian-owl-tetradrachm',
    title: 'Atina Baykuşlu Tetradrahmi',
    civilization: 'Antik Yunan (Atina)',
    ruler: 'Atina Demokrasisi (Perikles Çağı)',
    period: 'M.Ö. 440 – 404 (Klasik Dönem)',
    material: 'Gümüş (Ag 980)',
    weight: '17.20 g',
    diameter: '24.0 mm',
    obverseImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    reverseImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    obverseDesc: 'Zeytin yaprakları ve palmet motifli Attika miğferi takmış, sağa bakan bilgelik tanrıçası Athena büstü; arkaik tebessüm ve belirgin badem göz.',
    reverseDesc: 'Sağa dönük, başı cepheden resmedilmiş kutsal baykuş (glaux). Sol üstte zeytin dalı ve hilal, sağda dikey "ΑΘΕ" (Atinalıların parası) lejantı.',
    rarity: 'R1 (Nadir / Koleksiyonluk)',
    estimatedValue: '$3,500 - $6,000',
    description: 'Laurion madenlerinin yüksek saflıktaki gümüşünden basılan bu sikke, Akdeniz ticaretinde yüzlerce yıl güvenle kullanılan antik dünyanın rezerv para birimidir. Hem sanatsal zarafeti hem de ekonomik etkisiyle nümizmatik tarihinin en tanınan parasıdır.',
  },
  {
    id: 'alexander-gold-stater',
    title: 'Büyük İskender Zafer Stateri',
    civilization: 'Makedonya Krallığı',
    ruler: 'III. Aleksandros (Büyük İskender)',
    period: 'M.Ö. 336 – 323 (Helenistik Dönem)',
    material: 'Altın (Au 24K)',
    weight: '8.58 g',
    diameter: '18.2 mm',
    obverseImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    reverseImage: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80',
    obverseDesc: 'Korint tipi süslü tolgasıyla sağa yönelmiş Athena başı; miğfer üzerinde kanatlı ejderha/yılan kabartması.',
    reverseDesc: 'Ayakta duran kanatlı Zafer Tanrıçası Nike; sol elinde gemi omurgasını simgeleyen stylis, sağ elinde defne çelengi tutar. Sağında dikey "ΑΛΕΞΑΝΔΡΟΥ" lejantı ve darphane monogramı bulunur.',
    rarity: 'R2 (Çok Nadir)',
    estimatedValue: '$12,000 - $16,500',
    description: 'Büyük İskender\'in Asya seferindeki zaferlerini finanse etmek ve askeri başarısını tüm imparatorluğa duyurmak için Amfipolis darphanesinde darp ettirdiği prestijli zafer sikkesidir. Yüksek sanatsal işçiliği ve dönemin emperyal gücünü kusursuz şekilde yansıtır.',
  },
  {
    id: 'augustus-denarius',
    title: 'Augustus Zafer Denariusu',
    civilization: 'Roma İmparatorluğu',
    ruler: 'İmparator Augustus (Octavianus)',
    period: 'M.Ö. 27 – M.S. 14 (Erken İmparatorluk)',
    material: 'Gümüş (Denarius)',
    weight: '3.85 g',
    diameter: '19.5 mm',
    obverseImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    reverseImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    obverseDesc: 'Defne çelenkli sağa bakan Augustus portresi; çevresinde "CAESAR AVGVSTVS DIVI F PATER PATRIAE" lejantı.',
    reverseDesc: 'Kalkan ve mızraklar arasında duran Gaius ve Lucius Caesar; üstte kurban kepçesi (simpulum) ve lituus asa motifleri.',
    rarity: 'R1 (Nadir)',
    estimatedValue: '$2,800 - $4,200',
    description: 'Pax Romana (Roma Barışı) döneminin başlangıcını ve Augustus Hanedanlığı\'nın ilahi meşruiyetini simgeleyen Lugdunum (Lyon) darphanesi gümüş denariusu.',
  },
  {
    id: 'justinian-gold-solidus',
    title: 'I. Justinianus Altın Solidusu',
    civilization: 'Bizans İmparatorluğu',
    ruler: 'I. Justinianus (Büyük Justinian)',
    period: 'M.S. 527 – 565 (Erken Bizans)',
    material: 'Saf Altın (Solidus)',
    weight: '4.48 g',
    diameter: '21.0 mm',
    obverseImage: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
    reverseImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    obverseDesc: 'Miğferli, zırhlı ve elinde haçlı küre (globus cruciger) tutan cepheden İmparator Justinianus portresi; "D N IVSTINIANVS P P AVG" lejantı.',
    reverseDesc: 'Ayakta duran kanatlı Zafer Meleği, sağ elinde uzun haç tutar; altta "CONOB" (Konstantinopolis darphanesi saf altın garantisi) mührü.',
    rarity: 'R1 (Nadir)',
    estimatedValue: '$1,900 - $3,200',
    description: 'Ayasofya\'yı inşa ettiren ve Roma Hukukunu derleyen Büyük Justinianus döneminde başkent Konstantinopolis darphanesinde basılmış kusursuz altın solidus.',
  },
  {
    id: 'mehmed-gold-sultani',
    title: 'Fatih Sultan Mehmed Altın Sultanisi',
    civilization: 'Osmanlı İmparatorluğu',
    ruler: 'Fatih Sultan Mehmed Han',
    period: '1477 – 1481 (Klasik Dönem)',
    material: 'Has Altın (Sultani / Hasene)',
    weight: '3.52 g',
    diameter: '20.0 mm',
    obverseImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    reverseImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    obverseDesc: 'Sülüs hat sanatı ile "Sultânü\'l-Berreyn ve Hâkânü\'l-Bahreyn es-Sultân İbnü\'s-Sultân" (İki karanın sultanı, iki denizin hakanı, sultan oğlu sultan) unvanı.',
    reverseDesc: '"Dâribü\'n-Nadr Sâhibü\'l-İzz ve\'n-Nasr fi\'l-Berr ve\'l-Bahr" ve darp yeri olan Kostantiniyye 882 (Hicri).',
    rarity: 'R3 (Aşırı Nadir)',
    estimatedValue: '$15,000 - $22,000',
    description: 'İstanbul\'un fethinden sonra 1477 yılında Osmanlı Devleti\'nin ilk yerli altın parası olarak Kostantiniyye darphanesinde basılan çığır açıcı altın sikke.',
  },
];
