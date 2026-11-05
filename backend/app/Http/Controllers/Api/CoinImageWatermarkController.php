<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coin;
use App\Services\CoinWatermarkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CoinImageWatermarkController extends Controller
{
    protected CoinWatermarkService $watermarkService;

    public function __construct(CoinWatermarkService $watermarkService)
    {
        $this->watermarkService = $watermarkService;
    }

    /**
     * Güvenli ve dinamik filigranlı sikke görselini servis eder.
     * Bu uç nokta 'signed' middleware'i ile korunur; geçersiz veya süresi dolmuş URL'ler reddedilir.
     *
     * GET /api/v1/coins/{coin}/image/{type}
     */
    public function serve(Request $request, Coin $coin, string $type): BinaryFileResponse|JsonResponse
    {
        // 1. Tip Kontrolü (avers / revers)
        if (!in_array($type, ['avers', 'revers'])) {
            return response()->json([
                'success' => false,
                'message' => 'Geçersiz yüz tipi. "avers" veya "revers" olmalıdır.',
            ], 400);
        }

        // 2. Yayın Kontrolü (Yayında değilse ve giriş yapılmamışsa 403)
        if (!$coin->is_published && !auth('sanctum')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Bu eser henüz kamuya açık yayında değildir.',
            ], 403);
        }

        // 3. Filigranlı WebP Görsel Yolunu Al (Önbellekli & Optimize)
        $filePath = $this->watermarkService->getWatermarkedImagePath($coin, $type);

        // 4. HTTP Önbellek Başlıkları ile Güvenli Servis
        $lastModified = filemtime($filePath);
        $etag = md5_file($filePath);

        // İstemci tarafı 304 Not Modified kontrolü
        if ($request->header('If-None-Match') === $etag) {
            return response()->json(null, 304);
        }

        return response()->file($filePath, [
            'Content-Type'        => 'image/webp',
            'Content-Disposition' => "inline; filename=\"coin_{$coin->id}_{$type}.webp\"",
            'Cache-Control'       => 'private, max-age=7200, must-revalidate',
            'ETag'                => $etag,
            'Last-Modified'       => gmdate('D, d M Y H:i:s', $lastModified) . ' GMT',
            'X-Watermark-Status'  => 'Applied',
            'X-Inventory-Code'    => $coin->inventory_code,
        ]);
    }

    /**
     * Mobil uygulama için esere ait süreli imzalı (Signed URL) görsel bağlantılarını üretir.
     *
     * GET /api/v1/coins/{coin}/signed-urls
     */
    public function getSignedUrls(Request $request, Coin $coin): JsonResponse
    {
        $durationMinutes = (int) $request->input('expires_in', 120); // Varsayılan 2 saat

        $expiresAt = now()->addMinutes($durationMinutes);

        $signedAversUrl = URL::temporarySignedRoute(
            'api.coins.watermarked_image',
            $expiresAt,
            ['coin' => $coin->id, 'type' => 'avers']
        );

        $signedReversUrl = URL::temporarySignedRoute(
            'api.coins.watermarked_image',
            $expiresAt,
            ['coin' => $coin->id, 'type' => 'revers']
        );

        return response()->json([
            'success'        => true,
            'coin_id'        => $coin->id,
            'inventory_code' => $coin->inventory_code,
            'expires_at'     => $expiresAt->toIso8601String(),
            'expires_in_sec' => $durationMinutes * 60,
            'images'         => [
                'avers_signed_url'  => $signedAversUrl,
                'revers_signed_url' => $signedReversUrl,
            ],
        ]);
    }
}

