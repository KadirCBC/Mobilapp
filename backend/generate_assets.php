<?php

declare(strict_types=1);

$storageCoinsDir = __DIR__ . '/storage/app/public/coins';
$placeholdersDir = __DIR__ . '/public/images/placeholders';
$publicStorageCoinsDir = __DIR__ . '/public/storage/coins';

if (!is_dir($storageCoinsDir)) mkdir($storageCoinsDir, 0755, true);
if (!is_dir($placeholdersDir)) mkdir($placeholdersDir, 0755, true);
if (!is_dir($publicStorageCoinsDir)) mkdir($publicStorageCoinsDir, 0755, true);

function createCoinImage(string $filePath, string $metal, string $title, string $legend): void {
    $size = 400;
    $img = imagecreatetruecolor($size, $size);
    imagesavealpha($img, true);

    $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
    imagefill($img, 0, 0, $transparent);

    // Maden Renkleri
    if ($metal === 'gold') {
        $baseR = 212; $baseG = 175; $baseB = 55;  // Altın
        $edgeR = 158; $edgeG = 123; $edgeB = 59;
        $textColor = imagecolorallocate($img, 92, 60, 20);
    } elseif ($metal === 'silver') {
        $baseR = 192; $baseG = 197; $baseB = 206; // Gümüş
        $edgeR = 148; $edgeG = 153; $edgeB = 164;
        $textColor = imagecolorallocate($img, 50, 55, 65);
    } else {
        $baseR = 184; $baseG = 115; $baseB = 51;  // Bronz
        $edgeR = 130; $edgeG = 75; $edgeB = 30;
        $textColor = imagecolorallocate($img, 60, 30, 10);
    }

    $center = $size / 2;
    $radius = ($size / 2) - 15;

    // Gradyanlı Sikke Gövdesi
    for ($r = (int)$radius; $r > 0; $r--) {
        $factor = $r / $radius;
        $color = imagecolorallocate(
            $img,
            (int)($baseR + (255 - $baseR) * (1 - $factor) * 0.4),
            (int)($baseG + (255 - $baseG) * (1 - $factor) * 0.4),
            (int)($baseB + (255 - $baseB) * (1 - $factor) * 0.4)
        );
        imagefilledellipse($img, (int)$center, (int)$center, $r * 2, $r * 2, $color);
    }

    // Dış Kenar ve Kabartma İnciler (Beaded border)
    $edgeColor = imagecolorallocate($img, $edgeR, $edgeG, $edgeB);
    imagesetthickness($img, 4);
    imageellipse($img, (int)$center, (int)$center, (int)($radius * 2), (int)($radius * 2), $edgeColor);

    // Noktalı Kenar (Dot Border)
    for ($angle = 0; $angle < 360; $angle += 6) {
        $rad = deg2rad($angle);
        $dotX = $center + ($radius - 12) * cos($rad);
        $dotY = $center + ($radius - 12) * sin($rad);
        imagefilledellipse($img, (int)$dotX, (int)$dotY, 6, 6, $edgeColor);
    }

    // İç Çember
    imageellipse($img, (int)$center, (int)$center, (int)(($radius - 24) * 2), (int)(($radius - 24) * 2), $edgeColor);

    // Metinler (GD Dahili Fontları)
    $fontTitle = 5;
    $fontLegend = 4;
    $fontSub = 3;

    $tw = imagefontwidth($fontTitle) * strlen($title);
    $th = imagefontheight($fontTitle);
    imagestring($img, $fontTitle, (int)($center - ($tw / 2)), (int)($center - 35), $title, $textColor);

    $lw = imagefontwidth($fontLegend) * strlen($legend);
    imagestring($img, $fontLegend, (int)($center - ($lw / 2)), (int)($center), $legend, $textColor);

    $sub = strtoupper($metal) . ' NUMISMATIC';
    $sw = imagefontwidth($fontSub) * strlen($sub);
    imagestring($img, $fontSub, (int)($center - ($sw / 2)), (int)($center + 35), $sub, $textColor);

    // Kaydet
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    if ($ext === 'webp') {
        imagewebp($img, $filePath, 90);
    } else {
        imagepng($img, $filePath);
    }
    imagedestroy($img);
}

// 6 Örnek Sikke Görseli
$coinsList = [
    ['file' => 'domitian_denarius_avers.webp', 'metal' => 'silver', 'title' => 'DOMITIANVS', 'legend' => 'AVGVSTVS GERM'],
    ['file' => 'domitian_denarius_revers.webp', 'metal' => 'silver', 'title' => 'MINERVA', 'legend' => 'IMP XXI COS XVI'],
    ['file' => 'croesus_stater_avers.webp', 'metal' => 'gold', 'title' => 'KROISOS STATER', 'legend' => 'LYDIAN LION & BULL'],
    ['file' => 'croesus_stater_revers.webp', 'metal' => 'gold', 'title' => 'INCUSE SQUARE', 'legend' => 'SARDIS MINT 550 BC'],
    ['file' => 'alexander_tetradrachm_avers.webp', 'metal' => 'silver', 'title' => 'ALEXANDER', 'legend' => 'HERAKLES HEAD'],
    ['file' => 'alexander_tetradrachm_revers.webp', 'metal' => 'silver', 'title' => 'ZEUS AETOPHOROS', 'legend' => 'BASILEOS ALEXANDROU'],
];

foreach ($coinsList as $c) {
    $destStorage = $storageCoinsDir . '/' . $c['file'];
    $destPublic = $publicStorageCoinsDir . '/' . $c['file'];
    createCoinImage($destStorage, $c['metal'], $c['title'], $c['legend']);
    copy($destStorage, $destPublic);
    echo "Görsel üretildi: {$c['file']}\n";
}

// Placeholder PNG'leri
createCoinImage($placeholdersDir . '/coin-avers.png', 'bronze', 'ANTIK SIKKE', 'ON YUZ (AVERS)');
createCoinImage($placeholdersDir . '/coin-revers.png', 'bronze', 'ANTIK SIKKE', 'ARKA YUZ (REVERS)');
echo "Placeholder görselleri üretildi.\n";

