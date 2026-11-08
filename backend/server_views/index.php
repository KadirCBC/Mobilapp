<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sikkeler & Eser Kataloğu | Sikkelobedi Admin (localhost:8000)</title>
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

        .admin-main { max-width: 1340px; margin: 0 auto; padding: 32px 24px 60px 24px; }
        
        .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .page-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; color: var(--text-dark); }
        .page-subtitle { font-size: 13.5px; color: var(--text-muted); margin-top: 3px; }

        .filter-card {
            background: #FFFFFF; border-radius: 12px; border: 1px solid var(--border-subtle);
            padding: 16px 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
        }
        .filter-input {
            padding: 10px 14px; border: 1.5px solid var(--border-subtle); border-radius: 8px;
            font-size: 13.5px; color: var(--text-dark); background: #FFFFFF; outline: none;
        }
        .filter-input:focus { border-color: var(--gold-primary); }

        .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 10px 20px; border-radius: 8px; font-size: 13.5px; font-weight: 700;
            cursor: pointer; border: 1.5px solid transparent; text-decoration: none; transition: all 0.2s;
        }
        .btn-gold { background: var(--gold-primary); color: #FFFFFF; border-color: var(--gold-primary); }
        .btn-gold:hover { background: var(--gold-hover); }
        .btn-outline { background: #FFFFFF; color: var(--text-dark); border-color: var(--border-subtle); }
        .btn-outline:hover { border-color: var(--gold-primary); color: var(--gold-primary); }
        .btn-danger {
            background: #FEE2E2; color: #DC2626; border-color: #FCA5A5;
        }
        .btn-danger:hover {
            background: #DC2626; color: #FFFFFF; border-color: #DC2626;
        }

        /* Toplu Seçim ve İşlem Barı */
        .bulk-bar {
            display: none;
            background: #FFF7ED;
            border: 1.5px solid #FDBA74;
            border-radius: 12px;
            padding: 14px 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 14px rgba(234, 88, 12, 0.08);
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            animation: slideDown 0.25s ease-out;
        }
        .bulk-bar.visible { display: flex; }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .checkbox-custom {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--gold-primary);
            border-radius: 4px;
            vertical-align: middle;
        }
        tr.selected-row {
            background-color: #FEF3C7 !important;
        }

        .table-card {
            background: #FFFFFF; border-radius: 14px; border: 1px solid var(--border-subtle);
            box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.05); overflow: hidden;
        }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th {
            background: #F8FAFC; padding: 14px 16px; font-size: 12px; font-weight: 700;
            color: var(--text-muted); border-bottom: 1px solid var(--border-subtle);
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        .data-table td { padding: 14px 16px; font-size: 13.5px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
        .data-table tr:hover { background-color: #FBF8F2; }

        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .badge-gold { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
        .badge-silver { background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; }
        .badge-bronze { background: #FFEDD5; color: #9A3412; border: 1px solid #FED7AA; }
        .badge-electrum { background: #FEF9C3; color: #854D0E; border: 1px solid #FACC15; }
        .badge-billon { background: #E2E8F0; color: #334155; border: 1px solid #94A3B8; }
        .badge-brass { background: #FDF4E7; color: #B45309; border: 1px solid #FCD34D; }
        .badge-lead { background: #E5E7EB; color: #374151; border: 1px solid #9CA3AF; }
        .badge-plat { background: #F0FDF4; color: #166534; border: 1px solid #86EFAC; }

        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
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
        input:checked + .slider:before { transform: translateX(20px); }
    </style>
</head>
<body>

    <?php include __DIR__ . '/nav.php'; ?>

    <main class="admin-main">
        <?php if (isset($_GET['success'])): ?>
            <div style="background: #ECFDF5; border: 1px solid #10B981; color: #065F46; padding: 14px 20px; border-radius: 10px; margin-bottom: 24px; font-weight: 600;">
                ✨ Eser başarıyla MySQL veritabanına kaydedildi ve yayına alındı!
            </div>
        <?php endif; ?>

        <?php if (isset($_GET['deleted'])): ?>
            <div style="background: #FEE2E2; border: 1px solid #EF4444; color: #991B1B; padding: 14px 20px; border-radius: 10px; margin-bottom: 24px; font-weight: 600;">
                🗑️ Sikke başarıyla MySQL veritabanından silindi.
            </div>
        <?php endif; ?>

        <?php if (isset($_GET['bulk_deleted'])): ?>
            <div style="background: #FEE2E2; border: 1px solid #EF4444; color: #991B1B; padding: 14px 20px; border-radius: 10px; margin-bottom: 24px; font-weight: 600;">
                🗑️ Seçilen <?= (int)$_GET['bulk_deleted'] ?> adet sikke başarıyla MySQL veritabanından silindi.
            </div>
        <?php endif; ?>

        <div class="page-header">
            <div>
                <h1 class="page-title">Sikke & Eser Kataloğu</h1>
                <p class="page-subtitle">XAMPP MySQL `numismatics.coins` tablosundan canlı listelenen <strong id="totalCoinsCount"><?= count($coins) ?></strong> eser.</p>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button type="button" onclick="selectAllCoins(true)" class="btn btn-outline" style="font-size: 13px;">
                    ☑️ Tümünü Seç
                </button>
                <a href="/admin/coins/create" class="btn btn-gold">+ Yeni Sikke Ekle</a>
            </div>
        </div>

        <form method="GET" action="/admin/coins" class="filter-card">
            <input type="text" name="q" value="<?= htmlspecialchars($_GET['q'] ?? '') ?>" placeholder="Sikke başlığı veya hükümdar ara..." class="filter-input" style="flex: 1; min-width: 250px;">
            <select name="metal" class="filter-input">
                <option value="">Tüm Madenler</option>
                <option value="Altın" <?= (stripos($_GET['metal'] ?? '', 'Altın') !== false || ($_GET['metal'] ?? '') === 'AV' || ($_GET['metal'] ?? '') === 'AU') ? 'selected' : '' ?>>Altın (AV / AU)</option>
                <option value="Gümüş" <?= (stripos($_GET['metal'] ?? '', 'Gümüş') !== false || ($_GET['metal'] ?? '') === 'AR') ? 'selected' : '' ?>>Gümüş (AR)</option>
                <option value="Bronz" <?= (stripos($_GET['metal'] ?? '', 'Bronz') !== false || ($_GET['metal'] ?? '') === 'AE') ? 'selected' : '' ?>>Bronz (AE)</option>
                <option value="Elektrum" <?= (stripos($_GET['metal'] ?? '', 'Elektrum') !== false || ($_GET['metal'] ?? '') === 'EL') ? 'selected' : '' ?>>Elektrum (EL)</option>
                <option value="Bilyon" <?= (stripos($_GET['metal'] ?? '', 'Bilyon') !== false || ($_GET['metal'] ?? '') === 'BI') ? 'selected' : '' ?>>Bilyon (BI)</option>
                <option value="Pirinç" <?= (stripos($_GET['metal'] ?? '', 'Pirinç') !== false || ($_GET['metal'] ?? '') === 'OR') ? 'selected' : '' ?>>Pirinç (OR)</option>
                <option value="Kurşun" <?= (stripos($_GET['metal'] ?? '', 'Kurşun') !== false || ($_GET['metal'] ?? '') === 'PB') ? 'selected' : '' ?>>Kurşun (PB)</option>
                <option value="Platin" <?= (stripos($_GET['metal'] ?? '', 'Platin') !== false || ($_GET['metal'] ?? '') === 'PT') ? 'selected' : '' ?>>Platin (PT)</option>
            </select>
            <select name="civilization_id" class="filter-input">
                <option value="">Tüm Medeniyetler</option>
                <?php foreach ($civs as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= ((int)($_GET['civilization_id'] ?? 0) === (int)$c['id']) ? 'selected' : '' ?>><?= htmlspecialchars($c['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <button type="submit" class="btn btn-gold">Filtrele</button>
            <?php if (!empty($_GET['q']) || !empty($_GET['metal']) || !empty($_GET['civilization_id'])): ?>
                <a href="/admin/coins" class="btn btn-outline">Temizle</a>
            <?php endif; ?>
        </form>

        <!-- TOPLU İŞLEM BARI (En az 1 sikke seçildiğinde görünür) -->
        <div id="bulkBar" class="bulk-bar">
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                <span style="font-size: 14px; font-weight: 700; color: #9A3412;">
                    ⚡ <span id="selectedCount">0</span> eser seçildi
                </span>
                <button type="button" onclick="selectAllCoins(true)" style="background: none; border: none; color: var(--gold-primary); font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: underline;">
                    Tümünü Seç
                </button>
                <button type="button" onclick="selectAllCoins(false)" style="background: none; border: none; color: var(--text-muted); font-size: 13px; cursor: pointer; text-decoration: underline;">
                    Seçimi Temizle
                </button>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button type="button" onclick="executeBulkDelete()" class="btn btn-danger" style="background: #DC2626; color: #FFFFFF; border-color: #DC2626; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);">
                    🗑️ Seçilenleri Sil (<span id="deleteBtnCount">0</span>)
                </button>
            </div>
        </div>

        <div class="table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 44px; text-align: center;">
                            <input type="checkbox" id="headerCheckbox" class="checkbox-custom" title="Tümünü Seç / Kaldır" onchange="toggleHeaderCheckbox(this)">
                        </th>
                        <th>Görsel</th>
                        <th>Sikke Başlığı & Hükümdar</th>
                        <th>Medeniyet / Darphane</th>
                        <th>Maden & Tip</th>
                        <th>Gram / Çap</th>
                        <th>Fiyat Aralığı</th>
                        <th>Yayın</th>
                        <th style="text-align: center;">İşlem</th>
                    </tr>
                </thead>
                <tbody id="coinsTableBody">
                    <?php if (empty($coins)): ?>
                        <tr id="emptyRow">
                            <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                                Eşleşen sikke bulunamadı. <a href="/admin/coins/create" style="color: var(--gold-primary); font-weight: 700;">Buradan yeni ekleyebilirsiniz</a>.
                            </td>
                        </tr>
                    <?php endif; ?>
                    <?php foreach ($coins as $item): ?>
                        <tr id="coinRow-<?= $item['id'] ?>">
                            <td style="text-align: center;">
                                <input type="checkbox" class="coin-checkbox checkbox-custom" value="<?= $item['id'] ?>" onchange="onCoinCheckboxChange(this)">
                            </td>
                            <td>
                                <?php 
                                    $placeholderSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='40' cy='40' r='38' fill='%23FBF8F2' stroke='%239E7B3B' stroke-width='2' stroke-dasharray='3 2'/><circle cx='40' cy='40' r='32' fill='none' stroke='%239E7B3B' stroke-width='1'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-weight='bold' font-size='12' fill='%239E7B3B'>SİKKE</text><text x='50%' y='64%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='8' fill='%2364748B'>ANTİK</text></svg>";
                                    $aversUrl = !empty($item['avers_image']) 
                                        ? (str_starts_with($item['avers_image'], 'http') ? $item['avers_image'] : ('/storage/' . ltrim($item['avers_image'], '/'))) 
                                        : $placeholderSvg;
                                    $reversUrl = !empty($item['revers_image']) 
                                        ? (str_starts_with($item['revers_image'], 'http') ? $item['revers_image'] : ('/storage/' . ltrim($item['revers_image'], '/'))) 
                                        : $placeholderSvg;
                                    $isSameImage = ($aversUrl === $reversUrl && $aversUrl !== $placeholderSvg);
                                ?>
                                <div style="display: flex; gap: 6px;" title="<?= $isSameImage ? 'Çift yüzlü panoramik görsel otomatik ön/arka olarak ayrıştırıldı' : 'Ön ve Arka Yüzler' ?>">
                                    <div style="width: 42px; height: 42px; border-radius: 50%; overflow: hidden; border: 1.5px solid var(--gold-primary); background: #1a1d20; position: relative;">
                                        <img src="<?= htmlspecialchars($aversUrl) ?>" 
                                             style="width: 100%; height: 100%; object-fit: cover; object-position: <?= $isSameImage ? '0% 50%' : 'center' ?>;" 
                                             alt="Ön Yüz (Avers)" 
                                             onerror="this.onerror=null; this.src='<?= $placeholderSvg ?>';">
                                    </div>
                                    <div style="width: 42px; height: 42px; border-radius: 50%; overflow: hidden; border: 1.5px solid var(--gold-primary); background: #1a1d20; position: relative;">
                                        <img src="<?= htmlspecialchars($reversUrl) ?>" 
                                             style="width: 100%; height: 100%; object-fit: cover; object-position: <?= $isSameImage ? '100% 50%' : 'center' ?>;" 
                                             alt="Arka Yüz (Revers)" 
                                             onerror="this.onerror=null; this.src='<?= $placeholderSvg ?>';">
                                    </div>
                                </div>
                            </td>
                            <td>
                                <?php
                                    $displayTitle = html_entity_decode((string)($item['title'] ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                                    $displayRuler = html_entity_decode((string)($item['ruler'] ?? '-'), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                                    // AU → AV normalizasyonu (başlıkta)
                                    $displayTitle = str_replace(['Altın (AU)', 'AV Aureus'], ['Altın (AV)', 'AV Aureus'], $displayTitle);
                                ?>
                                <strong style="font-size: 14px; color: var(--text-dark);"><?= htmlspecialchars($displayTitle) ?></strong>
                                <div style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($displayRuler) ?> (<?= $item['year_start'] ?> / <?= $item['year_end'] ?>)</div>
                            </td>
                            <td>
                                <span style="font-weight: 600;"><?= htmlspecialchars($item['civilization_name'] ?? 'Bilinmeyen') ?></span>
                                <div style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($item['mint_name'] ?? '-') ?></div>
                            </td>
                            <td>
                                <?php 
                                    $bClass = 'badge-silver';
                                    $mt = $item['metal_type'];
                                    // AU → AV normalizasyonu (ekranda gösterim)
                                    $mtDisplay = str_replace('Altın (AU)', 'Altın (AV)', $mt);
                                    if (str_contains($mt, 'Altın') || str_contains($mt, 'AV') || str_contains($mt, 'AU')) $bClass = 'badge-gold';
                                    elseif (str_contains($mt, 'Gümüş') || str_contains($mt, 'AR')) $bClass = 'badge-silver';
                                    elseif (str_contains($mt, 'Bronz') || str_contains($mt, 'AE') || str_contains($mt, 'Bakır')) $bClass = 'badge-bronze';
                                    elseif (str_contains($mt, 'Elektrum') || str_contains($mt, 'EL')) $bClass = 'badge-electrum';
                                    elseif (str_contains($mt, 'Bilyon') || str_contains($mt, 'BI')) $bClass = 'badge-billon';
                                    elseif (str_contains($mt, 'Pirinç') || str_contains($mt, 'OR')) $bClass = 'badge-brass';
                                    elseif (str_contains($mt, 'Kurşun') || str_contains($mt, 'PB')) $bClass = 'badge-lead';
                                    elseif (str_contains($mt, 'Platin') || str_contains($mt, 'PT')) $bClass = 'badge-plat';
                                ?>
                                <span class="badge <?= $bClass ?>"><?= htmlspecialchars($mtDisplay) ?></span>
                                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;"><?= htmlspecialchars(html_entity_decode((string)($item['standard_name'] ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?></div>
                            </td>
                            <td><?= $item['weight_grams'] ? $item['weight_grams'] . ' gr' : '-' ?> / <?= $item['diameter_mm'] ? $item['diameter_mm'] . ' mm' : '-' ?></td>
                            <td>
                                <strong style="color: var(--gold-primary);">
                                    $<?= number_format((float)($item['estimated_value_min'] ?? 0), 0) ?> - $<?= number_format((float)($item['estimated_value_max'] ?? 0), 0) ?>
                                </strong>
                            </td>
                            <td>
                                <label class="switch">
                                    <input type="checkbox" <?= $item['is_published'] ? 'checked' : '' ?> onchange="togglePublish(<?= $item['id'] ?>, this)">
                                    <span class="slider"></span>
                                </label>
                            </td>
                            <td style="text-align: center; white-space: nowrap;">
                                <div style="display: flex; gap: 6px; align-items: center; justify-content: center;">
                                    <a href="/admin/coins/<?= $item['id'] ?>/edit" class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;">Düzenle</a>
                                    <button type="button" onclick="deleteSingleCoin(<?= $item['id'] ?>, '<?= htmlspecialchars(addslashes($item['title'])) ?>', this)" class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;">Sil</button>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <script>
        // Yayın Durumu Değiştirme
        async function togglePublish(coinId, cb) {
            try {
                const res = await fetch(`/admin/coins/${coinId}/toggle-published`, { method: 'POST' });
                const json = await res.json();
                if (!json.success) {
                    cb.checked = !cb.checked;
                    alert('Durum güncellenemedi.');
                }
            } catch (e) {
                cb.checked = !cb.checked;
                alert('Hata oluştu.');
            }
        }

        // Başlık Checkbox: Tümünü Seç / Temizle
        function toggleHeaderCheckbox(headerCb) {
            selectAllCoins(headerCb.checked);
        }

        // Tüm Sikkeleri Seç / Kaldır
        function selectAllCoins(state) {
            const checkboxes = document.querySelectorAll('.coin-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = state;
                const row = cb.closest('tr');
                if (row) {
                    if (state) row.classList.add('selected-row');
                    else row.classList.remove('selected-row');
                }
            });
            const headerCb = document.getElementById('headerCheckbox');
            if (headerCb) headerCb.checked = state;
            updateBulkBar();
        }

        // Tekil Satır Checkbox Değiştiğinde
        function onCoinCheckboxChange(cb) {
            const row = cb.closest('tr');
            if (row) {
                if (cb.checked) row.classList.add('selected-row');
                else row.classList.remove('selected-row');
            }
            updateBulkBar();
        }

        // Toplu İşlem Barını ve Sayacı Güncelle
        function updateBulkBar() {
            const checkedBoxes = document.querySelectorAll('.coin-checkbox:checked');
            const totalBoxes = document.querySelectorAll('.coin-checkbox');
            const count = checkedBoxes.length;

            const bulkBar = document.getElementById('bulkBar');
            const selectedCountSpan = document.getElementById('selectedCount');
            const deleteBtnCountSpan = document.getElementById('deleteBtnCount');
            const headerCb = document.getElementById('headerCheckbox');

            if (selectedCountSpan) selectedCountSpan.textContent = count;
            if (deleteBtnCountSpan) deleteBtnCountSpan.textContent = count;

            if (bulkBar) {
                if (count > 0) {
                    bulkBar.classList.add('visible');
                } else {
                    bulkBar.classList.remove('visible');
                }
            }

            if (headerCb) {
                headerCb.checked = (totalBoxes.length > 0 && count === totalBoxes.length);
                headerCb.indeterminate = (count > 0 && count < totalBoxes.length);
            }
        }

        // Tekil Sikke Silme (Onaylı & Canlı)
        async function deleteSingleCoin(coinId, title, btn) {
            if (!confirm(`"${title}" adlı sikkeyi MySQL veritabanından kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) {
                return;
            }

            const row = document.getElementById(`coinRow-${coinId}`);
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Siliniyor...';
            }

            try {
                const res = await fetch(`/admin/coins/${coinId}/delete`, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' }
                });
                const json = await res.json().catch(() => ({ success: true }));

                if (json.success !== false) {
                    if (row) {
                        row.style.transition = 'all 0.3s ease';
                        row.style.opacity = '0';
                        row.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            row.remove();
                            decrementTotalCount(1);
                            updateBulkBar();
                            checkEmptyState();
                        }, 300);
                    }
                } else {
                    alert(json.message || 'Sikke silinemedi.');
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = 'Sil';
                    }
                }
            } catch (err) {
                alert('Silme işlemi sırasında sunucu hatası oluştu.');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Sil';
                }
            }
        }

        // Toplu Sikke Silme (Onaylı & Canlı)
        async function executeBulkDelete() {
            const checkedBoxes = Array.from(document.querySelectorAll('.coin-checkbox:checked'));
            const ids = checkedBoxes.map(cb => parseInt(cb.value)).filter(id => !isNaN(id) && id > 0);

            if (ids.length === 0) {
                alert('Lütfen silmek istediğiniz sikkeleri soldaki kutucuklardan seçin.');
                return;
            }

            if (!confirm(`Seçtiğiniz ${ids.length} adet sikkeyi MySQL veritabanından KALICI OLARAK silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`)) {
                return;
            }

            const bulkBar = document.getElementById('bulkBar');
            if (bulkBar) {
                bulkBar.style.opacity = '0.5';
                bulkBar.style.pointerEvents = 'none';
            }

            try {
                const res = await fetch('/admin/coins/bulk-delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ ids: ids })
                });
                const json = await res.json();

                if (json.success) {
                    ids.forEach(id => {
                        const row = document.getElementById(`coinRow-${id}`);
                        if (row) {
                            row.style.transition = 'all 0.3s ease';
                            row.style.opacity = '0';
                            row.style.transform = 'scale(0.95)';
                            setTimeout(() => row.remove(), 300);
                        }
                    });

                    setTimeout(() => {
                        decrementTotalCount(ids.length);
                        updateBulkBar();
                        checkEmptyState();
                        if (bulkBar) {
                            bulkBar.style.opacity = '1';
                            bulkBar.style.pointerEvents = 'auto';
                        }
                    }, 350);
                } else {
                    alert(json.message || 'Toplu silme başarısız oldu.');
                    if (bulkBar) {
                        bulkBar.style.opacity = '1';
                        bulkBar.style.pointerEvents = 'auto';
                    }
                }
            } catch (err) {
                alert('Toplu silme sırasında bir sunucu hatası oluştu.');
                if (bulkBar) {
                    bulkBar.style.opacity = '1';
                    bulkBar.style.pointerEvents = 'auto';
                }
            }
        }

        // Toplam Sayacı Azaltma
        function decrementTotalCount(amount) {
            const totalSpan = document.getElementById('totalCoinsCount');
            if (totalSpan) {
                const current = parseInt(totalSpan.textContent) || 0;
                totalSpan.textContent = Math.max(0, current - amount);
            }
        }

        // Tablo Boş Kaldıysa Uyarı Gösterme
        function checkEmptyState() {
            const remainingRows = document.querySelectorAll('#coinsTableBody tr:not(#emptyRow)');
            if (remainingRows.length === 0) {
                const tbody = document.getElementById('coinsTableBody');
                if (tbody) {
                    tbody.innerHTML = `
                        <tr id="emptyRow">
                            <td colspan="9" style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
                                🗑️ Tüm seçilen demo sikkeler başarıyla temizlendi. Veritabanında sikke kalmadı.<br>
                                <a href="/admin/coins/create" class="btn btn-gold" style="margin-top: 14px;">+ Yeni Sikke Ekle</a>
                            </td>
                        </tr>
                    `;
                }
            }
        }
    </script>
</body>
</html>