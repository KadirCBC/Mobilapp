<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>✨ Gemini AI Ayarları | Sikkelobedi Admin</title>
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
        .admin-main { max-width: 900px; margin: 0 auto; padding: 32px 24px 60px 24px; }
        .page-header { margin-bottom: 24px; }
        .page-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; }
        .card { background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 13.5px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .form-control { width: 100%; padding: 12px 16px; border: 1px solid var(--border-subtle); border-radius: 10px; font-size: 14px; color: var(--text-dark); font-family: inherit; transition: border-color 0.2s; }
        .form-control:focus { outline: none; border-color: var(--gold-primary); box-shadow: 0 0 0 3px rgba(158, 123, 59, 0.15); }
        .form-help { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
        .btn-submit { background: var(--gold-primary); color: #FFFFFF; padding: 12px 28px; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
        .btn-submit:hover { background: var(--gold-hover); }
        .alert-success { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 14px 18px; border-radius: 10px; margin-bottom: 24px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; }
    </style>
</head>
<body>
    <?php include __DIR__ . '/nav.php'; ?>
    <main class="admin-main">
        <div class="page-header">
            <h1 class="page-title">✨ Gemini AI Yapay Zeka Ayarları</h1>
            <p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px;">Antik sikke görsel analizi, nümizmatik ayrıştırma ve Türkçe literatür çevirisi için Gemini model parametreleri.</p>
        </div>

        <?php if (!empty($_GET['saved'])): ?>
            <div class="alert-success">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                Gemini AI ayarları başarıyla veritabanına kaydedildi ve canlı servise aktarıldı.
            </div>
        <?php endif; ?>

        <div class="card">
            <form action="/admin/ai/settings" method="POST">
                <div class="form-group">
                    <label class="form-label" for="api_key">Google Gemini API Anahtarı (API Key)</label>
                    <input type="password" id="api_key" name="api_key" class="form-control" value="<?= htmlspecialchars($setting['api_key'] ?? '') ?>" placeholder="AIzaSy...">
                    <div class="form-help">Google AI Studio üzerinden edindiğiniz Gemini API anahtarı. Hem admin web ayrıştırıcısı hem mobil kamera tarama tarafından kullanılır.</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label class="form-label" for="model_name">Model Adı</label>
                        <select id="model_name" name="model_name" class="form-control">
                            <option value="gemini-3.5-flash" <?= in_array($setting['model_name'] ?? '', ['gemini-3.5-flash', 'gemini-1.5-flash', '']) ? 'selected' : '' ?>>gemini-3.5-flash (Önerilen - En Yeni & Yüksek Doğruluk)</option>
                            <option value="gemini-flash-latest" <?= ($setting['model_name'] ?? '') === 'gemini-flash-latest' ? 'selected' : '' ?>>gemini-flash-latest (Otomatik En Güncel Flash)</option>
                            <option value="gemini-2.5-pro" <?= ($setting['model_name'] ?? '') === 'gemini-2.5-pro' ? 'selected' : '' ?>>gemini-2.5-pro (Kapsamlı Nümizmatik Akıl Yürütme)</option>
                            <option value="gemini-3.8-flash" <?= ($setting['model_name'] ?? '') === 'gemini-3.8-flash' ? 'selected' : '' ?>>gemini-3.8-flash (Yeni Nesil)</option>
                        </select>
                        <div class="form-help">Görsel teşhis performansı ve yanıt süresini belirler.</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="temperature">Sıcaklık (Temperature: 0.0 - 1.0)</label>
                        <input type="number" id="temperature" name="temperature" step="0.05" min="0" max="1" class="form-control" value="<?= htmlspecialchars((string)($setting['temperature'] ?? 0.20)) ?>">
                        <div class="form-help">Düşük değerler (0.10 - 0.25) bilimsel ve tutarlı nümizmatik veriler sağlar.</div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="system_prompt">Sistem Talimatı (Nümizmatik Uzmanı Prompt)</label>
                    <textarea id="system_prompt" name="system_prompt" rows="6" class="form-control" style="font-size: 13px; line-height: 1.6;"><?= htmlspecialchars($setting['system_prompt'] ?? "Sen uluslararası kıdemli bir nümizmat ve antik sikke uzmanısın. Sana sunulan antik sikke görselini ve metnini analiz et, terimleri Türkçe nümizmatik literatürüne uygun olarak çevir ve kesin JSON formatında yanıt ver.") ?></textarea>
                    <div class="form-help">Modelin antik sikkeleri analiz ederken takınacağı kimlik ve akademik terminoloji kuralları.</div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                    <button type="submit" class="btn-submit">💾 Ayarları Kaydet</button>
                </div>
            </form>
        </div>
    </main>
</body>
</html>

