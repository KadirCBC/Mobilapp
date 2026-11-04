export interface CivilizationCategory {
  id: string;
  name: string;
  shortName: string;
  period: string; // M.Ö. / M.S. tarih aralığı
  image: string; // Temsili antik motif / arkeolojik görsel
  coinCount: number; // Arşivdeki kayıtlı eser sayısı
  description?: string; // Medeniyet kısa tanıtımı
}

export const CATEGORIES: CivilizationCategory[] = [
  {
    id: 'roma',
    name: 'Roma İmparatorluğu',
    shortName: 'Roma',
    period: 'M.Ö. 27 – M.S. 476',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80', // Roma Kolezyum (Colosseum)
    coinCount: 820,
    description: 'İmparatorluk propagandası, efsanevi gümüş tetradrahmi ve denarius serileri.',
  },
  {
    id: 'yunan',
    name: 'Antik Yunan',
    shortName: 'Yunan',
    period: 'M.Ö. 5. – 1. Yüzyıl',
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=400&q=80', // Atina Parthenon Tapınağı
    coinCount: 486,
    description: 'Atina baykuşlu tetradrahmileri ve Helenistik şehir devleti sikkeleri.',
  },
  {
    id: 'bizans',
    name: 'Bizans İmparatorluğu',
    shortName: 'Bizans',
    period: 'M.S. 330 – 1453',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=400&q=80', // Ayasofya (Hagia Sophia)
    coinCount: 512,
    description: 'Konstantinopolis darphaneli, yüzyıllarca değerini koruyan saf altın solidus serileri.',
  },
  {
    id: 'lidya',
    name: 'Lidya Krallığı',
    shortName: 'Lidya',
    period: 'M.Ö. 7. – 6. Yüzyıl',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80', // Sardes Antik Kenti & Artemis Tapınağı Sütunları
    coinCount: 142,
    description: 'Madeni paranın doğduğu Sardes merkezli krallık. İlk elektrum ve saf altın staterler.',
  },
  {
    id: 'islam-dogu',
    name: 'İslam & Doğu',
    shortName: 'İslam & Doğu',
    period: 'M.S. 3. – 14. Yüzyıl',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80', // Selçuklu & İslam mukarnas taş ve hat sanatı
    coinCount: 320,
    description: 'Endülüs Fatımi altın dinarları, Kuşano-Sasani ve Selçuklu nümizmatik şaheserleri.',
  },
  {
    id: 'osmanli',
    name: 'Osmanlı İmparatorluğu',
    shortName: 'Osmanlı',
    period: '1299 – 1922',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400&q=80', // Tarihi İstanbul & Topkapı kubbeleri
    coinCount: 1140,
    description: 'Orhan Gazi’nin ilk akçesinden Fatih’in altın sultanisine ve tuğralı imparatorluk paralarına.',
  },
  {
    id: 'amerika',
    name: 'Latin Amerika',
    shortName: 'Amerika',
    period: '18. – 19. Yüzyıl',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=400&q=80', // Cuzco & Potosi gümüş madeni dağları
    coinCount: 185,
    description: 'Potosi ve Cuzco darphaneli Simón Bolívar portreli 8 Reales ve Soles serileri.',
  },
];
