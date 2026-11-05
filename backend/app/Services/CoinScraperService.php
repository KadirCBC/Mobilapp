<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\ImageManager;

class CoinScraperService
{
    protected GeminiCoinScannerService $geminiScanner;
    protected ImageManager $imageManager;

    /**
     * Web kazıma için gerçekçi masaüstü tarayıcı User-Agent bilgisi.
     */
    protected string $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 (NumismaticsBot/1.0; +https://numismatics.local)';

    public function __construct(GeminiCoinScannerService $geminiScanner)
    {
        $this->geminiScanner = $geminiScanner;
        $this->imageManager = new ImageManager(new GdDriver());
    }

    /**
     * Verilen URL'den (VCoins vb.) tek linkle nümizmatik verileri çeker,
     * Gemini AI ile Türkçeleştirip yapılandırır ve görselleri WebP olarak kaydeder.
     *
     * @param string $url VCoins veya benzeri antik sikke ürün detay linki
     * @return array Yapılandırılmış nümizmatik veriler ve yerel görsel yolları
     *
     * @throws \InvalidArgumentException Geçersiz URL durumunda
     * @throws \RuntimeException Sayfa çekilemezse veya analiz başarısız olursa
     */
    public function scrapeAndProcess(string $url): array
    {
        $url = trim($url);

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new \InvalidArgumentException("Geçersiz URL formatı: {$url}");
        }

        Log::info("CoinScraperService: Veri çekme başlatıldı -> {$url}");

        // 1. Sayfa HTML içeriğini çek (User-Agent ve Accept başlıklarıyla)
        $html = $this->fetchHtml($url);

        // 2. Ham Başlık, Açıklama Gövdesi, Fiyat ve Yüksek Çözünürlüklü Görsel URL'lerini yakala
        $rawExtracted = $this->extractRawContent($html, $url);

        if (empty($rawExtracted['title']) && empty($rawExtracted['description'])) {
            throw new \RuntimeException("Belirtilen sayfadan nümizmatik içerik veya açıklama metni okunamadı.");
        }

        // 3. Ham metni GeminiCoinScannerService aracılığıyla Gemini API'ye gönder
        $rawCombinedText = "Ürün Başlığı:\n{$rawExtracted['title']}\n\n";
        if (!empty($rawExtracted['price'])) {
            $rawCombinedText .= "Satış Fiyatı:\n{$rawExtracted['price']}\n\n";
        }
        $rawCombinedText .= "Ürün Açıklaması:\n{$rawExtracted['description']}";

        $structuredData = $this->geminiScanner->analyzeScrapedText($rawCombinedText);

        // 4. Görselleri cPanel'de storage/app/public/coins/imported/ altına WebP olarak kaydet
        $savedImages = $this->downloadAndSaveImages($rawExtracted['image_urls']);

        // 5. Ayrıştırılan JSON verisi ile yerel sunucuya kaydedilen avers_image_path ve revers_image_path değerlerini birleştirip tek bir dizi döndür
        return array_merge($structuredData, [
            'success'            => true,
            'source_url'         => $url,
            'raw_title'          => $rawExtracted['title'],
            'raw_description'    => $rawExtracted['description'],
            'raw_price'          => $rawExtracted['price'] ?? null,
            'raw_image_urls'     => $rawExtracted['image_urls'],
            'avers_image_path'   => $savedImages['avers_image_path'],
            'revers_image_path'  => $savedImages['revers_image_path'],
            // Ek uyumluluk anahtarları
            'avers_image'        => $savedImages['avers_image_path'],
            'revers_image'       => $savedImages['revers_image_path'],
            'all_images'         => $savedImages['all'],
            'structured_data'    => $structuredData,
        ]);
    }

    /**
     * Hedef URL'e HTTP GET isteği atarak HTML içeriğini çeker.
     */
    protected function fetchHtml(string $url): string
    {
        try {
            $response = Http::timeout(25)
                ->withHeaders([
                    'User-Agent'      => $this->userAgent,
                    'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language' => 'en-US,en;q=0.9,tr;q=0.8',
                    'Cache-Control'   => 'no-cache',
                    'Pragma'          => 'no-cache',
                ])
                ->get($url);

            if (!$response->successful()) {
                Log::error("CoinScraperService HTTP Hatası ({$response->status()}): {$url}");
                throw new \RuntimeException("Hedef siteye erişilemedi (HTTP {$response->status()}). URL: {$url}");
            }

            $body = $response->body();

            if (empty($body)) {
                throw new \RuntimeException("Hedef sayfadan boş yanıt döndü.");
            }

            return $body;
        } catch (\Throwable $e) {
            Log::error("CoinScraperService fetchHtml Hatası: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * HTML belgesinden başlık, açıklama metni, fiyat ve sikke görsellerini ayrıştırır.
     */
    protected function extractRawContent(string $html, string $sourceUrl): array
    {
        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        // UTF-8 karakterlerin bozulmasını önlemek için xml öneki
        @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        // --- 1. BAŞLIK ÇIKARMA (VCoins ve genel nümizmatik seçicileri) ---
        $title = '';
        $titleQueries = [
            "//span[@id='lblItemTitle']",
            "//h1[contains(@class, 'item-title')]",
            "//h1[contains(@class, 'product')]",
            "//h1",
            "//meta[@property='og:title']/@content",
            "//title",
        ];

        foreach ($titleQueries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes && $nodes->length > 0) {
                $nodeVal = trim($nodes->item(0)->nodeValue ?? '');
                if (!empty($nodeVal)) {
                    $title = $nodeVal;
                    break;
                }
            }
        }

        // Başlıktan site adı gibi gereksiz uzantıları temizle
        $title = preg_replace('/(\s*\|\s*VCoins.*|\s*-\s*VCoins.*|\s*\|\s*MA-Shops.*)$/i', '', $title);

        // --- 2. SATIŞ FİYATI ÇIKARMA ---
        $price = '';
        $priceQueries = [
            "//span[@id='lblPrice']",
            "//span[contains(@class, 'item-price')]",
            "//span[contains(@class, 'price')]",
            "//div[contains(@class, 'price')]",
            "//meta[@property='product:price:amount']/@content",
        ];

        foreach ($priceQueries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes && $nodes->length > 0) {
                $nodeVal = trim($nodes->item(0)->nodeValue ?? '');
                if (!empty($nodeVal)) {
                    $price = $nodeVal;
                    break;
                }
            }
        }

        // Regex ile fiyat desteği (örn: $1,250.00 veya €850)
        if (empty($price) && preg_match('/(?:US\s*)?[\$\€\£]\s*([0-9,]+(?:\.[0-9]{2})?)/i', $html, $priceMatches)) {
            $price = trim($priceMatches[0]);
        }

        // --- 3. AÇIKLAMA GÖVDESİ (DESCRIPTION) ÇIKARMA ---
        $description = '';
        $descQueries = [
            "//span[@id='lblDescription']",
            "//div[contains(@class, 'item-description')]",
            "//div[@id='divDescription']",
            "//div[contains(@class, 'product-description')]",
            "//div[contains(@class, 'description')]",
            "//meta[@property='og:description']/@content",
        ];

        foreach ($descQueries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes && $nodes->length > 0) {
                $nodeVal = trim($nodes->item(0)->nodeValue ?? '');
                if (!empty($nodeVal) && strlen($nodeVal) > strlen($description)) {
                    $description = $nodeVal;
                }
            }
        }

        // Eğer spesifik alan bulunamadıysa metin bloklarını topla
        if (empty($description)) {
            $bodyNodes = $xpath->query("//body");
            if ($bodyNodes && $bodyNodes->length > 0) {
                $rawBody = $bodyNodes->item(0)->textContent;
                $description = trim(preg_replace('/\s+/', ' ', $rawBody));
            }
        }

        // --- 4. ÖN / ARKA YÜZ YÜKSEK ÇÖZÜNÜRLÜKLÜ GÖRSELLERİ ÇIKARMA ---
        $imageUrls = [];

        // A) VCoins ve büyük galeri zoom/lightbox linkleri (yüksek çözünürlük)
        $anchorImages = $xpath->query("//a[contains(@class, 'fancybox') or contains(@class, 'zoom') or contains(@rel, 'gallery') or contains(@href, '.jpg') or contains(@href, '.png') or contains(@href, '.webp')]/@href");
        if ($anchorImages) {
            foreach ($anchorImages as $node) {
                $href = trim($node->nodeValue ?? '');
                if ($this->isLikelyCoinImage($href)) {
                    $imageUrls[] = $this->resolveAbsoluteUrl($href, $sourceUrl);
                }
            }
        }

        // B) VCoins <img> etiketleri
        $imgQueries = [
            "//img[@id='imgObverse' or @id='imgReverse']/@src",
            "//img[contains(@class, 'item-image') or contains(@class, 'product-image') or contains(@class, 'main-image')]/@src",
            "//div[contains(@class, 'item-images')]//img/@src",
            "//div[contains(@class, 'product')]//img/@src",
            "//meta[@property='og:image']/@content",
            "//img/@src",
        ];

        foreach ($imgQueries as $query) {
            $imgNodes = $xpath->query($query);
            if ($imgNodes) {
                foreach ($imgNodes as $node) {
                    $src = trim($node->nodeValue ?? '');
                    if ($this->isLikelyCoinImage($src)) {
                        $imageUrls[] = $this->resolveAbsoluteUrl($src, $sourceUrl);
                    }
                }
            }
        }

        // Benzersiz ve geçerli URL'leri filtrele
        $imageUrls = array_values(array_unique(array_filter($imageUrls)));

        return [
            'title'       => html_entity_decode(trim($title), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'price'       => html_entity_decode(trim($price), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'description' => html_entity_decode(trim($description), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'image_urls'  => $imageUrls,
        ];
    }

    /**
     * Görsel URL'sinin sikke fotoğrafı olup olmadığını denetler (logo, ikon, sepet vb. eler).
     */
    protected function isLikelyCoinImage(string $url): bool
    {
        if (empty($url)) {
            return false;
        }

        $lower = strtolower($url);

        // Hariç tutulacak şablonlar
        $blacklist = [
            'logo', 'icon', 'cart', 'banner', 'flag', 'spacer', 'pixel', 'avatar',
            'button', 'header', 'footer', 'social', 'facebook', 'twitter', 'instagram',
            'loader', 'spinner', 'badge', 'payment', 'visa', 'mastercard', 'paypal',
        ];

        foreach ($blacklist as $badWord) {
            if (str_contains($lower, $badWord)) {
                return false;
            }
        }

        // Desteklenen görsel uzantıları veya VCoins ürün depolama yolları
        $isImageExtension = preg_match('/\.(jpg|jpeg|png|webp)($|\?)/i', $lower);
        $isProductStore = str_contains($lower, '/stores/') || str_contains($lower, '/product/') || str_contains($lower, '/items/');

        return $isImageExtension || $isProductStore;
    }

    /**
     * Göreceli (relative) URL'leri tam kök etki alanına bağlar.
     */
    protected function resolveAbsoluteUrl(string $relativeUrl, string $baseUrl): string
    {
        $relativeUrl = trim($relativeUrl);

        if (str_starts_with($relativeUrl, 'http://') || str_starts_with($relativeUrl, 'https://')) {
            return $relativeUrl;
        }

        if (str_starts_with($relativeUrl, '//')) {
            return 'https:' . $relativeUrl;
        }

        $parsed = parse_url($baseUrl);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';

        if (str_starts_with($relativeUrl, '/')) {
            return "{$scheme}://{$host}{$relativeUrl}";
        }

        $path = $parsed['path'] ?? '/';
        $baseDir = dirname($path);
        if ($baseDir === '\\' || $baseDir === '.') {
            $baseDir = '';
        }

        return "{$scheme}://{$host}{$baseDir}/{$relativeUrl}";
    }

    /**
     * Kazınan görselleri cPanel'de storage/app/public/coins/imported/ dizinine indirip
     * Intervention Image ile WebP formatına dönüştürerek kaydeder.
     *
     * @param array $imageUrls Kazınan görsel URL'leri listesi
     * @return array Ön yüz (avers_image_path), arka yüz (revers_image_path) ve tüm yollar
     */
    protected function downloadAndSaveImages(array $imageUrls): array
    {
        $savedPaths = [];
        $targetDir = 'coins/imported';

        // storage/app/public/coins/imported/ dizininin varlığını sağla
        if (!Storage::disk('public')->exists($targetDir)) {
            Storage::disk('public')->makeDirectory($targetDir);
        }

        // Ön yüz ve arka yüz için ilk 2 yüksek çözünürlüklü görseli öncelikle indir
        $targetUrls = array_slice($imageUrls, 0, 4);

        foreach ($targetUrls as $idx => $imgUrl) {
            $sidePrefix = $idx === 0 ? 'avers' : ($idx === 1 ? 'revers' : "gallery_{$idx}");
            $savedRelativePath = $this->downloadAndConvertToWebp($imgUrl, $sidePrefix);

            if ($savedRelativePath) {
                $savedPaths[] = $savedRelativePath;
            }
        }

        return [
            'avers_image_path'  => $savedPaths[0] ?? null,
            'revers_image_path' => $savedPaths[1] ?? ($savedPaths[0] ?? null),
            'all'               => $savedPaths,
        ];
    }

    /**
     * Harici görsel URL'sini indirir ve Intervention Image ile WebP formatına sıkıştırıp
     * storage/app/public/coins/imported/ altına kaydeder.
     */
    protected function downloadAndConvertToWebp(string $imageUrl, string $prefix): ?string
    {
        try {
            $response = Http::timeout(25)
                ->withHeaders([
                    'User-Agent' => $this->userAgent,
                ])
                ->get($imageUrl);

            if (!$response->successful()) {
                Log::warning("Görsel indirilemedi (HTTP {$response->status()}): {$imageUrl}");
                return null;
            }

            $binaryData = $response->body();
            if (empty($binaryData)) {
                return null;
            }

            // storage/app/public/coins/imported/ altında dosya adı oluştur
            $hash = Str::random(20);
            $fileName = "coins/imported/{$prefix}_{$hash}.webp";

            // Intervention Image GD Sürücüsü ile WebP'ye dönüştür
            try {
                $img = $this->imageManager->read($binaryData);
                $img->scaleDown(width: 1600); // 1600px maksimum nümizmatik detay
                $webpBinary = (string) $img->toWebp(85);
            } catch (\Throwable $intervException) {
                // GD yerel yedeği (fallback)
                if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
                    $gdImage = @imagecreatefromstring($binaryData);
                    if ($gdImage !== false) {
                        ob_start();
                        imagewebp($gdImage, null, 85);
                        $webpBinary = ob_get_clean();
                        imagedestroy($gdImage);
                    } else {
                        $webpBinary = $binaryData;
                    }
                } else {
                    $webpBinary = $binaryData;
                }
            }

            // cPanel storage/app/public/coins/imported/ altına yaz
            Storage::disk('public')->put($fileName, $webpBinary);

            Log::info("CoinScraperService: Görsel WebP olarak kaydedildi -> {$fileName}");
            return $fileName;
        } catch (\Throwable $e) {
            Log::error("CoinScraperService görsel indirme/WebP hatası [{$imageUrl}]: " . $e->getMessage());
            return null;
        }
    }
}
