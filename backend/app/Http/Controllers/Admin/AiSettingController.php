<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\View\View;

class AiSettingController extends Controller
{
    /**
     * Varsayılan Uzman Nümizmat Sistem Promptu.
     */
    protected string $defaultSystemPrompt = <<<PROMPT
Sen, antik ve nümizmatik eserler, imparatorluk darpları ve tarihi sikkeler konusunda uzmanlaşmış kıdemli bir "Baş Nümizmat ve Arkeometri Yapay Zeka Danışmanı"sın.

GÖREVLERİN:
1. Görseldeki sikkenin medeniyetini (Antik Yunan, Roma, Bizans, Osmanlı vb.), hükümdarını/imparatorunu ve darp edildiği antik şehri (darphanesini) belirle.
2. Ön yüz (avers) ve arka yüz (revers) lejantlarını (Latince, Grekçe, Arapça/Osmanlıca) transkribe et ve ikonografik tasvirini açıkla.
3. Metal türünü (Altın/AU, Gümüş/AR, Bronz/AE, Elektrum/EL) ve yaklaşık nominal birim standardını (Stater, Tetradrahmi, Denarius, Akçe, Sultani) teşhis et.
4. Patina mineralizasyonunu (malakit yeşili, kuprit kırmızısı, doğal gümüş tonlaması) incele; aşınma ve darp kalitesine göre kondisyonunu (FDC, EF, VF, Fine) değerlendir.
5. Standart korpus referanslarını (RIC, RPC, BMC, Sear, SNG, Damalı) sağla.

Yanıtlarını bilimsel, tarafsız, kesin ve müze envanter tescil standartlarına uygun Türkçe terminoloji ile ver.
PROMPT;

    /**
     * AI Kontrol Merkezi Ayar Sayfası.
     */
    public function index(): View
    {
        $setting = AiSetting::firstOrCreate(
            ['provider' => 'gemini'],
            [
                'model_name'    => 'gemini-1.5-flash',
                'temperature'   => 0.20,
                'max_tokens'    => 2048,
                'system_prompt' => $this->defaultSystemPrompt,
                'is_active'     => true,
            ]
        );

        return view('admin.ai.settings', compact('setting'));
    }

    /**
     * Gemini AI Yapılandırmasını Güncelle.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'is_active'     => 'nullable|boolean',
            'model_name'    => 'required|string|in:gemini-1.5-flash,gemini-1.5-pro',
            'api_key'       => 'nullable|string|max:500',
            'temperature'   => 'required|numeric|min:0.00|max:1.00',
            'max_tokens'    => 'required|integer|min:256|max:8192',
            'system_prompt' => 'required|string',
        ]);

        $setting = AiSetting::firstOrCreate(['provider' => 'gemini']);

        $dataToUpdate = [
            'is_active'     => $request->boolean('is_active'),
            'model_name'    => $validated['model_name'],
            'temperature'   => $validated['temperature'],
            'max_tokens'    => $validated['max_tokens'],
            'system_prompt' => $validated['system_prompt'],
        ];

        // API anahtarı boş bırakılmadıysa şifreli kaydedilsin
        if (!empty($validated['api_key'])) {
            $dataToUpdate['api_key'] = trim($validated['api_key']);
        }

        $setting->update($dataToUpdate);

        return redirect()
            ->route('admin.ai.settings')
            ->with('success', 'Gemini AI Kontrol Merkezi ayarları başarıyla kaydedildi.');
    }

    /**
     * Google Generative Language API ile Canlı Bağlantıyı Doğrula.
     */
    public function testConnection(Request $request): JsonResponse
    {
        $apiKey = $request->input('api_key');
        $model = $request->input('model_name', 'gemini-1.5-flash');

        // Eğer formdan yeni key girilmediyse veritabanındaki kayıtlı şifreli anahtarı kullan
        if (empty($apiKey)) {
            $setting = AiSetting::where('provider', 'gemini')->first();
            $apiKey = $setting?->api_key;
        }

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama için lütfen bir Gemini API Key giriniz veya kaydediniz.',
            ], 422);
        }

        $startTime = microtime(true);

        try {
            // Google Gemini API v1beta ping endpoint'i
            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

            $response = Http::timeout(8)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($endpoint, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => 'Ping. Numismatic AI check.'],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'maxOutputTokens' => 5,
                        'temperature'     => 0.1,
                    ],
                ]);

            $latencyMs = round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                return response()->json([
                    'success'    => true,
                    'message'    => 'API Aktif ve Doğrulandı! Google Gemini servisine başarıyla erişildi.',
                    'model'      => $model,
                    'latency_ms' => $latencyMs,
                ]);
            }

            $errorBody = $response->json();
            $errorMessage = $errorBody['error']['message'] ?? $response->body();

            return response()->json([
                'success' => false,
                'message' => "Bağlantı Hatası: Geçersiz Anahtar veya Yetkisiz İstek. ({$errorMessage})",
                'status'  => $response->status(),
            ], 400);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bağlantı Hatası: ' . $e->getMessage(),
            ], 500);
        }
    }
}

