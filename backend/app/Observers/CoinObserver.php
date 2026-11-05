<?php

namespace App\Observers;

use App\Models\Coin;
use App\Services\CoinImageOptimizerService;

class CoinObserver
{
    protected CoinImageOptimizerService $optimizer;

    public function __construct(CoinImageOptimizerService $optimizer)
    {
        $this->optimizer = $optimizer;
    }

    /**
     * Sikke kaydedilmeden önce tetiklenir (Create veya Update).
     * Yüklenen avers ve revers görsellerini WebP'ye dönüştürür ve türevlerini üretir.
     */
    public function saving(Coin $coin): void
    {
        // 1. Ön Yüz (Avers) Görseli Değişti mi?
        if ($coin->isDirty('avers_image') && !empty($coin->avers_image)) {
            // Eğer zaten optimize edilmiş uploads/coins/ yolundaysa tekrar işleme sokma
            if (!str_contains($coin->avers_image, '_medium.webp') && !str_contains($coin->avers_image, '_thumb.webp')) {
                // Eski görseli sil
                if ($coin->exists && $coin->getOriginal('avers_image')) {
                    $this->optimizer->deleteOldImages($coin->getOriginal('avers_image'));
                }

                // WebP dönüştürme ve türev üretme
                $processed = $this->optimizer->process($coin->avers_image, 'obverse');
                $coin->avers_image = $processed['original'];
            }
        }

        // 2. Arka Yüz (Revers) Görseli Değişti mi?
        if ($coin->isDirty('revers_image') && !empty($coin->revers_image)) {
            if (!str_contains($coin->revers_image, '_medium.webp') && !str_contains($coin->revers_image, '_thumb.webp')) {
                // Eski görseli sil
                if ($coin->exists && $coin->getOriginal('revers_image')) {
                    $this->optimizer->deleteOldImages($coin->getOriginal('revers_image'));
                }

                // WebP dönüştürme ve türev üretme
                $processed = $this->optimizer->process($coin->revers_image, 'reverse');
                $coin->revers_image = $processed['original'];
            }
        }
    }

    /**
     * Sikke veri tabanından silindiğinde sunucudaki tüm görselleri ve türevlerini temizler.
     */
    public function deleted(Coin $coin): void
    {
        if ($coin->avers_image) {
            $this->optimizer->deleteOldImages($coin->avers_image);
        }
        if ($coin->revers_image) {
            $this->optimizer->deleteOldImages($coin->revers_image);
        }
    }
}

