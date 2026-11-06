<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Civilization;
use App\Models\Coin;
use App\Models\Mint;
use App\Services\CoinImageOptimizerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\ImageManager;

class CoinController extends Controller
{
    protected ImageManager $imageManager;
    protected CoinImageOptimizerService $optimizerService;

    public function __construct(CoinImageOptimizerService $optimizerService)
    {
        $this->imageManager = new ImageManager(new GdDriver());
        $this->optimizerService = $optimizerService;
    }

    /**
     * Sikke Listesi (Filtreleme & Arama Desteği).
     */
    public function index(Request $request): View
    {
        $query = Coin::with(['civilization', 'mint'])->latest();

        // Arama (Başlık, Hükümdar, Birim Standartı)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('ruler', 'like', "%{$search}%")
                  ->orWhere('standard_name', 'like', "%{$search}%");
            });
        }

        // Medeniyet Filtresi
        if ($request->filled('civilization_id')) {
            $query->where('civilization_id', $request->input('civilization_id'));
        }

        // Maden Türü Filtresi
        if ($request->filled('metal_type')) {
            $query->where('metal_type', 'like', "%{$request->input('metal_type')}%");
        }

        // Yayın Durumu Filtresi
        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        $coins = $query->paginate(15)->withQueryString();
        $civilizations = Civilization::active()->orderBy('name')->get();

        return view('admin.coins.index', compact('coins', 'civilizations'));
    }

    /**
     * Yeni Sikke Ekleme Formu.
     */
    public function create(): View
    {
        $coin = new Coin([
            'currency'     => 'USD',
            'is_published' => true,
            'is_featured'  => false,
            'rarity_code'  => 'C',
        ]);

        $civilizations = Civilization::active()->orderBy('name')->get();
        $mints = Mint::orderBy('name')->get();

        return view('admin.coins.form', compact('coin', 'civilizations', 'mints'));
    }

    /**
     * Yeni Sikkeyi Kaydet (Görselleri Otomatik WebP'ye Çevir).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateCoin($request);

        // Benzersiz slug oluştur
        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (Coin::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }
        $validated['slug'] = $slug;

        // Ön Yüz (Avers) Görselini WebP'ye Dönüştür ve Kaydet
        if ($request->hasFile('avers_image_file')) {
            $validated['avers_image'] = $this->uploadAndConvertToWebp($request->file('avers_image_file'), 'obverse');
        } elseif ($request->filled('avers_imported_path')) {
            $validated['avers_image'] = $request->input('avers_imported_path');
        } elseif ($request->filled('avers_image')) {
            $validated['avers_image'] = $request->input('avers_image');
        }

        // Arka Yüz (Revers) Görselini WebP'ye Dönüştür ve Kaydet
        if ($request->hasFile('revers_image_file')) {
            $validated['revers_image'] = $this->uploadAndConvertToWebp($request->file('revers_image_file'), 'reverse');
        } elseif ($request->filled('revers_imported_path')) {
            $validated['revers_image'] = $request->input('revers_imported_path');
        } elseif ($request->filled('revers_image')) {
            $validated['revers_image'] = $request->input('revers_image');
        }

        // Referans kodları (Diziye dönüştür)
        $validated['reference_codes'] = $this->parseReferenceCodes($request->input('reference_codes_raw'));

        // Yayın ve Vitrin Bayrakları
        $validated['is_published'] = $request->boolean('is_published');
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['created_by'] = auth()->id();
        $validated['approval_status'] = auth()->user()?->can('coins.approve') ? 'approved' : 'pending_review';

        Coin::create($validated);

        return redirect()
            ->route('admin.coins.index')
            ->with('success', 'Nümizmatik sikke başarıyla kataloğa kaydedildi.');
    }

    /**
     * Sikke Düzenleme Formu.
     */
    public function edit(Coin $coin): View
    {
        $civilizations = Civilization::active()->orderBy('name')->get();
        $mints = Mint::where('civilization_id', $coin->civilization_id)->orderBy('name')->get();

        return view('admin.coins.form', compact('coin', 'civilizations', 'mints'));
    }

    /**
     * Sikkeyi Güncelle.
     */
    public function update(Request $request, Coin $coin): RedirectResponse
    {
        $validated = $this->validateCoin($request, $coin->id);

        // Ön Yüz (Avers) Güncellendi mi?
        if ($request->hasFile('avers_image_file')) {
            if ($coin->avers_image) {
                $this->optimizerService->deleteOldImages($coin->avers_image);
            }
            $validated['avers_image'] = $this->uploadAndConvertToWebp($request->file('avers_image_file'), 'obverse');
        } elseif ($request->filled('avers_imported_path')) {
            $validated['avers_image'] = $request->input('avers_imported_path');
        } elseif ($request->filled('avers_image')) {
            $validated['avers_image'] = $request->input('avers_image');
        }

        // Arka Yüz (Revers) Güncellendi mi?
        if ($request->hasFile('revers_image_file')) {
            if ($coin->revers_image) {
                $this->optimizerService->deleteOldImages($coin->revers_image);
            }
            $validated['revers_image'] = $this->uploadAndConvertToWebp($request->file('revers_image_file'), 'reverse');
        } elseif ($request->filled('revers_imported_path')) {
            $validated['revers_image'] = $request->input('revers_imported_path');
        } elseif ($request->filled('revers_image')) {
            $validated['revers_image'] = $request->input('revers_image');
        }

        $validated['reference_codes'] = $this->parseReferenceCodes($request->input('reference_codes_raw'));
        $validated['is_published'] = $request->boolean('is_published');
        $validated['is_featured'] = $request->boolean('is_featured');

        $coin->update($validated);

        return redirect()
            ->route('admin.coins.index')
            ->with('success', 'Sikke ve tipoloji bilgileri başarıyla güncellendi.');
    }

    /**
     * Sikkeyi Sil.
     */
    public function destroy(Coin $coin): RedirectResponse
    {
        // Dosyaları ve türevleri temizle
        if ($coin->avers_image) {
            $this->optimizerService->deleteOldImages($coin->avers_image);
        }
        if ($coin->revers_image) {
            $this->optimizerService->deleteOldImages($coin->revers_image);
        }

        $coin->delete();

        return redirect()
            ->route('admin.coins.index')
            ->with('success', 'Sikke kaydı sistemden silindi.');
    }

    /**
     * Canlı Yayın Durumunu Aç/Kapat (AJAX Toggle).
     */
    public function togglePublish(Coin $coin): JsonResponse
    {
        $coin->is_published = !$coin->is_published;
        $coin->save();

        return response()->json([
            'success'      => true,
            'is_published' => $coin->is_published,
            'message'      => $coin->is_published ? 'Eser yayına alındı.' : 'Eser taslağa çekildi.',
        ]);
    }

    /**
     * Medeniyete ait antik darphaneleri dönen dinamik JSON uç noktası.
     */
    public function getMintsByCivilization(Civilization $civilization): JsonResponse
    {
        $mints = $civilization->mints()->select('id', 'name', 'ancient_name')->orderBy('name')->get();
        return response()->json($mints);
    }

    /**
     * Görseli Intervention Image v3 ile WebP formatına dönüştürüp kaydeder.
     */
    protected function uploadAndConvertToWebp($file, string $side): string
    {
        // Hedef dizin: storage/app/public/coins/{obverse|reverse}
        $targetDir = "coins/{$side}";
        if (!Storage::disk('public')->exists($targetDir)) {
            Storage::disk('public')->makeDirectory($targetDir);
        }

        $filename = "coin_{$side}_" . Str::random(24) . ".webp";
        $saveRelativePath = "{$targetDir}/{$filename}";
        $fullPath = Storage::disk('public')->path($saveRelativePath);

        // Intervention Image v3 ile oku, boyutlandır ve %80 WebP olarak kaydet
        $image = $this->imageManager->read($file->getRealPath());
        $image->scaleDown(width: 1600); // 1600px max
        $encoded = $image->toWebp(80);
        $encoded->save($fullPath);

        // Ayrıca hızlı mobil liste için 300x300 thumbnail üret
        $thumbName = "coins/{$side}/thumb_" . $filename;
        $thumbFullPath = Storage::disk('public')->path($thumbName);
        $thumbImage = clone $image;
        $thumbImage->cover(width: 300, height: 300);
        $thumbImage->toWebp(80)->save($thumbFullPath);

        // Veritabanı için saklanan yol (storage/app/public/coins/...)
        return "storage/" . $saveRelativePath;
    }

    /**
     * Ham referans metnini ('RIC: II 114, BMC: 241') anahtar-değer JSON dizisine çevirir.
     */
    protected function parseReferenceCodes(?string $raw): array
    {
        if (empty($raw)) {
            return [];
        }

        $results = [];
        $lines = preg_split('/[\n,;]+/', $raw);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (str_contains($line, ':')) {
                [$key, $val] = explode(':', $line, 2);
                $results[trim($key)] = trim($val);
            } else {
                $results['REF'] = $line;
            }
        }
        return $results;
    }

    /**
     * Form Doğrulama Kuralları.
     */
    protected function validateCoin(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title'               => 'required|string|max:255',
            'civilization_id'     => 'required|integer|exists:civilizations,id',
            'mint_id'             => 'nullable|integer|exists:mints,id',
            'ruler'               => 'nullable|string|max:255',
            'year_start'          => 'nullable|integer',
            'year_end'            => 'nullable|integer',
            'metal_type'          => 'required|string|max:50',
            'standard_name'       => 'required|string|max:100',
            'weight_grams'        => 'nullable|numeric|min:0|max:9999.99',
            'diameter_mm'         => 'nullable|numeric|min:0|max:999.99',
            'die_axis'            => 'nullable|string|max:10',
            'condition_grade'     => 'nullable|string|max:30',
            'rarity_code'         => 'nullable|string|max:20',
            'avers_description'   => 'nullable|string',
            'revers_description'  => 'nullable|string',
            'avers_image'         => 'nullable|string|max:500',
            'revers_image'        => 'nullable|string|max:500',
            'avers_image_file'    => 'nullable|image|max:15360',
            'revers_image_file'   => 'nullable|image|max:15360',
            'estimated_value_min' => 'nullable|numeric|min:0',
            'estimated_value_max' => 'nullable|numeric|min:0',
            'currency'            => 'nullable|string|size:3',
            'reference_codes_raw' => 'nullable|string',
            'is_published'        => 'nullable|boolean',
            'is_featured'         => 'nullable|boolean',
        ]);
    }
}

