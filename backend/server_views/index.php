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
            padding: 16px 20px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
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

        .table-card {
            background: #FFFFFF; border-radius: 14px; border: 1px solid var(--border-subtle);
            box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.05); overflow: hidden;
        }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th {
            background: #F8FAFC; padding: 14px 18px; font-size: 12px; font-weight: 700;
            color: var(--text-muted); border-bottom: 1px solid var(--border-subtle);
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        .data-table td { padding: 14px 18px; font-size: 13.5px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
        .data-table tr:hover { background-color: #FBF8F2; }

        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .badge-gold { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
        .badge-silver { background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0; }
        .badge-bronze { background: #FFEDD5; color: #9A3412; border: 1px solid #FED7AA; }

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

        <div class="page-header">
            <div>
                <h1 class="page-title">Sikke & Eser Kataloğu</h1>
                <p class="page-subtitle">XAMPP MySQL `numismatics.coins` tablosundan canlı listelenen <?= count($coins) ?> eser.</p>
            </div>
            <a href="/admin/coins/create" class="btn btn-gold">+ Yeni Sikke Ekle</a>
        </div>

        <form method="GET" action="/admin/coins" class="filter-card">
            <input type="text" name="q" value="<?= htmlspecialchars($_GET['q'] ?? '') ?>" placeholder="Sikke başlığı veya hükümdar ara..." class="filter-input" style="flex: 1; min-width: 250px;">
            <select name="metal" class="filter-input">
                <option value="">Tüm Madenler</option>
                <option value="Altın (AU)" <?= ($_GET['metal'] ?? '') === 'Altın (AU)' ? 'selected' : '' ?>>Altın (AU)</option>
                <option value="Gümüş (AR)" <?= ($_GET['metal'] ?? '') === 'Gümüş (AR)' ? 'selected' : '' ?>>Gümüş (AR)</option>
                <option value="Bronz (AE)" <?= ($_GET['metal'] ?? '') === 'Bronz (AE)' ? 'selected' : '' ?>>Bronz (AE)</option>
                <option value="Elektrum (EL)" <?= ($_GET['metal'] ?? '') === 'Elektrum (EL)' ? 'selected' : '' ?>>Elektrum (EL)</option>
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

        <div class="table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Görsel</th>
                        <th>Sikke Başlığı & Hükümdar</th>
                        <th>Medeniyet / Darphane</th>
                        <th>Maden & Tip</th>
                        <th>Gram / Çap</th>
                        <th>Fiyat Aralığı</th>
                        <th>Yayın</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($coins)): ?>
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                                Eşleşen sikke bulunamadı. <a href="/admin/coins/create" style="color: var(--gold-primary); font-weight: 700;">Buradan yeni ekleyebilirsiniz</a>.
                            </td>
                        </tr>
                    <?php endif; ?>
                    <?php foreach ($coins as $item): ?>
                        <tr>
                            <td>
                                <?php 
                                    $placeholderSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='40' cy='40' r='38' fill='%23FBF8F2' stroke='%239E7B3B' stroke-width='2' stroke-dasharray='3 2'/><circle cx='40' cy='40' r='32' fill='none' stroke='%239E7B3B' stroke-width='1'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-weight='bold' font-size='12' fill='%239E7B3B'>SİKKE</text><text x='50%' y='64%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='8' fill='%2364748B'>ANTİK</text></svg>";
                                    $aversUrl = !empty($item['avers_image']) 
                                        ? (str_starts_with($item['avers_image'], 'http') ? $item['avers_image'] : ('/storage/' . ltrim($item['avers_image'], '/'))) 
                                        : $placeholderSvg;
                                    $reversUrl = !empty($item['revers_image']) 
                                        ? (str_starts_with($item['revers_image'], 'http') ? $item['revers_image'] : ('/storage/' . ltrim($item['revers_image'], '/'))) 
                                        : $placeholderSvg;
                                ?>
                                <div style="display: flex; gap: 6px;">
                                    <img src="<?= htmlspecialchars($aversUrl) ?>" 
                                         style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--gold-primary);" 
                                         alt="Avers" 
                                         onerror="this.onerror=null; this.src='<?= $placeholderSvg ?>';">
                                    <img src="<?= htmlspecialchars($reversUrl) ?>" 
                                         style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--gold-primary);" 
                                         alt="Revers" 
                                         onerror="this.onerror=null; this.src='<?= $placeholderSvg ?>';">
                                </div>
                            </td>
                            <td>
                                <strong style="font-size: 14px; color: var(--text-dark);"><?= htmlspecialchars($item['title']) ?></strong>
                                <div style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($item['ruler'] ?? '-') ?> (<?= $item['year_start'] ?> / <?= $item['year_end'] ?>)</div>
                            </td>
                            <td>
                                <span style="font-weight: 600;"><?= htmlspecialchars($item['civilization_name'] ?? 'Bilinmeyen') ?></span>
                                <div style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($item['mint_name'] ?? '-') ?></div>
                            </td>
                            <td>
                                <?php 
                                    $bClass = 'badge-silver';
                                    if (str_contains($item['metal_type'], 'Altın')) $bClass = 'badge-gold';
                                    elseif (str_contains($item['metal_type'], 'Bronz')) $bClass = 'badge-bronze';
                                ?>
                                <span class="badge <?= $bClass ?>"><?= htmlspecialchars($item['metal_type']) ?></span>
                                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;"><?= htmlspecialchars($item['standard_name']) ?></div>
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
                            <td>
                                <a href="/admin/coins/<?= $item['id'] ?>/edit" class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;">Düzenle</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <script>
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
    </script>
</body>
</html>

