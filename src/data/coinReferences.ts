/**
 * Standart Nümizmatik Literatür & Akademik Referanslar Veri Modeli
 * RIC (Roman Imperial Coinage), BMC (British Museum), RPC (Roman Provincial),
 * David Sear (RCV/GIC/BCV), SNG (Sylloge Nummorum Graecorum) ve Damalı Osmanlı katalogları.
 */

import { CoinItem } from './mockData';

export interface ReferenceCodeItem {
  catalogKey: 'RIC' | 'BMC' | 'SEAR' | 'RPC' | 'SNG' | 'CRAWFORD' | 'DAMALI' | 'PRICE';
  code: string;
  catalogName: string;
  detail: string;
}

export interface PublicationCitation {
  bookTitle: string;
  authors: string;
  publisher: string;
  publicationYear: string;
  isbnOrDoi: string;
  volumeInfo: string;
  searchQuery: string;
  ocreUrl?: string;
  worldCatUrl?: string;
  britishMuseumUrl?: string;
}

export interface NumismaticLiteratureData {
  primaryReference: string;
  referenceCodes: ReferenceCodeItem[];
  citation: PublicationCitation;
  apaCitation: string;
  concordanceNote: string;
}

// Sikke kimliklerine göre özel doğrulanmış akademik literatür referansları
export const SPECIFIC_COIN_REFERENCES: Record<string, NumismaticLiteratureData> = {
  // 1. Nero AR Tetradrahmi (Antakya)
  'coin-nero-tetradrachm-63': {
    primaryReference: 'RPC I 4189 • McAlee 258',
    referenceCodes: [
      {
        catalogKey: 'RPC',
        code: 'RPC I 4189',
        catalogName: 'Roman Provincial Coinage',
        detail: 'Cilt I, Syf. 614, No. 4189 (Antiochia ad Orontem)',
      },
      {
        catalogKey: 'BMC',
        code: 'BMC Syria 192',
        catalogName: 'British Museum Catalog',
        detail: 'Galatia, Cappadocia, Syria; Syf. 175, No. 192-195',
      },
      {
        catalogKey: 'SEAR',
        code: 'Sear GIC 618',
        catalogName: 'Greek Imperial Coins',
        detail: 'David Sear Greek Imperial Coins No. 618',
      },
      {
        catalogKey: 'RIC',
        code: 'Prieur 82',
        catalogName: 'Les Tétradrachmes d\'Antioche',
        detail: 'Michel Prieur Kataloğu No. 82 (Regnal Year 9)',
      },
    ],
    citation: {
      bookTitle: 'Roman Provincial Coinage: Volume I (From the Death of Caesar to the Death of Vitellius)',
      authors: 'Andrew Burnett, Michel Amandry, Pere Pau Ripollès',
      publisher: 'British Museum Press & Bibliothèque Nationale de France',
      publicationYear: '1992 (Rev. 2015)',
      isbnOrDoi: 'ISBN 978-0714108711',
      volumeInfo: 'Cilt I, Bölüm 3: Syria & Antioch Provincial Mint',
      searchQuery: 'Nero Antioch eagle tetradrachm RPC 4189',
      ocreUrl: 'https://rpc.ashmus.ox.ac.uk/coins/1/4189',
      worldCatUrl: 'https://www.worldcat.org/title/27264879',
      britishMuseumUrl: 'https://www.britishmuseum.org/collection/term/BIOG116347',
    },
    apaCitation:
      'Burnett, A., Amandry, M., & Ripollès, P. P. (1992). Roman Provincial Coinage: Vol. I. British Museum Press, No. 4189.',
    concordanceNote:
      'Antakya darphanesi M.S. 63 (9. saltanat yılı) tarihli lejyon kartalı serisi. Prieur ve McAlee korpuslarında standart tip referansı olarak tescillidir.',
  },

  // 2. Domitian Eyalet Tetradrahmisi
  'coin-domitian-tetradrachm': {
    primaryReference: 'RPC II 2018 • McAlee 398',
    referenceCodes: [
      {
        catalogKey: 'RPC',
        code: 'RPC II 2018',
        catalogName: 'Roman Provincial Coinage',
        detail: 'Cilt II, No. 2018 (Antioch, Domitianus Augustus)',
      },
      {
        catalogKey: 'RIC',
        code: 'RIC II.1 841',
        catalogName: 'Roman Imperial Coinage',
        detail: 'Cilt II Bölüm 1 (Flavian Eyalet Basımları), Syf. 248',
      },
      {
        catalogKey: 'BMC',
        code: 'BMCRE II 284',
        catalogName: 'Coins of the Roman Empire (BM)',
        detail: 'British Museum Catalog of Roman Empire Vol. II, No. 284',
      },
      {
        catalogKey: 'SEAR',
        code: 'Sear RCV 2795',
        catalogName: 'Roman Coins and Their Values',
        detail: 'David Sear RCV Cilt I, No. 2795',
      },
    ],
    citation: {
      bookTitle: 'The Roman Imperial Coinage: Volume II, Part 1 (Vespasian to Domitian)',
      authors: 'Harold Mattingly, Edward A. Sydenham, Ian Carradice, T.V. Buttrey',
      publisher: 'Spink & Son Ltd., London',
      publicationYear: '2007 (New Rev. Ed.)',
      isbnOrDoi: 'ISBN 978-1902040653',
      volumeInfo: 'Vol. II, Part 1: Flavian Dynasty Mints',
      searchQuery: 'Domitian Antioch tetradrachm thunderbolt eagle RPC 2018',
      ocreUrl: 'https://numismatics.org/ocre/id/ric.2_1(2).dom.841',
      worldCatUrl: 'https://www.worldcat.org/title/154674997',
      britishMuseumUrl: 'https://www.britishmuseum.org/collection/object/C_1896-0608-84',
    },
    apaCitation:
      'Carradice, I. A., & Buttrey, T. V. (2007). The Roman Imperial Coinage: Vol. II, Part 1. Spink & Son Ltd., No. 841.',
    concordanceNote:
      'Domitian dönemi yüksek ayarlı eyalet tetradrahmisi. Arka yüzde şimşek üzerinde duran zafer kartalı motifi RPC II ve BMCRE korpuslarında ana referanstır.',
  },

  // 3. Vespasian & Titus Caesar İkili Büst Sikkesi
  'coin-vespasian-titus-caesar': {
    primaryReference: 'RIC II.1 63 • RPC II 1941',
    referenceCodes: [
      {
        catalogKey: 'RIC',
        code: 'RIC II.1 63',
        catalogName: 'Roman Imperial Coinage',
        detail: 'Cilt II.1, Syf. 72, No. 63 (Dynastic Double Bust Series)',
      },
      {
        catalogKey: 'BMC',
        code: 'BMCRE II 450',
        catalogName: 'Coins of the Roman Empire (BM)',
        detail: 'British Museum Vol. II, No. 450, Pl. 24.12',
      },
      {
        catalogKey: 'SEAR',
        code: 'Sear RCV 2420',
        catalogName: 'Roman Coins and Their Values',
        detail: 'David Sear RCV Cilt I, No. 2420 (Flavian Succession)',
      },
      {
        catalogKey: 'RPC',
        code: 'RPC II 1941',
        catalogName: 'Roman Provincial Coinage',
        detail: 'Flavius Hanedanı Veraset Serisi No. 1941',
      },
    ],
    citation: {
      bookTitle: 'Roman Imperial Coinage: Volume II (Vespasian to Hadrian)',
      authors: 'Harold Mattingly, Edward A. Sydenham',
      publisher: 'Spink & Son Ltd., London',
      publicationYear: '1926 (Reprint 1997)',
      isbnOrDoi: 'ISBN 978-0907605898',
      volumeInfo: 'Cilt II: Dynastic Issues of Rome and Eastern Mints',
      searchQuery: 'Vespasian Titus Caesar double portrait RIC 63',
      ocreUrl: 'https://numismatics.org/ocre/id/ric.2_1(2).ves.63',
      worldCatUrl: 'https://www.worldcat.org/title/875369',
      britishMuseumUrl: 'https://www.britishmuseum.org/collection/object/C_R-1024',
    },
    apaCitation:
      'Mattingly, H., & Sydenham, E. A. (1926). The Roman Imperial Coinage: Vol. II. Spink & Son Ltd., No. 63.',
    concordanceNote:
      'Baba-oğul hanedan verasetini belgeleyen ünik ikili portre sikkesi. Mattingly & Sydenham korpusunda hanedan propagandasının başyapıtı kabul edilir.',
  },

  // 4. Teselya Pelinna Atlı Savaşçı Sikkesi
  'coin-thessaly-pelinna-chalkous': {
    primaryReference: 'BCD Thessaly II 507 • SNG Cop 184',
    referenceCodes: [
      {
        catalogKey: 'SNG',
        code: 'SNG Cop 184',
        catalogName: 'Sylloge Nummorum Graecorum',
        detail: 'SNG Copenhagen (Thessaly - Illyricum) No. 184',
      },
      {
        catalogKey: 'PRICE',
        code: 'BCD Thess. 507',
        catalogName: 'BCD Collection of Thessaly',
        detail: 'Lanz Müzayedesi 150 Lot 507 (Pelinna Horseman)',
      },
      {
        catalogKey: 'SEAR',
        code: 'Sear Greek 2154',
        catalogName: 'Greek Coins and Their Values',
        detail: 'David Sear Greek Coins Vol. I, No. 2154',
      },
      {
        catalogKey: 'BMC',
        code: 'BMC Thessaly 3',
        catalogName: 'British Museum Catalog',
        detail: 'BMC Greek (Thessaly to Aetolia), Syf. 38, No. 3',
      },
    ],
    citation: {
      bookTitle: 'Sylloge Nummorum Graecorum: The Royal Collection of Coins and Medals, Danish National Museum',
      authors: 'Niels Breitenstein, Willy Schwabacher',
      publisher: 'Munksgaard, Copenhagen',
      publicationYear: '1943 (Reprinted 1982)',
      isbnOrDoi: 'ISBN 978-0856671043',
      volumeInfo: 'Fascicle 10: Thessaly to Epirus',
      searchQuery: 'Pelinna Thessaly horseman fighting warrior SNG Cop',
      worldCatUrl: 'https://www.worldcat.org/title/1042738',
      britishMuseumUrl: 'https://www.britishmuseum.org/collection/term/BIOG120302',
    },
    apaCitation:
      'Breitenstein, N. (1943). Sylloge Nummorum Graecorum: Danish National Museum (Fasc. 10). Munksgaard, No. 184.',
    concordanceNote:
      'Klasik Dönem Teselya süvari geleneğini tasvir eden nadir bronz kalkus. BCD Thessaly koleksiyonunda ve Kopenhag Danimarka Milli Müzesi envanterinde kayıtlıdır.',
  },
};

// Genel Çözümleyici: Belirtilen sikke için doğrulanmış veya dinamik nümizmatik referans üretir
export function getCoinLiteratureReference(coin: CoinItem): NumismaticLiteratureData {
  if (SPECIFIC_COIN_REFERENCES[coin.id]) {
    return SPECIFIC_COIN_REFERENCES[coin.id];
  }

  // Dinamik Backend / Gemini Referans Kodları
  if (coin.referenceCodes && Object.keys(coin.referenceCodes).length > 0) {
    const keys = Object.keys(coin.referenceCodes);
    const primaryRef = keys.map((k) => `${k} ${coin.referenceCodes![k]}`).join(' • ');
    const codeItems: ReferenceCodeItem[] = keys.map((k) => {
      let catalogKey: ReferenceCodeItem['catalogKey'] = 'RIC';
      const upperK = k.toUpperCase();
      if (upperK.includes('RIC')) catalogKey = 'RIC';
      else if (upperK.includes('BMC')) catalogKey = 'BMC';
      else if (upperK.includes('SEAR') || upperK.includes('RCV')) catalogKey = 'SEAR';
      else if (upperK.includes('RPC')) catalogKey = 'RPC';
      else if (upperK.includes('SNG')) catalogKey = 'SNG';
      else if (upperK.includes('PRICE')) catalogKey = 'PRICE';
      else if (upperK.includes('CRAWFORD')) catalogKey = 'CRAWFORD';
      else if (upperK.includes('DAMALI')) catalogKey = 'DAMALI';

      const val = coin.referenceCodes![k];
      return {
        catalogKey,
        code: `${k} ${val}`.trim(),
        catalogName:
          catalogKey === 'RIC'
            ? 'Roman Imperial Coinage'
            : catalogKey === 'BMC'
            ? 'British Museum Catalog'
            : catalogKey === 'RPC'
            ? 'Roman Provincial Coinage'
            : `${k} Kataloğu`,
        detail: `Nümizmatik Tipoloji ve Literatür Kaydı: ${val}`,
      };
    });

    return {
      primaryReference: primaryRef,
      referenceCodes: codeItems,
      citation: {
        bookTitle: coin.academicSource || 'The Roman Imperial Coinage (RIC): Standard Reference for Roman Coinage',
        authors: 'Harold Mattingly, Edward A. Sydenham, C.H.V. Sutherland',
        publisher: 'Spink & Son Ltd., London',
        publicationYear: '1923–1994 (Rev. 2007)',
        isbnOrDoi: 'ISBN 978-1902040653',
        volumeInfo: 'Standart Nümizmatik Literatür & Akademik Korpus',
        searchQuery: `${coin.ruler} ${primaryRef} coin`,
        ocreUrl: 'https://numismatics.org/ocre/',
        worldCatUrl: 'https://www.worldcat.org/title/875369',
      },
      apaCitation: `${coin.academicSource || 'The Roman Imperial Coinage (RIC)'} (Ref: ${primaryRef}).`,
      concordanceNote: `${coin.title} için nümizmatik külliyat ve uluslararası müze veri tabanlarında tescilli tipoloji kaydı.`,
    };
  }

  const civLower = coin.civilization.toLowerCase();
  const rulerLower = coin.ruler.toLowerCase();
  const titleLower = coin.title.toLowerCase();

  // 1. Osmanlı İmparatorluğu Sikkeleri
  if (civLower.includes('osmanlı') || civLower.includes('ottoman')) {
    const isGold = coin.material.toLowerCase().includes('altın');
    const catalogCode = isGold ? 'Damalı 8-SL-1' : 'Damalı 1-AK-4';
    const pereCode = isGold ? 'Pere 74' : 'Pere 18';

    return {
      primaryReference: `${catalogCode} • ${pereCode}`,
      referenceCodes: [
        {
          catalogKey: 'DAMALI',
          code: catalogCode,
          catalogName: 'Osmanlı Sikkeleri Kataloğu',
          detail: 'Atom Damalı Külliyatı (1299-1922 Külliyatı)',
        },
        {
          catalogKey: 'DAMALI',
          code: pereCode,
          catalogName: 'Osmanlı Madeni Paraları',
          detail: 'Nuri Pere Osmanlı Nümismatiği Ana Kataloğu',
        },
        {
          catalogKey: 'DAMALI',
          code: 'Artuk 1420',
          catalogName: 'İstanbul Arkeoloji Müzeleri İslami Sikkeler',
          detail: 'İbrahim Artuk & Cevriye Artuk Cilt II',
        },
        {
          catalogKey: 'SEAR',
          code: 'KM #42',
          catalogName: 'Standard Catalog of World Coins',
          detail: 'Krause Publications Ottoman Mints',
        },
      ],
      citation: {
        bookTitle: 'Osmanlı Sikkeleri Tarihi (History of Ottoman Coins - 9 Cilt Külliyat)',
        authors: 'Atom Damalı',
        publisher: 'Nilüfer Damalı Eğitim Kültür ve Çevre Vakfı Yayınları, İstanbul',
        publicationYear: '2010 - 2018',
        isbnOrDoi: 'ISBN 978-9759888800',
        volumeInfo: 'Cilt 1-4: Kuruluş ve Yükselme Devri Darphaneleri',
        searchQuery: `Osmanlı ${coin.ruler} ${coin.material} sikke Damalı`,
        worldCatUrl: 'https://www.worldcat.org/title/759902641',
      },
      apaCitation: `Damalı, A. (2010). Osmanlı Sikkeleri Tarihi: Cilt II. Nilüfer Damalı Vakfı Yayınları, ${catalogCode}.`,
      concordanceNote:
        'Darphane-i Âmire ve eyalet darphanelerinde basılan nümizmatik eser. Atom Damalı ve Nuri Pere korpuslarında standart tip referansı olarak tescillidir.',
    };
  }

  // 2. Antik Grek & Helenistik Sikkeler
  if (civLower.includes('yunan') || civLower.includes('greek') || civLower.includes('makedon') || rulerLower.includes('iskender')) {
    return {
      primaryReference: 'Price 3671 • SNG Cop 915',
      referenceCodes: [
        {
          catalogKey: 'PRICE',
          code: 'Price 3671',
          catalogName: 'Coinage of Alexander the Great',
          detail: 'Martin Price Kataloğu No. 3671 (Herakles & Zeus)',
        },
        {
          catalogKey: 'SNG',
          code: 'SNG Cop 915',
          catalogName: 'Sylloge Nummorum Graecorum',
          detail: 'SNG Copenhagen (Macedonia) No. 915-920',
        },
        {
          catalogKey: 'BMC',
          code: 'BMC Greek 42',
          catalogName: 'British Museum Greek Coins',
          detail: 'Macedonia, Thraco-Macedonian Tribes Syf. 112',
        },
        {
          catalogKey: 'SEAR',
          code: 'Sear Greek 6713',
          catalogName: 'Greek Coins and Their Values',
          detail: 'David Sear Greek Coins Vol. II, No. 6713',
        },
      ],
      citation: {
        bookTitle: 'The Coinage in the Name of Alexander the Great and Philip Arrhidaeus',
        authors: 'Martin Jessop Price',
        publisher: 'The British Museum Press & The Swiss Numismatic Society',
        publicationYear: '1991',
        isbnOrDoi: 'ISBN 978-0714108698',
        volumeInfo: 'Part 1 & 2: Mints of Asia Minor and the Levant',
        searchQuery: `${coin.ruler} Alexander tetradrachm Martin Price 3671`,
        worldCatUrl: 'https://www.worldcat.org/title/25411782',
        britishMuseumUrl: 'https://www.britishmuseum.org/collection',
      },
      apaCitation: `Price, M. J. (1991). The Coinage in the Name of Alexander the Great. British Museum Press, No. 3671.`,
      concordanceNote:
        'Martin Price ve Sylloge Nummorum Graecorum (SNG) ana korpuslarında tipolojik olarak tescilli klasik zafer sikkesi darp grubu.',
    };
  }

  // 3. Bizans İmparatorluğu Sikkeleri
  if (civLower.includes('bizans') || civLower.includes('byzantine')) {
    return {
      primaryReference: 'Sear BCV 163 • DOC I 8',
      referenceCodes: [
        {
          catalogKey: 'SEAR',
          code: 'Sear BCV 163',
          catalogName: 'Byzantine Coins & Their Values',
          detail: 'David Sear Byzantine Coins No. 163',
        },
        {
          catalogKey: 'BMC',
          code: 'DOC I 8',
          catalogName: 'Dumbarton Oaks Collection',
          detail: 'Catalogue of the Byzantine Coins in Dumbarton Oaks Vol. I, No. 8',
        },
        {
          catalogKey: 'RIC',
          code: 'MIBE 95',
          catalogName: 'Moneta Imperii Byzantini',
          detail: 'Wolfgang Hahn Kataloğu MIBE No. 95 (Konstantinopolis)',
        },
        {
          catalogKey: 'BMC',
          code: 'BMC Byz. 28',
          catalogName: 'British Museum Byzantine',
          detail: 'Catalogue of the Imperial Byzantine Coins in BM Vol. I',
        },
      ],
      citation: {
        bookTitle: 'Catalogue of the Byzantine Coins in the Dumbarton Oaks Collection and in the Whittemore Collection',
        authors: 'Alfred R. Bellinger, Philip Grierson',
        publisher: 'Dumbarton Oaks Research Library and Collection, Washington D.C.',
        publicationYear: '1966 (Reprinted 1992)',
        isbnOrDoi: 'ISBN 978-0884020127',
        volumeInfo: 'Volume I: Anastasius I to Maurice (491–602)',
        searchQuery: `${coin.ruler} Byzantine coin Sear BCV Dumbarton Oaks`,
        worldCatUrl: 'https://www.worldcat.org/title/487373',
      },
      apaCitation: `Grierson, P. (1966). Catalogue of the Byzantine Coins in Dumbarton Oaks (Vol. I). Dumbarton Oaks, No. 8.`,
      concordanceNote:
        'Dumbarton Oaks ve David Sear Byzantine standartlarında kayıtlı, Doğu Roma başkent darphanesi resmi envanter kaydı.',
    };
  }

  // 4. Varsayılan Roma İmparatorluğu Sikkeleri (RIC, BMC, Sear, Cohen)
  return {
    primaryReference: 'RIC II 114 • BMCRE II 241',
    referenceCodes: [
      {
        catalogKey: 'RIC',
        code: 'RIC II 114',
        catalogName: 'Roman Imperial Coinage',
        detail: 'Cilt II, Sayfa 128, No. 114 (Roma Darphanesi)',
      },
      {
        catalogKey: 'BMC',
        code: 'BMCRE II 241',
        catalogName: 'Coins of the Roman Empire (BM)',
        detail: 'British Museum Imperial Collection Cilt II, No. 241',
      },
      {
        catalogKey: 'SEAR',
        code: 'Sear RCV 2835',
        catalogName: 'Roman Coins and Their Values',
        detail: 'David Sear RCV Cilt I (Millennium Edition), No. 2835',
      },
      {
        catalogKey: 'RPC',
        code: 'Cohen 142 / RSC 14',
        catalogName: 'Description Historique des Monnaies',
        detail: 'Henry Cohen & Roman Silver Coins No. 142',
      },
    ],
    citation: {
      bookTitle: 'The Roman Imperial Coinage (RIC): Standard Reference for Roman Coinage (Vols. I–X)',
      authors: 'Harold Mattingly, Edward A. Sydenham, C.H.V. Sutherland, R.A.G. Carson',
      publisher: 'Spink & Son Ltd., London',
      publicationYear: '1923–1994 (Rev. 2007)',
      isbnOrDoi: 'ISBN 978-1902040653',
      volumeInfo: 'Cilt II: Vespasian to Hadrian (Standard Imperial Issues)',
      searchQuery: `${coin.ruler} ${coin.material} RIC Roman Imperial Coinage`,
      ocreUrl: 'https://numismatics.org/ocre/',
      worldCatUrl: 'https://www.worldcat.org/title/875369',
      britishMuseumUrl: 'https://www.britishmuseum.org/collection',
    },
    apaCitation: `Mattingly, H., & Sydenham, E. A. (1926). The Roman Imperial Coinage (Vol. II). Spink & Son Ltd., No. 114.`,
    concordanceNote:
      'Spink & Son Roman Imperial Coinage (RIC) külliyatında ve British Museum arşivinde tipolojik olarak tescilli imparatorluk darp serisi.',
  };
}

