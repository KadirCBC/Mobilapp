import { CoinItem } from './mockData';

export interface MetallurgyData {
  purity: string;
  specificGravity: string;
  weightExact: string;
  diameterExact: string;
  thickness: string;
  dieAxis: string;
}

export interface AuthenticityScanReport {
  aiScore: number; // e.g. 99.6
  riskLevel: 'Çok Düşük (Orijinal)' | 'Düşük' | 'Şüpheli';
  dieMatch: string;
  patinaAge: string;
  metallurgicConsistency: string;
  verifiedBy: string;
}

export interface DigitalPassportData {
  certificateNumber: string;
  issueDate: string;
  registryHash: string;
  verificationUrl: string;
  institutionSeal: string;
  sheldonGrade: string;
  strikeScore: string;
  surfaceScore: string;
  metallurgy: MetallurgyData;
  authenticity: AuthenticityScanReport;
}

export function generateDigitalPassport(coin: CoinItem): DigitalPassportData {
  // Benzersiz deterministik veya dinamik sertifika numarası
  const cleanIdNum = coin.id.replace(/[^0-9]/g, '') || '8841';
  const certNumber = `#NUM-2026-${cleanIdNum.padStart(4, '0').slice(0, 4)}`;

  const numPrice =
    coin.numericPrice ??
    parseInt(coin.estimatedValue.replace(/[^0-9]/g, '') || '2500', 10);
  const insuranceVal = Math.round(numPrice * 1.25);

  const isGold =
    coin.material.toLowerCase().includes('altın') ||
    coin.material.toLowerCase().includes('au') ||
    coin.material.toLowerCase().includes('stater') ||
    coin.material.toLowerCase().includes('solidus');

  const isSilver =
    coin.material.toLowerCase().includes('gümüş') ||
    coin.material.toLowerCase().includes('ar') ||
    coin.material.toLowerCase().includes('denarius') ||
    coin.material.toLowerCase().includes('tetradrahmi');

  return {
    certificateNumber: certNumber,
    issueDate: '05 Kasım 2026',
    registryHash: `0x${Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}...${cleanIdNum}`,
    verificationUrl: `sikkelobedi://verify/${certNumber.replace('#', '')}`,
    institutionSeal: 'ULUSLARARASI NÜMİSMATİK OTORİTESİ (INA & NGC STANDARD)',
    sheldonGrade: coin.condition || 'NGC Choice AU (Çil / Mint State)',
    strikeScore: '5/5 (Kusursuz Kalıp Merkezleme)',
    surfaceScore: '4.5/5 (Orijinal Patina ve Yüksek Rölyef)',
    metallurgy: {
      purity: isGold
        ? '%98.6 Saf Altın (AU) • %1.4 Doğal Elektrum Katkısı'
        : isSilver
        ? '%96.8 Saf Gümüş (AR) • %3.2 Bakır Nümizmatik Katkısı'
        : '%88.5 Bakır (AE) • %11.5 Kalay / Antik Bronz Alaşım',
      specificGravity: isGold ? '19.28 g/cm³' : isSilver ? '10.49 g/cm³' : '8.86 g/cm³',
      weightExact: `${coin.weight} (±0.02g Mettler Toledo Hassasiyeti)`,
      diameterExact: `${coin.diameter} • Kalınlık: 2.7 mm`,
      thickness: '2.70 mm',
      dieAxis: '12h (Dikey Darp Ekseni / Medallic Orientation)',
    },
    authenticity: {
      aiScore: 99.6,
      riskLevel: 'Çok Düşük (Orijinal)',
      dieMatch: 'Katalog ve Müze Arşiv Kalıbıyla %99.8 Eşleşme (BMC & RIC)',
      patinaAge: '2000+ Yıl Kristalize Doğal Oksidasyon Tabakası',
      metallurgicConsistency: 'Dönem Atölye Standartlarına %100 Uyumlu',
      verifiedBy: 'Sikkelobedi Nümizmat Enstitüsü & AI Spektro Engine v4.2',
    },
  };
}

