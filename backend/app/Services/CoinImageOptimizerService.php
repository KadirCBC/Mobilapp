<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\ImageManager;

class CoinImageOptimizerService
{
    protected ImageManager $manager;

    /**
     * Hedef yükleme ana dizini (cPanel symlink sorunlarını aşmak için doğrudan public/uploads kullanılır).
     */
    protected string $basePublicDir;

    public function __construct()
    {
        // Intervention Image v3 GD Sürücüsü başlatma (cPanel paylaşımlı sunucularda %100 uyumlu)
        $this->manager = new ImageManager(new GdDriver());
        $this->basePublicDir = public_path('uploads/coins');
    }

    /**
     * Yüklenen sikke görselini WebP formatına dönüştürür ve thumbnail/medium türevlerini üretir.
     *
     * @param string $sourcePath Yüklenen geçici veya kalıcı dosya yolu
     * @param string $side 'obverse' (ön yüz) veya 'reverse' (arka yüz)
     * @return array Üretilen dosyaların web erişim yolları
     */
    public function process(string $sourcePath, string $side = 'obverse'): array
    {
        $realSource = $this->resolveRealPath($sourcePath);

        if (!$realSource || !file_exists($realSource)) {
            Log::warning("Görsel optimizasyonu için dosya bulunamadı: {$sourcePath}");
            return [
                'original' => $sourcePath,
                'medium'   => null,
                'thumb'    => null,
            ];
        }

        try {
            // Hedef klasörleri hazırla
            $targetDir = $this->basePublicDir . DIRECTORY_SEPARATOR . $side;
            if (!File::isDirectory($targetDir)) {
                File::makeDirectory($targetDir, 0755, true, true);
            }

            // Benzersiz dosya adı oluştur
            $hash = Str::random(20);
            $baseFileName = "coin_{$side}_{$hash}";

            // 1. Orijinal Görseli Oku (Intervention v3)
            $image = $this->manager->read($realSource);

            // A) Ana / Büyük WebP Versiyonu (Max 1600px genişlik, %80 Kalite)
            $largeImage = clone $image;
            $largeImage->scaleDown(width: 1600);
            $largeEncoded = $largeImage->toWebp(80);
            $largeRelativePath = "uploads/coins/{$side}/{$baseFileName}.webp";
            $largeEncoded->save(public_path($largeRelativePath));

            // B) Orta Boy (Medium) - Mobil Eser Detay Sayfası & Zoom (800x800px max, %80 Kalite)
            $mediumImage = clone $image;
            $mediumImage->scaleDown(width: 800, height: 800);
            $mediumEncoded = $mediumImage->toWebp(80);
            $mediumRelativePath = "uploads/coins/{$side}/{$baseFileName}_medium.webp";
            $mediumEncoded->save(public_path($mediumRelativePath));

            // C) Minyatür (Thumbnail) - Mobil Liste, Kart ve Avatar (300x300px kare kırpma)
            $thumbImage = clone $image;
            $thumbImage->cover(width: 300, height: 300);
            $thumbEncoded = $thumbImage->toWebp(80);
            $thumbRelativePath = "uploads/coins/{$side}/{$baseFileName}_thumb.webp";
            $thumbEncoded->save(public_path($thumbRelativePath));

            return [
                'original' => $largeRelativePath,
                'medium'   => $mediumRelativePath,
                'thumb'    => $thumbRelativePath,
            ];
        } catch (\Throwable $e) {
            Log::error("Intervention Image v3 optimizasyon hatası: " . $e->getMessage(), [
                'file' => $sourcePath,
            ]);

            return [
                'original' => $sourcePath,
                'medium'   => null,
                'thumb'    => null,
            ];
        }
    }

    /**
     * Eski görsel dosyalarını ve türevlerini sunucudan temizler.
     */
    public function deleteOldImages(?string $relativePath): void
    {
        if (empty($relativePath)) {
            return;
        }

        $fullPath = public_path($relativePath);
        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }

        // Medium ve Thumb türevlerini temizle
        $dir = dirname($fullPath);
        $filename = pathinfo($fullPath, PATHINFO_FILENAME);
        $ext = pathinfo($fullPath, PATHINFO_EXTENSION);

        $mediumPath = $dir . DIRECTORY_SEPARATOR . $filename . '_medium.' . $ext;
        $thumbPath = $dir . DIRECTORY_SEPARATOR . $filename . '_thumb.' . $ext;

        if (File::exists($mediumPath)) {
            File::delete($mediumPath);
        }
        if (File::exists($thumbPath)) {
            File::delete($thumbPath);
        }
    }

    /**
     * Gelen görsel yolunun fiziksel disk yolunu çözer (storage/ veya doğrudan public).
     */
    protected function resolveRealPath(string $path): ?string
    {
        // 1. Zaten tam yol mu?
        if (file_exists($path)) {
            return $path;
        }

        // 2. public_path içinde mi?
        $pub = public_path($path);
        if (file_exists($pub)) {
            return $pub;
        }

        // 3. storage/app/public içinde mi?
        $storage = storage_path('app/public/' . ltrim($path, '/'));
        if (file_exists($storage)) {
            return $storage;
        }

        // 4. storage/app içinde mi?
        $appStorage = storage_path('app/' . ltrim($path, '/'));
        if (file_exists($appStorage)) {
            return $appStorage;
        }

        return null;
    }
}

