import { DigitalPassportData } from '@/data/certificateData';
import { CoinItem } from '@/data/mockData';

export async function fetchImageAsBase64(uri: string): Promise<string> {
  if (!uri) return '';
  if (uri.startsWith('data:')) return uri;

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          resolve(uri);
        }
      };
      reader.onerror = () => resolve(uri);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Image fetch to base64 failed, falling back to uri:', err);
    return uri;
  }
}

export function generateCertificateHtml(
  coin: CoinItem,
  passport: DigitalPassportData,
  imageOverrides?: {
    obverseBase64?: string;
    reverseBase64?: string;
  }
): string {
  const obverseSrc = imageOverrides?.obverseBase64 || coin.obverseImage;
  const reverseSrc = imageOverrides?.reverseBase64 || coin.reverseImage;

  const isComposite = Boolean(
    coin.obverseImage &&
    coin.reverseImage &&
    coin.obverseImage === coin.reverseImage &&
    !(coin as any).isScanned
  );

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sikkelobedi - Dijital Nümizmatik Pasaportu (${passport.certificateNumber})</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #0F1216;
      color: #1A1D20;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 12px;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Üst Aksiyon Araç Çubuğu (Yazdırırken gizlenir) */
    .toolbar {
      width: 100%;
      max-width: 800px;
      background: #1E232B;
      border: 1px solid rgba(158, 123, 59, 0.4);
      border-radius: 12px;
      padding: 12px 18px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    }
    .toolbar-info {
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-badge {
      background: #9E7B3B;
      color: #FFF;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
    }
    .btn-print {
      background: linear-gradient(135deg, #D4AF37 0%, #9E7B3B 100%);
      color: #FFFFFF;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
      transition: transform 0.15s ease;
    }
    .btn-print:hover {
      transform: scale(1.02);
    }

    /* A4 Sertifika Belge Sayfası */
    .certificate-sheet {
      width: 100%;
      max-width: 800px;
      background-color: #FDFBF7;
      border: 2px solid #9E7B3B;
      border-radius: 16px;
      padding: 32px 28px;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    /* İkincil İç Guilloche Çerçevesi */
    .inner-border {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      border: 1px solid rgba(158, 123, 59, 0.35);
      border-radius: 10px;
      pointer-events: none;
    }

    /* Üst Başlık & Kurum Mührü */
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid rgba(158, 123, 59, 0.3);
      padding-bottom: 16px;
      margin-bottom: 20px;
      gap: 16px;
    }
    .institution-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .seal-circle {
      width: 52px;
      height: 52px;
      border-radius: 26px;
      background: #1E232B;
      border: 2px solid #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D4AF37;
      font-size: 24px;
      flex-shrink: 0;
    }
    .institution-text h1 {
      font-size: 16px;
      font-weight: 900;
      color: #1A1D20;
      letter-spacing: -0.2px;
    }
    .institution-text p {
      font-size: 10px;
      font-weight: 800;
      color: #9E7B3B;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .institution-text span {
      font-size: 10px;
      color: #64748B;
    }

    /* Sertifika No Rozeti */
    .cert-badge {
      background: #FBF5E8;
      border: 1.5px solid rgba(158, 123, 59, 0.4);
      padding: 8px 14px;
      border-radius: 8px;
      text-align: right;
      flex-shrink: 0;
    }
    .cert-badge-tag {
      font-size: 9px;
      font-weight: 800;
      color: #9E7B3B;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .cert-badge-num {
      font-size: 16px;
      font-weight: 900;
      color: #9E7B3B;
      margin-top: 2px;
    }
    .cert-badge-date {
      font-size: 10px;
      color: #64748B;
      margin-top: 2px;
    }

    /* Eser Başlık Bölümü */
    .coin-title-section {
      margin-bottom: 20px;
    }
    .coin-civ-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      color: #9E7B3B;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .coin-main-title {
      font-size: 22px;
      font-weight: 900;
      color: #1A1D20;
      line-height: 1.25;
      margin-bottom: 4px;
    }
    .coin-mint-info {
      font-size: 12px;
      color: #475569;
    }

    /* Ön & Arka Yüz Fotoğrafları */
    .photos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 22px;
    }
    .photo-card {
      background: #FFFFFF;
      border: 1.5px solid rgba(158, 123, 59, 0.3);
      border-radius: 12px;
      padding: 14px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .coin-image-frame {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      margin: 0 auto 10px;
      overflow: hidden;
      border: 3px solid #D4AF37;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background: #FFFFFF;
      position: relative;
    }
    .coin-image-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .coin-image-frame img.composite-left {
      object-position: left center;
    }
    .coin-image-frame img.composite-right {
      object-position: right center;
    }
    .photo-card h4 {
      font-size: 13px;
      font-weight: 800;
      color: #1A1D20;
      margin-bottom: 4px;
    }
    .photo-card p {
      font-size: 10.5px;
      color: #64748B;
      line-height: 1.4;
    }

    /* XRF Spektrometre Tablosu */
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #1A1D20;
      letter-spacing: -0.2px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .spec-item {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .spec-item.full-width {
      grid-column: span 2;
    }
    .spec-item.gold-highlight {
      background: #FBF5E8;
      border-color: rgba(158, 123, 59, 0.35);
    }
    .spec-item-label {
      font-size: 9px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .spec-item-value {
      font-size: 12px;
      font-weight: 800;
      color: #1A1D20;
    }
    .spec-item.gold-highlight .spec-item-value {
      color: #9E7B3B;
      font-size: 13px;
    }

    /* Sahtelik Doğrulama Kutusu */
    .security-box {
      background: #DCFCE7;
      border: 1.5px solid rgba(22, 163, 74, 0.35);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .security-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .security-tag {
      font-size: 10px;
      font-weight: 800;
      color: #15803D;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .security-score {
      font-size: 14px;
      font-weight: 900;
      color: #166534;
    }
    .security-list {
      list-style: none;
      font-size: 11px;
      color: #14532D;
      line-height: 1.6;
    }
    .security-list li::before {
      content: "✓ ";
      font-weight: 800;
      color: #15803D;
    }

    /* Alt Karekod & Sicil Bölümü */
    .qr-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid rgba(158, 123, 59, 0.3);
      padding-top: 16px;
      gap: 16px;
    }
    .qr-left {
      flex: 1;
    }
    .qr-left h5 {
      font-size: 11px;
      font-weight: 800;
      color: #9E7B3B;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .qr-left p {
      font-size: 10px;
      color: #64748B;
      line-height: 1.4;
      margin-bottom: 6px;
    }
    .hash-code {
      font-family: monospace;
      font-size: 9px;
      color: #94A3B8;
      background: #F1F5F9;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .signatures-box {
      display: flex;
      gap: 20px;
      text-align: center;
    }
    .sig-col {
      border-top: 1px solid #1A1D20;
      padding-top: 4px;
      min-width: 100px;
    }
    .sig-title {
      font-size: 8.5px;
      font-weight: 800;
      color: #1A1D20;
      text-transform: uppercase;
    }
    .sig-sub {
      font-size: 8px;
      color: #64748B;
    }

    /* Yazdırma Modu (Print Media) */
    @media print {
      body {
        background-color: #FFFFFF;
        padding: 0;
      }
      .toolbar {
        display: none !important;
      }
      .certificate-sheet {
        box-shadow: none !important;
        border: 2px solid #9E7B3B !important;
        max-width: 100% !important;
        padding: 24px 20px !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <!-- Üst Aksiyon Araç Çubuğu (Yalnızca Ekranda Görünür) -->
  <div class="toolbar">
    <div class="toolbar-info">
      <span class="toolbar-badge">RESMİ SERTİFİKA</span>
      <span>${passport.certificateNumber}</span>
    </div>
    <button class="btn-print" onclick="window.print()">
      🖨️ PDF Olarak Kaydet / Yazdır
    </button>
  </div>

  <!-- A4 Sertifika Belgesi -->
  <div class="certificate-sheet">
    <div class="inner-border"></div>

    <!-- 1. Üst Kurum Mührü & Sertifika Bilgisi -->
    <div class="header-row">
      <div class="institution-box">
        <div class="seal-circle">🏛️</div>
        <div class="institution-text">
          <p>ULUSLARARASI NÜMİSMATİK OTORİTESİ</p>
          <h1>Sikkelobedi Nümizmatik Enstitüsü</h1>
          <span>ISO / NGC Ancients Standartlarında Tescil</span>
        </div>
      </div>
      <div class="cert-badge">
        <div class="cert-badge-tag">SERTİFİKA NO</div>
        <div class="cert-badge-num">${passport.certificateNumber}</div>
        <div class="cert-badge-date">Tescil: ${passport.issueDate}</div>
      </div>
    </div>

    <!-- 2. Sikke Başlığı & Medeniyet -->
    <div class="coin-title-section">
      <div class="coin-civ-row">
        <span>🏛️ ${coin.civilization.toUpperCase()}</span>
        <span>•</span>
        <span>${coin.period}</span>
      </div>
      <div class="coin-main-title">${coin.title}</div>
      <div class="coin-mint-info">
        Basım Darphanesi: <strong>${coin.mint || 'İmparatorluk Merkez Darphanesi'}</strong> • Hükümdar: <strong>${coin.ruler}</strong>
      </div>
    </div>

    <!-- 3. Ön & Arka Yüz Fotoğrafları -->
    <div class="photos-grid">
      <div class="photo-card">
        <div class="coin-image-frame">
          <img 
            src="${obverseSrc}" 
            alt="Avers (Ön Yüz)" 
            class="${isComposite ? 'composite-left' : ''}"
          />
        </div>
        <h4>Ön Yüz (Avers)</h4>
        <p>${coin.obverseDesc}</p>
      </div>

      <div class="photo-card">
        <div class="coin-image-frame">
          <img 
            src="${reverseSrc}" 
            alt="Revers (Arka Yüz)" 
            class="${isComposite ? 'composite-right' : ''}"
          />
        </div>
        <h4>Arka Yüz (Revers)</h4>
        <p>${coin.reverseDesc}</p>
      </div>
    </div>

    <!-- 4. Spektrometre & Metalurjik Veriler -->
    <div class="section-title">🔬 XRF Spektrometre & Metalurjik Analiz Verileri</div>
    <div class="spec-grid">
      <div class="spec-item full-width gold-highlight">
        <div class="spec-item-label">Maden Saflığı & Alaşım Analizi</div>
        <div class="spec-item-value">⭐ ${passport.metallurgy.purity}</div>
      </div>

      <div class="spec-item">
        <div class="spec-item-label">Hassas Ağırlık</div>
        <div class="spec-item-value">${passport.metallurgy.weightExact}</div>
      </div>

      <div class="spec-item">
        <div class="spec-item-label">Çap & Kalınlık</div>
        <div class="spec-item-value">${passport.metallurgy.diameterExact}</div>
      </div>

      <div class="spec-item">
        <div class="spec-item-label">Özgül Ağırlık (Yoğunluk)</div>
        <div class="spec-item-value">${passport.metallurgy.specificGravity}</div>
      </div>

      <div class="spec-item">
        <div class="spec-item-label">Kondisyon Derecesi (Sheldon Skalası)</div>
        <div class="spec-item-value">${passport.sheldonGrade}</div>
      </div>
    </div>

    <!-- 5. Sahtelik Güvencesi -->
    <div class="security-box">
      <div class="security-header">
        <div class="security-tag">✓ GÖRSEL YAPAY ZEKA İLE DOĞRULANMIŞTIR</div>
        <div class="security-score">Güven Puanı: %${passport.authenticity.aiScore}</div>
      </div>
      <ul class="security-list">
        <li>${passport.authenticity.dieMatch}</li>
        <li>${passport.authenticity.patinaAge}</li>
        <li>${passport.authenticity.metallurgicConsistency}</li>
      </ul>
    </div>

    <!-- 6. Alt İmza & Sicil -->
    <div class="qr-footer-row">
      <div class="qr-left">
        <h5>Sikkelobedi Sicil & Doğrulama</h5>
        <p>Bu sertifika, uluslararası standartlarda kriptografik sicil defterine kaydedilmiştir.</p>
        <span class="hash-code">Sicil Hash: ${passport.registryHash}</span>
      </div>

      <div class="signatures-box">
        <div class="sig-col">
          <div class="sig-title">Nümizmat Heyeti</div>
          <div class="sig-sub">Baş Küratör</div>
        </div>
        <div class="sig-col">
          <div class="sig-title">Enstitü Müdürü</div>
          <div class="sig-sub">Sicil Otoritesi</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Sayfa yüklendiğinde yazdırma / PDF kaydetme diyaloğunu tetikle
    window.addEventListener('load', function() {
      setTimeout(function() {
        if (window.location.search.includes('print=true')) {
          window.print();
        }
      }, 350);
    });
  </script>
</body>
</html>`;
}

