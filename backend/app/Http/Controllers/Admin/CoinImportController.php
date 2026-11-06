<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Civilization;
use App\Services\CoinScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Throwable;

class CoinImportController extends Controller
{
    protected CoinScraperService $scraperService;

    public function __construct(CoinScraperService $scraperService)
    {
        $this->scraperService = $scraperService;
    }

    /**
     * Admin panelindeki sikke ekleme formunda AJAX ile VCoins vb. sitelerden
     * tek URL ile nümizmatik veri ve görselleri çeker.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function fetchFromUrl(Request $request): JsonResponse
    {
        // 1. URL parametresini doğrula
        $validator = Validator::make($request->all(), [
            'url' => ['required', 'url', 'max:2048'],
        ], [
            'url.required' => 'Lütfen veri çekilecek nümizmatik eser URL adresini giriniz.',
            'url.url'      => 'Lütfen geçerli bir internet adresi (https://www.vcoins.com/...) formatı giriniz.',
            'url.max'      => 'Girilen URL adresi çok uzun.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $url = (string) $request->input('url');

        try {
            Log::info("Admin CoinImportController: URL ayrıştırma isteği alındı -> {$url}");

            // 2. CoinScraperService scrapeAndTranslate metodunu çalıştır
            $scrapedResult = $this->scraperService->scrapeAndTranslate($url);

            // 3. Yerel depolanan görsellerin web erişim URL'lerini hazırla
            $aversImage = $scrapedResult['avers_image_path'] ?? $scrapedResult['avers_image'] ?? null;
            $reversImage = $scrapedResult['revers_image_path'] ?? $scrapedResult['revers_image'] ?? null;

            $aversImageUrl = $aversImage ? Storage::disk('public')->url($aversImage) : null;
            $reversImageUrl = $reversImage ? Storage::disk('public')->url($reversImage) : null;

            // 4. Veritabanındaki Medeniyet (Civilization) ile otomatik eşleştir
            $civilizationName = $scrapedResult['civilization'] ?? '';
            $matchedCivilizationId = null;

            if (!empty($civilizationName)) {
                $matchedCiv = Civilization::where('name', 'like', "%{$civilizationName}%")
                    ->orWhere('slug', 'like', '%' . strtolower(trim($civilizationName)) . '%')
                    ->first();

                if ($matchedCiv) {
                    $matchedCivilizationId = $matchedCiv->id;
                }
            }

            // 5. Form alanlarına basılacak yapılandırılmış nümizmatik veri paketi
            $responseData = [
                'title'                 => $scrapedResult['title'] ?? '',
                'civilization'          => $scrapedResult['civilization'] ?? '',
                'civilization_id'       => $matchedCivilizationId,
                'ruler'                 => $scrapedResult['ruler'] ?? '',
                'metal_type'            => $scrapedResult['metal_type'] ?? '',
                'standard_name'         => $scrapedResult['standard_name'] ?? '',
                'weight_grams'          => $scrapedResult['weight_grams'] ?? null,
                'diameter_mm'           => $scrapedResult['diameter_mm'] ?? null,
                'die_axis'              => $scrapedResult['die_axis'] ?? null,
                'year_start'            => $scrapedResult['year_start'] ?? null,
                'year_end'              => $scrapedResult['year_end'] ?? null,
                'condition_grade'       => $scrapedResult['condition_grade'] ?? 'VF',
                'avers_description'     => $scrapedResult['avers_description'] ?? '',
                'revers_description'    => $scrapedResult['revers_description'] ?? '',
                'reference_codes'       => $scrapedResult['reference_codes'] ?? [],
                'estimated_value_usd'   => $scrapedResult['estimated_value_usd'] ?? null,
                'estimated_value_min'   => $scrapedResult['estimated_value_usd'] ?? null,
                'estimated_value_max'   => $scrapedResult['estimated_value_usd'] ? round($scrapedResult['estimated_value_usd'] * 1.15, 2) : null,
                'currency'              => 'USD',
                'avers_image_path'      => $aversImage,
                'revers_image_path'     => $reversImage,
                'avers_image'           => $aversImage,
                'revers_image'          => $reversImage,
                'avers_image_url'       => $aversImageUrl,
                'revers_image_url'      => $reversImageUrl,
                'source_url'            => $url,
                'raw_title'             => $scrapedResult['raw_title'] ?? '',
                'raw_description'       => $scrapedResult['raw_description'] ?? '',
                'all_images'            => $scrapedResult['all_images'] ?? [],
            ];

            return response()->json([
                'success' => true,
                'message' => 'Nümizmatik eser verileri başarıyla çekildi ve Türkçeleştirildi.',
                'data'    => $responseData,
            ], 200);

        } catch (Throwable $e) {
            Log::error("CoinImportController Hata [{$url}]: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            // Kullanıcıya anlaşılır Türkçe hata mesajı üret (500 yerine 422 veya 200)
            $userFriendlyMessage = $this->resolveErrorMessage($e);

            return response()->json([
                'success'      => false,
                'message'      => $userFriendlyMessage,
                'error_detail' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }

    /**
     * Hata türüne göre kullanıcı dostu Türkçe hata mesajı döner.
     */
    protected function resolveErrorMessage(Throwable $e): string
    {
        $msg = $e->getMessage();

        if (str_contains($msg, 'Gemini API anahtarı bulunamadı') || str_contains($msg, 'aktif değil')) {
            return 'Yapay zeka analiz servisi aktif değil veya API anahtarı tanımlanmamış. Lütfen Admin -> AI Ayarları sayfasını kontrol ediniz.';
        }

        if (str_contains($msg, 'quota') || str_contains($msg, 'ResourceExhausted') || str_contains($msg, 'rate limit') || str_contains($msg, 'RESOURCE_EXHAUSTED')) {
            return 'Google Gemini API kotası tükendi veya anlık istek sınırına ulaşıldı. Lütfen birkaç dakika sonra tekrar deneyiniz veya yeni bir API anahtarı giriniz.';
        }

        if (str_contains($msg, 'Hedef siteye erişilemedi') || str_contains($msg, 'cURL error') || str_contains($msg, 'timeout') || str_contains($msg, 'Connection timed out')) {
            return 'Hedef nümizmatik web sitesi açılamadı veya bağlantı zaman aşımına uğradı. Lütfen URL adresinin tarayıcıda açıldığını doğrulayınız.';
        }

        if (str_contains($msg, 'içerik veya açıklama metni okunamadı')) {
            return 'Girilen sayfada nümizmatik ürün başlığı veya satış açıklaması tespit edilemedi. Lütfen geçerli bir ürün detay sayfası linki giriniz.';
        }

        return 'Veri çekme sırasında bir hata oluştu: ' . $msg;
    }
}

