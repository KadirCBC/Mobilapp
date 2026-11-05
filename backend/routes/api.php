<?php

use App\Http\Controllers\Api\CivilizationController;
use App\Http\Controllers\Api\CoinController;
use App\Http\Controllers\Api\CoinImageWatermarkController;
use App\Http\Controllers\Api\CoinScanController;
use App\Http\Controllers\Api\MintController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - React Native (Expo) Mobil Uygulama RESTful Servisleri
|--------------------------------------------------------------------------
|
| Mobil uygulamanın kamera taraması, katalog filtreleme, detay ekranı,
| antik darphaneler haritası ve medeniyet keşif modüllerini besler.
|
*/

Route::prefix('v1')->group(function () {

    // 1. KAMERA & AI SİKKE TARAMA
    // ----------------------------------------------------------------------
    // Gemini AI Çok Modlu Nümizmatik Teşhis (%100 Saf JSON)
    Route::post('/scan/gemini', [CoinScanController::class, 'geminiScan'])->name('api.scan.gemini');

    // Yerel Spektrum ve Kamera Tanıma Motoru
    Route::post('/scan/identify', [CoinScanController::class, 'identify'])->name('api.scan.identify');


    // 2. SİKKE VE TARİHİ ESER KATALOĞU
    // ----------------------------------------------------------------------
    // Sayfalı (pagination: 20), çoklu maden, medeniyet, darphane ve arama filtreli liste
    Route::get('/coins', [CoinController::class, 'index'])->name('api.coins.index');

    // Tekil sikke detayları, galeri fotoğrafları, RIC referansları ve darphane koordinatları
    Route::get('/coins/{id}', [CoinController::class, 'show'])->name('api.coins.show');


    // 3. ANTİK DARPHANELER & COĞRAFİ HARİTA
    // ----------------------------------------------------------------------
    // Mobil harita ekranı için koordinatları ve sikke sayılarıyla darphane listesi
    Route::get('/mints', [MintController::class, 'index'])->name('api.mints.index');


    // 4. MEDENİYETLER & ÇAĞLAR
    // ----------------------------------------------------------------------
    // Tüm medeniyetler, dönem bilgileri ve aktif eser sayıları
    Route::get('/civilizations', [CivilizationController::class, 'index'])->name('api.civilizations.index');


    // 5. GÜVENLİK & İMZALI FİLİGRANLI GÖRSELLER (Signed URLs)
    // ----------------------------------------------------------------------
    // Envanter kodu ve kurum damgalı dinamik WebP görsel servisi
    Route::get('/coins/{coin}/image/{type}', [CoinImageWatermarkController::class, 'serve'])
        ->name('api.coins.watermarked_image')
        ->middleware('signed');

    // Süreli imzalı görsel URL'lerini üretme uç noktası
    Route::get('/coins/{coin}/signed-urls', [CoinImageWatermarkController::class, 'getSignedUrls'])
        ->name('api.coins.signed_urls');

});
