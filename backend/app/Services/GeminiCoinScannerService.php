<?php

namespace App\Services;

use App\Models\AiSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiCoinScannerService
{
    /**
     * Varsayılan Nümizmatik JSON Şeması İstemi.
     */
    protected string $jsonSchemaInstructions = <<<SCHEMA
Sen kıdemli bir Baş Nümizmat ve Arkeometri Uzmanısın. Ekteki sikke fotoğrafını (ön yüz ve varsa arka yüz) incele.
Yanıtını KESİNLİKLE aşağıdaki JSON şemasına uygun ve %100 geçerli saf JSON olarak üret:

{
  "identified_title": "Sikke tam adı (Örn: Domitianus Cistophorus veya Kroisos Ağır Altın Stateri)",
  "civilization": "Medeniyet adı (Örn: Roma İmparatorluğu, Antik Yunan, Bizans, Osmanlı)",
  "ruler": "Hükümdar / İmparator / Sultan adı",
  "metal_type": "Maden cinsi (Altın/AU, Gümüş/AR, Bronz/AE, Elektrum/EL)",
  "period": "Tarihsel basım dönemi (Örn: M.S. 82 veya M.Ö. 560 – 546)",
  "mint": "Darp edildiği antik şehir / darphane (Örn: Efes, Sardis, Roma, Kostantiniyye)",
  "estimated_condition": "Tahmini kondisyon derecesi (FDC, EF, VF, Fine)",
  "confidence_score": 94.5,
  "avers_description": "Ön yüz büst, figür ve Latince/Grekçe/Osmanlıca lejant transkripsiyonu",
  "revers_description": "Arka yüz tapınak, tanrıça, çelenk veya tuğra tasviri ve lejantı",
  "authenticity_notes": "Yüzey patinası, döküm kabarcığı veya modern replika şüphesi olup olmadığına dair uzman değerlendirmesi"
}
SCHEMA;

    /**
     * Mobilden gelen sikke fotoğraflarını Gemini Çok Modlu (Multimodal) API'ye gönderir ve JSON döner.
     *
     * @param string $aversBase64OrPath Ön yüz fotoğrafı (Base64 dizesi veya yerel dosya yolu)
     * @param string|null $reversBase64OrPath İsteğe bağlı arka yüz fotoğrafı (Base64 veya dosya yolu)
     * @return array Parse edilmiş nümizmatik analiz sonuç dizisi
     *
     * @throws \RuntimeException Aktif servis yoksa veya API hatası oluşursa
     */
    public function scan(string $aversBase64OrPath, ?string $reversBase64OrPath = null): array
    {
        // 1. AiSetting tablosundan aktif ayarları dinamik oku
        $setting = AiSetting::where('provider', 'gemini')
            ->where('is_active', true)
            ->latest()
            ->first();

        if (!$setting) {
            throw new \RuntimeException('Gemini AI nümizmatik tarama servisi şu anda aktif değil veya yapılandırılmamış.');
        }

        $apiKey = $setting->api_key;
        if (empty($apiKey)) {
            throw new \RuntimeException('Gemini API anahtarı bulunamadı. Lütfen AI Kontrol Merkezi üzerinden geçerli bir API Key giriniz.');
        }

        $model = $setting->model_name ?: 'gemini-1.5-flash';
        $temperature = (float) ($setting->temperature ?? 0.20);
        $maxTokens = (int) ($setting->max_tokens ?? 2048);
        $baseSystemPrompt = $setting->system_prompt ?: 'Sen uzman bir antik sikke nümizmatısın.';

        // 2. Base64 görsel verilerini normalize et
        $aversBase64 = $this->normalizeBase64($aversBase64OrPath);
        if (empty($aversBase64)) {
            throw new \InvalidArgumentException('Ön yüz (avers) görsel verisi boş veya geçersiz.');
        }

        // 3. İstek Gövdesini (Payload) Oluştur
        $parts = [
            [
                'text' => "Lütfen ekteki nümizmatik sikkeyi analiz et. Belirtilen JSON şemasına harfiyen uyarak Türkçe çıktı ver.",
            ],
            [
                'inline_data' => [
                    'mime_type' => 'image/jpeg',
                    'data'      => $aversBase64,
                ],
            ],
        ];

        // Eğer arka yüz varsa ekle
        if (!empty($reversBase64OrPath)) {
            $reversBase64 = $this->normalizeBase64($reversBase64OrPath);
            if (!empty($reversBase64)) {
                $parts[] = [
                    'inline_data' => [
                        'mime_type' => 'image/jpeg',
                        'data'      => $reversBase64,
                    ],
                ];
            }
        }

        // Birleşik sistem talimatı
        $fullSystemPrompt = $baseSystemPrompt . "\n\n" . $this->jsonSchemaInstructions;

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $fullSystemPrompt],
                ],
            ],
            'contents' => [
                [
                    'role'  => 'user',
                    'parts' => $parts,
                ],
            ],
            'generationConfig' => [
                'temperature'       => $temperature,
                'maxOutputTokens'   => $maxTokens,
                'responseMimeType'  => 'application/json', // %100 Saf JSON Zorunluluğu
            ],
        ];

        // 4. Gemini API v1beta Uç Noktasına POST İsteği
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

        try {
            $response = Http::timeout(25)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($endpoint, $payload);

            if (!$response->successful()) {
                $errorBody = $response->json();
                $errorMsg = $errorBody['error']['message'] ?? $response->body();
                Log::error("Gemini API Tarama Hatası (HTTP {$response->status()}): {$errorMsg}");
                throw new \RuntimeException("Google Gemini API Hatası (HTTP {$response->status()}): {$errorMsg}");
            }

            // 5. Yanıtı Parse Et
            $responseData = $response->json();
            $rawJsonText = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (empty($rawJsonText)) {
                throw new \RuntimeException('Gemini API boş veya anlaşılamayan bir içerik döndürdü.');
            }

            // Olası markdown işaretlerini temizle
            $cleanJsonText = trim($rawJsonText);
            if (str_starts_with($cleanJsonText, '```json')) {
                $cleanJsonText = preg_replace('/^```json\s*/i', '', $cleanJsonText);
                $cleanJsonText = preg_replace('/\s*```$/', '', $cleanJsonText);
            } elseif (str_starts_with($cleanJsonText, '```')) {
                $cleanJsonText = preg_replace('/^```\s*/', '', $cleanJsonText);
                $cleanJsonText = preg_replace('/\s*```$/', '', $cleanJsonText);
            }

            $parsed = json_decode($cleanJsonText, true);

            if (!is_array($parsed)) {
                Log::error("Gemini JSON parse hatası. Ham yanıt: {$rawJsonText}");
                throw new \RuntimeException('Gemini API geçerli bir JSON çıktısı üretemedi.');
            }

            // Gerekli anahtarların eksik olması durumunda varsayılanlarla güvenceye al
            return [
                'identified_title'    => $parsed['identified_title'] ?? 'Bilinmeyen Antik Sikke',
                'civilization'        => $parsed['civilization'] ?? 'Bilinmiyor',
                'ruler'               => $parsed['ruler'] ?? null,
                'metal_type'          => $parsed['metal_type'] ?? 'Belirlenemedi',
                'period'              => $parsed['period'] ?? null,
                'mint'                => $parsed['mint'] ?? null,
                'estimated_condition' => $parsed['estimated_condition'] ?? 'VF',
                'confidence_score'    => isset($parsed['confidence_score']) ? (float) $parsed['confidence_score'] : 85.0,
                'avers_description'   => $parsed['avers_description'] ?? null,
                'revers_description'  => $parsed['revers_description'] ?? null,
                'authenticity_notes'  => $parsed['authenticity_notes'] ?? 'Belirgin bir döküm veya modern replika anomalisi gözlemlenmedi.',
                '_raw_gemini'         => $parsed,
            ];

        } catch (\Throwable $e) {
            Log::error("GeminiCoinScannerService İstisna: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * VCoins ve benzeri sitelerden kazınan İngilizce satış açıklamasını
     * Gemini AI ile analiz edip Türkçe yapılandırılmış nümizmatik veriye dönüştürür.
     *
     * @param string $rawText Kazınan ham metin (başlık, açıklama, parametreler)
     * @return array Yapılandırılmış Türkçe nümizmatik veri dizisi
     */
    public function analyzeScrapedText(string $rawText): array
    {
        $setting = AiSetting::where('provider', 'gemini')
            ->where('is_active', true)
            ->latest()
            ->first();

        if (!$setting) {
            throw new \RuntimeException('Gemini AI servisi şu anda aktif değil veya yapılandırılmamış.');
        }

        $apiKey = $setting->api_key;
        if (empty($apiKey)) {
            throw new \RuntimeException('Gemini API anahtarı bulunamadı.');
        }

        $model = $setting->model_name ?: 'gemini-1.5-flash';
        $temperature = (float) ($setting->temperature ?? 0.20);
        $maxTokens = (int) ($setting->max_tokens ?? 2048);

        $systemInstruction = <<<INSTRUCTION
Sen uluslararası kıdemli bir nümizmat ve antik sikke uzmanısın. Sana sunulan İngilizce nümizmatik ürün metnini analiz et, terimleri Türkçe nümizmatik literatürüne uygun olarak çevir ve tam olarak şu JSON şemasında yanıt ver:
- title (Türkçe tam sikke adı)
- civilization (Medeniyet: Antik Yunan, Roma İmparatorluğu, Bizans vb.)
- ruler (Hükümdar / İmparator)
- metal_type (Altın (AU), Gümüş (AR), Bronz (AE), Elektrum vb.)
- standard_name (Stater, Tetradrahmi, Denarius, Solidus vb.)
- weight_grams (float, örn: 8.42, sayı veya null)
- diameter_mm (float, örn: 19.5, sayı veya null)
- die_axis (Kalıp yönü, örn: 6h veya 12h)
- year_start (integer, MÖ için negatif örn: -336)
- year_end (integer, örn: -323)
- condition_grade (FDC, EF, VF, Fine vb.)
- avers_description (Ön yüzün Türkçe rölyef, portre ve lejant açıklaması)
- revers_description (Arka yüzün Türkçe rölyef, figür ve lejant açıklaması)
- reference_codes (RIC, RPC, Sear, BMC kodları)
- estimated_value_usd (Satış fiyatı varsa nümerik, örn: 1250.00)

Yanıtını KESİNLİKLE geçerli saf JSON formatında döndür. JSON haricinde hiçbir ek metin, açıklama veya markdown bloğu üretme.
INSTRUCTION;

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemInstruction],
                ],
            ],
            'contents' => [
                [
                    'role'  => 'user',
                    'parts' => [
                        ['text' => "Aşağıdaki nümizmatik ürün açıklamasını analiz et ve belirtilen JSON formatında çıktı ver:\n\n" . $rawText],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature'       => $temperature,
                'maxOutputTokens'   => $maxTokens,
                'responseMimeType'  => 'application/json',
            ],
        ];

        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

        $response = Http::timeout(30)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($endpoint, $payload);

        if (!$response->successful()) {
            $errorMsg = $response->json()['error']['message'] ?? $response->body();
            Log::error("Gemini Scraper Metin Analizi Hatası: {$errorMsg}");
            throw new \RuntimeException("Gemini API Hatası: {$errorMsg}");
        }

        $responseData = $response->json();
        $rawJson = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '{}';

        $cleanJson = trim($rawJson);
        if (str_starts_with($cleanJson, '```json')) {
            $cleanJson = preg_replace('/^```json\s*/i', '', $cleanJson);
            $cleanJson = preg_replace('/\s*```$/', '', $cleanJson);
        } elseif (str_starts_with($cleanJson, '```')) {
            $cleanJson = preg_replace('/^```\s*/', '', $cleanJson);
            $cleanJson = preg_replace('/\s*```$/', '', $cleanJson);
        }

        $parsed = json_decode($cleanJson, true) ?: [];

        return [
            'title'               => $parsed['title'] ?? 'Antik Sikke',
            'civilization'        => $parsed['civilization'] ?? 'Bilinmiyor',
            'ruler'               => $parsed['ruler'] ?? null,
            'metal_type'          => $parsed['metal_type'] ?? 'Belirlenemedi',
            'standard_name'       => $parsed['standard_name'] ?? 'Birim',
            'weight_grams'        => isset($parsed['weight_grams']) && is_numeric($parsed['weight_grams']) ? (float) $parsed['weight_grams'] : null,
            'diameter_mm'         => isset($parsed['diameter_mm']) && is_numeric($parsed['diameter_mm']) ? (float) $parsed['diameter_mm'] : null,
            'die_axis'            => $parsed['die_axis'] ?? null,
            'year_start'          => isset($parsed['year_start']) && is_numeric($parsed['year_start']) ? (int) $parsed['year_start'] : null,
            'year_end'            => isset($parsed['year_end']) && is_numeric($parsed['year_end']) ? (int) $parsed['year_end'] : null,
            'condition_grade'     => $parsed['condition_grade'] ?? 'VF',
            'avers_description'   => $parsed['avers_description'] ?? null,
            'revers_description'  => $parsed['revers_description'] ?? null,
            'reference_codes'     => $parsed['reference_codes'] ?? [],
            'estimated_value_usd' => isset($parsed['estimated_value_usd']) && is_numeric($parsed['estimated_value_usd']) ? (float) $parsed['estimated_value_usd'] : null,
            '_raw'                => $parsed,
        ];
    }

    /**
     * Gelen veriyi (dosya yolu, data-uri veya ham base64) temiz saf base64 formatına çevirir.
     */
    protected function normalizeBase64(string $input): ?string
    {
        $input = trim($input);

        // 1. Eğer yerel dosya yolu ise dosya içeriğini oku ve encode et
        if (file_exists($input) && is_readable($input)) {
            return base64_encode(file_get_contents($input));
        }

        // 2. Eğer "data:image/jpeg;base64,..." şeklinde data-uri ise ön eki kırp
        if (str_contains($input, ',')) {
            $input = explode(',', $input)[1];
        }

        // Boşluk ve satır sonlarını temizle
        $input = str_replace(["\r", "\n", ' '], '', $input);

        // Geçerli base64 mü?
        if (base64_decode($input, true) !== false) {
            return $input;
        }

        return null;
    }
}

