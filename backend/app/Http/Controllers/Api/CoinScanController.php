<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiScanLog;
use App\Models\Coin;
use App\Services\GeminiCoinScannerService;
use App\Services\NumismaticVisualMatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CoinScanController extends Controller
{
    protected NumismaticVisualMatcherService $matcherService;
    protected GeminiCoinScannerService $geminiService;

    public function __construct(
        NumismaticVisualMatcherService $matcherService,
        GeminiCoinScannerService $geminiService
    ) {
        $this->matcherService = $matcherService;
        $this->geminiService = $geminiService;
    }

    /**
     * Doğrudan Gemini AI Çok Modlu Nümizmatik Teşhis Uç Noktası (%100 Saf JSON).
     *
     * POST /api/v1/scan/gemini
     */
    public function geminiScan(Request $request): JsonResponse
    {
        // 1. Doğrulama: avers_image (base64 string veya multipart dosya kabul edilir)
        $validator = Validator::make($request->all(), [
            'avers_image'   => 'required_without_all:avers_base64,image|string',
            'avers_base64'  => 'nullable|string',
            'image'         => 'nullable|image|max:15360',
            'revers_image'  => 'nullable|string',
            'revers_base64' => 'nullable|string',
            'revers_file'   => 'nullable|image|max:15360',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lütfen geçerli bir ön yüz (avers_image) görsel verisi sağlayınız.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Ön Yüz Görselini Belirle
        $aversInput = null;
        if ($request->hasFile('image')) {
            $aversInput = $request->file('image')->getRealPath();
        } else {
            $aversInput = $request->input('avers_image') ?? $request->input('avers_base64');
        }

        // Arka Yüz Görselini Belirle (Varsa)
        $reversInput = null;
        if ($request->hasFile('revers_file')) {
            $reversInput = $request->file('revers_file')->getRealPath();
        } else {
            $reversInput = $request->input('revers_image') ?? $request->input('revers_base64');
        }

        try {
            // 2. Gemini Çok Modlu Nümizmatik Teşhisini Başlat (%100 Saf JSON)
            $analysis = $this->geminiService->scan($aversInput, $reversInput);

            // 3. Yerel Veritabanındaki Eserlerle Eşleştirme (matched_archive_coin)
            $matchedCoin = null;

            // A) Başlık veya Hükümdara göre arama
            $identifiedTitle = $analysis['identified_title'] ?? '';
            $ruler = $analysis['ruler'] ?? '';

            $candidateQuery = Coin::with(['civilization', 'mint'])->published();

            if (!empty($identifiedTitle) || !empty($ruler)) {
                $candidateQuery->where(function ($q) use ($identifiedTitle, $ruler) {
                    if (!empty($identifiedTitle)) {
                        $q->where('title', 'like', "%{$identifiedTitle}%");
                    }
                    if (!empty($ruler)) {
                        $q->orWhere('ruler', 'like', "%{$ruler}%");
                    }
                });

                $matchedCoin = $candidateQuery->first();
            }

            // Eğer birebir bulunamadıysa medeniyet ve metal türüne göre en yakın vitrin eserini al
            if (!$matchedCoin && !empty($analysis['civilization'])) {
                $matchedCoin = Coin::with(['civilization', 'mint'])
                    ->published()
                    ->whereHas('civilization', function ($q) use ($analysis) {
                        $q->where('name', 'like', "%{$analysis['civilization']}%");
                    })
                    ->first();
            }

            // 4. Denetim Günlüğünü (ai_scan_logs) Veritabanına Kaydet
            $scanLog = AiScanLog::create([
                'user_ip'             => $request->ip(),
                'incoming_avers_path' => null,
                'incoming_revers_path'=> null,
                'detected_title'      => $analysis['identified_title'],
                'confidence_score'    => $analysis['confidence_score'],
                'matched_coin_id'     => $matchedCoin?->id,
                'raw_ai_response'     => $analysis,
            ]);

            // 5. Mobil İstemci İçin Zengin JSON Çıktısı Hazırla
            return response()->json([
                'success'    => true,
                'scan_id'    => $scanLog->id,
                'ai_analysis'=> $analysis,
                'matched_archive_coin' => $matchedCoin ? [
                    'id'                    => $matchedCoin->id,
                    'title'                 => $matchedCoin->title,
                    'slug'                  => $matchedCoin->slug,
                    'civilization'          => $matchedCoin->civilization?->name,
                    'mint'                  => $matchedCoin->mint?->name,
                    'ruler'                 => $matchedCoin->ruler,
                    'metal_type'            => $matchedCoin->metal_type,
                    'standard_name'         => $matchedCoin->standard_name,
                    'formatted_period'      => $matchedCoin->formatted_period,
                    'formatted_value_range' => $matchedCoin->formatted_value_range,
                    'currency'              => $matchedCoin->currency,
                    'avers_thumb_url'       => $matchedCoin->avers_thumb_url,
                    'revers_thumb_url'      => $matchedCoin->revers_thumb_url,
                    'reference_codes'       => $matchedCoin->reference_codes,
                    'detail_url'            => url("/api/v1/coins/{$matchedCoin->id}"),
                    'app_deep_link'         => "mobilapp://coin/{$matchedCoin->id}",
                ] : null,
            ], 200);

        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gemini AI analizi gerçekleştirilemedi.',
                'debug'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Hibrit Yerel Spektrum ve Kamera Tanıma Motoru.
     *
     * POST /api/v1/scan/identify
     */
    public function identify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image'           => 'nullable|image|max:15360',
            'photo'           => 'nullable|image|max:15360',
            'image_base64'    => 'nullable|string',
            'photo_base64'    => 'nullable|string',
            'civilization_id' => 'nullable|integer|exists:civilizations,id',
            'metal_type'      => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama hatası',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $imageBinary = null;
        if ($request->hasFile('image')) {
            $imageBinary = file_get_contents($request->file('image')->getRealPath());
        } elseif ($request->hasFile('photo')) {
            $imageBinary = file_get_contents($request->file('photo')->getRealPath());
        } elseif ($request->filled('image_base64') || $request->filled('photo_base64')) {
            $raw = $request->input('image_base64') ?? $request->input('photo_base64');
            $clean = str_contains($raw, ',') ? explode(',', $raw)[1] : $raw;
            $imageBinary = base64_decode($clean, true);
        }

        if (!$imageBinary) {
            return response()->json([
                'success' => false,
                'message' => 'Lütfen geçerli bir sikke fotoğrafı yükleyiniz.',
            ], 422);
        }

        try {
            $hints = [
                'civilization_id' => $request->input('civilization_id'),
                'metal_type'      => $request->input('metal_type'),
            ];

            $result = $this->matcherService->match($imageBinary, $hints);

            return response()->json($result, 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
