<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $coin ? 'Sikke Düzenle' : 'Yeni Sikke Ekle' ?> | Sikkelobedi Admin (localhost:8000)</title>
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
            --text-dark: #1E293B;
            --text-muted: #64748B;
            --border-subtle: #E2E8F0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg-canvas); color: var(--text-dark); min-height: 100vh; }
        
        .admin-navbar {
            background: #FFFFFF; border-bottom: 1px solid var(--border-subtle); padding: 0 32px;
            height: 68px; display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .navbar-brand {
            font-family: 'Cinzel', serif; font-size: 19px; font-weight: 700; color: var(--text-dark);
            text-decoration: none; display: flex; align-items: center; gap: 12px;
        }
        .brand-badge {
            background: rgba(158, 123, 59, 0.12); color: var(--gold-primary); font-size: 11px;
            font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.5px;
        }
        .navbar-nav { display: flex; align-items: center; gap: 8px; }
        .nav-link {
            padding: 9px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 600;
            color: var(--text-muted); text-decoration: none; transition: all 0.2s ease;
        }
        .nav-link:hover, .nav-link.active { color: var(--gold-primary); background: var(--gold-light); }

        .admin-main { max-width: 1280px; margin: 0 auto; padding: 32px 24px 60px 24px; }
        
        .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .page-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; color: var(--text-dark); }
        .page-subtitle { font-size: 13.5px; color: var(--text-muted); margin-top: 3px; }

        .card {
            background: var(--card-bg); border-radius: 14px; border: 1px solid var(--border-subtle);
            padding: 24px 28px; box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.05); margin-bottom: 24px;
        }

        .tab-nav {
            display: flex; gap: 6px; background: #FFFFFF; padding: 6px; border-radius: 12px;
            border: 1px solid var(--border-subtle); margin-bottom: 24px; overflow-x: auto;
        }
        .tab-btn {
            flex: 1; padding: 12px 18px; border-radius: 8px; border: none; background: transparent;
            font-size: 13.5px; font-weight: 600; color: var(--text-muted); cursor: pointer;
            transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap;
        }
        .tab-btn:hover { color: var(--gold-primary); background: var(--gold-light); }
        .tab-btn.active { color: #FFFFFF; background: var(--gold-primary); box-shadow: 0 2px 8px rgba(158, 123, 59, 0.35); }

        .form-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 16px; }
        .form-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 16px; }
        .form-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 700; color: var(--text-dark); }
        .form-control {
            padding: 11px 14px; border: 1.5px solid var(--border-subtle); border-radius: 8px;
            font-size: 13.5px; color: var(--text-dark); background: #FFFFFF; transition: border-color 0.2s; outline: none; font-family: inherit;
        }
        .form-control:focus { border-color: var(--gold-primary); box-shadow: 0 0 0 3px rgba(158, 123, 59, 0.15); }
        .form-helper { font-size: 11.5px; color: var(--text-muted); }

        .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 11px 22px; border-radius: 8px; font-size: 13.5px; font-weight: 700;
            cursor: pointer; border: 1.5px solid transparent; text-decoration: none; transition: all 0.2s ease;
        }
        .btn-gold { background: var(--gold-primary); color: #FFFFFF; border-color: var(--gold-primary); }
        .btn-gold:hover { background: var(--gold-hover); }
        .btn-outline { background: #FFFFFF; color: var(--text-dark); border-color: var(--border-subtle); }
        .btn-outline:hover { border-color: var(--gold-primary); color: var(--gold-primary); }

        .image-upload-box {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 24px; border: 2px dashed rgba(158, 123, 59, 0.35); border-radius: 12px; background: #FFFFFF; cursor: pointer;
        }
        .image-upload-box:hover { border-color: var(--gold-primary); background: var(--gold-light); }
        .preview-circle {
            width: 130px; height: 130px; border-radius: 50%; object-fit: cover;
            border: 3px solid var(--gold-primary); margin-bottom: 12px; background: #F1F5F9; box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        }

        .toggle-wrapper {
            display: flex; align-items: center; justify-content: space-between; padding: 14px 18px;
            border-radius: 10px; background: #F8FAFC; border: 1px solid var(--border-subtle);
        }
        .switch { position: relative; display: inline-block; width: 46px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #CBD5E1; transition: .3s; border-radius: 24px;
        }
        .slider:before {
            position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
            background-color: white; transition: .3s; border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--gold-primary); }
        input:checked + .slider:before { transform: translateX(22px); }

        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>

    <?php include __DIR__ . '/nav.php'; ?>

    <main class="admin-main">
        <div class="page-header">
            <div>
                <h1 class="page-title"><?= $coin ? 'Sikke Düzenle' : 'Yeni Sikke / Eser Ekle' ?></h1>
                <p class="page-subtitle">XAMPP MySQL veritabanına doğrudan kayıt yapan nümizmatik eser giriş ekranı.</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <a href="/admin/coins" class="btn btn-outline">İptal</a>
                <button type="submit" form="coinForm" class="btn btn-gold">Kaydet ve MySQL'e Yaz</button>
            </div>
        </div>

        <!-- ⚡ Akıllı Dış Bağlantı Ayrıştırıcı (#F8F9FA zemin, #FFFFFF kart, #9E7B3B antik altın aksanlar) -->
        <div class="card" style="background: #FFFFFF; border: 2px solid #9E7B3B; border-radius: 16px; padding: 22px 28px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.15);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(158, 123, 59, 0.12); display: flex; align-items: center; justify-content: center; color: #9E7B3B;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </div>
                    <div>
                        <h3 style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 700; color: #1A1D20; margin: 0;">
                            Akıllı Dış Bağlantı Ayrıştırıcı
                        </h3>
                        <p style="font-size: 12px; color: #64748B; margin: 2px 0 0 0;">
                            VCoins ve benzeri nümizmatik mağazalardan tek tıkla eser bilgilerini ve fotoğraflarını çekip Türkçeleştirin.
                        </p>
                    </div>
                </div>
                <a href="/admin/ai/settings" style="background: #9E7B3B; color: #FFFFFF; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; padding: 5px 14px; border-radius: 20px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: background 0.2s;" onmouseover="this.style.background='#83642D'" onmouseout="this.style.background='#9E7B3B'" title="Gemini API Anahtarını Gir & Yönet">
                    ✨ GEMINI AI AYARLARI ↗
                </a>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                <input type="url" id="import_url" class="form-control" value="" placeholder="https://www.vcoins.com/en/stores/... linkini buraya yapıştırın" style="flex: 1; min-width: 320px; background: #F8F9FA; border-color: rgba(158, 123, 59, 0.4); font-size: 13.5px; padding: 11px 16px;">
                <button type="button" id="btn_fetch_coin" class="btn btn-gold">
                    <span id="fetch_spinner" style="display: none; width: 15px; height: 15px; border: 2px solid #FFF; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></span>
                    <svg id="fetch_icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path></svg>
                    <span id="fetch_btn_text">Eseri Getir & Yapay Zeka ile Çevir</span>
                </button>
            </div>

            <!-- Canlı Çekilen Eser ve Görsel Önizleme Kartı -->
            <div id="fetch_preview_card" style="display: none; margin-top: 18px; padding: 18px 22px; background: #FBF8F2; border: 1.5px solid #9E7B3B; border-radius: 12px; box-shadow: 0 4px 14px rgba(158,123,59,0.08);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="background: #10B981; color: #FFF; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">✓ VERİLER & GÖRSELLER ÇEKİLDİ</span>
                        <span id="preview_card_title" style="font-family: 'Cinzel', serif; font-size: 15.5px; font-weight: 700; color: #1E293B;"></span>
                    </div>
                    <span id="preview_card_badge" style="background: rgba(158,123,59,0.15); color: #9E7B3B; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px;"></span>
                </div>
                <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
                    <!-- Avers & Revers Canlı Görselleri -->
                    <div style="display: flex; gap: 14px; align-items: center;">
                        <div style="text-align: center;">
                            <img id="card_avers_img" src="" alt="Ön Yüz" style="width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 2.5px solid #9E7B3B; background: #FFF; box-shadow: 0 3px 10px rgba(0,0,0,0.12);">
                            <div style="font-size: 10.5px; font-weight: 700; color: #9E7B3B; margin-top: 4px;">ÖN YÜZ (Avers)</div>
                        </div>
                        <div style="text-align: center;">
                            <img id="card_revers_img" src="" alt="Arka Yüz" style="width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 2.5px solid #9E7B3B; background: #FFF; box-shadow: 0 3px 10px rgba(0,0,0,0.12);">
                            <div style="font-size: 10.5px; font-weight: 700; color: #9E7B3B; margin-top: 4px;">ARKA YÜZ (Revers)</div>
                        </div>
                    </div>
                    <!-- Ayrıştırılan Temel Veriler -->
                    <div style="flex: 1; min-width: 280px; font-size: 13.5px; color: #334155; line-height: 1.7;">
                        <div><strong>🏛️ Medeniyet & Hükümdar:</strong> <span id="card_civ_ruler"></span> &bull; <span id="card_rarity_badge" style="background: rgba(158,123,59,0.15); color: #9E7B3B; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 11.5px;"></span></div>
                        <div><strong>⚖️ Maden & Standart:</strong> <span id="card_metal_std"></span> &bull; <span id="card_weight_dia"></span></div>
                        <div><strong>📜 Tarih & Dönem:</strong> <span id="card_years"></span> &bull; <strong>📚 Ref:</strong> <span id="card_reference"></span></div>
                        <div id="card_market_row"><strong>📈 5 Yıllık ROI & Değerleme:</strong> <span id="card_market_metrics"></span></div>
                        <div id="card_hist_preview" style="display: none; margin-top: 6px; padding: 8px 12px; background: #FFFFFF; border-left: 3px solid #9E7B3B; border-radius: 6px; font-size: 12px; color: #475569; font-style: italic;"></div>
                        <div style="color: #059669; font-weight: 600; font-size: 12.5px; margin-top: 6px;">
                            ✨ Eser başlığı, maden, çap, ağırlık, tarihsel arka plan, ön/arka yüz açıklamaları ve fotoğraflar aşağıdaki forma yerleştirildi.
                        </div>
                    </div>
                </div>
            </div>

            <div id="fetch_status_box" style="display: none; margin-top: 14px; padding: 13px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 500;"></div>
        </div>

        <!-- 4 Sekmeli Navigasyon Çubuğu -->
        <div class="tab-nav">
            <button type="button" class="tab-btn active" onclick="switchTab('tab-basic', this)">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Sekme 1: Temel Bilgiler
            </button>
            <button type="button" class="tab-btn" onclick="switchTab('tab-physical', this)">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12"></path><path d="M6 12h12"></path></svg>
                Sekme 2: Fiziksel Veriler
            </button>
            <button type="button" class="tab-btn" onclick="switchTab('tab-images', this)">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Sekme 3: Görseller & Rölyef
            </button>
            <button type="button" class="tab-btn" onclick="switchTab('tab-references', this)">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Sekme 4: Değerleme & Referanslar
            </button>
        </div>

        <form id="coinForm" method="POST" action="/admin/coins" enctype="multipart/form-data">
            <input type="hidden" name="coin_id" id="coin_id" value="<?= htmlspecialchars($coin['id'] ?? '') ?>">
            <input type="hidden" name="avers_image" id="avers_image" value="<?= htmlspecialchars($coin['avers_image'] ?? '') ?>">
            <input type="hidden" name="revers_image" id="revers_image" value="<?= htmlspecialchars($coin['revers_image'] ?? '') ?>">
            <input type="hidden" name="avers_imported_path" id="avers_imported_path" value="">
            <input type="hidden" name="revers_imported_path" id="revers_imported_path" value="">

            <!-- SEKME 1: Temel Bilgiler -->
            <div id="tab-basic" class="tab-pane active">
                <div class="card">
                    <div class="form-grid-2">
                        <div class="form-group">
                            <label class="form-label" for="title">Sikke / Eser Başlığı *</label>
                            <input type="text" name="title" id="title" class="form-control" value="<?= htmlspecialchars(html_entity_decode($coin['title'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?>" placeholder="Örn: Domitian Gümüş Denarius (Minerva Tasvirli)" required>
                            <div class="form-helper">SEO dostu kalıcı bağlantı (slug) otomatik oluşturulur.</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="ruler">Hükümdar / İmparator</label>
                            <input type="text" name="ruler" id="ruler" class="form-control" value="<?= htmlspecialchars(html_entity_decode($coin['ruler'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?>" placeholder="Örn: Domitian, Nero, Augustus">
                        </div>
                    </div>

                    <div class="form-grid-2">
                        <div class="form-group">
                            <label class="form-label" for="civilization_id">Medeniyet & Dönem *</label>
                            <select name="civilization_id" id="civilization_id" class="form-control" required>
                                <option value="">Medeniyet Seçiniz...</option>
                                <?php foreach ($civs as $c): ?>
                                    <option value="<?= $c['id'] ?>" <?= (($coin['civilization_id'] ?? 1) == $c['id']) ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($c['name']) ?> (<?= htmlspecialchars($c['era_period'] ?? '') ?>)
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="mint_id">Antik Darphane</label>
                            <select name="mint_id" id="mint_id" class="form-control">
                                <option value="">Darphane Seçiniz...</option>
                                <?php foreach ($mints as $m): ?>
                                    <option value="<?= $m['id'] ?>" <?= (($coin['mint_id'] ?? '') == $m['id']) ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($m['name']) ?> <?= $m['ancient_name'] ? "({$m['ancient_name']})" : '' ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="form-grid-2">
                        <div class="form-group">
                            <label class="form-label" for="year_start">Başlangıç Yılı</label>
                            <input type="number" name="year_start" id="year_start" class="form-control" value="<?= htmlspecialchars($coin['year_start'] ?? '') ?>" placeholder="81">
                            <div class="form-helper">M.Ö. tarihleri için negatif tam sayı giriniz (Örn: -560).</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="year_end">Bitiş Yılı</label>
                            <input type="number" name="year_end" id="year_end" class="form-control" value="<?= htmlspecialchars($coin['year_end'] ?? '') ?>" placeholder="96">
                        </div>
                    </div>
                </div>
            </div>

            <!-- SEKME 2: Fiziksel Veriler -->
            <div id="tab-physical" class="tab-pane" style="display: none;">
                <div class="card">
                    <div class="form-grid-3">
                        <div class="form-group">
                            <label class="form-label" for="metal_type">Maden Türü & Kısaltma (8 Standart) *</label>
                            <select name="metal_type" id="metal_type" class="form-control" required>
                                <?php 
                                    $numismaticMetals = [
                                        'Altın (AV)'   => 'Altın (AV) - Aurum (veya AU)',
                                        'Gümüş (AR)'   => 'Gümüş (AR) - Argentum (Denarius, Obol, Drahmi vb.)',
                                        'Bronz (AE)'   => 'Bronz / Bakır (AE) - Aes (Æ14, Æ20, Follis vb.)',
                                        'Elektrum (EL)'=> 'Elektrum (EL) - Electrum (Doğal / Yapay Alaşım)',
                                        'Bilyon (BI)'  => 'Bilyon (BI) - Billon (Düşük Ayarlı Gümüş-Bakır)',
                                        'Pirinç (OR)'  => 'Pirinç (OR) - Orichalcum (Sestertius / Dupondius)',
                                        'Kurşun (PB)'  => 'Kurşun (PB) - Plumbum (Mühür, Ağırlık, Jeton)',
                                        'Platin (PT)'  => 'Platin (PT) - Platinum (Nadir / Hatıra Darpları)',
                                    ];
                                    $curM = $coin['metal_type'] ?? 'Gümüş (AR)';
                                    if ($curM === 'Altın (AU)') $curM = 'Altın (AV)';
                                ?>
                                <?php foreach ($numismaticMetals as $mCode => $mTitle): ?>
                                    <option value="<?= $mCode ?>" <?= ($curM === $mCode) ? 'selected' : '' ?>><?= $mTitle ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="standard_name">Birim / Tip Standartı *</label>
                            <input type="text" name="standard_name" id="standard_name" class="form-control" value="<?= htmlspecialchars(html_entity_decode($coin['standard_name'] ?? 'Denarius', ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?>" placeholder="Denarius, Stater, Tetradrahmi" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="die_axis">Kalıp Açısı (Die Axis)</label>
                            <input type="text" name="die_axis" id="die_axis" list="die_axis_list" class="form-control" value="<?= htmlspecialchars($coin['die_axis'] ?? '6h') ?>" placeholder="Örn: 6h">
                            <datalist id="die_axis_list">
                                <option value="12h"><option value="6h"><option value="1h"><option value="2h"><option value="3h"><option value="7h">
                            </datalist>
                        </div>
                    </div>

                    <div class="form-grid-4">
                        <div class="form-group">
                            <label class="form-label" for="weight_grams">Ağırlık (Gram)</label>
                            <input type="number" step="any" name="weight_grams" id="weight_grams" class="form-control" value="<?= htmlspecialchars($coin['weight_grams'] ?? '') ?>" placeholder="3.45">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="diameter_mm">Çap (Milimetre)</label>
                            <input type="number" step="any" name="diameter_mm" id="diameter_mm" class="form-control" value="<?= htmlspecialchars($coin['diameter_mm'] ?? '') ?>" placeholder="19.2">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="condition_grade">Kondisyon Derecesi</label>
                            <select name="condition_grade" id="condition_grade" class="form-control">
                                <?php foreach (['EF' => 'EF / XF (Son Derece Güzel)', 'FDC' => 'FDC (Kusursuz Çil)', 'UNC' => 'UNC (Çil)', 'VF' => 'VF (Çok Güzel)', 'Fine' => 'Fine (Güzel)'] as $ck => $cv): ?>
                                    <option value="<?= $ck ?>" <?= (($coin['condition_grade'] ?? 'EF') === $ck) ? 'selected' : '' ?>><?= $cv ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="rarity_code">Nadirlik Kodu</label>
                            <select name="rarity_code" id="rarity_code" class="form-control">
                                <?php foreach (['C' => 'C (Yaygın)', 'S' => 'S (Kıt)', 'R1' => 'R1 (Nadir)', 'R2' => 'R2 (Çok Nadir)', 'R3' => 'R3 (Son Derece Nadir)', 'Ünik' => 'Ünik (Tek Örnek)'] as $rk => $rv): ?>
                                    <option value="<?= $rk ?>" <?= (($coin['rarity_code'] ?? 'C') === $rk) ? 'selected' : '' ?>><?= $rv ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SEKME 3: Görseller & Rölyef -->
            <div id="tab-images" class="tab-pane" style="display: none;">
                <div class="card">
                    <?php 
                        $placeholderFormSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='130' height='130' viewBox='0 0 130 130'><circle cx='65' cy='65' r='61' fill='%23FBF8F2' stroke='%239E7B3B' stroke-width='3' stroke-dasharray='4 2'/><circle cx='65' cy='65' r='52' fill='none' stroke='%239E7B3B' stroke-width='1.5'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-weight='bold' font-size='18' fill='%239E7B3B'>SİKKE</text><text x='50%' y='64%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748B'>FOTOĞRAF YÜKLE</text></svg>";
                        $avSrc = !empty($coin['avers_image']) 
                            ? (str_starts_with($coin['avers_image'], 'http') ? $coin['avers_image'] : ('/storage/' . ltrim($coin['avers_image'], '/'))) 
                            : $placeholderFormSvg;
                        $rvSrc = !empty($coin['revers_image']) 
                            ? (str_starts_with($coin['revers_image'], 'http') ? $coin['revers_image'] : ('/storage/' . ltrim($coin['revers_image'], '/'))) 
                            : $placeholderFormSvg;
                    ?>
                    <div class="form-grid-2">
                        <!-- Ön Yüz -->
                        <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px;">
                            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--text-dark);">Ön Yüz (Avers / Obverse)</h3>
                            <div class="image-upload-box" onclick="document.getElementById('avers_image_file').click()">
                                <img id="avers-preview" class="preview-circle" src="<?= htmlspecialchars($avSrc) ?>" alt="Ön Yüz" onerror="this.onerror=null; this.src='<?= $placeholderFormSvg ?>';">
                                <div style="font-weight: 600; font-size: 13px; color: var(--gold-primary);">Makro Fotoğraf Yükle</div>
                                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">JPG, PNG veya WebP (Otomatik optimize edilir)</div>
                                <input type="file" name="avers_image_file" id="avers_image_file" accept="image/*" style="display: none;" onchange="previewFile(this, 'avers-preview')">
                            </div>
                            <div class="form-group" style="margin-top: 16px;">
                                <label class="form-label" for="avers_description">Ön Yüz Tasvir & Lejant Metni</label>
                                <textarea name="avers_description" id="avers_description" class="form-control" rows="4" placeholder="Sağa bakan defne çelenkli büst. Lejant: IMP CAES DOMIT AVG GERM P M TR P"><?= htmlspecialchars($coin['avers_description'] ?? '') ?></textarea>
                            </div>
                        </div>

                        <!-- Arka Yüz -->
                        <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px;">
                            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--text-dark);">Arka Yüz (Revers / Reverse)</h3>
                            <div class="image-upload-box" onclick="document.getElementById('revers_image_file').click()">
                                <img id="revers-preview" class="preview-circle" src="<?= htmlspecialchars($rvSrc) ?>" alt="Arka Yüz" onerror="this.onerror=null; this.src='<?= $placeholderFormSvg ?>';">
                                <div style="font-weight: 600; font-size: 13px; color: var(--gold-primary);">Makro Fotoğraf Yükle</div>
                                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">JPG, PNG veya WebP (Otomatik optimize edilir)</div>
                                <input type="file" name="revers_image_file" id="revers_image_file" accept="image/*" style="display: none;" onchange="previewFile(this, 'revers-preview')">
                            </div>
                            <div class="form-group" style="margin-top: 16px;">
                                <label class="form-label" for="revers_description">Arka Yüz Tasvir & Lejant Metni</label>
                                <textarea name="revers_description" id="revers_description" class="form-control" rows="4" placeholder="Minerva ayakta, sağ elinde mızrak ve kalkan. Lejant: IMP XXI COS XVI CENS P P P"><?= htmlspecialchars($coin['revers_description'] ?? '') ?></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tarihsel Arka Plan & Nümismatik Önemi (Gemini Destekli Zengin Alan) -->
                    <div class="form-group" style="margin-top: 22px; padding: 20px; background: #FFFFFF; border: 1.5px solid rgba(158,123,59,0.3); border-radius: 12px; box-shadow: 0 2px 8px rgba(158,123,59,0.05);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                            <label class="form-label" for="historical_context" style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #1E293B;">
                                <span style="color: #9E7B3B; font-size: 16px;">📖</span> Tarihsel Arka Plan & Nümismatik Önemi
                            </label>
                            <span style="background: rgba(158,123,59,0.12); color: #9E7B3B; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px;">
                                ✨ GEMINI AI AKADEMİK ANLATIM
                            </span>
                        </div>
                        <textarea name="historical_context" id="historical_context" class="form-control" rows="5" placeholder="Eserin basıldığı dönemin siyasi ve iktisadi olayları, hükümdarın durumu, tasvir edilen tanrı/sembol ve nümizmatik önemi hakkında akademik Türkçe paragraf..."><?= htmlspecialchars($coin['historical_context'] ?? '') ?></textarea>
                        <div class="form-helper" style="margin-top: 6px;">Mobil uygulamanın detay sayfasındaki "Tarihsel Arka Plan & Nümismatik Önemi" kartında bu açıklama gösterilir.</div>
                    </div>
                </div>
            </div>

            <!-- SEKME 4: Değerleme & Referanslar -->
            <div id="tab-references" class="tab-pane" style="display: none;">
                <div class="card">
                    <div class="form-grid-3">
                        <div class="form-group">
                            <label class="form-label" for="estimated_value_min">Tahmini Taban Fiyat ($)</label>
                            <input type="number" step="any" name="estimated_value_min" id="estimated_value_min" class="form-control" value="<?= htmlspecialchars($coin['estimated_value_min'] ?? '') ?>" placeholder="185">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="estimated_value_max">Tahmini Tavan Fiyat ($)</label>
                            <input type="number" step="any" name="estimated_value_max" id="estimated_value_max" class="form-control" value="<?= htmlspecialchars($coin['estimated_value_max'] ?? '') ?>" placeholder="240">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="currency">Para Birimi</label>
                            <select name="currency" id="currency" class="form-control">
                                <option value="USD" <?= (($coin['currency'] ?? 'USD') === 'USD') ? 'selected' : '' ?>>USD ($)</option>
                                <option value="EUR" <?= (($coin['currency'] ?? '') === 'EUR') ? 'selected' : '' ?>>EUR (€)</option>
                                <option value="TRY" <?= (($coin['currency'] ?? '') === 'TRY') ? 'selected' : '' ?>>TRY (₺)</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-top: 20px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px dashed var(--border-subtle); display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--gold-primary); font-size: 16px;">📈</span>
                        <h3 style="font-size: 14px; font-weight: 700; color: var(--text-dark);">Müzayede Endeksi, Getiri & Likidite Metrikleri</h3>
                    </div>

                    <div class="form-grid-3">
                        <div class="form-group">
                            <label class="form-label" for="roi_5y">5 Yıllık Değer Artışı (ROI %)</label>
                            <input type="text" name="roi_5y" id="roi_5y" class="form-control" value="<?= htmlspecialchars($coin['roi_5y'] ?? '+49%') ?>" placeholder="Örn: +49%">
                            <div class="form-helper">Mobil grafikteki getiri yüzdesi.</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="avg_hammer_price">Ortalama Çekiç Fiyatı ($)</label>
                            <input type="number" step="any" name="avg_hammer_price" id="avg_hammer_price" class="form-control" value="<?= htmlspecialchars($coin['avg_hammer_price'] ?? '') ?>" placeholder="104">
                            <div class="form-helper">Son 5 yıldaki müzayede ortalaması.</div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="liquidity_grade">Likidite Derecesi</label>
                            <select name="liquidity_grade" id="liquidity_grade" class="form-control">
                                <?php foreach (['A+ Üstün', 'A Yüksek', 'B+ Orta', 'B Normal', 'C Düşük'] as $lq): ?>
                                    <option value="<?= $lq ?>" <?= (($coin['liquidity_grade'] ?? 'A+ Üstün') === $lq) ? 'selected' : '' ?>><?= $lq ?></option>
                                <?php endforeach; ?>
                            </select>
                            <div class="form-helper">Piyasadaki alıcı talebi.</div>
                        </div>
                    </div>

                    <div class="form-group" style="margin-top: 16px;">
                        <label class="form-label" for="reference_codes">Standart Nümizmatik Referans Kodları (RIC, BMC, Sear, RPC, Cohen)</label>
                        <input type="text" name="reference_codes" id="reference_codes" class="form-control" value="<?= htmlspecialchars($coin['reference_codes'] ?? '') ?>" placeholder="Örn: RIC: III 1736, Cohen: 21, BMC: 241" style="margin-bottom: 8px;">
                        <textarea name="reference_codes_raw" id="reference_codes_raw" class="form-control" rows="3" placeholder="RIC: III 1736&#10;Cohen: 21&#10;BMCRE: 241"></textarea>
                    </div>

                    <div class="form-group" style="margin-top: 16px;">
                        <label class="form-label" for="academic_source">İlgili Temel Akademik Yayın Künyesi</label>
                        <input type="text" name="academic_source" id="academic_source" class="form-control" value="<?= htmlspecialchars($coin['academic_source'] ?? '') ?>" placeholder="Örn: The Roman Imperial Coinage (RIC): Vol. III - Antoninus Pius to Commodus (Spink & Son)">
                        <div class="form-helper">Mobil detay ekranındaki akademik korpus kartında görüntülenir.</div>
                    </div>

                    <div class="form-grid-2" style="margin-top: 24px;">
                        <div class="toggle-wrapper">
                            <div>
                                <div style="font-weight: 700; font-size: 14px;">Mobil Katalogta Yayınla</div>
                                <div class="form-helper">Expo mobil arama motorunda ve medeniyet ekranlarında listelenir.</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" name="is_published" value="1" <?= (!isset($coin) || $coin['is_published']) ? 'checked' : '' ?>>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="toggle-wrapper">
                            <div>
                                <div style="font-weight: 700; font-size: 14px;">Günün Eseri / Vitrin (Hero)</div>
                                <div class="form-helper">Mobil uygulamanın ana sayfasındaki altın vitrinde öne çıkar.</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" name="is_featured" value="1" <?= (!empty($coin['is_featured'])) ? 'checked' : '' ?>>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </main>

    <script>
        function switchTab(tabId, btn) {
            document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            const target = document.getElementById(tabId);
            if (target) target.style.display = 'block';
            if (btn) btn.classList.add('active');
        }

        function previewFile(input, imgId) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById(imgId).src = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Akıllı Dış Bağlantı Ayrıştırıcı
        async function fetchCoinFromUrl() {
            const urlInput = document.getElementById('import_url');
            const url = urlInput ? urlInput.value.trim() : '';
            const btn = document.getElementById('btn_fetch_coin');
            const btnText = document.getElementById('fetch_btn_text');
            const spinner = document.getElementById('fetch_spinner');
            const icon = document.getElementById('fetch_icon');
            const statusBox = document.getElementById('fetch_status_box');

            if (!url) {
                alert('Lütfen geçerli bir internet adresi (https://www.vcoins.com/...) giriniz.');
                if (urlInput) urlInput.focus();
                return;
            }

            if (btn) btn.disabled = true;
            if (btnText) btnText.innerText = 'Nümizmatik veriler çekiliyor ve Gemini ile Türkçeleştiriliyor...';
            if (spinner) spinner.style.display = 'inline-block';
            if (icon) icon.style.display = 'none';

            if (statusBox) {
                statusBox.style.display = 'block';
                statusBox.style.background = '#EFF6FF';
                statusBox.style.color = '#1E40AF';
                statusBox.style.border = '1px solid #BFDBFE';
                statusBox.innerHTML = '⏳ <strong>Nümizmatik veriler çekiliyor ve Gemini ile Türkçeleştiriliyor...</strong> Lütfen bekleyiniz, fotoğraflar optimize edilip WebP olarak sunucuya indiriliyor.';
            }

            try {
                const response = await fetch('/admin/coins/fetch-from-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ url: url })
                });

                const rawText = await response.text();
                let res;
                try {
                    res = JSON.parse(rawText);
                } catch(parseErr) {
                    throw new Error('Sunucudan geçerli JSON yanıtı alınamadı.');
                }

                if (res.success && res.data) {
                    const d = res.data;

                    // 1. Canlı Önizleme Kartını Doldur ve Göster
                    const previewCard = document.getElementById('fetch_preview_card');
                    if (previewCard) {
                        previewCard.style.display = 'block';
                        document.getElementById('card_avers_img').src = d.avers_image_url || '';
                        document.getElementById('card_revers_img').src = d.revers_image_url || '';
                        document.getElementById('preview_card_title').innerText = d.title || 'Antik Sikke';
                        document.getElementById('preview_card_badge').innerText = d.is_ai_translated ? '✨ GEMINI AI İLE ÇEVRİLDİ' : '🏛️ NÜMİZMATİK KÜTÜPHANE DOĞRULAMASI';
                        document.getElementById('card_civ_ruler').innerText = (d.civilization || 'Bilinmiyor') + (d.mint_name ? ' • Darphane: ' + d.mint_name : '') + (d.ruler ? ' • Hük./Figür: ' + d.ruler : '');
                        
                        const rarityEl = document.getElementById('card_rarity_badge');
                        if (rarityEl) rarityEl.innerText = '⭐ Nadirlik: ' + (d.rarity_code || 'C');

                        document.getElementById('card_metal_std').innerText = (d.metal_type || '') + ' ' + (d.standard_name || '');
                        
                        let physicalParts = [];
                        if (d.weight_grams) physicalParts.push(d.weight_grams + ' gr');
                        if (d.diameter_mm) physicalParts.push(d.diameter_mm + ' mm');
                        if (d.die_axis) physicalParts.push(d.die_axis);
                        document.getElementById('card_weight_dia').innerText = physicalParts.join(' / ');

                        let yearStr = '';
                        if (d.year_start !== null && d.year_start !== undefined) {
                            yearStr += (d.year_start < 0 ? 'M.Ö. ' + Math.abs(d.year_start) : 'M.S. ' + d.year_start);
                        }
                        if (d.year_end !== null && d.year_end !== undefined) {
                            yearStr += ' – ' + (d.year_end < 0 ? 'M.Ö. ' + Math.abs(d.year_end) : 'M.S. ' + d.year_end);
                        }
                        document.getElementById('card_years').innerText = yearStr || 'Dönem Belirtilmedi';

                        const refEl = document.getElementById('card_reference');
                        if (refEl) {
                            if (d.reference_codes) {
                                refEl.innerText = typeof d.reference_codes === 'object'
                                    ? Object.entries(d.reference_codes).map(([k,v]) => `${k} ${v}`).join(', ')
                                    : d.reference_codes;
                            } else {
                                refEl.innerText = 'Tipolojik Kayıt';
                            }
                        }

                        const metricsEl = document.getElementById('card_market_metrics');
                        if (metricsEl) {
                            metricsEl.innerText = (d.roi_5y || '+49%') + ' • Likidite: ' + (d.liquidity_grade || 'A+ Üstün') + ' • Tahmini: $' + (d.estimated_value_min || '120') + ' - $' + (d.estimated_value_max || '160');
                        }

                        const histPrev = document.getElementById('card_hist_preview');
                        if (histPrev) {
                            if (d.historical_context) {
                                histPrev.style.display = 'block';
                                histPrev.innerText = '📖 ' + d.historical_context;
                            } else {
                                histPrev.style.display = 'none';
                            }
                        }
                    }

                    // 2. Form Alanlarını Otomatik Doldur
                    const setVal = (selector, val) => {
                        const el = document.querySelector(selector);
                        if (el && val !== undefined && val !== null) {
                            el.value = val;
                            el.style.borderColor = 'var(--gold-primary)';
                            setTimeout(() => { el.style.borderColor = ''; }, 2500);
                        }
                    };

                    setVal('input[name="title"]', d.title);
                    setVal('input[name="ruler"]', d.ruler);

                    const civSelect = document.querySelector('select[name="civilization_id"]');
                    if (civSelect && d.civilization_id) {
                        civSelect.value = d.civilization_id;
                        civSelect.style.borderColor = 'var(--gold-primary)';
                        setTimeout(() => { civSelect.style.borderColor = ''; }, 2500);
                    }

                    const mintSelect = document.querySelector('select[name="mint_id"]');
                    if (mintSelect && d.mint_id) {
                        mintSelect.value = d.mint_id;
                        mintSelect.style.borderColor = 'var(--gold-primary)';
                        setTimeout(() => { mintSelect.style.borderColor = ''; }, 2500);
                    }

                    const metalSelect = document.querySelector('select[name="metal_type"]');
                    if (metalSelect && d.metal_type) {
                        let target = d.metal_type.trim();
                        if (target.includes('AU')) target = 'Altın (AV)';
                        let matched = false;
                        for (let opt of metalSelect.options) {
                            if (opt.value === target || opt.value.toLowerCase() === target.toLowerCase()) {
                                metalSelect.value = opt.value;
                                matched = true;
                                break;
                            }
                        }
                        if (!matched) {
                            // Kısaltmaya göre eşle (AR, AV, AE, EL, BI, PB, OR, PT)
                            const codeMap = [
                                { k: 'AR', opt: 'Gümüş (AR)' },
                                { k: 'AV', opt: 'Altın (AV)' },
                                { k: 'AU', opt: 'Altın (AV)' },
                                { k: 'AE', opt: 'Bronz (AE)' },
                                { k: 'EL', opt: 'Elektrum (EL)' },
                                { k: 'BI', opt: 'Bilyon (BI)' },
                                { k: 'PB', opt: 'Kurşun (PB)' },
                                { k: 'OR', opt: 'Pirinç (OR)' },
                                { k: 'PT', opt: 'Platin (PT)' },
                            ];
                            for (let cm of codeMap) {
                                if (target.toUpperCase().includes(cm.k) || target.toLowerCase().includes(cm.opt.split(' ')[0].toLowerCase())) {
                                    for (let opt of metalSelect.options) {
                                        if (opt.value.includes(cm.k) || opt.value === cm.opt) {
                                            metalSelect.value = opt.value;
                                            matched = true;
                                            break;
                                        }
                                    }
                                    if (matched) break;
                                }
                            }
                        }
                        metalSelect.style.borderColor = 'var(--gold-primary)';
                        setTimeout(() => { metalSelect.style.borderColor = ''; }, 2500);
                    }

                    setVal('input[name="standard_name"]', d.standard_name);
                    setVal('input[name="weight_grams"]', d.weight_grams);
                    setVal('input[name="diameter_mm"]', d.diameter_mm);
                    setVal('input[name="die_axis"]', d.die_axis);
                    setVal('input[name="year_start"]', d.year_start);
                    setVal('input[name="year_end"]', d.year_end);

                    const condSelect = document.querySelector('select[name="condition_grade"]');
                    if (condSelect && d.condition_grade) {
                        for (let opt of condSelect.options) {
                            if (opt.value.toUpperCase() === d.condition_grade.toUpperCase() || opt.value.toUpperCase().startsWith(d.condition_grade.toUpperCase())) {
                                condSelect.value = opt.value;
                                break;
                            }
                        }
                    }

                    const raritySelect = document.querySelector('select[name="rarity_code"]');
                    if (raritySelect && d.rarity_code) {
                        for (let opt of raritySelect.options) {
                            if (opt.value.toUpperCase() === d.rarity_code.toUpperCase() || opt.value.toUpperCase().startsWith(d.rarity_code.toUpperCase())) {
                                raritySelect.value = opt.value;
                                break;
                            }
                        }
                    }

                    setVal('textarea[name="avers_description"]', d.avers_description);
                    setVal('textarea[name="revers_description"]', d.revers_description);
                    setVal('textarea[name="historical_context"]', d.historical_context);
                    const histDirect = document.getElementById('historical_context');
                    if (histDirect && d.historical_context) {
                        histDirect.value = d.historical_context;
                        histDirect.style.borderColor = 'var(--gold-primary)';
                    }

                    if (d.reference_codes) {
                        const refStr = typeof d.reference_codes === 'object' 
                            ? Object.entries(d.reference_codes).map(([k,v]) => `${k}: ${v}`).join(', ')
                            : d.reference_codes;
                        setVal('input[name="reference_codes"]', refStr);
                        setVal('textarea[name="reference_codes_raw"]', refStr.replace(/, /g, '\n'));
                    }

                    setVal('input[name="roi_5y"]', d.roi_5y);
                    setVal('input[name="avg_hammer_price"]', d.avg_hammer_price ? Math.round(d.avg_hammer_price) : (d.estimated_value_min ? Math.round(d.estimated_value_min * 0.95) : ''));
                    
                    const liqSelect = document.querySelector('select[name="liquidity_grade"]');
                    if (liqSelect && d.liquidity_grade) {
                        for (let opt of liqSelect.options) {
                            if (opt.value.toLowerCase().includes(d.liquidity_grade.toLowerCase())) {
                                liqSelect.value = opt.value;
                                break;
                            }
                        }
                    }

                    setVal('input[name="academic_source"]', d.academic_source);
                    setVal('input[name="estimated_value_min"]', d.estimated_value_min ? Math.round(d.estimated_value_min) : '');
                    setVal('input[name="estimated_value_max"]', d.estimated_value_max ? Math.round(d.estimated_value_max) : '');

                    // 3. Sekme 3 Görsellerini Canlı Güncelle
                    if (d.avers_image_url) {
                        const avEl = document.getElementById('avers-preview');
                        if (avEl) avEl.src = d.avers_image_url;
                        const avHidden = document.getElementById('avers_imported_path');
                        if (avHidden) avHidden.value = d.avers_image_path;
                    }
                    if (d.revers_image_url) {
                        const rvEl = document.getElementById('revers-preview');
                        if (rvEl) rvEl.src = d.revers_image_url;
                        const rvHidden = document.getElementById('revers_imported_path');
                        if (rvHidden) rvHidden.value = d.revers_image_path;
                    }

                    // 4. Yeşil Başarı Bildirimi
                    statusBox.style.background = '#ECFDF5';
                    statusBox.style.color = '#065F46';
                    statusBox.style.border = '1px solid #10B981';
                    statusBox.innerHTML = '✨ <strong>1 Eser başarıyla analiz edildi, Türkçeye çevrildi ve form dolduruldu. Lütfen alanları kontrol edip Kaydet\'e basın.</strong>';
                } else {
                    throw new Error(res.message || 'Veriler alınamadı.');
                }
            } catch (err) {
                statusBox.style.background = '#FEF2F2';
                statusBox.style.color = '#991B1B';
                statusBox.style.border = '1px solid #EF4444';
                statusBox.innerHTML = '❌ <strong>Hata:</strong> ' + (err.message || 'Bir hata oluştu.');
            } finally {
                btn.disabled = false;
                btnText.innerText = 'Eseri Getir & Yapay Zeka ile Çevir';
                spinner.style.display = 'none';
                icon.style.display = 'inline-block';
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const btn = document.getElementById('btn_fetch_coin');
            if (btn) btn.addEventListener('click', fetchCoinFromUrl);

            // Virgüllü giriş yapıldığında (ör. 118,8) MySQL ve HTML5 validasyonunun takılmaması için otomatik noktaya çevir
            const coinFormEl = document.getElementById('coinForm');
            if (coinFormEl) {
                const numFields = ['estimated_value_min', 'estimated_value_max', 'avg_hammer_price', 'weight_grams', 'diameter_mm'];
                
                numFields.forEach(function(fieldName) {
                    const inp = document.querySelector('input[name="' + fieldName + '"]');
                    if (inp) {
                        inp.addEventListener('input', function() {
                            if (this.value && this.value.includes(',')) {
                                this.value = this.value.replace(',', '.');
                            }
                        });
                    }
                });

                coinFormEl.addEventListener('submit', function() {
                    numFields.forEach(function(fieldName) {
                        const inp = document.querySelector('input[name="' + fieldName + '"]');
                        if (inp && inp.value) {
                            inp.value = inp.value.toString().trim().replace(',', '.');
                        }
                    });
                });
            }
        });
    </script>
</body>
</html>

