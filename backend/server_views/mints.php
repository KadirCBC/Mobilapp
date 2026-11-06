<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🗺️ Antik Darphaneler (Harita) | Sikkelobedi Admin (localhost:8000)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-canvas: #F8F9FA; --card-bg: #FFFFFF; --gold-primary: #9E7B3B; --gold-hover: #83642D;
            --gold-light: #FBF8F2; --gold-border: rgba(158, 123, 59, 0.25); --text-dark: #1E293B;
            --text-muted: #64748B; --border-subtle: #E2E8F0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: var(--bg-canvas); color: var(--text-dark); min-height: 100vh; }
        .admin-navbar {
            background: #FFFFFF; border-bottom: 1px solid var(--border-subtle); padding: 0 32px;
            height: 68px; display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .navbar-brand { font-family: 'Cinzel', serif; font-size: 19px; font-weight: 700; color: var(--text-dark); text-decoration: none; display: flex; align-items: center; gap: 12px; }
        .brand-badge { background: rgba(158, 123, 59, 0.12); color: var(--gold-primary); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
        .navbar-nav { display: flex; align-items: center; gap: 8px; }
        .nav-link { padding: 9px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 600; color: var(--text-muted); text-decoration: none; transition: all 0.2s; }
        .nav-link:hover, .nav-link.active { color: var(--gold-primary); background: var(--gold-light); }
        .admin-main { max-width: 1340px; margin: 0 auto; padding: 32px 24px 60px 24px; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .page-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; }

        /* Harita Temsili Kartı */
        .map-banner {
            background: radial-gradient(circle at 50% 50%, #2A2F35 0%, #15181C 100%);
            border-radius: 16px; border: 2px solid var(--gold-primary); padding: 28px;
            color: #FFFFFF; margin-bottom: 28px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
        }
        .mint-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
        .mint-card { background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .coord-badge { background: #EFF6FF; color: #1E40AF; font-size: 11.5px; font-weight: 700; padding: 4px 8px; border-radius: 6px; font-family: monospace; }
    </style>
</head>
<body>
    <?php include __DIR__ . '/nav.php'; ?>
    <main class="admin-main">
        <div class="page-header">
            <div>
                <h1 class="page-title">🗺️ Antik Darphaneler & Coğrafi Koordinatlar</h1>
                <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 3px;">Mobil uygulamanın Harita Atlası (Map) ekranını besleyen <?= count($mints) ?> antik darphane noktası.</p>
            </div>
            <a href="/api/v1/mints" target="_blank" class="nav-link" style="background: var(--gold-primary); color: white;">Harita JSON Verisi ↗</a>
        </div>

        <div class="map-banner">
            <div>
                <div style="color: var(--gold-primary); font-size: 12px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px;">AKDENİZ VE ORTA DOĞU NÜMİZMATİK HARİTASI</div>
                <h2 style="font-family: 'Cinzel', serif; font-size: 22px; margin: 0 0 8px 0;">Mobil Harita Atlası Canlı Uç Noktası</h2>
                <p style="color: #94A3B8; font-size: 13.5px; max-width: 650px; margin: 0;">Sardes, Antakya, Roma, Atina, Efes, İskenderiye, Amphipolis ve diğer tüm antik darphane koordinatları doğrudan mobildeki radar pinlerine bağlanmıştır.</p>
            </div>
            <div style="background: rgba(158,123,59,0.15); border: 1px solid var(--gold-primary); padding: 14px 20px; border-radius: 10px; text-align: center;">
                <div style="font-size: 26px; font-weight: 700; color: #F59E0B;"><?= count($mints) ?></div>
                <div style="font-size: 12px; color: #E2E8F0; font-weight: 600;">Aktif Harita Pini</div>
            </div>
        </div>

        <div class="mint-grid">
            <?php foreach ($mints as $m): ?>
                <div class="mint-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div>
                            <h3 style="font-family: 'Cinzel', serif; font-size: 17px; margin: 0; color: var(--text-dark);"><?= htmlspecialchars($m['name']) ?></h3>
                            <div style="font-size: 12px; color: var(--gold-primary); font-style: italic;"><?= htmlspecialchars($m['ancient_name'] ?? '') ?></div>
                        </div>
                        <span class="coord-badge"><?= round((float)$m['latitude'], 2) ?>°N, <?= round((float)$m['longitude'], 2) ?>°E</span>
                    </div>
                    <div style="font-size: 12.5px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px;">
                        Medeniyet: <strong><?= htmlspecialchars($m['civilization_name'] ?? 'Bilinmeyen') ?></strong>
                    </div>
                    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0;"><?= htmlspecialchars($m['description'] ?? '') ?></p>
                    <div style="margin-top: 16px; border-top: 1px solid var(--border-subtle); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; font-weight: 700; color: var(--gold-primary);"><?= $m['coins_count'] ?? 0 ?> Sikke Basımı</span>
                        <a href="/admin/coins?q=<?= urlencode($m['name']) ?>" style="font-size: 12px; font-weight: 700; color: var(--text-dark); text-decoration: none;">Eserleri İncele &rarr;</a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </main>
</body>
</html>

