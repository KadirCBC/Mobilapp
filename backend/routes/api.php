<?php

use App\Http\Controllers\Api\CoinImageWatermarkController;
use App\Http\Controllers\Api\CoinScanController;
use App\Models\Coin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Nümizmatik Mobil Uygulama Servisleri
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Mobil Kamera Sikke Tanıma & Spektrum Eşleştirme Uç Noktası
    Route::post('/scan/identify', [CoinScanController::class, 'identify']);

    // 2. Doğrudan Gemini Çok Modlu (Multimodal) Nümizmatik AI Teşhis Uç Noktası
    Route::post('/scan/gemini', [CoinScanController::class, 'geminiScan']);

    // 3. Sikke Detay Sorgulama Uç Noktası (Provenans & Konservasyon ile birlikte)
    Route::get('/coins/{id}', function ($id) {
        $coin = Coin::with(['civilization', 'mint', 'provenances'])->published()->findOrFail($id);
        
        // Mobil uygulama için süreli imzalı filigranlı görsel URL'lerini iliştir
        $data = $coin->toArray();
        $data['watermarked_signed_urls'] = [
            'avers'  => $coin->getSignedAversUrl(120),
            'revers' => $coin->getSignedReversUrl(120),
        ];

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    });

    // 4. Dinamik Filigranlı Güvenli Görsel Servisi (Signed URL Korumalı)
    Route::get('/coins/{coin}/image/{type}', [CoinImageWatermarkController::class, 'serve'])
        ->name('api.coins.watermarked_image')
        ->middleware('signed');

    // 5. Esere ait Yeni İmzalı URL Üretme Uç Noktası
    Route::get('/coins/{coin}/signed-urls', [CoinImageWatermarkController::class, 'getSignedUrls']);
});
