<?php

namespace App\Services;

use App\Models\Civilization;
use App\Models\Coin;
use App\Models\Mint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NumismaticImportService
{
    /**
     * cPanel paylaşımlı sunucular için toplu okuma parçacık (chunk) boyutu.
     */
    protected int $chunkSize = 50;

    /**
     * Kabul edilebilir standart maden türleri ve eşleme sözlüğü.
     */
    protected array $validMetals = [
        'altin'    => 'Altın (AU)',
        'altın'    => 'Altın (AU)',
        'au'       => 'Altın (AU)',
        'gold'     => 'Altın (AU)',
        'gumus'    => 'Gümüş (AR)',
        'gümüş'    => 'Gümüş (AR)',
        'ar'       => 'Gümüş (AR)',
        'silver'   => 'Gümüş (AR)',
        'bronz'    => 'Bronz (AE)',
        'bronze'   => 'Bronz (AE)',
        'ae'       => 'Bronz (AE)',
        'elektrum' => 'Elektrum (EL)',
        'el'       => 'Elektrum (EL)',
        'electrum' => 'Elektrum (EL)',
        'bakir'    => 'Bakır',
        'bakır'    => 'Bakır',
        'copper'   => 'Bakır',
        'bilyon'   => 'Bilyon',
        'billon'   => 'Bilyon',
    ];

    /**
     * Başlık sütunlarını otomatik algılamak için eşleme sözlüğü.
     */
    protected array $headerAliases = [
        'title'             => ['baslik', 'başlık', 'title', 'ad', 'sikke', 'sikke_adi', 'name'],
        'civilization'      => ['medeniyet', 'civilization', 'donem', 'dönem', 'imparatorluk', 'empire'],
        'mint'              => ['darphane', 'mint', 'mint_name', 'sehir', 'şehir', 'antik_sehir'],
        'ruler'             => ['hukumdar', 'hükümdar', 'ruler', 'imparator', 'emperor', 'sultan'],
        'metal_type'        => ['maden', 'maden_turu', 'metal', 'metal_type', 'materyal', 'madeni'],
        'standard_name'     => ['standart', 'standard_name', 'birim', 'nominal', 'tip', 'denomination'],
        'weight_grams'      => ['gramaj', 'agirlik', 'ağırlık', 'weight', 'weight_grams', 'gr', 'gram'],
        'diameter_mm'       => ['cap', 'çap', 'diameter', 'diameter_mm', 'mm'],
        'die_axis'          => ['kalip_acisi', 'kalıp_açısı', 'die_axis', 'axis', 'saat_yonu'],
        'year_start'        => ['yil_baslangic', 'yıl_başlangıç', 'year_start', 'baslangic', 'tarih_baslangic', 'start_year'],
        'year_end'          => ['yil_bitis', 'yıl_bitiş', 'year_end', 'bitis', 'tarih_bitis', 'end_year'],
        'rarity_code'       => ['nadirlik', 'rarity', 'rarity_code', 'nadir'],
        'condition_grade'   => ['kondisyon', 'condition', 'condition_grade', 'derece'],
        'estimated_val_min' => ['deger_min', 'değer_min', 'fiyat_min', 'estimated_value_min', 'min_fiyat'],
        'estimated_val_max' => ['deger_max', 'değer_max', 'fiyat_max', 'estimated_value_max', 'max_fiyat'],
        'currency'          => ['para_birimi', 'currency', 'birim_para'],
        'avers_image'       => ['on_yuz_gorsel', 'ön_yüz_görsel', 'avers_image', 'avers_url', 'obverse_image', 'on_yuz'],
        'revers_image'      => ['arka_yuz_gorsel', 'arka_yüz_görsel', 'revers_image', 'revers_url', 'reverse_image', 'arka_yuz'],
        'avers_description' => ['on_yuz_aciklama', 'ön_yüz_açıklama', 'avers_description', 'obverse_desc'],
        'revers_description'=> ['arka_yuz_aciklama', 'arka_yüz_açıklama', 'revers_description', 'reverse_desc'],
        'reference_codes'   => ['referans', 'referans_kodlari', 'reference_codes', 'ric', 'rpc', 'bmc', 'sear'],
    ];

    /**
     * CSV/Excel dosyasını parçalı (chunked) ve bellek dostu okuyarak içeri aktarır.
     *
     * @param string $filePath Dosyanın tam sistem yolu
     * @param bool $downloadImages Harici görsel URL'lerini indirip yerel storage'a kaydet
     * @return array Sonuç raporu (başarılı, atlanan, hata listesi)
     */
    public function import(string $filePath, bool $downloadImages = true): array
    {
        // cPanel timeout sınırlarını aşmamak için script süresini esnet
        if (!ini_get('safe_mode')) {
            @set_time_limit(300);
        }

        $report = [
            'total_rows'      => 0,
            'imported_count'  => 0,
            'failed_count'    => 0,
            'failed_rows'     => [], // Hatalı Satırlar Raporu
            'download_errors' => [],
        ];

        if (!file_exists($filePath) || !is_readable($filePath)) {
            $report['failed_rows'][] = [
                'row' => 0,
                'data' => [],
                'errors' => ['Dosya bulunamadı veya okunamıyor.'],
            ];
            return $report;
        }

        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            $report['failed_rows'][] = [
                'row' => 0,
                'data' => [],
                'errors' => ['Dosya akışı açılamadı.'],
            ];
            return $report;
        }

        // BOM temizliği (UTF-8)
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // 1. Satır: Başlıkları oku ve kolon indeks haritasını çıkar
        $rawHeaders = fgetcsv($handle, 0, $this->detectDelimiter($filePath));
        if (!$rawHeaders) {
            fclose($handle);
            $report['failed_rows'][] = [
                'row' => 1,
                'data' => [],
                'errors' => ['Başlık satırı bulunamadı veya dosya boş.'],
            ];
            return $report;
        }

        $headerMap = $this->buildHeaderMap($rawHeaders);

        // Satır satır okuma döngüsü (cPanel RAM limitini 128MB altında tutar)
        $rowNumber = 1;
        $batch = [];

        while (($row = fgetcsv($handle, 0, $this->detectDelimiter($filePath))) !== false) {
            $rowNumber++;

            // Tamamen boş satırları atla
            if (empty(array_filter($row))) {
                continue;
            }

            $report['total_rows']++;
            $mappedData = $this->extractRowData($row, $headerMap);

            // Satırı doğrula
            $validation = $this->validateRow($mappedData, $rowNumber);

            if (!$validation['is_valid']) {
                $report['failed_count']++;
                $report['failed_rows'][] = [
                    'row'    => $rowNumber,
                    'title'  => $mappedData['title'] ?? "Satır {$rowNumber}",
                    'data'   => $mappedData,
                    'errors' => $validation['errors'],
                ];
                continue;
            }

            $batch[] = [
                'row_number' => $rowNumber,
                'data'       => $validation['cleaned_data'],
            ];

            // Belirlenen chunk boyutuna ulaşıldığında toplu kaydet
            if (count($batch) >= $this->chunkSize) {
                $this->processBatch($batch, $report, $downloadImages);
                $batch = [];
            }
        }

        // Kalan son parçayı işle
        if (!empty($batch)) {
            $this->processBatch($batch, $report, $downloadImages);
        }

        fclose($handle);

        return $report;
    }

    /**
     * Bir veri parçasını (batch) veri tabanına işler.
     */
    protected function processBatch(array $batch, array &$report, bool $downloadImages): void
    {
        foreach ($batch as $item) {
            $data = $item['data'];
            $rowNum = $item['row_number'];

            try {
                // Medeniyet ilişkilendirmesi (Yoksa oluştur veya getir)
                $civilization = Civilization::firstOrCreate(
                    ['name' => $data['civilization_name']],
                    [
                        'slug'      => Str::slug($data['civilization_name']),
                        'is_active' => true,
                    ]
                );

                // Darphane ilişkilendirmesi (Belirtilmişse)
                $mintId = null;
                if (!empty($data['mint_name'])) {
                    $mint = Mint::firstOrCreate(
                        [
                            'civilization_id' => $civilization->id,
                            'name'            => $data['mint_name'],
                        ],
                        [
                            'ancient_name'    => $data['mint_name'],
                        ]
                    );
                    $mintId = $mint->id;
                }

                // Harici Görselleri İndir & Kaydet
                $aversImagePath = null;
                $reversImagePath = null;

                if ($downloadImages) {
                    if (!empty($data['avers_image_url'])) {
                        $aversImagePath = $this->downloadAndStoreImage($data['avers_image_url'], 'obverse');
                    }
                    if (!empty($data['revers_image_url'])) {
                        $reversImagePath = $this->downloadAndStoreImage($data['revers_image_url'], 'reverse');
                    }
                } else {
                    $aversImagePath = $data['avers_image_url'] ?? null;
                    $reversImagePath = $data['revers_image_url'] ?? null;
                }

                // Sikke Kaydı veya Güncelleme
                $slug = Str::slug($data['title']);
                $originalSlug = $slug;
                $counter = 1;
                while (Coin::where('slug', $slug)->exists()) {
                    $slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }

                Coin::create([
                    'civilization_id'     => $civilization->id,
                    'mint_id'             => $mintId,
                    'title'               => $data['title'],
                    'slug'                => $slug,
                    'ruler'               => $data['ruler'] ?? null,
                    'metal_type'          => $data['metal_type'],
                    'standard_name'       => $data['standard_name'] ?? 'Birim Belirtilmemiş',
                    'weight_grams'        => $data['weight_grams'] ?? null,
                    'diameter_mm'         => $data['diameter_mm'] ?? null,
                    'die_axis'            => $data['die_axis'] ?? null,
                    'year_start'          => $data['year_start'] ?? null,
                    'year_end'            => $data['year_end'] ?? null,
                    'rarity_code'         => $data['rarity_code'] ?? 'C',
                    'condition_grade'     => $data['condition_grade'] ?? null,
                    'estimated_value_min' => $data['estimated_value_min'] ?? null,
                    'estimated_value_max' => $data['estimated_value_max'] ?? null,
                    'currency'            => $data['currency'] ?? 'USD',
                    'avers_description'   => $data['avers_description'] ?? null,
                    'revers_description'  => $data['revers_description'] ?? null,
                    'avers_image'         => $aversImagePath,
                    'revers_image'        => $reversImagePath,
                    'reference_codes'     => $data['reference_codes'] ?? [],
                    'is_featured'         => false,
                    'is_published'        => true,
                ]);

                $report['imported_count']++;
            } catch (\Throwable $e) {
                Log::error("İçe aktarma hatası (Satır {$rowNum}): " . $e->getMessage());
                $report['failed_count']++;
                $report['failed_rows'][] = [
                    'row'    => $rowNum,
                    'title'  => $data['title'] ?? "Satır {$rowNum}",
                    'data'   => $data,
                    'errors' => ['Veritabanı kayıt hatası: ' . $e->getMessage()],
                ];
            }
        }
    }

    /**
     * Satır verisini kurallara göre doğrular ve temizler.
     */
    protected function validateRow(array $data, int $rowNumber): array
    {
        $errors = [];
        $cleaned = [];

        // 1. Başlık Kontrolü
        if (empty($data['title'])) {
            $errors[] = 'Eser/Sikke başlığı boş olamaz.';
        } else {
            $cleaned['title'] = trim($data['title']);
        }

        // 2. Medeniyet Kontrolü
        if (empty($data['civilization'])) {
            $errors[] = 'Medeniyet alanı zorunludur.';
        } else {
            $cleaned['civilization_name'] = trim($data['civilization']);
        }

        // 3. Maden Türü Kontrolü ve Fuzzy Normalizasyon
        if (empty($data['metal_type'])) {
            $errors[] = 'Maden türü (Altın, Gümüş, Bronz vb.) belirtilmemiş.';
        } else {
            $normalizedMetal = $this->normalizeMetal($data['metal_type']);
            if (!$normalizedMetal) {
                $errors[] = "Geçersiz maden türü: '{$data['metal_type']}'. Kabul edilenler: Altın (AU), Gümüş (AR), Bronz (AE), Elektrum (EL), Bakır, Bilyon.";
            } else {
                $cleaned['metal_type'] = $normalizedMetal;
            }
        }

        // 4. Tarih Formatı Kontrolü (M.Ö. -560 veya 82 gibi)
        $yearStart = $this->parseYear($data['year_start'] ?? null);
        $yearEnd = $this->parseYear($data['year_end'] ?? null);

        if (!empty($data['year_start']) && $yearStart === null) {
            $errors[] = "Geçersiz başlangıç yılı: '{$data['year_start']}'. Örn: -560, M.Ö. 480 veya 117 olmalıdır.";
        } else {
            $cleaned['year_start'] = $yearStart;
        }

        if (!empty($data['year_end']) && $yearEnd === null) {
            $errors[] = "Geçersiz bitiş yılı: '{$data['year_end']}'.";
        } else {
            $cleaned['year_end'] = $yearEnd;
        }

        // 5. Nümerik Değerler (Ağırlık, Çap, Değer)
        $cleaned['weight_grams'] = !empty($data['weight_grams']) ? (float) str_replace(',', '.', $data['weight_grams']) : null;
        $cleaned['diameter_mm'] = !empty($data['diameter_mm']) ? (float) str_replace(',', '.', $data['diameter_mm']) : null;
        $cleaned['estimated_value_min'] = !empty($data['estimated_val_min']) ? (float) str_replace(['$', '€', '₺', ','], ['', '', '', '.'], $data['estimated_val_min']) : null;
        $cleaned['estimated_value_max'] = !empty($data['estimated_val_max']) ? (float) str_replace(['$', '€', '₺', ','], ['', '', '', '.'], $data['estimated_val_max']) : null;

        // 6. Metin & Referanslar
        $cleaned['ruler'] = !empty($data['ruler']) ? trim($data['ruler']) : null;
        $cleaned['mint_name'] = !empty($data['mint']) ? trim($data['mint']) : null;
        $cleaned['standard_name'] = !empty($data['standard_name']) ? trim($data['standard_name']) : 'Birim Belirtilmemiş';
        $cleaned['die_axis'] = !empty($data['die_axis']) ? trim($data['die_axis']) : null;
        $cleaned['rarity_code'] = !empty($data['rarity_code']) ? strtoupper(trim($data['rarity_code'])) : 'C';
        $cleaned['condition_grade'] = !empty($data['condition_grade']) ? strtoupper(trim($data['condition_grade'])) : null;
        $cleaned['currency'] = !empty($data['currency']) ? strtoupper(trim($data['currency'])) : 'USD';
        $cleaned['avers_description'] = !empty($data['avers_description']) ? trim($data['avers_description']) : null;
        $cleaned['revers_description'] = !empty($data['revers_description']) ? trim($data['revers_description']) : null;
        $cleaned['avers_image_url'] = !empty($data['avers_image']) ? trim($data['avers_image']) : null;
        $cleaned['revers_image_url'] = !empty($data['revers_image']) ? trim($data['revers_image']) : null;

        // Referans kodları (JSON veya string ayıklama)
        $cleaned['reference_codes'] = $this->parseReferences($data['reference_codes'] ?? null);

        return [
            'is_valid'     => empty($errors),
            'errors'       => $errors,
            'cleaned_data' => $cleaned,
        ];
    }

    /**
     * Maden ismini esnek eşleme ile normalize eder.
     */
    protected function normalizeMetal(string $input): ?string
    {
        $clean = mb_strtolower(trim($input), 'UTF-8');
        $clean = str_replace(['ı', 'ğ', 'ü', 'ş', 'ö', 'ç'], ['i', 'g', 'u', 's', 'o', 'c'], $clean);

        foreach ($this->validMetals as $key => $target) {
            if ($clean === $key || str_contains($clean, $key)) {
                return $target;
            }
        }

        return null;
    }

    /**
     * Tarih metinlerini tamsayıya dönüştürür (M.Ö. için negatif).
     */
    protected function parseYear(?string $yearStr): ?int
    {
        if ($yearStr === null || trim($yearStr) === '') {
            return null;
        }

        $str = mb_strtolower(trim($yearStr), 'UTF-8');
        $isBC = str_contains($str, 'm.ö') || str_contains($str, 'mö') || str_contains($str, 'bc') || str_starts_with($str, '-');

        // Sadece rakamları ayıkla
        preg_match('/\d+/', $str, $matches);
        if (empty($matches)) {
            return null;
        }

        $year = (int) $matches[0];
        return $isBC ? -$year : $year;
    }

    /**
     * Referans kodlarını yapısal diziye dönüştürür.
     */
    protected function parseReferences(?string $refStr): array
    {
        if (empty($refStr)) {
            return [];
        }

        // Eğer JSON formatındaysa
        $decoded = json_decode($refStr, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // Virgül veya noktalı virgülle ayrılmış "RIC: II 114, BMC: 241" metni
        $result = [];
        $parts = preg_split('/[,;\n]+/', $refStr);
        foreach ($parts as $part) {
            if (str_contains($part, ':')) {
                [$k, $v] = explode(':', $part, 2);
                $result[trim($k)] = trim($v);
            } else {
                $result['REF'] = trim($part);
            }
        }

        return $result;
    }

    /**
     * Harici web görselini indirir, mime tipini denetler ve storage/coins içerisine kaydeder.
     */
    protected function downloadAndStoreImage(string $url, string $type = 'obverse'): ?string
    {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        try {
            // 8 saniye zaman aşımı (cPanel hosting dostu)
            $response = Http::timeout(8)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NumismaticCatalogImporter/1.0',
                ])
                ->get($url);

            if (!$response->successful()) {
                Log::warning("Görsel indirilemedi (HTTP {$response->status()}): {$url}");
                return null;
            }

            $content = $response->body();
            $contentType = $response->header('Content-Type') ?? '';

            // Dosya uzantısını belirle
            $extension = match (true) {
                str_contains($contentType, 'image/webp') => 'webp',
                str_contains($contentType, 'image/png')  => 'png',
                str_contains($contentType, 'image/gif')  => 'gif',
                default                                  => 'jpg',
            };

            $fileName = "coins/{$type}/" . Str::random(24) . ".{$extension}";

            // public diskine kaydet (storage/app/public/coins/...)
            Storage::disk('public')->put($fileName, $content);

            return $fileName;
        } catch (\Throwable $e) {
            Log::warning("Görsel indirme hatası [{$url}]: " . $e->getMessage());
            return null;
        }
    }

    /**
     * CSV kolon başlıklarını anahtar alanlarla eşleştirir.
     */
    protected function buildHeaderMap(array $rawHeaders): array
    {
        $map = [];

        foreach ($rawHeaders as $index => $header) {
            $cleanHeader = mb_strtolower(trim($header), 'UTF-8');
            $cleanHeader = str_replace([' ', '-', '_', '.'], '', $cleanHeader);

            foreach ($this->headerAliases as $fieldKey => $aliases) {
                foreach ($aliases as $alias) {
                    $cleanAlias = str_replace([' ', '-', '_', '.'], '', $alias);
                    if ($cleanHeader === $cleanAlias) {
                        $map[$fieldKey] = $index;
                        break 2;
                    }
                }
            }
        }

        return $map;
    }

    /**
     * Ham CSV satırını etiketli diziye dönüştürür.
     */
    protected function extractRowData(array $row, array $headerMap): array
    {
        $extracted = [];
        foreach ($headerMap as $fieldKey => $index) {
            $extracted[$fieldKey] = $row[$index] ?? null;
        }
        return $extracted;
    }

    /**
     * CSV sınırlayıcı karakterini (virgül veya noktalı virgül) otomatik algılar.
     */
    protected function detectDelimiter(string $filePath): string
    {
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (empty($lines)) {
            return ',';
        }

        $firstLine = $lines[0];
        $commaCount = substr_count($firstLine, ',');
        $semicolonCount = substr_count($firstLine, ';');
        $tabCount = substr_count($firstLine, "\t");

        if ($semicolonCount > $commaCount && $semicolonCount > $tabCount) {
            return ';';
        }
        if ($tabCount > $commaCount) {
            return "\t";
        }

        return ',';
    }
}

