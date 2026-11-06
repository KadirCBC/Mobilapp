<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏛️ Medeniyetler | Sikkelobedi Admin (localhost:8000)</title>
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
        .civ-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
        .civ-card { background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: all 0.2s; }
        .civ-card:hover { transform: translateY(-2px); border-color: var(--gold-primary); box-shadow: 0 8px 24px rgba(158,123,59,0.1); }
        .civ-badge { background: var(--gold-light); color: var(--gold-primary); font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
    </style>
</head>
<body>
    <?php include __DIR__ . '/nav.php'; ?>
    <main class="admin-main">
        <div class="page-header">
            <div>
                <h1 class="page-title">🏛️ Medeniyetler & Tarihsel Dönemler</h1>
                <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 3px;">Katalogda kayıtlı <?= count($civs) ?> büyük nümizmatik medeniyet ve imparatorluk.</p>
            </div>
            <a href="/admin/coins" class="nav-link" style="background: var(--gold-primary); color: white;">🪙 Eser Kataloğuna Git &rarr;</a>
        </div>

        <div class="civ-grid">
            <?php foreach ($civs as $c): ?>
                <div class="civ-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <h2 style="font-family: 'Cinzel', serif; font-size: 18px; color: var(--text-dark); margin: 0;"><?= htmlspecialchars($c['name']) ?></h2>
                        <span class="civ-badge"><?= $c['coins_count'] ?? 0 ?> Sikke</span>
                    </div>
                    <div style="font-size: 12.5px; font-weight: 600; color: var(--gold-primary); margin-bottom: 10px;"><?= htmlspecialchars($c['era_period'] ?? '') ?></div>
                    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0;"><?= htmlspecialchars($c['description'] ?? '') ?></p>
                    <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                        <span style="font-size: 11.5px; color: #10B981; font-weight: 700;">● Aktif Ekol</span>
                        <a href="/admin/coins?civilization_id=<?= $c['id'] ?>" style="font-size: 12.5px; font-weight: 700; color: var(--gold-primary); text-decoration: none;">Sikkeleri Gör &rarr;</a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </main>
</body>
</html>

