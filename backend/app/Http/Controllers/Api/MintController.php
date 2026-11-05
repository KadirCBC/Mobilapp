<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MintController extends Controller
{
    /**
     * Mobil Antik Darphane Haritası Uç Noktası.
     *
     * GET /api/v1/mints
     */
    public function index(Request $request): JsonResponse
    {
        $query = Mint::with(['civilization:id,name,slug'])
            ->withCount(['coins' => function ($q) {
                $q->published();
            }]);

        // Medeniyete göre filtreleme (Opsiyonel)
        if ($request->filled('civilization_id')) {
            $query->where('civilization_id', $request->input('civilization_id'));
        }

        // Yalnızca harita koordinatları tanımlı olanlar (Opsiyonel: ?with_coords=1)
        if ($request->boolean('with_coords', false)) {
            $query->whereNotNull('latitude')->whereNotNull('longitude');
        }

        $mints = $query->orderBy('name')->get()->map(function (Mint $mint) {
            return [
                'id'            => $mint->id,
                'name'          => $mint->name,
                'ancient_name'  => $mint->ancient_name,
                'latitude'      => $mint->latitude ? (float) $mint->latitude : null,
                'longitude'     => $mint->longitude ? (float) $mint->longitude : null,
                'description'   => $mint->description,
                'civilization'  => $mint->civilization ? [
                    'id'   => $mint->civilization->id,
                    'name' => $mint->civilization->name,
                    'slug' => $mint->civilization->slug,
                ] : null,
                'coins_count'   => $mint->coins_count,
            ];
        });

        return response()->json([
            'success'     => true,
            'total_count' => $mints->count(),
            'data'        => $mints,
        ], 200);
    }
}

