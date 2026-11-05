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
     * Mobil kameradan taranan sikke görselini analiz ederek en yakın 3 nümizmatik eseri döner.
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
            'use_gemini_ai'   => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama hatası',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $imageBinary = null;
        $rawBase64 = null;

        if ($request->hasFile('image')) {
            $imageBinary = file_get_contents($request->file('image')->getRealPath());
            $rawBase64 = base64_encode($imageBinary);
        } elseif ($request->hasFile('photo')) {
            $imageBinary = file_get_contents($request->file('photo')->getRealPath());
            $rawBase64 = base64_encode($imageBinary);
        } elseif ($request->filled('image_base64') || $request->filled('photo_base64')) {
            $rawBase64 = $request->input('image_base64') ?? $request->input('photo_base64');
            $cleanBase64 = str_contains($rawBase64, ',') ? explode(',', $rawBase64)[1] : $rawBase64;
            $imageBinary = base64_decode($cleanBase64, true);
        }

        if (!$imageBinary) {
            return response()->json([
                'success' => false,
                'message' => 'Lütfen geçerli bir sikke fotoğrafı yükleyiniz (image veya image_base64).',
            ], 422);
        }

        try {
            $hints = [
                'civilization_id' => $request->input('civilization_id'),
                'metal_type'      => $request->input('metal_type'),
            ];

            // 1. Yerel Veritabanı Spektrum & Benzerlik Eşleştirme Motoru
            $result = $this->matcherService->match($imageBinary, $hints);

            // 2. İsteğe Bağlı Gemini Multimodal AI Teşhisi
            if ($request->boolean('use_gemini_ai', false)) {
                try {
                    $aiDiagnosis = $this->geminiService->scan($rawBase64);
                    $result['ai_diagnosis'] = $aiDiagnosis;

                    // AI Tarama Günlüğünü (Audit Log) Veritabanına Kaydet
                    AiScanLog::create([
                        'user_ip'             => $request->ip(),
                        'incoming_avers_path' => null,
                        'detected_title'      => $aiDiagnosis['identified_title'],
                        'confidence_score'    => $aiDiagnosis['confidence_score'],
                        'matched_coin_id'     => $result['matches'][0]['id'] ?? null,
                        'raw_ai_response'     => $aiDiagnosis,
                    ]);
                } catch (\Throwable $aiEx) {
                    $result['ai_diagnosis_error'] = $aiEx->getMessage();
                }
            }

            return response()->json($result, 200);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Görsel işleme ve eşleştirme sırasında beklenmeyen bir hata oluştu.',
                'debug'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Doğrudan Gemini AI Çok Modlu Nümizmatik Teşhis Uç Noktası (%100 Saf JSON).
     *
     * POST /api/v1/scan/gemini
     */
    public function geminiScan(Request $request): JsonResponse
    {
        $request->validate([
            'avers_base64'  => 'required_without:avers_file|string',
            'revers_base64' => 'nullable|string',
            'avers_file'    => 'nullable|image|max:15360',
            'revers_file'   => 'nullable|image|max:15360',
        ]);

        $aversInput = $request->hasFile('avers_file')
            ? $request->file('avers_file')->getRealPath()
            : $request->input('avers_base64');

        $reversInput = $request->hasFile('revers_file')
            ? $request->file('revers_file')->getRealPath()
            : $request->input('revers_base64');

        try {
            $analysis = $this->geminiService->scan($aversInput, $reversInput);

            // Veritabanındaki en yakın sikke ile eşleştir
            $matchedCoin = Coin::where('title', 'like', "%{$analysis['identified_title']}%")
                ->orWhere('ruler', 'like', "%{$analysis['ruler']}%")
                ->first();

            // Günlüğü (AiScanLog) Kaydet
            AiScanLog::create([
                'user_ip'          => $request->ip(),
                'detected_title'   => $analysis['identified_title'],
                'confidence_score' => $analysis['confidence_score'],
                'matched_coin_id'  => $matchedCoin?->id,
                'raw_ai_response'  => $analysis,
            ]);

            return response()->json([
                'success' => true,
                'data'    => $analysis,
                'matched_coin' => $matchedCoin ? [
                    'id'               => $matchedCoin->id,
                    'title'            => $matchedCoin->title,
                    'formatted_period' => $matchedCoin->formatted_period,
                    'avers_thumb_url'  => $matchedCoin->avers_thumb_url,
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
}
