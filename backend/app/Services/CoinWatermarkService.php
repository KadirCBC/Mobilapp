<?php

namespace App\Services;

use App\Models\Coin;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Geometry\Factories\RectangleFactory;
use Intervention\Image\ImageManager;

class CoinWatermarkService
{
    protected ImageManager $manager;

    /**
     * Güvenli (Public Olmayan) Orijinal Görsel Depolama Dizini.
     */
    protected string $secureDir;

    /**
     * Filigranlanmış önbellek dizini (cPanel CPU yükünü sıfırlamak için).
     */
    protected string $cacheDir;

    public function __construct()
    {
        $this->manager = new ImageManager(new GdDriver());
        $this->secureDir = storage_path('app/secure_coins');
        $this->cacheDir = storage_path('app/cache/watermarked');

        if (!File::isDirectory($this->secureDir)) {
            File::makeDirectory($this->secureDir, 0700, true, true);
        }
        if (!File::isDirectory($this->cacheDir)) {
            File::makeDirectory($this->cacheDir, 0755, true, true);
        }
    }

    /**
     * Sikke görseline dinamik filigran basar ve optimize WebP olarak döner.
     *
     * @param Coin $coin İlgili sikke modeli
     * @param string $type 'avers' (ön yüz) veya 'revers' (arka yüz)
     * @return string Filigranlı görselin tam dosya yolu
     */
    public function getWatermarkedImagePath(Coin $coin, string $type = 'avers'): string
    {
        $relativePath = $type === 'avers' ? $coin->avers_image : $coin->revers_image;
        $realPath = $this->resolveSourcePath($relativePath);

        // Önbellek anahtarı: Eser ID + Tip + Son Güncellenme Zamanı
        $cacheKey = "coin_{$coin->id}_{$type}_v" . ($coin->updated_at?->timestamp ?? 1);
        $cachedFilePath = "{$this->cacheDir}/{$cacheKey}.webp";

        // Eğer daha önce filigranlanıp önbelleğe alındıysa doğrudan dosyayı dön (0ms gecikme)
        if (File::exists($cachedFilePath)) {
            return $cachedFilePath;
        }

        // Kaynak dosya bulunamazsa varsayılan placeholder üret
        if (!$realPath || !File::exists($realPath)) {
            return $this->generatePlaceholder($coin, $type);
        }

        try {
            // 1. Görseli Belleğe Oku (GD)
            $srcImg = @imagecreatefromstring(file_get_contents($realPath));
            if (!$srcImg) {
                return $this->generatePlaceholder($coin, $type);
            }

            $w = imagesx($srcImg);
            $h = imagesy($srcImg);

            // 2. Yarı Saydam Filigran Şeridi Ekle (Alt Kısım)
            // Envanter Kodu ve Kurum Damgası
            $inventoryCode = $coin->inventory_code ?? "#NUM-2026-{$coin->id}";
            $institutionText = "SİKKELOBEDİ NÜMİZMATİK ENSTİTÜSÜ • TESCİLLİ KORPUS";
            $rulerText = $coin->ruler ? " | " . mb_strtoupper($coin->ruler, 'UTF-8') : "";
            $watermarkText = "{$inventoryCode}  •  {$institutionText}{$rulerText}";

            // Filigran şerit yüksekliği (görsel boyutuna oranlı)
            $barHeight = max(38, (int) round($h * 0.055));
            $barY = $h - $barHeight;

            // TrueColor destekli şeffaflık katmanı
            imagealphablending($srcImg, true);
            imagesavealpha($srcImg, true);

            // Siyah yarı saydam alt bant (%45 Opaklık - alpha 70)
            $bgOverlay = imagecolorallocatealpha($srcImg, 15, 23, 42, 60);
            imagefilledrectangle($srcImg, 0, $barY, $w, $h, $bgOverlay);

            // Üst altın sınır çizgisi (Gold Accent Line)
            $goldLine = imagecolorallocatealpha($srcImg, 217, 119, 6, 40);
            imageline($srcImg, 0, $barY, $w, $barY, $goldLine);

            // Altın rozet ve beyaz metin renkleri
            $whiteColor = imagecolorallocatealpha($srcImg, 255, 255, 255, 20);
            $amberColor = imagecolorallocatealpha($srcImg, 251, 191, 36, 10);

            // GD dahili yazı tipi ile metni alt banda yaz
            $fontSize = ($w > 800) ? 5 : 3;
            $textY = $barY + (int) round(($barHeight - 16) / 2);

            // Envanter Kodu (Sarı / Kehribar Vurgusu)
            imagestring($srcImg, $fontSize, 20, $textY, $inventoryCode, $amberColor);

            // Kurumsal Damga Metni
            $offsetCode = (strlen($inventoryCode) * ($fontSize >= 5 ? 10 : 7)) + 35;
            imagestring($srcImg, $fontSize, $offsetCode, $textY, "•  " . $institutionText, $whiteColor);

            // 3. Hafif Çapraz Merkez Filigranı (Saydam Mühür Damgası)
            $sealColor = imagecolorallocatealpha($srcImg, 255, 255, 255, 115); // %90 şeffaf
            $centerText = "SİKKELOBEDİ ARŞİV";
            imagestring($srcImg, 5, (int) round($w / 2) - 80, (int) round($h / 2) - 10, $centerText, $sealColor);

            // 4. WebP Formatında Önbellek Dosyasına Kaydet (%85 Kalite)
            imagewebp($srcImg, $cachedFilePath, 85);
            imagedestroy($srcImg);

            return $cachedFilePath;
        } catch (\Throwable $e) {
            Log::error("Filigran oluşturma hatası: " . $e->getMessage(), ['coin_id' => $coin->id]);
            return $realPath;
        }
    }

    /**
     * Orijinal görselin fiziksel yolunu çözer.
     */
    protected function resolveSourcePath(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // 1. Güvenli storage/app/secure_coins içinde mi?
        $securePath = "{$this->secureDir}/" . basename($path);
        if (File::exists($securePath)) {
            return $securePath;
        }

        // 2. storage/app içinde mi?
        $storagePath = storage_path('app/' . ltrim($path, '/'));
        if (File::exists($storagePath)) {
            return $storagePath;
        }

        // 3. public/ içinde mi?
        $pubPath = public_path($path);
        if (File::exists($pubPath)) {
            return $pubPath;
        }

        return null;
    }

    /**
     * Görsel bulunamadığında dinamik boş sikke şablonu üretir.
     */
    protected function generatePlaceholder(Coin $coin, string $type): string
    {
        $placeholderPath = "{$this->cacheDir}/placeholder_{$coin->id}_{$type}.webp";
        if (File::exists($placeholderPath)) {
            return $placeholderPath;
        }

        $img = imagecreatetruecolor(600, 600);
        $bg = imagecolorallocate($img, 30, 41, 59);
        $gold = imagecolorallocate($img, 217, 119, 6);
        $white = imagecolorallocate($img, 255, 255, 255);

        imagefill($img, 0, 0, $bg);
        imageellipse($img, 300, 300, 450, 450, $gold);

        $text = "#NUM-2026-{$coin->id} | {$type}";
        imagestring($img, 5, 200, 290, $text, $white);

        imagewebp($img, $placeholderPath, 80);
        imagedestroy($img);

        return $placeholderPath;
    }
}

