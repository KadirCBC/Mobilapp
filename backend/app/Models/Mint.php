<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mint extends Model
{
    use HasFactory;

    /**
     * Toplu atanabilir öznitelikler.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'civilization_id',
        'name',
        'ancient_name',
        'latitude',
        'longitude',
        'description',
    ];

    /**
     * Tür dönüşümleri.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    /**
     * Darphanenin bağlı olduğu medeniyet.
     */
    public function civilization(): BelongsTo
    {
        return $this->belongsTo(Civilization::class);
    }

    /**
     * Bu darphanede basılmış sikkeler.
     */
    public function coins(): HasMany
    {
        return $this->hasMany(Coin::class);
    }
}

