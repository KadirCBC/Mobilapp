<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Civilization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CivilizationController extends Controller
{
    /**
     * Medeniyetler ve Eser Sayıları Listesi.
     *
     * GET /api/v1/civilizations
     */
    public function index(Request $request): JsonResponse
    {
        $civilizations = Civilization::active()
            ->withCount(['coins' => function ($q) {
                $q->published();
            }])
            ->orderBy('id', 'asc')
            ->get()
            ->map(function (Civilization $civ) {
                return [
                    'id'          => $civ->id,
                    'name'        => $civ->name,
                    'slug'        => $civ->slug,
                    'era_period'  => $civ->era_period,
                    'description' => $civ->description,
                    'cover_image' => $civ->cover_image ? asset($civ->cover_image) : null,
                    'coins_count' => $civ->coins_count,
                ];
            });

        return response()->json([
            'success'     => true,
            'total_count' => $civilizations->count(),
            'data'        => $civilizations,
        ], 200);
    }
}

