export interface CivilizationCategory {
  id: string;
  name: string;
  shortName: string;
  period: string; // M.Ö. / M.S. tarih aralığı
  image: string; // Temsili antik motif / arkeolojik görsel
  coinCount: number; // Arşivdeki kayıtlı eser sayısı
  metals: string[]; // Öne çıkan maden türleri
  description?: string; // Medeniyet kısa tanıtımı
}

export const CATEGORIES: CivilizationCategory[] = [
  {
    id: 'roma',
    name: 'Roma İmparatorluğu',
    shortName: 'Roma',
    period: 'M.Ö. 27 – M.S. 476',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', // Roma Kolezyum (Colosseum)
    coinCount: 840,
    metals: ['Altın', 'Gümüş', 'Bronz'],
    description: 'İmparatorluk propagandası, efsanevi gümüş tetradrahmi ve aureus serileri.',
  },
  {
    id: 'yunan',
    name: 'Antik Yunan (Greek)',
    shortName: 'Yunan',
    period: 'M.Ö. 800 – M.Ö. 146',
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80', // Atina Parthenon Tapınağı
    coinCount: 620,
    metals: ['Gümüş', 'Altın', 'Bronz'],
    description: 'Atina baykuşlu tetradrahmileri ve Helenistik şehir devleti staterleri.',
  },
  {
    id: 'makedonya',
    name: 'Makedonya Krallığı',
    shortName: 'Makedonya',
    period: 'M.Ö. 808 – M.Ö. 168',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80', // Vergina / Antik Makedonya
    coinCount: 310,
    metals: ['Gümüş', 'Altın', 'Bronz'],
    description: 'Büyük İskender zafer tetradrahmileri ve II. Philippos altın staterleri.',
  },
  {
    id: 'bizans',
    name: 'Bizans İmparatorluğu',
    shortName: 'Bizans',
    period: 'M.S. 330 – 1453',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80', // Ayasofya (Hagia Sophia)
    coinCount: 512,
    metals: ['Altın', 'Bronz', 'Elektrum'],
    description: 'Konstantinopolis darphaneli, yüzyıllarca değerini koruyan saf altın solidus serileri.',
  },
  {
    id: 'lidya',
    name: 'Lidya Krallığı',
    shortName: 'Lidya',
    period: 'M.Ö. 7. – M.Ö. 6. Yüzyıl',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', // Sardes Antik Kenti & Artemis Tapınağı Sütunları
    coinCount: 142,
    metals: ['Elektrum', 'Altın', 'Gümüş'],
    description: 'Madeni paranın doğduğu Sardes merkezli krallık. İlk elektrum ve saf altın staterler.',
  },
  {
    id: 'roma-cumhuriyet',
    name: 'Roma Cumhuriyeti',
    shortName: 'Roma Cumhuriyeti',
    period: 'M.Ö. 509 – M.Ö. 27',
    image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80', // Roma Forumu
    coinCount: 275,
    metals: ['Gümüş', 'Bronz'],
    description: 'Konsüller, aile armaları ve erken dönem cumhuriyet denariusları.',
  },
  {
    id: 'selcuklu',
    name: 'Anadolu Selçuklu',
    shortName: 'Selçuklu',
    period: 'M.S. 1077 – 1308',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80', // Selçuklu Taş Oyma & Medrese
    coinCount: 195,
    metals: ['Gümüş', 'Bakır', 'Altın'],
    description: 'Konya ve Sivas darphaneli, aslan ve güneş motifli gümüş dirhemler.',
  },
  {
    id: 'osmanli',
    name: 'Osmanlı İmparatorluğu',
    shortName: 'Osmanlı',
    period: 'M.S. 1299 – 1922',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80', // Tarihi İstanbul & Topkapı kubbeleri
    coinCount: 1140,
    metals: ['Altın', 'Gümüş', 'Bakır'],
    description: 'Orhan Gazi’nin ilk akçesinden Fatih’in altın sultanisine ve tuğralı imparatorluk paralarına.',
  },
];
