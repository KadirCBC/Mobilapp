<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoinController extends Controller
{
    /**
     * Sikke Katalog Listesi (Sayfalama, Çoklu Filtreleme ve Arama).
     *
     * GET /api/v1/coins
     */
    public function index(Request $request): JsonResponse
    {
        $query = Coin::with([
            'civilization:id,name,slug',
            'mint:id,name,ancient_name,latitude,longitude',
        ])->published();

        // 1. Arama Sorgusu (q)
        if ($request->filled('q')) {
            $q = trim($request->input('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('ruler', 'like', "%{$q}%")
                    ->orWhere('standard_name', 'like', "%{$q}%")
                    ->orWhere('avers_description', 'like', "%{$q}%")
                    ->orWhere('revers_description', 'like', "%{$q}%");
            });
        }

        // 2. Maden Filtresi (metals[])
        if ($request->has('metals')) {
            $metals = (array) $request->input('metals');
            $query->where(function ($sub) use ($metals) {
                foreach ($metals as $metal) {
                    $sub->orWhere('metal_type', 'like', "%{$metal}%");
                }
            });
        }

        // 3. Medeniyet Filtresi (civilizations[])
        if ($request->has('civilizations')) {
            $civilizations = (array) $request->input('civilizations');
            $query->where(function ($sub) use ($civilizations) {
                // ID veya slug desteği
                $sub->whereIn('civilization_id', $civilizations)
                    ->orWhereHas('civilization', function ($civQuery) use ($civilizations) {
                        $civQuery->whereIn('slug', $civilizations);
                    });
            });
        }

        // 4. Darphane Filtresi (mint_id)
        if ($request->filled('mint_id')) {
            $query->where('mint_id', $request->input('mint_id'));
        }

        // 5. Müzayede Fiyat Aralığı (price_min, price_max)
        if ($request->filled('price_min')) {
            $query->where('estimated_value_max', '>=', (float) $request->input('price_min'));
        }
        if ($request->filled('price_max')) {
            $query->where('estimated_value_min', '<=', (float) $request->input('price_max'));
        }

        // 6. Vitrin Filtresi (is_featured)
        if ($request->boolean('is_featured')) {
            $query->where('is_featured', true);
        }

        // 7. Sıralama (sort_by)
        $sortBy = $request->input('sort_by', 'newest');
        match ($sortBy) {
            'year_asc'   => $query->orderBy('year_start', 'asc'),
            'year_desc'  => $query->orderBy('year_end', 'desc'),
            'price_asc'  => $query->orderBy('estimated_value_min', 'asc'),
            'price_desc' => $query->orderBy('estimated_value_max', 'desc'),
            'title_asc'  => $query->orderBy('title', 'asc'),
            default      => $query->latest('id'),
        };

        // 8. Sayfalama (Varsayılan 20)
        $perPage = min(50, max(1, (int) $request->input('per_page', 20)));
        $paginator = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $paginator->items(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
            'links'   => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
        ], 200);
    }

    /**
     * Tekil Sikke Detay Bilgileri.
     *
     * GET /api/v1/coins/{id}
     */
    public function show($id): JsonResponse
    {
        $coin = Coin::with([
            'civilization:id,name,slug,era_period,description',
            'mint:id,civilization_id,name,ancient_name,latitude,longitude,description',
            'provenances',
        ])->published()->findOrFail($id);

        $payload = $coin->toArray();

        // Harita koordinatları formatı
        $payload['mint_coordinates'] = ($coin->mint && $coin->mint->latitude && $coin->mint->longitude) ? [
            'latitude'     => (float) $coin->mint->latitude,
            'longitude'    => (float) $coin->mint->longitude,
            'mint_name'    => $coin->mint->name,
            'ancient_name' => $coin->mint->ancient_name,
        ] : null;

        // Galeri görselleri koleksiyonu
        $payload['gallery'] = [
            'avers' => [
                'original' => $coin->avers_image ? asset($coin->avers_image) : null,
                'medium'   => $coin->avers_medium_url,
                'thumb'    => $coin->avers_thumb_url,
            ],
            'revers' => [
                'original' => $coin->revers_image ? asset($coin->revers_image) : null,
                'medium'   => $coin->revers_medium_url,
                'thumb'    => $coin->revers_thumb_url,
            ],
        ];

        // Süreli İmzalı Filigranlı URL'ler (Signed URLs)
        $payload['watermarked_signed_urls'] = [
            'avers'      => $coin->getSignedAversUrl(120),
            'revers'     => $coin->getSignedReversUrl(120),
            'expires_in' => 7200,
        ];

        return response()->json([
            'success' => true,
            'data'    => $payload,
        ], 200);
    }
}

