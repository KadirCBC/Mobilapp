<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiScanLog extends Model
{
    use HasFactory;

    /**
     * Tablo adı.
     *
     * @var string
     */
    protected $table = 'ai_scan_logs';

    /**
     * Toplu atanabilir öznitelikler.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_ip',
        'incoming_avers_path',
        'incoming_revers_path',
        'detected_title',
        'confidence_score',
        'matched_coin_id',
        'raw_ai_response',
    ];

    /**
     * Tür dönüşümleri.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'confidence_score' => 'decimal:2',
        'raw_ai_response'  => 'array',
    ];

    /**
     * Taranan görselin eşleştiği sikke (Eğer veritabanındaki bir eserle eşleştiyse).
     */
    public function matchedCoin(): BelongsTo
    {
        return $this->belongsTo(Coin::class, 'matched_coin_id');
    }

    /**
     * Kapsam: Yüksek güven skoruna sahip taramalar.
     */
    public function scopeHighConfidence(Builder $query, float $threshold = 90.0): Builder
    {
        return $query->where('confidence_score', '>=', $threshold);
    }

    /**
     * Kapsam: Son günlerdeki taramalar.
     */
    public function scopeRecent(Builder $query, int $days = 7): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}

