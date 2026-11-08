<?php
$currentUri = $_SERVER['REQUEST_URI'] ?? '';
$cleanUri = parse_url($currentUri, PHP_URL_PATH);

// MySQL Canlı Sayıları Çek (Mümkünse)
$totalCoinsCount = 0;
$totalCivsCount = 0;
$totalMintsCount = 0;
try {
    if (isset($pdo)) {
        $totalCoinsCount = (int)$pdo->query("SELECT COUNT(*) FROM coins")->fetchColumn();
        $totalCivsCount = (int)$pdo->query("SELECT COUNT(*) FROM civilizations")->fetchColumn();
        $totalMintsCount = (int)$pdo->query("SELECT COUNT(*) FROM mints")->fetchColumn();
    }
} catch (\Throwable $e) {}

// Aktif Menü ve Breadcrumb Tespiti
$isCoinsGroup = str_starts_with($cleanUri, '/admin/coins');
$isCivsGroup = str_starts_with($cleanUri, '/admin/civilizations') || str_starts_with($cleanUri, '/admin/mints');
$isAiGroup = str_starts_with($cleanUri, '/admin/ai');
$isGlossaryGroup = str_starts_with($cleanUri, '/admin/glossary');

$breadcrumbSection = 'Katalog';
$breadcrumbPage = 'Sikke Kataloğu';
if ($cleanUri === '/admin/coins/create') {
    $breadcrumbSection = 'Sikke Yönetimi';
    $breadcrumbPage = 'Yeni Eser Ekle';
} elseif (str_starts_with($cleanUri, '/admin/coins/edit')) {
    $breadcrumbSection = 'Sikke Yönetimi';
    $breadcrumbPage = 'Eser Düzenle';
} elseif ($cleanUri === '/admin/civilizations') {
    $breadcrumbSection = 'Tarih & Medeniyet';
    $breadcrumbPage = 'Medeniyetler & Dönemler';
} elseif ($cleanUri === '/admin/mints') {
    $breadcrumbSection = 'Tarih & Medeniyet';
    $breadcrumbPage = 'Antik Darphaneler Atlası';
} elseif (str_starts_with($cleanUri, '/admin/ai')) {
    $breadcrumbSection = 'Yapay Zeka';
    $breadcrumbPage = 'Gemini AI Ayarları';
} elseif ($cleanUri === '/admin/glossary') {
    $breadcrumbSection = 'Kaynaklar';
    $breadcrumbPage = 'Nümizmatik Sözlük';
}
?>

<!-- SİKKELOBEDİ PROFESYONEL SİDEBAR & TOPBAR SİSTEMİ -->
<link rel="icon" type="image/png" href="/images/app-logo.png">
<style>
    /* CSS Variables & Reset Override */
    :root {
        --sb-width: 275px;
        --sb-width-collapsed: 72px;
        --topbar-h: 68px;
        --sb-bg: #0B0F19;
        --sb-card-bg: #111827;
        --sb-border: rgba(255, 255, 255, 0.08);
        --sb-text: #F1F5F9;
        --sb-text-muted: #94A3B8;
        --sb-hover: rgba(255, 255, 255, 0.06);
        --gold-primary: #9E7B3B;
        --gold-glow: #D4AF37;
        --gold-light: #FBF8F2;
        --gold-border: rgba(158, 123, 59, 0.25);
        --gold-grad: linear-gradient(135deg, #ECC97C 0%, #D4AF37 50%, #9E7B3B 100%);
    }

    body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #F8F9FA !important;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        overflow-x: hidden !important;
    }

    /* Eski Navbar'ı Gizle */
    .admin-navbar { display: none !important; }

    /* Ana Sayfa İçeriğini Sidebar Yanına Hizala */
    .admin-main {
        margin-left: var(--sb-width) !important;
        padding-top: calc(var(--topbar-h) + 26px) !important;
        padding-left: 36px !important;
        padding-right: 36px !important;
        padding-bottom: 70px !important;
        max-width: calc(100vw - var(--sb-width)) !important;
        min-height: 100vh !important;
        box-sizing: border-box !important;
        transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    body.sb-collapsed .admin-main {
        margin-left: var(--sb-width-collapsed) !important;
        max-width: calc(100vw - var(--sb-width-collapsed)) !important;
    }

    /* Mobil / Küçük Ekranlar */
    @media (max-width: 1024px) {
        .admin-main {
            margin-left: 0 !important;
            max-width: 100vw !important;
            padding-left: 18px !important;
            padding-right: 18px !important;
        }
    }

    /* -------------------------------------------------------------------------
       SOL SİDEBAR
       ------------------------------------------------------------------------- */
    .sb-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: var(--sb-width);
        background: var(--sb-bg);
        color: var(--sb-text);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--sb-border);
        box-shadow: 4px 0 25px rgba(0, 0, 0, 0.18);
        transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    }

    body.sb-collapsed .sb-sidebar {
        width: var(--sb-width-collapsed);
    }

    @media (max-width: 1024px) {
        .sb-sidebar {
            transform: translateX(-100%);
        }
        body.sb-mobile-open .sb-sidebar {
            transform: translateX(0);
        }
    }

    /* Backdrop (Mobil için) */
    .sb-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        z-index: 999;
        display: none;
        opacity: 0;
        transition: opacity 0.25s ease;
    }
    body.sb-mobile-open .sb-backdrop {
        display: block;
        opacity: 1;
    }

    /* 1. Sidebar Brand Header */
    .sb-header {
        min-height: var(--topbar-h);
        padding: 12px 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        border-bottom: 1px solid var(--sb-border);
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.02);
        transition: all 0.25s ease;
    }

    .sb-brand-container {
        display: flex;
        align-items: center;
    }

    .sb-brand-logo-full {
        height: 38px;
        width: auto;
        max-width: 200px;
        object-fit: contain;
        display: block;
        filter: brightness(0) invert(1);
        transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .sb-header:hover .sb-brand-logo-full {
        transform: scale(1.02);
    }

    .sb-brand-logo-mini {
        display: none;
        width: 38px;
        height: 38px;
        border-radius: 9px;
        object-fit: cover;
        border: 1.5px solid rgba(212, 175, 55, 0.35);
        box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
    }

    .sb-brand-status {
        font-size: 11px;
        color: var(--sb-text-muted);
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding-left: 2px;
        transition: opacity 0.2s;
    }

    body.sb-collapsed .sb-header {
        padding: 14px 16px;
        align-items: center;
    }

    body.sb-collapsed .sb-brand-logo-full,
    body.sb-collapsed .sb-brand-status {
        display: none !important;
    }

    body.sb-collapsed .sb-brand-logo-mini {
        display: block;
    }

    .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #10B981;
        box-shadow: 0 0 8px #10B981;
        display: inline-block;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* 2. Sidebar Scrollable Menü Alanı */
    .sb-nav-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 18px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .sb-nav-container::-webkit-scrollbar {
        width: 4px;
    }
    .sb-nav-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
    }

    /* Kategori Grup Başlığı */
    .sb-group-title {
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #64748B;
        padding: 12px 12px 6px 12px;
        white-space: nowrap;
        transition: opacity 0.2s;
    }
    body.sb-collapsed .sb-group-title {
        opacity: 0;
    }

    /* Açılır Kapanır Accordion Kutusu */
    .sb-accordion {
        margin-bottom: 2px;
    }

    .sb-parent-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        background: transparent;
        border: none;
        color: var(--sb-text);
        font-size: 13.5px;
        font-weight: 600;
        border-radius: 10px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
        position: relative;
    }

    .sb-parent-btn:hover {
        background: var(--sb-hover);
        color: #FFFFFF;
    }

    .sb-parent-btn.active {
        background: rgba(158, 123, 59, 0.15);
        color: #F8D88A;
    }

    .sb-icon {
        font-size: 17px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }

    .sb-label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: opacity 0.2s;
    }
    body.sb-collapsed .sb-label {
        opacity: 0;
        pointer-events: none;
    }

    .sb-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        color: var(--sb-text);
        transition: opacity 0.2s;
    }
    body.sb-collapsed .sb-badge {
        display: none;
    }

    .sb-chevron {
        width: 16px;
        height: 16px;
        transition: transform 0.28s ease, opacity 0.2s;
        opacity: 0.6;
        flex-shrink: 0;
    }
    body.sb-collapsed .sb-chevron {
        display: none;
    }

    .sb-accordion.open .sb-chevron {
        transform: rotate(180deg);
        opacity: 1;
        color: var(--gold-glow);
    }

    /* Alt Menü / Submenu */
    .sb-submenu {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding-left: 20px;
        margin-left: 14px;
        border-left: 1.5px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .sb-accordion.open .sb-submenu {
        max-height: 400px;
        margin-top: 4px;
        margin-bottom: 6px;
    }

    body.sb-collapsed .sb-submenu {
        display: none !important;
    }

    .sb-sub-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 500;
        color: var(--sb-text-muted);
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.18s ease;
        white-space: nowrap;
    }

    .sb-sub-link:hover {
        color: #FFFFFF;
        background: var(--sb-hover);
        transform: translateX(3px);
    }

    .sb-sub-link.active {
        color: #F8D88A;
        font-weight: 600;
        background: rgba(158, 123, 59, 0.18);
        border: 1px solid rgba(212, 175, 55, 0.25);
    }

    .sub-bullet {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #475569;
        transition: all 0.2s;
        flex-shrink: 0;
    }
    .sb-sub-link:hover .sub-bullet, .sb-sub-link.active .sub-bullet {
        background: var(--gold-glow);
        box-shadow: 0 0 6px var(--gold-glow);
    }
    .sub-bullet.gold { background: #EAB308; box-shadow: 0 0 6px #EAB308; }
    .sub-bullet.silver { background: #94A3B8; box-shadow: 0 0 6px #CBD5E1; }
    .sub-bullet.bronze { background: #D97706; box-shadow: 0 0 6px #D97706; }

    /* Tekil Menü Linki (Alt menüsü olmayan) */
    .sb-single-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        color: var(--sb-text);
        font-size: 13.5px;
        font-weight: 600;
        border-radius: 10px;
        text-decoration: none;
        transition: all 0.2s ease;
    }
    .sb-single-link:hover {
        background: var(--sb-hover);
        color: #FFFFFF;
    }
    .sb-single-link.active {
        background: rgba(158, 123, 59, 0.18);
        color: #F8D88A;
        border: 1px solid rgba(212, 175, 55, 0.2);
    }

    /* 3. Sidebar Footer / Sistem Kartı */
    .sb-footer {
        padding: 14px;
        border-top: 1px solid var(--sb-border);
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex-shrink: 0;
    }

    .sb-sys-card {
        background: var(--sb-card-bg);
        border: 1px solid var(--sb-border);
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: opacity 0.2s;
    }
    body.sb-collapsed .sb-sys-card {
        display: none;
    }

    .sb-sys-info {
        display: flex;
        flex-direction: column;
    }
    .sb-sys-name {
        font-size: 11.5px;
        font-weight: 700;
        color: #E2E8F0;
    }
    .sb-sys-stat {
        font-size: 10.5px;
        color: #10B981;
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 2px;
    }

    .sb-toggle-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--sb-border);
        color: var(--sb-text-muted);
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s;
    }
    .sb-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #FFFFFF;
    }

    /* -------------------------------------------------------------------------
       ÜST TOPBAR (Header)
       ------------------------------------------------------------------------- */
    .admin-topbar {
        position: fixed;
        top: 0;
        left: var(--sb-width);
        right: 0;
        height: var(--topbar-h);
        background: #FFFFFF;
        border-bottom: 1px solid #E2E8F0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 36px;
        z-index: 900;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
    }

    body.sb-collapsed .admin-topbar {
        left: var(--sb-width-collapsed);
    }

    @media (max-width: 1024px) {
        .admin-topbar {
            left: 0 !important;
            padding: 0 18px;
        }
    }

    /* Topbar Sol (Toggle & Breadcrumb) */
    .topbar-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .topbar-menu-toggle {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: #F1F5F9;
        border: 1px solid #CBD5E1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #334155;
        transition: all 0.2s;
    }
    .topbar-menu-toggle:hover {
        background: #E2E8F0;
        color: #0F172A;
    }

    .topbar-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13.5px;
    }
    .bc-root {
        color: #64748B;
        text-decoration: none;
        font-weight: 500;
    }
    .bc-root:hover {
        color: var(--gold-primary);
    }
    .bc-sep {
        color: #94A3B8;
        font-size: 12px;
    }
    .bc-active {
        color: #1E293B;
        font-weight: 700;
    }

    /* Topbar Sağ (Metrikler & Butonlar) */
    .topbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .topbar-stat-pill {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 6px 14px;
        background: #F8F9FA;
        border: 1px solid #E2E8F0;
        border-radius: 20px;
        font-size: 12.5px;
        font-weight: 600;
        color: #475569;
    }
    @media (max-width: 768px) {
        .topbar-stat-pill { display: none; }
    }

    .btn-topbar-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--gold-primary);
        color: #FFFFFF;
        padding: 9px 18px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        transition: all 0.2s;
        border: 1px solid #83642D;
        box-shadow: 0 2px 8px rgba(158, 123, 59, 0.25);
    }
    .btn-topbar-primary:hover {
        background: #83642D;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(158, 123, 59, 0.35);
    }

    .btn-topbar-api {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #FFFFFF;
        color: #1E293B;
        padding: 9px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        border: 1px solid #CBD5E1;
        transition: all 0.2s;
    }
    .btn-topbar-api:hover {
        border-color: var(--gold-primary);
        color: var(--gold-primary);
        background: var(--gold-light);
    }
</style>

<!-- MOBIL BACKDROP OVERLAY -->
<div class="sb-backdrop" id="sbBackdrop" onclick="closeMobileSidebar()"></div>

<!-- SOL PROFESYONEL SİDEBAR -->
<aside class="sb-sidebar" id="sbSidebar">
    <!-- Brand Başlık: 2. Görseldeki Tam Logo (Amblem + Yazı) -->
    <a href="/admin/coins" class="sb-header" style="text-decoration: none; color: inherit;">
        <div class="sb-brand-container">
            <!-- Normal Geniş Görünüm: Tam Logo (Amblem + Sikkelobedi Yazısı) -->
            <img src="/images/brand-logo-white.png" alt="Sikkelobedi" class="sb-brand-logo-full" onerror="this.onerror=null; this.src='/images/brand-logo.png';">
            
            <!-- Daraltılmış Sidebar İkonu -->
            <img src="/images/app-logo.png" alt="Sikkelobedi" class="sb-brand-logo-mini">
        </div>
        <div class="sb-brand-status">
            <span class="live-dot"></span> XAMPP MySQL • CANLI
        </div>
    </a>

    <!-- Menü Elemanları (Açılır Kapanır Accordion Grupları) -->
    <nav class="sb-nav-container">

        <!-- GRUP 1: KOLEKSİYON & ESER YÖNETİMİ -->
        <div class="sb-group-title">KOLEKSİYON YÖNETİMİ</div>

        <!-- 1. Sikke & Eser Yönetimi Accordion -->
        <div class="sb-accordion <?= $isCoinsGroup ? 'open' : '' ?>" id="accCoins">
            <button type="button" class="sb-parent-btn <?= $isCoinsGroup ? 'active' : '' ?>" onclick="toggleAccordion('accCoins')">
                <span class="sb-icon">🪙</span>
                <span class="sb-label">Sikke & Eser Yönetimi</span>
                <?php if ($totalCoinsCount > 0): ?>
                    <span class="sb-badge"><?= $totalCoinsCount ?></span>
                <?php endif; ?>
                <svg class="sb-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="sb-submenu">
                <a href="/admin/coins" class="sb-sub-link <?= ($cleanUri === '/admin/coins' && empty($_GET['metal'])) ? 'active' : '' ?>">
                    <span class="sub-bullet"></span> Tüm Eserler Kataloğu
                </a>
                <a href="/admin/coins/create" class="sb-sub-link <?= ($cleanUri === '/admin/coins/create') ? 'active' : '' ?>">
                    <span class="sub-bullet"></span> ➕ Yeni Sikke Ekle
                </a>
                <a href="/admin/coins?metal=Altın" class="sb-sub-link <?= (($_GET['metal'] ?? '') === 'Altın') ? 'active' : '' ?>">
                    <span class="sub-bullet gold"></span> 🟡 Altın (AV) Sikkeler
                </a>
                <a href="/admin/coins?metal=Gümüş" class="sb-sub-link <?= (($_GET['metal'] ?? '') === 'Gümüş') ? 'active' : '' ?>">
                    <span class="sub-bullet silver"></span> ⚪ Gümüş (AR) Sikkeler
                </a>
                <a href="/admin/coins?metal=Bronz" class="sb-sub-link <?= (($_GET['metal'] ?? '') === 'Bronz') ? 'active' : '' ?>">
                    <span class="sub-bullet bronze"></span> 🟤 Bronz (AE) Sikkeler
                </a>
            </div>
        </div>

        <!-- 2. Tarih & Medeniyet Accordion -->
        <div class="sb-accordion <?= $isCivsGroup ? 'open' : '' ?>" id="accCivs">
            <button type="button" class="sb-parent-btn <?= $isCivsGroup ? 'active' : '' ?>" onclick="toggleAccordion('accCivs')">
                <span class="sb-icon">🏛️</span>
                <span class="sb-label">Tarih & Medeniyet</span>
                <?php if ($totalCivsCount > 0): ?>
                    <span class="sb-badge"><?= $totalCivsCount ?></span>
                <?php endif; ?>
                <svg class="sb-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="sb-submenu">
                <a href="/admin/civilizations" class="sb-sub-link <?= ($cleanUri === '/admin/civilizations') ? 'active' : '' ?>">
                    <span class="sub-bullet"></span> 🏛️ Medeniyetler & Çağlar
                </a>
                <a href="/admin/mints" class="sb-sub-link <?= ($cleanUri === '/admin/mints') ? 'active' : '' ?>">
                    <span class="sub-bullet"></span> 🗺️ Antik Darphaneler Atlası
                </a>
            </div>
        </div>

        <!-- GRUP 2: YAPAY ZEKA & ARAÇLAR -->
        <div class="sb-group-title" style="margin-top: 10px;">YAPAY ZEKA & ARAÇLAR</div>

        <!-- 3. Gemini AI Asistanı Accordion -->
        <div class="sb-accordion <?= $isAiGroup ? 'open' : '' ?>" id="accAi">
            <button type="button" class="sb-parent-btn <?= $isAiGroup ? 'active' : '' ?>" onclick="toggleAccordion('accAi')">
                <span class="sb-icon">✨</span>
                <span class="sb-label">Gemini AI Asistanı</span>
                <svg class="sb-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="sb-submenu">
                <a href="/admin/ai/settings" class="sb-sub-link <?= ($cleanUri === '/admin/ai/settings') ? 'active' : '' ?>">
                    <span class="sub-bullet"></span> ⚙️ Model & Prompt Ayarları
                </a>
                <a href="/admin/coins/create" class="sb-sub-link">
                    <span class="sub-bullet"></span> ⚡ Dış Bağlantı Ayrıştırıcı
                </a>
            </div>
        </div>

        <!-- 4. Nümizmatik Terminoloji -->
        <div class="sb-accordion <?= $isGlossaryGroup ? 'open' : '' ?>" id="accGlossary">
            <button type="button" class="sb-parent-btn <?= $isGlossaryGroup ? 'active' : '' ?>" onclick="toggleAccordion('accGlossary')">
                <span class="sb-icon">📖</span>
                <span class="sb-label">Nümizmatik Sözlük</span>
                <svg class="sb-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="sb-submenu">
                <a href="/admin/glossary" class="sb-sub-link <?= ($cleanUri === '/admin/glossary') ? 'active' : '' ?>">
                    <span class="sub-bullet"></span> 📚 Terimler & Açıklamalar
                </a>
            </div>
        </div>

        <!-- GRUP 3: SİSTEM & SERVİSLER -->
        <div class="sb-group-title" style="margin-top: 10px;">SİSTEM & SERVİSLER</div>

        <!-- 5. Mobil API Servisleri Accordion -->
        <div class="sb-accordion" id="accApi">
            <button type="button" class="sb-parent-btn" onclick="toggleAccordion('accApi')">
                <span class="sb-icon">📡</span>
                <span class="sb-label">Mobil Servisler (API)</span>
                <svg class="sb-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="sb-submenu">
                <a href="/api/v1/coins" target="_blank" class="sb-sub-link">
                    <span class="sub-bullet"></span> 🪙 Sikkeler JSON API ↗
                </a>
                <a href="/api/v1/mints" target="_blank" class="sb-sub-link">
                    <span class="sub-bullet"></span> 🗺️ Darphaneler JSON API ↗
                </a>
                <a href="/api/v1/civilizations" target="_blank" class="sb-sub-link">
                    <span class="sub-bullet"></span> 🏛️ Medeniyetler JSON API ↗
                </a>
            </div>
        </div>

    </nav>

    <!-- 3. Sidebar Footer (Sistem Durumu & Daraltma Butonu) -->
    <div class="sb-footer">
        <div class="sb-sys-card">
            <div class="sb-sys-info">
                <span class="sb-sys-name">MySQL Veritabanı</span>
                <span class="sb-sys-stat">
                    <span class="live-dot" style="width: 5px; height: 5px;"></span> Port 3306 Aktif
                </span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #9E7B3B; background: rgba(158, 123, 59, 0.15); padding: 3px 7px; border-radius: 5px;">
                v1.0.0
            </div>
        </div>

        <button type="button" class="sb-toggle-btn" onclick="toggleSidebarCollapse()" title="Sol Paneli Daralt / Genişlet">
            <svg id="sbToggleIcon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
            </svg>
            <span id="sbToggleText">Menüyü Daralt</span>
        </button>
    </div>
</aside>

<!-- ÜST YÖNETİM BAR (TOPBAR) -->
<header class="admin-topbar">
    <div class="topbar-left">
        <button type="button" class="topbar-menu-toggle" onclick="toggleMobileSidebar()" title="Menüyü Aç/Kapat">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>

        <nav class="topbar-breadcrumbs">
            <a href="/admin/coins" class="bc-root">Sikkelobedi</a>
            <span class="bc-sep">/</span>
            <span class="bc-root"><?= htmlspecialchars($breadcrumbSection) ?></span>
            <span class="bc-sep">/</span>
            <span class="bc-active"><?= htmlspecialchars($breadcrumbPage) ?></span>
        </nav>
    </div>

    <div class="topbar-right">
        <div class="topbar-stat-pill">
            <span>🪙</span>
            <span><strong><?= $totalCoinsCount ?></strong> Eser</span>
        </div>
        <div class="topbar-stat-pill">
            <span>🏛️</span>
            <span><strong><?= $totalCivsCount ?></strong> Medeniyet</span>
        </div>

        <a href="/api/v1/coins" target="_blank" class="btn-topbar-api">
            <span>Canlı API</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3"></path></svg>
        </a>

        <?php if ($cleanUri !== '/admin/coins/create'): ?>
            <a href="/admin/coins/create" class="btn-topbar-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                <span>Yeni Sikke Ekle</span>
            </a>
        <?php endif; ?>
    </div>
</header>

<!-- SİDEBAR ETKİLEŞİM JAVASCRIPT'İ -->
<script>
    // 1. Accordion Açma / Kapama Fonksiyonu
    function toggleAccordion(id) {
        if (document.body.classList.contains('sb-collapsed')) {
            toggleSidebarCollapse();
        }
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('open');
    }

    // 2. Masaüstü Sidebar Daraltma / Genişletme (LocalStorage ile hatırlamalı)
    function toggleSidebarCollapse() {
        const isCollapsed = document.body.classList.toggle('sb-collapsed');
        localStorage.setItem('sikkelobedi_sb_collapsed', isCollapsed ? '1' : '0');
        updateToggleBtnUI(isCollapsed);
    }

    function updateToggleBtnUI(isCollapsed) {
        const txt = document.getElementById('sbToggleText');
        const icon = document.getElementById('sbToggleIcon');
        if (txt) txt.innerText = isCollapsed ? 'Genişlet' : 'Menüyü Daralt';
        if (icon) {
            icon.innerHTML = isCollapsed 
                ? '<path d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>' 
                : '<path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>';
        }
    }

    // Sayfa Yüklendiğinde Tercihi Hatırla
    (function initSidebar() {
        if (window.innerWidth > 1024) {
            const saved = localStorage.getItem('sikkelobedi_sb_collapsed');
            if (saved === '1') {
                document.body.classList.add('sb-collapsed');
                updateToggleBtnUI(true);
            }
        }
    })();

    // 3. Mobil Sidebar Drawer Açma / Kapama
    function toggleMobileSidebar() {
        if (window.innerWidth <= 1024) {
            document.body.classList.toggle('sb-mobile-open');
        } else {
            toggleSidebarCollapse();
        }
    }

    function closeMobileSidebar() {
        document.body.classList.remove('sb-mobile-open');
    }
</script>
