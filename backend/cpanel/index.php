<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/**
 * --------------------------------------------------------------------------
 * cPanel Dinamik Çekirdek Dizin Çözümleyici
 * --------------------------------------------------------------------------
 * Dosya doğrudan /public_html içinde ya da /public_html/admin alt klasöründe
 * olsa dahi /home/{username}/numismatics_backend yolunu otomatik algılar.
 */
$possibleBackendPaths = [
    __DIR__ . '/../numismatics_backend',       // public_html kökü için
    __DIR__ . '/../../numismatics_backend',    // public_html/admin alt klasörü için
    dirname(__DIR__) . '/numismatics_backend',
];

$backendPath = null;
foreach ($possibleBackendPaths as $path) {
    if (file_exists($path . '/bootstrap/app.php')) {
        $backendPath = realpath($path);
        break;
    }
}

if (!$backendPath) {
    header('HTTP/1.1 500 Internal Server Error');
    echo '<!DOCTYPE html><html><head><title>Konfigürasyon Hatası</title><style>body{font-family:sans-serif;padding:40px;background:#0f172a;color:#f8fafc;}h1{color:#f59e0b;}</style></head><body>';
    echo '<h1>Nümizmatik Katalog - Çekirdek Dizin Bulunamadı</h1>';
    echo '<p>Laravel çekirdek dosyaları (<code>/home/{username}/numismatics_backend</code>) bulunamadı. Lütfen dosya yolunu cPanel File Manager üzerinden kontrol ediniz.</p>';
    echo '</body></html>';
    exit(1);
}

// 1. Bakım Modu (Maintenance Mode) Kontrolü
if (file_exists($maintenance = $backendPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// 2. Composer Composer Autoloader'ı Yükle
require $backendPath . '/vendor/autoload.php';

// 3. Laravel 11 Uygulama Örneğini Başlat
$app = require_once $backendPath . '/bootstrap/app.php';

// 4. cPanel Web Kökünü (public_path) Bulunduğu Dizine Bağla
// Böylece asset(), mix(), vite() ve public_path() doğrudan bu klasörü hedefler
$app->usePublicPath(__DIR__);

// 5. Gelen HTTP İsteğini Yanıtla
$app->handleRequest(Request::capture());

