<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toplu Sikke İçe Aktarma (Bulk Import) | Sikkelobedi Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-canvas: #F8F9FA;
            --card-bg: #FFFFFF;
            --gold-primary: #9E7B3B;
            --gold-hover: #83642D;
            --gold-light: #FBF8F2;
            --gold-border: rgba(158, 123, 59, 0.25);
            --gold-glow: #D4AF37;
            --text-dark: #1E293B;
            --text-muted: #64748B;
            --border-subtle: #E2E8F0;
            --success-green: #10B981;
            --error-red: #EF4444;
            --warning-amber: #F59E0B;
            --info-blue: #3B82F6;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg-canvas); color: var(--text-dark); min-height: 100vh; }

        .admin-main {
            max-width: 1400px;
            margin: 0 auto;
            padding: 32px 28px 80px 28px;
        }

        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 24px;
        }
        .page-title {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            font-weight: 700;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .page-subtitle {
            font-size: 14px;
            color: var(--text-muted);
            margin-top: 4px;
        }

        /* Üst İstatistik Kartları */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-card {
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-subtle);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
            transition: all 0.2s ease;
        }
        .stat-card:hover {
            border-color: var(--gold-border);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(158, 123, 59, 0.08);
        }
        .stat-icon {
            width: 46px;
            height: 46px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            flex-shrink: 0;
        }
        .stat-icon.gold { background: rgba(158, 123, 59, 0.12); color: var(--gold-primary); }
        .stat-icon.green { background: rgba(16, 185, 129, 0.12); color: var(--success-green); }
        .stat-icon.blue { background: rgba(59, 130, 246, 0.12); color: var(--info-blue); }
        .stat-icon.amber { background: rgba(245, 158, 11, 0.12); color: var(--warning-amber); }
        .stat-value {
            font-size: 22px;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.2;
        }
        .stat-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Ana Kart & Sekmeler */
        .card {
            background: var(--card-bg);
            border-radius: 14px;
            border: 1px solid var(--border-subtle);
            padding: 24px 28px;
            box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.05);
            margin-bottom: 24px;
        }

        .tab-nav {
            display: flex;
            gap: 8px;
            background: #FFFFFF;
            padding: 6px;
            border-radius: 12px;
            border: 1px solid var(--border-subtle);
            margin-bottom: 24px;
            overflow-x: auto;
        }
        .tab-btn {
            flex: 1;
            padding: 12px 18px;
            border-radius: 8px;
            border: none;
            background: transparent;
            font-size: 13.5px;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            white-space: nowrap;
        }
        .tab-btn:hover {
            color: var(--gold-primary);
            background: var(--gold-light);
        }
        .tab-btn.active {
            color: #FFFFFF;
            background: var(--gold-primary);
            box-shadow: 0 2px 8px rgba(158, 123, 59, 0.35);
        }

        .tab-content { display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.25s ease-in-out; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Sürükle Bırak Alanı */
        .dropzone {
            border: 2px dashed #CBD5E1;
            border-radius: 12px;
            padding: 36px 20px;
            text-align: center;
            background: #F8FAFC;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 16px;
        }
        .dropzone:hover, .dropzone.dragover {
            border-color: var(--gold-primary);
            background: var(--gold-light);
        }
        .dropzone-icon {
            font-size: 38px;
            margin-bottom: 8px;
            color: var(--gold-primary);
        }
        .dropzone-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 4px;
        }
        .dropzone-desc {
            font-size: 12.5px;
            color: var(--text-muted);
        }

        /* Form Elemanları */
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        }
        .form-label {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .form-control {
            padding: 12px 14px;
            border: 1.5px solid var(--border-subtle);
            border-radius: 8px;
            font-size: 13.5px;
            color: var(--text-dark);
            background: #FFFFFF;
            transition: border-color 0.2s;
            outline: none;
            font-family: inherit;
        }
        .form-control:focus {
            border-color: var(--gold-primary);
            box-shadow: 0 0 0 3px rgba(158, 123, 59, 0.15);
        }
        textarea.form-control {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12.5px;
            line-height: 1.5;
            resize: vertical;
        }

        /* Butonlar */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 11px 20px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
        }
        .btn-primary {
            background: var(--gold-primary);
            color: #FFFFFF;
            border: 1px solid var(--gold-hover);
            box-shadow: 0 2px 6px rgba(158, 123, 59, 0.25);
        }
        .btn-primary:hover {
            background: var(--gold-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(158, 123, 59, 0.35);
        }
        .btn-success {
            background: var(--success-green);
            color: #FFFFFF;
        }
        .btn-success:hover {
            background: #059669;
            transform: translateY(-1px);
        }
        .btn-secondary {
            background: #FFFFFF;
            color: var(--text-dark);
            border: 1.5px solid var(--border-subtle);
        }
        .btn-secondary:hover {
            border-color: var(--gold-primary);
            color: var(--gold-primary);
            background: var(--gold-light);
        }
        .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 6px;
        }

        /* İlerleme Çubuğu */
        .progress-box {
            display: none;
            margin: 20px 0;
            padding: 18px 22px;
            background: #F8FAFC;
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
        }
        .progress-header {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 8px;
        }
        .progress-bar-wrap {
            height: 10px;
            background: #E2E8F0;
            border-radius: 99px;
            overflow: hidden;
            position: relative;
        }
        .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--gold-primary), var(--gold-glow));
            width: 0%;
            transition: width 0.25s ease;
        }
        .progress-log {
            margin-top: 10px;
            font-size: 12px;
            color: var(--text-muted);
            max-height: 80px;
            overflow-y: auto;
            font-family: monospace;
            background: #FFFFFF;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid var(--border-subtle);
        }

        /* Önizleme & İçe Aktarma Tablosu */
        .table-responsive {
            overflow-x: auto;
            border-radius: 10px;
            border: 1px solid var(--border-subtle);
            background: #FFFFFF;
            margin-top: 16px;
        }
        .coin-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
        }
        .coin-table th {
            background: #F8FAFC;
            padding: 12px 14px;
            font-weight: 700;
            color: #475569;
            border-bottom: 1.5px solid var(--border-subtle);
            white-space: nowrap;
        }
        .coin-table td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--border-subtle);
            vertical-align: middle;
        }
        .coin-table tr:hover {
            background: #FBF8F2;
        }

        .coin-thumb-box {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .coin-thumb {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            border: 1.5px solid var(--gold-border);
            background: #F1F5F9;
        }

        /* Rozetler */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        .badge-ready { background: rgba(59, 130, 246, 0.12); color: #2563EB; }
        .badge-success { background: rgba(16, 185, 129, 0.12); color: #059669; }
        .badge-error { background: rgba(239, 68, 68, 0.12); color: #DC2626; }
        .badge-processing { background: rgba(245, 158, 11, 0.12); color: #D97706; }
        .badge-skipped { background: rgba(100, 116, 139, 0.12); color: #475569; }

        /* Seçenekler Paneli */
        .options-panel {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            background: #F8FAFC;
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 14px 20px;
            margin: 20px 0;
        }
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        .custom-checkbox {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-dark);
            cursor: pointer;
            user-select: none;
        }
        .custom-checkbox input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: var(--gold-primary);
            cursor: pointer;
        }

        .sample-format-box {
            background: #0B0F19;
            color: #E2E8F0;
            padding: 14px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 11.5px;
            max-height: 150px;
            overflow-y: auto;
            margin-top: 8px;
        }
    </style>
</head>
<body>

    <!-- Profesyonel Sidebar & Topbar Dahil Ediliyor -->
    <?php include __DIR__ . '/nav.php'; ?>

    <main class="admin-main">
        
        <!-- Sayfa Başlığı -->
        <div class="page-header">
            <div>
                <h1 class="page-title">
                    <span>📦</span> Toplu Sikke İçe Aktarma (Bulk Ingestion)
                </h1>
                <p class="page-subtitle">
                    Koleksiyonunuza JSON veri dosyalarından, web bağlantılarından veya sunucu arşiv klasöründen yüzlerce sikkeyi tek seferde yükleyin.
                </p>
            </div>
            <div style="display: flex; gap: 10px;">
                <a href="/admin/coins" class="btn btn-secondary">
                    <span>⬅️</span> Kataloğa Dön
                </a>
                <a href="/admin/coins/create" class="btn btn-secondary">
                    <span>➕</span> Tekil Eser Ekle
                </a>
            </div>
        </div>

        <!-- Üst İstatistik Sayaçları -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon gold">🪙</div>
                <div>
                    <div class="stat-value" id="statQueueCount">0</div>
                    <div class="stat-label">Kuyruktaki Sikkeler</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">✅</div>
                <div>
                    <div class="stat-value" id="statSuccessCount">0</div>
                    <div class="stat-label">Başarıyla Yüklenen</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon amber">⏭️</div>
                <div>
                    <div class="stat-value" id="statSkippedCount">0</div>
                    <div class="stat-label">Atlanan / Çift Kayıt</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue">📁</div>
                <div>
                    <div class="stat-value"><?= $archiveCoinCount ?></div>
                    <div class="stat-label">Sunucu Arşiv Havuzu</div>
                </div>
            </div>
        </div>

        <!-- İçe Aktarma Modu Sekmeleri -->
        <div class="tab-nav">
            <button type="button" class="tab-btn active" onclick="switchImportTab('tabHarvester')">
                <span>🎯</span> 1. Kategori Linkinden Otomatik Çekici (Category Harvester)
            </button>
            <button type="button" class="tab-btn" onclick="switchImportTab('tabUrls')">
                <span>🔗</span> 2. Çoklu Web Bağlantısı (URL Listesi)
            </button>
            <button type="button" class="tab-btn" onclick="switchImportTab('tabJson')">
                <span>📄</span> 3. JSON Dosyası / Metin Verisi
            </button>
            <button type="button" class="tab-btn" onclick="switchImportTab('tabServerArchive')">
                <span>🗄️</span> 4. Sunucu Arşiv Klasörü (./sikkeler_arsiv)
            </button>
        </div>

        <!-- SEKME 1: KATEGORİDEN OTOMATİK ÇEKİCİ (HARVESTER) -->
        <div id="tabHarvester" class="tab-content active">
            <div class="card" style="border: 2px solid var(--gold-border); background: linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 100%);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <h3 style="font-size: 17px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
                        <span>🎯</span> Kategori Linki ile Otomatik Sikke Hasadı (Category Harvester)
                    </h3>
                    <span class="badge" style="background: rgba(158, 123, 59, 0.15); color: var(--gold-primary); font-size: 12px; padding: 5px 10px;">
                        ⚡ Sayfalama & Çift Yüz Görsel İndirici Aktif
                    </span>
                </div>
                <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5;">
                    VCoins veya numizmatik sitelerden tek bir kategori adresi girin. Sistem o kategorideki <strong>tüm sayfaları ve sikkeleri</strong> otomatik tarar, ön ve arka yüz fotoğraflarını WebP formatında indirir, hükümdar, antik darphane, maden ve dönem bilgilerini hatasız tespit edip koleksiyonunuza yazar.
                </p>

                <!-- URL Girdi Kutusu -->
                <div class="form-group">
                    <label class="form-label" style="font-size: 13.5px;">
                        <span>Hedef Kategori veya Liste Web Adresi (URL):</span>
                    </label>
                    <input type="url" id="harvesterCategoryUrl" class="form-control" style="font-size: 14px; padding: 13px 16px;" placeholder="https://www.vcoins.com/en/coins/ancient/roman_provincial-364.aspx" value="https://www.vcoins.com/en/coins/ancient/roman_provincial-364.aspx">
                </div>

                <!-- Hızlı Şablon Butonları -->
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                    <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">Örnek Kategoriler:</span>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="setHarvesterSample('https://www.vcoins.com/en/coins/ancient/roman_provincial-364.aspx')">
                        🏛️ Roma Eyalet (Provincial)
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="setHarvesterSample('https://www.vcoins.com/en/coins/ancient/greek-13.aspx')">
                        🏺 Antik Yunan & Helenistik
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="setHarvesterSample('https://www.vcoins.com/en/coins/ancient/roman_imperial-14.aspx')">
                        👑 Roma İmparatorluk
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="setHarvesterSample('https://www.vcoins.com/en/coins/ancient/byzantine-15.aspx')">
                        ✝️ Bizans Sikkeleri
                    </button>
                </div>

                <!-- Alternatif: HTML Kaynak Kodunu Doğrudan Yapıştır (AWS WAF Engeline Kesin Çözüm) -->
                <div style="margin-bottom: 20px; background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 10px; padding: 14px 18px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <strong style="font-size: 13.5px; color: var(--text-dark); display: flex; align-items: center; gap: 6px;">
                                <span>🛡️</span> AWS WAF / Bot Engeline Karşı Kesin Çözüm: Sayfa Kaynağı (HTML) ile Çek
                            </strong>
                            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                                Hedef sitede açtığınız sayfada <code>Ctrl + U</code> (Kaynak Kodu) yapıp kopyaladığınız kodu buraya yapıştırırsanız, 50+ sikke anında sıfır engelle veritabanına yazılır.
                            </p>
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="toggleHtmlPasteBox()" id="btnToggleHtmlPaste">
                            📝 HTML Yapıştırma Kutusunu Aç
                        </button>
                    </div>
                    <div id="htmlPasteContainer" style="display: none; margin-top: 12px;">
                        <textarea id="harvesterRawHtml" class="form-control" rows="6" placeholder="Tarayıcınızda açtığınız VCoins kategori sayfasında Ctrl+U (veya sağ tık -> Sayfa Kaynağını Görüntüle) yapıp tüm HTML kodunu buraya yapıştırın..."></textarea>
                    </div>
                </div>

                <!-- Ayarlar Paneli -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; background: #FFFFFF; padding: 18px 20px; border-radius: 10px; border: 1.5px solid var(--border-subtle); margin-bottom: 22px;">
                    <div>
                        <label style="font-size: 13px; font-weight: 700; color: var(--text-dark); display: block; margin-bottom: 6px;">
                            📚 Tarama Kapsamı (Sayfa Sayısı):
                        </label>
                        <select id="harvesterMaxPages" class="form-control" style="font-weight: 600;" onchange="toggleCustomPageRange(this.value)">
                            <option value="all" selected>♾️ Tüm Kategoriyi Çek (Son Sayfaya Kadar / Sınırsız)</option>
                            <option value="1000">1000 Sayfa (~50.000 Sikke)</option>
                            <option value="500">500 Sayfa (~25.000 Sikke)</option>
                            <option value="250">250 Sayfa (~12.500 Sikke)</option>
                            <option value="100">100 Sayfa (~5.000 Sikke)</option>
                            <option value="50">50 Sayfa (~2.500 Sikke)</option>
                            <option value="20">20 Sayfa (~1.000 Sikke)</option>
                            <option value="10">10 Sayfa (~500 Sikke)</option>
                            <option value="5">5 Sayfa (~250 Sikke)</option>
                            <option value="1">1. Sayfa (~50 Sikke)</option>
                            <option value="custom">✏️ Özel Sayfa Aralığı Girin (Örn: 1 - 1000)...</option>
                        </select>
                        
                        <!-- Özel Sayfa Aralığı Kutusu -->
                        <div id="customPageRangeBox" style="display: none; margin-top: 10px; padding: 8px 10px; background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 6px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-size: 11.5px; font-weight: 700;">Başlangıç:</label>
                                <input type="number" id="harvesterStartPage" class="form-control" style="width: 80px; padding: 4px 8px; font-size: 12px;" value="1" min="1" max="1000">
                                <label style="font-size: 11.5px; font-weight: 700;">Bitiş:</label>
                                <input type="number" id="harvesterEndPage" class="form-control" style="width: 80px; padding: 4px 8px; font-size: 12px;" value="1000" min="1" max="1000">
                            </div>
                        </div>
                        <small style="color: var(--text-muted); font-size: 11px; margin-top: 4px; display: block;">Her sayfada yaklaşık 50 adet sikke bulunur. Kategori bitene kadar (1000 sayfaya kadar) otomatik çeker.</small>
                    </div>

                    <div>
                        <label style="font-size: 13px; font-weight: 700; color: var(--text-dark); display: block; margin-bottom: 6px;">
                            ⚙️ İçe Aktarma Modu:
                        </label>
                        <select id="harvesterMode" class="form-control" style="font-weight: 600;">
                            <option value="auto_commit" selected>🚀 Doğrudan Veritabanına Kaydet & Yayınla (Önerilen)</option>
                            <option value="stage_only">📋 Önce Önizleme Tablosuna Yükle (Ben Onaylayayım)</option>
                        </select>
                        <small style="color: var(--text-muted); font-size: 11px; margin-top: 4px; display: block;">Otomatik mod görselleri indirir ve anında veritabanına yazar.</small>
                    </div>

                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 8px;">
                        <label class="custom-checkbox">
                            <input type="checkbox" id="harvesterSkipDuplicates" checked>
                            <span>Aynı Başlıktaki Çift Kayıtları Atla</span>
                        </label>
                        <label class="custom-checkbox">
                            <input type="checkbox" id="harvesterAutoPublish" checked>
                            <span>Koleksiyonda Hemen Yayınla</span>
                        </label>
                    </div>
                </div>

                <!-- Çerez (Cookie) & Canlı Tarayıcı Hasatçısı Barı -->
                <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px 18px; margin-bottom: 22px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 13px; color: var(--text-dark);">🍪 Tarayıcı Oturum Çerezi (Cookie - İsteğe Bağlı):</strong>
                            <p style="font-size: 11.5px; color: var(--text-muted);">VCoins'te oturum açmış tarayıcınızın çerezini girerek 1000 sayfayı doğrudan sunucudan çekebilirsiniz.</p>
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="copyBrowserConsoleScript()" style="font-size: 12px; font-weight: 700;">
                            📋 1-Tık Tarayıcı Hasat Kodunu Kopyala (1000 Sayfa)
                        </button>
                    </div>
                    <input type="text" id="harvesterCookie" class="form-control" style="font-size: 12px; font-family: monospace;" placeholder="Örn: aws-waf-token=...; AWSALBTG=... (Tarayıcınızda F12 -> Console -> document.cookie)">
                </div>

                <!-- Başlat & Durdur Butonları -->
                <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" id="btnStopHarvesting" onclick="stopCategoryHarvesting()" style="display: none; background: #FEF2F2; color: #DC2626; border-color: #F87171; font-size: 14px; padding: 13px 22px;">
                        <span>⏹️</span> Hasadı Durdur (İstediğimde Kes)
                    </button>
                    <button type="button" class="btn btn-primary" id="btnStartHarvesting" onclick="startCategoryHarvesting()" style="font-size: 15px; padding: 13px 28px; box-shadow: 0 4px 14px rgba(158, 123, 59, 0.35);">
                        <span>🚀</span> Kategorideki Tüm Sikkeleri Çek ve Veritabanına Ekle
                    </button>
                </div>
            </div>
        </div>

        <!-- SEKME 3: JSON DOSYASI VEYA METİN GİRİŞİ -->
        <div id="tabJson" class="tab-content">
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--text-dark);">
                    JSON Formatında Toplu Sikke Verisi İçe Aktar
                </h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 18px;">
                    <code>raw_coins.json</code> dosyasını (örneğin scraper çıktısı) ya da standart numizmatik JSON dizisini sürükleyip bırakın veya metin kutusuna yapıştırın.
                </p>

                <!-- Sürükle Bırak -->
                <div class="dropzone" id="jsonDropzone" onclick="document.getElementById('jsonFileInput').click()">
                    <div class="dropzone-icon">📥</div>
                    <div class="dropzone-title">JSON Dosyasını Buraya Sürükleyin veya Dosya Seçin</div>
                    <div class="dropzone-desc">.json uzantılı dosyalar desteklenir (UTF-8)</div>
                    <input type="file" id="jsonFileInput" accept=".json,application/json" style="display: none;" onchange="handleFileSelect(event)">
                </div>

                <!-- Metin Alanı -->
                <div class="form-group">
                    <label class="form-label">
                        <span>Veya JSON Verisini Doğrudan Yapıştırın:</span>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="loadSampleJson()">
                            📋 Örnek Şablonu Yapıştır
                        </button>
                    </label>
                    <textarea id="jsonTextInput" class="form-control" rows="8" placeholder='[&#10;  {&#10;    "title": "Trajan AR Denarius. AD 112-114. Rome mint.",&#10;    "ruler": "Trajan",&#10;    "civilization": "Roma İmparatorluğu",&#10;    "metal": "Gümüş",&#10;    "denomination": "Denarius",&#10;    "mint": "Roma",&#10;    "avers_image": "https://...",&#10;    "revers_image": "https://..."&#10;  }&#10;]'></textarea>
                </div>

                <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="clearJsonInput()">
                        🧹 Temizle
                    </button>
                    <button type="button" class="btn btn-primary" onclick="parseAndStageJson()">
                        <span>🔍</span> JSON'ı Doğrula & Önizleme Listesine Ekle
                    </button>
                </div>
            </div>
        </div>

        <!-- SEKME 2: ÇOKLU URL GİRİŞİ -->
        <div id="tabUrls" class="tab-content">
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--text-dark);">
                    Çoklu Web Bağlantısı ile Otomatik Ayrıştırma & AI Zenginleştirme
                </h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 18px;">
                    Her satıra bir adet VCoins veya numizmatik web sayfası adresi yapıştırın. Sistemimiz sayfaları sırayla gezecek, görselleri ve detayları çekecek, Gemini AI ile Türkçe numizmatik kimlik kartını oluşturup önizleme tablonuza getirecektir.
                </p>

                <div class="form-group">
                    <label class="form-label">
                        <span>Sikke Bağlantı Listesi (Her satıra bir URL):</span>
                        <span id="urlCountBadge" style="font-size: 12px; font-weight: 600; color: var(--gold-primary);">0 Bağlantı Tespit Edildi</span>
                    </label>
                    <textarea id="urlsTextInput" class="form-control" rows="8" placeholder="https://www.vcoins.com/en/coins/ancient/roman_provincial-364.aspx&#10;https://www.vcoins.com/en/stores/numiscorner/239/product/campania_bronze_unit_ca_300275_bc_neapolis_bronze__sngans427/2417741/Default.aspx" oninput="updateUrlCount()"></textarea>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 13px; font-weight: 700; color: var(--text-dark);">📚 Kategori / Liste Tarama Derinliği:</span>
                        <select id="categoryDepthSelect" class="form-control" style="width: auto; padding: 6px 12px; font-size: 12.5px; font-weight: 600;">
                            <option value="1" selected>1. Sayfa (~50 Sikke)</option>
                            <option value="2">İlk 2 Sayfa (~100 Sikke)</option>
                            <option value="3">İlk 3 Sayfa (~150 Sikke)</option>
                            <option value="5">İlk 5 Sayfa (~250 Sikke)</option>
                        </select>
                        <span style="font-size: 11.5px; color: var(--text-muted);">Kategori linki yapıştırdığınızda sayfadaki tüm sikkeler otomatik tek tek taranır.</span>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('urlsTextInput').value = ''; updateUrlCount();">
                        🧹 Temizle
                    </button>
                    <button type="button" class="btn btn-primary" id="btnStartUrlProcessing" onclick="startUrlQueueProcessing()">
                        <span>⚡</span> Bağlantıları Çözümle & Önizleme Tablosuna Yükle
                    </button>
                </div>
            </div>
        </div>

        <!-- SEKME 3: SUNUCU ARŞİV KLASÖRÜ -->
        <div id="tabServerArchive" class="tab-content">
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--text-dark);">
                    Sunucu Yerel Arşiv Klasörü (<code>./sikkeler_arsiv</code>)
                </h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 18px;">
                    Python scraper'ınızın veya veri işleme botunuzun sunucu kök dizininde oluşturduğu <code>./sikkeler_arsiv/raw_coins.json</code> verilerini ve <code>./sikkeler_arsiv/images</code> klasöründeki ön/arka yüz fotoğraflarını tek tıkla koleksiyona aktarın.
                </p>

                <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 10px; padding: 18px 24px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted); display: block;">Arşiv JSON Dosyası:</span>
                            <strong style="font-size: 14px; color: var(--text-dark);">
                                <?= $archiveExists ? '✅ raw_coins.json Mevcut' : '❌ Bulunamadı' ?>
                            </strong>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted); display: block;">Bulunan Sikke Sayısı:</span>
                            <strong style="font-size: 14px; color: var(--gold-primary);"><?= $archiveCoinCount ?> Adet Eser</strong>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted); display: block;">Yerel Görsel Sayısı:</span>
                            <strong style="font-size: 14px; color: var(--info-blue);"><?= $archiveImgCount ?> Dosya</strong>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: var(--text-muted); display: block;">Son Değişiklik:</span>
                            <span style="font-size: 13px; color: var(--text-dark);"><?= $archiveModified ?? '-' ?></span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="checkServerArchiveStatus()">
                        <span>🔄</span> Durumu Yeniden Tara
                    </button>
                    <button type="button" class="btn btn-primary" onclick="loadServerArchiveToStaging()" <?= !$archiveExists ? 'disabled style="opacity:0.6;"' : '' ?>>
                        <span>📥</span> Sunucu Arşivini Önizleme Tablosuna Yükle
                    </button>
                </div>
            </div>
        </div>

        <!-- CANLI İLERLEME ÇUBUĞU (Progress Box) -->
        <div class="progress-box" id="globalProgressBox">
            <div class="progress-header">
                <span id="progressTitle">İşlem Yürütülüyor...</span>
                <span id="progressPercent">0%</span>
            </div>
            <div class="progress-bar-wrap">
                <div class="progress-bar-fill" id="progressBarFill"></div>
            </div>
            <div class="progress-log" id="progressLog"></div>
        </div>

        <!-- ÖNİZLEME & ONAY ALANI (Staging Table) -->
        <div class="card" style="margin-top: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
                <div>
                    <h3 style="font-size: 17px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
                        <span>📋</span> İçe Aktarılacak Eserler Önizleme Listesi
                        <span class="badge badge-ready" id="badgeStagingCount">0 Eser Hazır</span>
                    </h3>
                    <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
                        Veritabanına kaydetmeden önce eserleri kontrol edebilir, istemediğiniz satırları çıkarabilirsiniz.
                    </p>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="clearStagingList()">
                        🗑️ Listeyi Temizle
                    </button>
                </div>
            </div>

            <!-- Seçenekler -->
            <div class="options-panel">
                <div class="checkbox-group">
                    <label class="custom-checkbox">
                        <input type="checkbox" id="optPublished" checked>
                        <span>Hemen Yayınla (is_published)</span>
                    </label>
                    <label class="custom-checkbox">
                        <input type="checkbox" id="optFeatured">
                        <span>Öne Çıkarılanlara Ekle</span>
                    </label>
                    <label class="custom-checkbox">
                        <input type="checkbox" id="optSkipDuplicates" checked>
                        <span>Aynı Başlıktaki Çift Kayıtları Otomatik Atla</span>
                    </label>
                </div>

                <button type="button" class="btn btn-primary" id="btnCommitImport" onclick="commitStagedCoinsToDatabase()" style="font-size: 14px; padding: 12px 24px;">
                    <span>💾</span> Tüm Sikkeleri Veritabanına Kaydet (<span id="btnCommitCount">0</span>)
                </button>
            </div>

            <!-- Tablo -->
            <div class="table-responsive">
                <table class="coin-table" id="stagingTable">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">
                                <input type="checkbox" id="selectAllCheckbox" checked onchange="toggleSelectAll(this)">
                            </th>
                            <th style="width: 100px;">Görseller</th>
                            <th>Eser / Sikke Başlığı</th>
                            <th>Hükümdar / Şehir Devleti</th>
                            <th>Medeniyet & Darphane</th>
                            <th>Maden & Nominal</th>
                            <th>Tarih & Ref</th>
                            <th style="width: 90px; text-align: center;">Durum</th>
                            <th style="width: 60px; text-align: center;">Eylem</th>
                        </tr>
                    </thead>
                    <tbody id="stagingTableBody">
                        <tr>
                            <td colspan="9" style="text-align: center; padding: 36px; color: var(--text-muted);">
                                Henüz listeye eser eklenmedi. Yukarıdaki sekmelerden JSON yükleyin, URL girin veya sunucu arşivini tarayın.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>

    <!-- JAVASCRIPT MOTORU -->
    <script>
        // Kuyruk Listesi
        let stagedCoins = [];
        let isProcessing = false;

        // Sekme Değiştirici
        function switchImportTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            if (event && event.currentTarget) {
                event.currentTarget.classList.add('active');
            }
            const target = document.getElementById(tabId);
            if (target) target.classList.add('active');
        }

        function setHarvesterSample(url) {
            document.getElementById('harvesterCategoryUrl').value = url;
        }

        function toggleCustomPageRange(val) {
            const box = document.getElementById('customPageRangeBox');
            if (box) {
                box.style.display = (val === 'custom') ? 'block' : 'none';
            }
        }

        function toggleHtmlPasteBox(forceOpen = false) {
            const container = document.getElementById('htmlPasteContainer');
            const btn = document.getElementById('btnToggleHtmlPaste');
            if (!container) return;
            if (forceOpen || container.style.display === 'none') {
                container.style.display = 'block';
                if (btn) btn.innerHTML = '❌ HTML Kutusunu Kapat';
            } else {
                container.style.display = 'none';
                if (btn) btn.innerHTML = '📝 HTML Yapıştırma Kutusunu Aç';
            }
        }

        // VCoins üzerinde 1000 sayfayı engelsiz tarayan canlı konsol kodu
        function copyBrowserConsoleScript() {
            const script = `(async function(startPage=1, maxPages=1000) {
    console.log('%c🚀 SİKKELOBEDİ 1000 SAYFA OTOMATİK HASATÇI BAŞLATILDI...', 'color: #D4AF37; font-size: 16px; font-weight: bold;');
    let totalAdded = 0;
    for (let p = startPage; p <= maxPages; p++) {
        console.log(\`%c📄 Sayfa \${p} çekiliyor...\`, 'color: #3B82F6;');
        try {
            const pageUrl = window.location.pathname + (window.location.search ? window.location.search.replace(/([?&])page=\\d+/, '$1').replace(/[?&]$/, '') : '') + (window.location.search.includes('?') ? '&' : '?') + 'page=' + p;
            const res = await fetch(pageUrl);
            const html = await res.text();
            
            const apiResp = await fetch('http://localhost:8000/api/v1/coins/harvest_category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: html,
                    url: window.location.href,
                    auto_commit: true,
                    options: { skip_duplicates: true, is_published: 1 }
                })
            });
            const data = await apiResp.json();
            if (data.success) {
                totalAdded += (data.inserted_count || 0);
                console.log(\`%c✅ Sayfa \${p} Tamamlandı: \${data.inserted_count} yeni sikke eklendi, \${data.skipped_count} mükerrer atlandı. (Toplam: \${totalAdded})\`, 'color: #10B981; font-weight: bold;');
                if (data.total_found_on_page === 0 || (data.total_pages && p >= data.total_pages)) {
                    console.log('%c🎉 Kategorinin sonuna gelindi!', 'color: #10B981; font-size: 14px; font-weight: bold;');
                    break;
                }
            } else {
                console.error('Hata:', data.message);
                break;
            }
            await new Promise(r => setTimeout(r, 700));
        } catch(e) {
            console.error('İstek hatası:', e);
            break;
        }
    }
    alert('🎉 Tebrikler! Tüm sayfalar tarandı ve toplam ' + totalAdded + ' sikke veritabanınıza başarıyla aktarıldı.');
})();`;

            navigator.clipboard.writeText(script).then(() => {
                alert("📋 1-Tık Tarayıcı Hasat Kodu Panoya Kopyalandı!\n\nNASIL ÇALIŞTIRILIR:\n1. VCoins'te kategori sayfasındayken klavyeden F12'ye basın (Geliştirici Araçları).\n2. Açılan panelde 'Console' sekmesine tıklayın.\n3. Kopyalanan bu kodu yapıştırıp Enter'a basın!\n\nTarayıcınız sayfa 1'den 1000'e kadar tüm sayfaları otomatik çeker ve Sikkelobedi veritabanınıza canlı olarak aktarır!");
            }).catch(err => {
                prompt("Lütfen aşağıdaki kodu kopyalayıp VCoins sayfasında Console'a (F12) yapıştırın:", script);
            });
        }

        let isHarvestingActive = false;
        let stopHarvestingRequested = false;

        function stopCategoryHarvesting() {
            if (!isHarvestingActive) return;
            stopHarvestingRequested = true;
            const btnStop = document.getElementById('btnStopHarvesting');
            if (btnStop) {
                btnStop.innerHTML = '<span>⏳</span> Durduruluyor...';
            }
        }

        // KATEGORİDEN OTOMATİK SİKKE HASADI (Category Harvester)
        async function startCategoryHarvesting() {
            const catUrl = document.getElementById('harvesterCategoryUrl').value.trim();
            const rawHtml = document.getElementById('harvesterRawHtml')?.value.trim() || '';

            if (!catUrl && !rawHtml) {
                alert('Lütfen hedef kategori web adresini (URL) giriniz veya sayfa HTML kodunu yapıştırınız.');
                return;
            }

            const rangeChoice = document.getElementById('harvesterMaxPages').value;
            let startPage = 1;
            let endPage = 1000;

            if (rangeChoice === 'all') {
                startPage = 1;
                endPage = 1000;
            } else if (rangeChoice === 'custom') {
                startPage = parseInt(document.getElementById('harvesterStartPage')?.value || 1);
                endPage = parseInt(document.getElementById('harvesterEndPage')?.value || 1000);
            } else {
                startPage = 1;
                endPage = parseInt(rangeChoice);
            }

            if (startPage < 1) startPage = 1;
            if (endPage < startPage) endPage = startPage;

            const mode = document.getElementById('harvesterMode').value;
            const isAutoCommit = (mode === 'auto_commit');
            const skipDuplicates = document.getElementById('harvesterSkipDuplicates').checked;
            const isPublished = document.getElementById('harvesterAutoPublish').checked;

            const btn = document.getElementById('btnStartHarvesting');
            const btnStop = document.getElementById('btnStopHarvesting');
            btn.disabled = true;
            btn.innerHTML = '<span>⏳</span> Kategori Taranıyor & Sikkeler İndiriliyor...';
            btnStop.style.display = 'inline-flex';
            btnStop.innerHTML = '<span>⏹️</span> Hasadı Durdur (İstediğimde Kes)';

            isHarvestingActive = true;
            stopHarvestingRequested = false;

            const progressBox = document.getElementById('globalProgressBox');
            const progressTitle = document.getElementById('progressTitle');
            const progressPercent = document.getElementById('progressPercent');
            const progressBarFill = document.getElementById('progressBarFill');
            const progressLog = document.getElementById('progressLog');

            progressBox.style.display = 'block';
            progressLog.innerHTML = '';

            let totalInserted = 0;
            let totalSkipped = 0;
            let totalProcessed = 0;

            // DURUM 1: DOĞRUDAN HTML KAYNAK KODU YAPILMIŞSA
            if (rawHtml) {
                progressTitle.innerText = 'Yapıştırılan Kategori HTML Kodu Çözümleniyor...';
                progressBarFill.style.width = '30%';
                progressPercent.innerText = '30%';

                const pageLog = document.createElement('div');
                pageLog.innerHTML = '<strong>🛡️ Yapıştırılan HTML kodu taranıyor (AWS WAF koruması %100 aşıldı)...</strong>';
                pageLog.style.color = '#059669';
                progressLog.appendChild(pageLog);

                try {
                    const resp = await fetch('/api/v1/coins/harvest_category', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                            html: rawHtml,
                            url: catUrl || 'https://www.vcoins.com',
                            auto_commit: isAutoCommit,
                            options: {
                                skip_duplicates: skipDuplicates,
                                is_published: isPublished ? 1 : 0
                            }
                        })
                    });
                    const res = await resp.json();

                    if (!res.success) {
                        alert('HTML Ayrıştırma Hatası: ' + (res.message || 'Bilinmeyen hata'));
                    } else if (res.items && res.items.length > 0) {
                        res.items.forEach(item => {
                            totalProcessed++;
                            if (item.status === 'success') totalInserted++;
                            else if (item.status === 'skipped') totalSkipped++;

                            const cObj = normalizeCoinObject(item);
                            if (isAutoCommit) {
                                cObj.status = item.status === 'success' ? 'success' : 'skipped';
                            }
                            stagedCoins.push(cObj);

                            const itemLog = document.createElement('div');
                            if (item.status === 'success') {
                                itemLog.innerText = `[#${totalProcessed}] ${item.title} -> ${item.ruler || ''} | ${item.metal || ''} | $${item.price || ''} -> EKLENDİ (#${item.id})`;
                                itemLog.style.color = '#059669';
                            } else if (item.status === 'skipped') {
                                itemLog.innerText = `[#${totalProcessed}] ${item.title} -> Zaten mevcut (Atlandı)`;
                                itemLog.style.color = '#64748B';
                            }
                            progressLog.appendChild(itemLog);
                        });
                        renderStagingTable();
                    }
                } catch (e) {
                    alert('Hata: ' + e.message);
                }

                progressBarFill.style.width = '100%';
                progressPercent.innerText = '100%';
                progressTitle.innerText = `İşlem Tamamlandı! ${totalProcessed} sikke ayrıştırıldı (${totalInserted} kaydedildi).`;
                isHarvestingActive = false;
                btnStop.style.display = 'none';
                btn.disabled = false;
                btn.innerHTML = '<span>🚀</span> Kategorideki Tüm Sikkeleri Çek ve Veritabanına Ekle';
                updateCounters();

                if (isAutoCommit) {
                    alert(`🎉 Tebrikler! HTML kodundan ${totalInserted} sikke veritabanınıza başarıyla eklendi.`);
                }
                return;
            }

            // DURUM 2: URL İLE SAYFA SAYFA OTOMATİK TARAMA
            progressTitle.innerText = `Kategori Başlatılıyor: Sayfa ${startPage} taranıyor...`;
            progressBarFill.style.width = '3%';
            progressPercent.innerText = '3%';

            let actualTotalPages = endPage;

            for (let page = startPage; page <= endPage; page++) {
                if (stopHarvestingRequested) {
                    const stopLog = document.createElement('div');
                    stopLog.innerHTML = `<strong>⏹️ Hasat kullanıcı isteğiyle durduruldu!</strong> Şu ana kadar çekilen ${totalProcessed} adet sikke korunmuştur.`;
                    stopLog.style.color = '#DC2626';
                    stopLog.style.fontWeight = 'bold';
                    progressLog.appendChild(stopLog);
                    break;
                }

                const totalPagesToRun = (actualTotalPages - startPage + 1) || 1;
                const currentStep = page - startPage + 1;
                const pagePct = Math.min(99, Math.round((currentStep / totalPagesToRun) * 100));

                progressBarFill.style.width = pagePct + '%';
                progressPercent.innerText = pagePct + '%';
                progressTitle.innerText = `Sayfa ${page} / ${actualTotalPages} Çekiliyor & Sikkeler İşleniyor (${totalInserted} Kaydedildi)...`;

                const pageLog = document.createElement('div');
                pageLog.innerHTML = `<strong>📄 Sayfa ${page} / ${actualTotalPages} İsteği Gönderiliyor...</strong>`;
                pageLog.style.color = '#B45309';
                pageLog.style.marginTop = '6px';
                progressLog.appendChild(pageLog);
                progressLog.scrollTop = progressLog.scrollHeight;

                try {
                    const resp = await fetch('/api/v1/coins/harvest_category', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                            url: catUrl,
                            page: page,
                            auto_commit: isAutoCommit,
                            cookie: document.getElementById('harvesterCookie')?.value.trim() || '',
                            options: {
                                skip_duplicates: skipDuplicates,
                                is_published: isPublished ? 1 : 0
                            }
                        })
                    });

                    const res = await resp.json();

                    if (!res.success) {
                        const errDiv = document.createElement('div');
                        errDiv.innerText = `❌ Sayfa ${page} Hatası: ` + (res.message || 'Bağlantı kurulamadı');
                        errDiv.style.color = '#DC2626';
                        progressLog.appendChild(errDiv);

                        if (res.is_waf_block) {
                            toggleHtmlPasteBox(true);
                            alert(`🛡️ HEDEF SİTE BOT KORUMASI (AWS WAF)\n\nVCoins doğrudan sunucu isteklerine karşı güvenlik duvarı uyguladı.\n\n💡 KESİN VE ANINDA ÇÖZÜM:\n1. Tarayıcınızda açtığınız VCoins sayfasında Ctrl+U (veya sağ tık -> Sayfa Kaynağını Görüntüle) yapıp tüm kodu kopyalayın.\n2. Açılan 'HTML Yapıştırma Kutusuna' yapıştırıp tekrar butona basın!\nSayfadaki tüm sikkeler anında veritabanınıza yazılacaktır.`);
                        }
                        break;
                    }

                    if (res.total_pages && res.total_pages > 0) {
                        actualTotalPages = Math.min(endPage, res.total_pages);
                    }

                    pageLog.innerHTML = `<strong>✅ Sayfa ${page} / ${actualTotalPages} Çözümlendi:</strong> ${res.category_title || ''} (${res.total_found_on_page} sikke)`;
                    pageLog.style.color = '#059669';

                    if (res.items && res.items.length > 0) {
                        res.items.forEach((item) => {
                            totalProcessed++;
                            if (item.status === 'success') totalInserted++;
                            else if (item.status === 'skipped') totalSkipped++;

                            const cObj = normalizeCoinObject(item);
                            if (isAutoCommit) {
                                cObj.status = item.status === 'success' ? 'success' : 'skipped';
                            }
                            stagedCoins.push(cObj);

                            // Canlı Konsol Günlüğü
                            const itemLog = document.createElement('div');
                            if (item.status === 'success') {
                                itemLog.innerText = `[#${totalProcessed}] ${item.title} -> ${item.ruler || ''} | ${item.metal || ''} | $${item.price || ''} -> EKLENDİ (#${item.id})`;
                                itemLog.style.color = '#059669';
                            } else if (item.status === 'skipped') {
                                itemLog.innerText = `[#${totalProcessed}] ${item.title} -> Zaten mevcut (Atlandı)`;
                                itemLog.style.color = '#64748B';
                            } else {
                                itemLog.innerText = `[#${totalProcessed}] ${item.title} -> Hazırlandı`;
                            }
                            progressLog.appendChild(itemLog);
                        });

                        progressLog.scrollTop = progressLog.scrollHeight;
                        renderStagingTable();
                    }

                    // Kategori toplam sayfasına ulaşıldıysa veya sayfada hiç sikke yoksa sonlandır
                    if (res.total_found_on_page === 0 || (res.total_pages && page >= res.total_pages)) {
                        const endLog = document.createElement('div');
                        endLog.innerText = `ℹ️ Kategorinin son sayfasına (${page}. sayfa) ulaşıldı. Tarama tamamlandı.`;
                        endLog.style.color = '#2563EB';
                        endLog.style.fontWeight = 'bold';
                        progressLog.appendChild(endLog);
                        break;
                    }

                    // Hedef sitenin IP engeli atmaması için nazik bekleme
                    await new Promise(r => setTimeout(r, 600));

                } catch (err) {
                    const errDiv = document.createElement('div');
                    errDiv.innerText = `❌ Ağ Hatası: ` + err.message;
                    errDiv.style.color = '#DC2626';
                    progressLog.appendChild(errDiv);
                    break;
                }
            }

            isHarvestingActive = false;
            btnStop.style.display = 'none';
            btn.disabled = false;
            btn.innerHTML = '<span>🚀</span> Kategorideki Tüm Sikkeleri Çek ve Veritabanına Ekle';

            progressBarFill.style.width = '100%';
            progressPercent.innerText = '100%';
            progressTitle.innerText = `Hasat Tamamlandı! Toplam ${totalProcessed} sikke tarandı (${totalInserted} eklendi, ${totalSkipped} mükerrer atlandı).`;
            updateCounters();

            if (isAutoCommit) {
                alert(`🎉 Kategori Hasadı Başarıyla Tamamlandı!\n\n✅ ${totalInserted} adet sikke veritabanına hatasız kaydedildi.\n⏭️ ${totalSkipped} adet mükerrer kayıt atlandı.`);
            } else {
                alert(`📋 ${totalProcessed} adet sikke başarıyla önizleme tablosuna aktarıldı. İnceleyip onaylayabilirsiniz.`);
            }
        }

        // Sürükle Bırak Olayları
        const dropzone = document.getElementById('jsonDropzone');
        if (dropzone) {
            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('dragover');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('dragover');
                }, false);
            });

            dropzone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files.length > 0) {
                    processJsonFile(files[0]);
                }
            }, false);
        }

        function handleFileSelect(e) {
            const files = e.target.files;
            if (files.length > 0) {
                processJsonFile(files[0]);
            }
        }

        function processJsonFile(file) {
            if (!file.name.endsWith('.json') && file.type !== 'application/json') {
                alert('Lütfen geçerli bir .json dosyası seçiniz.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                const text = evt.target.result;
                document.getElementById('jsonTextInput').value = text;
                parseAndStageJson();
            };
            reader.readAsText(file, 'UTF-8');
        }

        // Örnek JSON Şablonu
        function loadSampleJson() {
            const sample = [
                {
                    "title": "Trajan AR Denarius (AD 98-117). Rome mint.",
                    "civilization": "Roma İmparatorluğu",
                    "ruler": "Trajan",
                    "mint": "Roma",
                    "metal": "Gümüş (AR)",
                    "denomination": "Denarius",
                    "weight_grams": 3.45,
                    "diameter_mm": 19.2,
                    "die_axis": "6h",
                    "year_start": 112,
                    "year_end": 114,
                    "condition": "EF",
                    "rarity": "C",
                    "estimated_value_min": 140,
                    "estimated_value_max": 220,
                    "reference": "RIC II 245",
                    "avers_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Denarius_Domitian-RIC_0114.jpg/640px-Denarius_Domitian-RIC_0114.jpg",
                    "revers_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Denarius_Domitian-RIC_0114_%28reverse%29.jpg/640px-Denarius_Domitian-RIC_0114_%28reverse%29.jpg",
                    "avers_description": "Defne taçlı Trajan büstü sağa.",
                    "revers_description": "Felicitas ayakta sola doğru, elinde bereket boynuzu ve caduceus tutmakta."
                },
                {
                    "title": "Neapolis Bronz Sikkesi (M.Ö. 300-275). Acheloos & Nike.",
                    "civilization": "Antik Yunan & Helenistik",
                    "ruler": "Neapolis Şehir Devleti (Apollon / Acheloos)",
                    "mint": "Neapolis (Napoli - Campania)",
                    "metal": "Bronz (AE)",
                    "denomination": "Unit",
                    "weight_grams": 3.45,
                    "diameter_mm": 19.2,
                    "year_start": -300,
                    "year_end": -275,
                    "condition": "VF",
                    "reference": "SNG ANS 427",
                    "avers_description": "Defne çelenkli Apollon başı sağa.",
                    "revers_description": "İnsan başlı nehir tanrısı Acheloos, üzerinde uçan zafer tanrıçası Nike tarafından taçlandırılıyor."
                }
            ];
            document.getElementById('jsonTextInput').value = JSON.stringify(sample, null, 2);
        }

        function clearJsonInput() {
            document.getElementById('jsonTextInput').value = '';
            document.getElementById('jsonFileInput').value = '';
        }

        // JSON Doğrulama & Kuyruğa Ekleme
        function parseAndStageJson() {
            const raw = document.getElementById('jsonTextInput').value.trim();
            if (!raw) {
                alert('Lütfen JSON metni giriniz veya bir dosya yükleyiniz.');
                return;
            }

            try {
                const parsed = JSON.parse(raw);
                const items = Array.isArray(parsed) ? parsed : (parsed.coins ? parsed.coins : [parsed]);

                let addedCount = 0;
                items.forEach(item => {
                    if (!item || typeof item !== 'object') return;
                    
                    const coinObj = normalizeCoinObject(item);
                    stagedCoins.push(coinObj);
                    addedCount++;
                });

                renderStagingTable();
                alert(`${addedCount} adet sikke başarıyla önizleme tablosuna eklendi.`);
            } catch (err) {
                alert('Geçersiz JSON formatı! Lütfen sözdizimini kontrol ediniz: ' + err.message);
            }
        }

        // Standart Sikke Nesnesi Normalizasyonu
        function normalizeCoinObject(raw) {
            let refStr = '';
            if (raw.reference && typeof raw.reference === 'object') {
                refStr = Object.values(raw.reference).filter(v => typeof v === 'string' || typeof v === 'number').join(', ');
            } else if (raw.reference_codes && typeof raw.reference_codes === 'object') {
                refStr = Object.values(raw.reference_codes).filter(v => typeof v === 'string' || typeof v === 'number').join(', ');
            } else if (typeof raw.reference === 'string') {
                refStr = raw.reference;
            } else if (typeof raw.katalog_ref === 'string') {
                refStr = raw.katalog_ref;
            } else if (typeof raw.raw_ref === 'string') {
                refStr = raw.raw_ref;
            }

            if (typeof refStr === 'string' && refStr.trim().startsWith('{')) {
                try {
                    const p = JSON.parse(refStr);
                    if (typeof p === 'object' && p !== null) {
                        refStr = Object.values(p).filter(v => typeof v === 'string' || typeof v === 'number').join(', ');
                    }
                } catch(e) {}
            }
            if (refStr.includes('[object Object]')) refStr = '';

            const rawTitle = raw.title || raw.baslik || raw.name || 'İsimsiz Sikke';

            // Akıllı Metal Tespiti (Öncelikli olarak AE / Bronz)
            let detectedMetal = raw.metal || raw.metal_type || raw.raw_metal;
            if (!detectedMetal || detectedMetal === 'Gümüş (AR)') {
                const titleLower = rawTitle.toLowerCase();
                if (titleLower.match(/(?:ae\s*\d+|æ\s*\d+|&#198;|&#230;|\bae\b|\bæ\b|bronze|bronz|copper|bakır|assarion|chalkous)/i)) {
                    detectedMetal = 'Bronz (AE)';
                } else if (titleLower.match(/\b(denarius|drachm|tetradrachm|obol|diobol|silver|gümüş|\bar\b)\b/i)) {
                    detectedMetal = 'Gümüş (AR)';
                } else if (titleLower.match(/\b(gold|altın|aureus|solidus|\bav\b|\bau\b)\b/i)) {
                    detectedMetal = 'Altın (AV)';
                } else if (!detectedMetal) {
                    detectedMetal = 'Bronz (AE)';
                }
            }

            // Akıllı Nominal Birim (Örn: Æ20, Æ16.5, Æ15)
            let detectedDenom = raw.denomination || raw.nominal_birim || raw.standard_name;
            if (!detectedDenom || detectedDenom === 'Standart') {
                const dMatch = rawTitle.match(/(?:Æ|AE|&#198;)\s*(\d{1,2}(?:\.\d+)?)/i);
                if (dMatch) {
                    detectedDenom = 'Æ' + dMatch[1];
                } else {
                    detectedDenom = 'Standart';
                }
            }

            return {
                id: 'coin_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
                selected: raw.status !== 'skipped',
                status: raw.status || 'ready', // ready, processing, success, error, skipped
                errorMsg: raw.message || '',
                
                title: rawTitle,
                civilization: raw.civilization || raw.medeniyet || '',
                civilization_id: raw.civilization_id || null,
                ruler: raw.ruler || raw.hukumdar || raw.authority || '',
                mint: raw.mint || raw.darphane || '',
                mint_id: raw.mint_id || null,
                metal: detectedMetal,
                denomination: detectedDenom,
                weight_grams: raw.weight_grams || raw.weight || null,
                diameter_mm: raw.diameter_mm || raw.diameter || raw.size || null,
                die_axis: raw.die_axis || '12h',
                year_start: raw.year_start !== undefined ? raw.year_start : null,
                year_end: raw.year_end !== undefined ? raw.year_end : null,
                condition: raw.condition || raw.condition_grade || raw.kondisyon || 'VF',
                rarity: raw.rarity || raw.rarity_code || 'C',
                estimated_value_min: raw.estimated_value_min || raw.price_min || null,
                estimated_value_max: raw.estimated_value_max || raw.price_max || null,
                currency: raw.currency || 'USD',
                reference: refStr,
                avers_image: raw.avers_image || raw.avers_image_url || raw.avers_image_path || '',
                revers_image: raw.revers_image || raw.revers_image_url || raw.revers_image_path || '',
                avers_description: raw.avers_description || (raw.on_yuz ? (raw.on_yuz.tasvir || '') : '') || raw.obverse_desc || '',
                revers_description: raw.revers_description || (raw.arka_yuz ? (raw.arka_yuz.tasvir || '') : '') || raw.reverse_desc || '',
                historical_context: raw.historical_context || raw.kullanici_bilgi_notu || ''
            };
        }

        // Tabloyu Çizdir
        function renderStagingTable() {
            const tbody = document.getElementById('stagingTableBody');
            if (stagedCoins.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 36px; color: var(--text-muted);">
                            Henüz listeye eser eklenmedi. Yukarıdaki sekmelerden JSON yükleyin, URL girin veya sunucu arşivini tarayın.
                        </td>
                    </tr>
                `;
                updateCounters();
                return;
            }

            let html = '';
            stagedCoins.forEach((c, idx) => {
                const aversSrc = c.avers_image ? c.avers_image : '/images/app-logo.png';
                const reversSrc = c.revers_image ? c.revers_image : '/images/app-logo.png';

                let statusBadge = '<span class="badge badge-ready">Hazır</span>';
                if (c.status === 'processing') statusBadge = '<span class="badge badge-processing">İşleniyor...</span>';
                else if (c.status === 'success') statusBadge = '<span class="badge badge-success">Kaydedildi</span>';
                else if (c.status === 'skipped') statusBadge = '<span class="badge badge-skipped">Atlandı (Çift)</span>';
                else if (c.status === 'error') statusBadge = `<span class="badge badge-error" title="${c.errorMsg || 'Hata'}">Hata</span>`;

                const dateStr = (c.year_start !== null && c.year_end !== null) 
                    ? `${c.year_start < 0 ? 'M.Ö. ' + Math.abs(c.year_start) : 'M.S. ' + c.year_start} - ${c.year_end < 0 ? 'M.Ö. ' + Math.abs(c.year_end) : 'M.S. ' + c.year_end}`
                    : '-';

                html += `
                    <tr>
                        <td style="text-align: center;">
                            <input type="checkbox" ${c.selected ? 'checked' : ''} onchange="toggleSelectCoin(${idx}, this.checked)">
                        </td>
                        <td>
                            <div class="coin-thumb-box">
                                <img src="${aversSrc}" class="coin-thumb" alt="Ön Yüz" onerror="this.src='/images/app-logo.png'" title="Ön Yüz">
                                <img src="${reversSrc}" class="coin-thumb" alt="Arka Yüz" onerror="this.src='/images/app-logo.png'" title="Arka Yüz">
                            </div>
                        </td>
                        <td>
                            <strong style="color: var(--text-dark); display: block; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${escapeHtml(c.title)}
                            </strong>
                            <small style="color: var(--text-muted); font-size: 11px;">${escapeHtml(c.denomination)}</small>
                        </td>
                        <td>
                            <span style="font-weight: 600; color: #334155;">${escapeHtml(c.ruler || 'Belirtilmedi')}</span>
                        </td>
                        <td>
                            <div style="font-size: 12px; font-weight: 600;">${escapeHtml(c.civilization || 'Otomatik Algı')}</div>
                            <small style="color: var(--text-muted); font-size: 11px;">${escapeHtml(c.mint || 'Darphane Otomatik')}</small>
                        </td>
                        <td>
                            <span style="font-weight: 600;">${escapeHtml(c.metal)}</span>
                            <div style="font-size: 11px; color: var(--text-muted);">Kond: ${escapeHtml(c.condition)}</div>
                        </td>
                        <td>
                            <div style="font-size: 11.5px;">${dateStr}</div>
                            <small style="color: var(--gold-primary); font-size: 10.5px;">${escapeHtml(c.reference || '')}</small>
                        </td>
                        <td style="text-align: center;">
                            ${statusBadge}
                        </td>
                        <td style="text-align: center;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="removeStagedCoin(${idx})" title="Listeden Kaldır" style="padding: 4px 8px;">
                                ❌
                            </button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
            updateCounters();
        }

        function toggleSelectCoin(idx, isChecked) {
            if (stagedCoins[idx]) {
                stagedCoins[idx].selected = isChecked;
            }
            updateCounters();
        }

        function toggleSelectAll(masterCheckbox) {
            const checked = masterCheckbox.checked;
            stagedCoins.forEach(c => c.selected = checked);
            renderStagingTable();
        }

        function removeStagedCoin(idx) {
            stagedCoins.splice(idx, 1);
            renderStagingTable();
        }

        function clearStagingList() {
            if (stagedCoins.length === 0) return;
            if (confirm('Tüm önizleme listesini temizlemek istediğinize emin misiniz?')) {
                stagedCoins = [];
                renderStagingTable();
            }
        }

        function updateCounters() {
            const total = stagedCoins.length;
            const selected = stagedCoins.filter(c => c.selected).length;
            const success = stagedCoins.filter(c => c.status === 'success').length;
            const skipped = stagedCoins.filter(c => c.status === 'skipped').length;

            document.getElementById('statQueueCount').innerText = total;
            document.getElementById('statSuccessCount').innerText = success;
            document.getElementById('statSkippedCount').innerText = skipped;

            document.getElementById('badgeStagingCount').innerText = `${total} Eser (${selected} Seçili)`;
            document.getElementById('btnCommitCount').innerText = selected;
        }

        function updateUrlCount() {
            const raw = document.getElementById('urlsTextInput').value.trim();
            const lines = raw ? raw.split('\n').map(l => l.trim()).filter(l => l.startsWith('http')) : [];
            document.getElementById('urlCountBadge').innerText = `${lines.length} Bağlantı Tespit Edildi`;
        }

        // ÇOKLU URL KUYRUĞU İŞLEME (Sekme 2)
        async function startUrlQueueProcessing() {
            const raw = document.getElementById('urlsTextInput').value.trim();
            const inputUrls = raw ? raw.split('\n').map(l => l.trim()).filter(l => l.startsWith('http')) : [];

            if (inputUrls.length === 0) {
                alert('Lütfen en az bir geçerli URL (https://...) giriniz.');
                return;
            }

            const btn = document.getElementById('btnStartUrlProcessing');
            btn.disabled = true;
            btn.innerHTML = '<span>⏳</span> Ayrıştırılıyor...';

            const progressBox = document.getElementById('globalProgressBox');
            const progressTitle = document.getElementById('progressTitle');
            const progressPercent = document.getElementById('progressPercent');
            const progressBarFill = document.getElementById('progressBarFill');
            const progressLog = document.getElementById('progressLog');

            progressBox.style.display = 'block';
            progressLog.innerHTML = '';
            progressTitle.innerText = 'Bağlantılar taranıyor ve kategori sayfaları kontrol ediliyor...';
            progressBarFill.style.width = '10%';
            progressPercent.innerText = '10%';

            // 1. ADIM: Kategori & Liste Sayfalarını Otomatik Tespit Et & Bütün Ürün Linklerini Çıkar
            let urlsToProcess = [];
            try {
                const maxPages = parseInt(document.getElementById('categoryDepthSelect')?.value || 1);
                const expandResp = await fetch('/admin/coins/expand-urls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ urls: inputUrls, max_pages: maxPages })
                });
                const expandData = await expandResp.json();

                if (expandData.success && expandData.urls && expandData.urls.length > 0) {
                    urlsToProcess = expandData.urls;
                    if (expandData.has_category) {
                        const catInfo = expandData.categories.map(c => `${c.title} (${c.count} sikke)`).join(', ');
                        const catLog = document.createElement('div');
                        catLog.innerHTML = `<strong>🎯 Kategori Sayfası Tespit Edildi:</strong> ${catInfo}. Toplam <strong>${urlsToProcess.length}</strong> adet sikke bağlantısı tek tek taranmak üzere kuyruğa alındı!`;
                        catLog.style.color = '#B45309';
                        catLog.style.fontWeight = 'bold';
                        progressLog.appendChild(catLog);
                    }
                } else {
                    urlsToProcess = inputUrls;
                }
            } catch (err) {
                urlsToProcess = inputUrls;
            }

            let processed = 0;
            const totalCount = urlsToProcess.length;

            for (let i = 0; i < totalCount; i++) {
                const url = urlsToProcess[i];
                const pct = Math.round(((i + 1) / totalCount) * 100);
                progressPercent.innerText = pct + '%';
                progressBarFill.style.width = pct + '%';
                progressTitle.innerText = `Sikke Ayrıştırılıyor (${i + 1}/${totalCount}): ${url.substring(0, 50)}...`;

                const logItem = document.createElement('div');
                logItem.innerText = `[${i + 1}/${totalCount}] İstek yapılıyor: ${url.substring(0, 60)}...`;
                progressLog.appendChild(logItem);
                progressLog.scrollTop = progressLog.scrollHeight;

                try {
                    const resp = await fetch('/admin/coins/fetch-from-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ url: url })
                    });
                    const resJson = await resp.json();

                    // Eğer fetch-from-url kategori tespiti döndürürse ve önceden expand edilmediyse
                    if (resJson.success && resJson.is_category && resJson.product_urls && resJson.product_urls.length > 0) {
                        logItem.innerText += ` -> 🎯 Kategori Sayfası: ${resJson.count} sikke kuyruğa eklendi.`;
                        logItem.style.color = '#B45309';
                        // Kalan linkleri ekle
                        for (const pUrl of resJson.product_urls) {
                            if (!urlsToProcess.includes(pUrl)) {
                                urlsToProcess.push(pUrl);
                            }
                        }
                        continue;
                    }

                    if (resJson.success && resJson.data) {
                        const d = resJson.data;
                        const coinObj = normalizeCoinObject({
                            title: d.title,
                            civilization_id: d.civilization_id,
                            civilization: d.civilization_name,
                            mint_id: d.mint_id,
                            mint: d.mint_name,
                            ruler: d.ruler,
                            metal_type: d.metal_type,
                            standard_name: d.standard_name,
                            weight_grams: d.weight_grams,
                            diameter_mm: d.diameter_mm,
                            die_axis: d.die_axis,
                            year_start: d.year_start,
                            year_end: d.year_end,
                            condition_grade: d.condition_grade,
                            rarity_code: d.rarity_code,
                            estimated_value_min: d.estimated_value_min,
                            estimated_value_max: d.estimated_value_max,
                            currency: d.currency,
                            reference: d.reference_codes,
                            avers_image: d.avers_imported_path || d.avers_image,
                            revers_image: d.revers_imported_path || d.revers_image,
                            avers_description: d.avers_description,
                            revers_description: d.revers_description,
                            historical_context: d.historical_context
                        });
                        stagedCoins.push(coinObj);
                        processed++;

                        logItem.innerText += ' -> BAŞARILI: ' + (d.title || 'Sikke çözümlendi');
                        logItem.style.color = '#059669';
                    } else {
                        logItem.innerText += ' -> BAŞARISIZ: ' + (resJson.message || 'Veri çekilemedi');
                        logItem.style.color = '#DC2626';
                    }
                } catch (e) {
                    logItem.innerText += ' -> HATA: ' + e.message;
                    logItem.style.color = '#DC2626';
                }

                renderStagingTable();

                // Hedef sitenin IP engeli atmaması için nazik bekleme
                await new Promise(r => setTimeout(r, 600));
            }

            progressBarFill.style.width = '100%';
            progressPercent.innerText = '100%';
            progressTitle.innerText = `İşlem Tamamlandı! ${processed}/${urlsToProcess.length} sikke başarıyla çözümlendi ve önizleme tablosuna eklendi.`;

            btn.disabled = false;
            btn.innerHTML = '<span>⚡</span> Bağlantıları Çözümle & Önizleme Tablosuna Yükle';
        }

        // SUNUCU ARŞİVİNİ ÖNİZLEME TABLOSUNA YÜKLE (Sekme 3)
        async function loadServerArchiveToStaging() {
            const progressBox = document.getElementById('globalProgressBox');
            const progressTitle = document.getElementById('progressTitle');
            const progressBarFill = document.getElementById('progressBarFill');

            progressBox.style.display = 'block';
            progressTitle.innerText = 'Sunucu Arşiv Dosyası Okunuyor...';
            progressBarFill.style.width = '30%';

            try {
                const resp = await fetch('/api/v1/coins/archive_status');
                const data = await resp.json();

                if (!data.success || !data.items || data.items.length === 0) {
                    alert('Sunucu arşivinde aktarılacak sikke bulunamadı veya dosya boş.');
                    progressBox.style.display = 'none';
                    return;
                }

                progressBarFill.style.width = '70%';
                let added = 0;
                data.items.forEach(raw => {
                    const c = normalizeCoinObject(raw);
                    stagedCoins.push(c);
                    added++;
                });

                progressBarFill.style.width = '100%';
                progressTitle.innerText = `Sunucudan ${added} adet sikke önizleme tablosuna aktarıldı.`;
                renderStagingTable();
                alert(`Sunucu arşivinden ${added} adet sikke önizleme tablosuna yüklendi.`);
            } catch (err) {
                alert('Sunucu arşivi okunurken hata oluştu: ' + err.message);
            }
        }

        async function checkServerArchiveStatus() {
            location.reload();
        }

        // TÜM KUYRUKTAKİ SİKKELERİ VERİTABANINA KAYDET
        async function commitStagedCoinsToDatabase() {
            const selectedCoins = stagedCoins.filter(c => c.selected && c.status !== 'success');
            if (selectedCoins.length === 0) {
                alert('Lütfen veritabanına kaydedilecek en az bir sikke seçiniz.');
                return;
            }

            if (!confirm(`Seçili ${selectedCoins.length} adet sikkeyi Sikkelobedi koleksiyon veritabanına eklemek istediğinize emin misiniz?`)) {
                return;
            }

            const btn = document.getElementById('btnCommitImport');
            btn.disabled = true;
            btn.innerHTML = '<span>💾</span> Veritabanına Yazılıyor...';

            const progressBox = document.getElementById('globalProgressBox');
            const progressTitle = document.getElementById('progressTitle');
            const progressPercent = document.getElementById('progressPercent');
            const progressBarFill = document.getElementById('progressBarFill');
            const progressLog = document.getElementById('progressLog');

            progressBox.style.display = 'block';
            progressLog.innerHTML = '';

            const isPublished = document.getElementById('optPublished').checked;
            const isFeatured = document.getElementById('optFeatured').checked;
            const skipDuplicates = document.getElementById('optSkipDuplicates').checked;

            // 15'erli paketler halinde (batch) göndererek sunucuyu ve belleği koru
            const batchSize = 15;
            let successTotal = 0;
            let skippedTotal = 0;

            for (let i = 0; i < selectedCoins.length; i += batchSize) {
                const batch = selectedCoins.slice(i, i + batchSize);
                const pct = Math.round((i / selectedCoins.length) * 100);
                progressPercent.innerText = pct + '%';
                progressBarFill.style.width = pct + '%';
                progressTitle.innerText = `Veritabanına Yazılıyor (${i + 1} - ${Math.min(i + batchSize, selectedCoins.length)} / ${selectedCoins.length})...`;

                // Status'u updating yap
                batch.forEach(c => c.status = 'processing');
                renderStagingTable();

                try {
                    const resp = await fetch('/api/v1/coins/bulk_import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                            coins: batch,
                            options: {
                                is_published: isPublished ? 1 : 0,
                                is_featured: isFeatured ? 1 : 0,
                                skip_duplicates: skipDuplicates
                            }
                        })
                    });

                    const res = await resp.json();
                    if (res.success) {
                        successTotal += (res.imported || 0);
                        skippedTotal += (res.skipped || 0);

                        // Batch içindeki coin'leri güncelle
                        batch.forEach((c, bIdx) => {
                            const resultItem = res.results ? res.results[bIdx] : null;
                            if (resultItem) {
                                c.status = resultItem.status;
                                c.errorMsg = resultItem.message || '';
                            } else {
                                c.status = 'success';
                            }
                        });

                        const logDiv = document.createElement('div');
                        logDiv.innerText = `Paket başarıyla işlendi: ${res.imported || 0} eklendi, ${res.skipped || 0} atlandı.`;
                        progressLog.appendChild(logDiv);
                    } else {
                        batch.forEach(c => {
                            c.status = 'error';
                            c.errorMsg = res.message || 'Hata';
                        });
                    }
                } catch (e) {
                    batch.forEach(c => {
                        c.status = 'error';
                        c.errorMsg = e.message;
                    });
                }

                renderStagingTable();
            }

            progressBarFill.style.width = '100%';
            progressPercent.innerText = '100%';
            progressTitle.innerText = `Toplu İçe Aktarma Tamamlandı! Toplam ${successTotal} sikke veritabanına kaydedildi.`;

            btn.disabled = false;
            btn.innerHTML = `<span>💾</span> Tüm Sikkeleri Veritabanına Kaydet (<span id="btnCommitCount">0</span>)`;
            updateCounters();

            alert(`İşlem Tamamlandı!\n✅ ${successTotal} sikke başarıyla eklendi.\n⏭️ ${skippedTotal} mükerrer sikke atlandı.`);
        }

        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    </script>
</body>
</html>
