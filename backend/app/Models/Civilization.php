<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Civilization extends Model
{
    use HasFactory;

    /**
     * Toplu atanabilir öznitelikler.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'era_period',
        'description',
        'cover_image',
        'is_active',
    ];

    /**
     * Tür dönüşümleri.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Medeniyete ait antik darphaneler.
     */
    public function mints(): HasMany
    {
        return $this->hasMany(Mint::class);
    }

    /**
     * Medeniyete ait tüm sikkeler.
     */
    public function coins(): HasMany
    {
        return $this->hasMany(Coin::class);
    }

    /**
     * Yalnızca aktif medeniyetleri getiren yerel sorgu kapsamı (Scope).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

