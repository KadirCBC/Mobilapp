<?php
/**
 * ==============================================================================
 * SİKKELOBEDİ NÜMİZMATİK - cPANEL STORAGE & DİZİN KURULUM SİHİRBAZI
 * ==============================================================================
 * Bu script, paylaşımlı cPanel hosting ortamında "php artisan storage:link"
 * komutunu web üzerinden güvenle çalıştırır veya symlink kapalıysa alternatif
 * güvenli uploads dizin mimarisini otomatik inşa eder.
 *
 * Güvenlik: Kurulum tamamlandıktan sonra bu dosyayı siliniz veya devre dışı bırakınız!
 */

// Basit güvenlik anahtarı (URL parametresi: ?key=numis2026_setup)
$secretKey = 'numis2026_setup';

if (php_sapi_name() !== 'cli') {
    if (!isset($_GET['key']) || $_GET['key'] !== $secretKey) {
        header('HTTP/1.1 403 Forbidden');
        die('<h2 style="color:red;font-family:sans-serif;">Erişim Reddedildi: Lütfen geçerli kurulum anahtarı ile giriniz (?key=numis2026_setup)</h2>');
    }
}

// Dizin Yollarını Belirle
$publicHtmlDir = __DIR__;
$backendDir = realpath(__DIR__ . '/../numismatics_backend') ?: realpath(__DIR__ . '/../../numismatics_backend');

if (!$backendDir) {
    die("HATA: Çekirdek dizin 'numismatics_backend' bulunamadı.");
}

$storageTarget = $backendDir . '/storage/app/public';
$storageLink = $publicHtmlDir . '/storage';
$uploadsDir = $publicHtmlDir . '/uploads';

$results = [];

// 1. Storage Klasör İzinleri Kontrolü (0775 / 0755)
$storageFolders = [
    $backendDir . '/storage',
    $backendDir . '/storage/app',
    $backendDir . '/storage/app/public',
    $backendDir . '/storage/framework',
    $backendDir . '/storage/framework/cache',
    $backendDir . '/storage/framework/sessions',
    $backendDir . '/storage/framework/views',
    $backendDir . '/storage/logs',
    $backendDir . '/bootstrap/cache',
];

foreach ($storageFolders as $folder) {
    if (!file_exists($folder)) {
        @mkdir($folder, 0755, true);
    }
    $isWritable = is_writable($folder);
    $results[] = [
        'title'   => 'Dizin Yazma Yetkisi: ' . basename(dirname($folder)) . '/' . basename($folder),
        'status'  => $isWritable ? 'success' : 'danger',
        'message' => $isWritable ? 'Yazılabilir (İzinler Uygun)' : 'HATA: Dizin yazılabilir değil! chmod 755 veya 775 yapınız.',
    ];
}

// 2. Symlink (Sembolik Bağlantı) Denemesi
$symlinkAvailable = function_exists('symlink');

if (!$symlinkAvailable) {
    $results[] = [
        'title'   => 'PHP symlink() Fonksiyonu',
        'status'  => 'warning',
        'message' => 'symlink() fonksiyonu hosting sağlayıcınız tarafından disable_functions ile kapatılmış. Alternatif "public/uploads" mimarisi devreye alınıyor.',
    ];
} else {
    // Mevcut bozuk symlink varsa temizle
    if (is_link($storageLink)) {
        @unlink($storageLink);
    }

    if (!file_exists($storageLink)) {
        $linkCreated = @symlink($storageTarget, $storageLink);
        if ($linkCreated) {
            $results[] = [
                'title'   => 'Sembolik Bağlantı (storage:link)',
                'status'  => 'success',
                'message' => "Başarılı! '{$storageLink}' -> '{$storageTarget}' sembolik bağı kuruldu.",
            ];
        } else {
            $results[] = [
                'title'   => 'Sembolik Bağlantı (storage:link)',
                'status'  => 'warning',
                'message' => 'Symlink oluşturulamadı (İzin yetersiz). Alternatif doğrudan uploads dizinine geçiliyor.',
            ];
        }
    } else {
        $results[] = [
            'title'   => 'Sembolik Bağlantı',
            'status'  => 'info',
            'message' => "'public_html/storage' zaten mevcut.",
        ];
    }
}

// 3. Alternatif cPanel Doğrudan Uploads Mimarisi Kurulumu
$subUploadDirs = [
    $uploadsDir,
    $uploadsDir . '/coins',
    $uploadsDir . '/coins/obverse',
    $uploadsDir . '/coins/reverse',
    $uploadsDir . '/civilizations',
    $uploadsDir . '/provenances',
];

foreach ($subUploadDirs as $dir) {
    if (!file_exists($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// 4. Uploads Klasörü Güvenlik Koruması (.htaccess ile PHP çalıştırmayı engelleme)
$uploadHtaccess = $uploadsDir . '/.htaccess';
$securityContent = <<<HTACCESS
# Güvenlik Kuralı: Uploads klasöründe hiçbir PHP veya CGI betiği çalıştırılamaz!
<FilesMatch "(?i)\.(php|phtml|php3|php4|php5|php7|php8|phps|cgi|pl|exe|sh)$">
    Order allow,deny
    Deny from all
</FilesMatch>
Options -ExecCGI -Indexes
HTACCESS;

file_put_contents($uploadHtaccess, $securityContent);

$results[] = [
    'title'   => 'Doğrudan Uploads Güvenlik Kalkanı (.htaccess)',
    'status'  => 'success',
    'message' => "'{$uploadsDir}/.htaccess' oluşturuldu. Yüklenen dosyalar arasında zararlı PHP betikleri çalıştırılması engellendi.",
];

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>cPanel Storage Kurulum Raporu</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        h1 { color: #f59e0b; margin-top: 0; font-size: 24px; }
        .item { padding: 12px 16px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid; display: flex; justify-content: space-between; align-items: center; }
        .success { background: rgba(16, 185, 129, 0.1); border-color: #10b981; color: #a7f3d0; }
        .warning { background: rgba(245, 158, 11, 0.1); border-color: #f59e0b; color: #fde68a; }
        .danger  { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #fecaca; }
        .info    { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; color: #bfdbfe; }
        .note { margin-top: 25px; padding: 15px; background: rgba(245, 158, 11, 0.15); border: 1px dashed #f59e0b; border-radius: 8px; color: #fbbf24; font-size: 13px; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sikkelobedi cPanel Kurulum & Depolama Denetimi</h1>
        <p style="color:#94a3b8; font-size: 14px;">Çekirdek: <code><?= htmlspecialchars($backendDir) ?></code></p>
        <p style="color:#94a3b8; font-size: 14px;">Web Kökü: <code><?= htmlspecialchars($publicHtmlDir) ?></code></p>

        <div style="margin-top: 20px;">
            <?php foreach ($results as $res): ?>
                <div class="item <?= $res['status'] ?>">
                    <div>
                        <strong><?= htmlspecialchars($res['title']) ?></strong>
                        <div style="font-size: 13px; margin-top: 3px;"><?= htmlspecialchars($res['message']) ?></div>
                    </div>
                    <span style="font-weight: bold; text-transform: uppercase; font-size: 12px;"><?= $res['status'] ?></span>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="note">
            <strong>ÖNEMLİ GÜVENLİK NOTU:</strong> Kurulum işleminiz başarıyla tamamlandıktan sonra bu dosyayı (<code>cpanel_storage_setup.php</code>) cPanel Dosya Yöneticisi üzerinden sunucunuzdan siliniz.
        </div>
    </div>
</body>
</html>

