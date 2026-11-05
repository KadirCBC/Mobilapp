<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiSetting extends Model
{
    use HasFactory;

    /**
     * Tablo adı.
     *
     * @var string
     */
    protected $table = 'ai_settings';

    /**
     * Toplu atanabilir öznitelikler.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'provider',
        'api_key',
        'model_name',
        'temperature',
        'max_tokens',
        'system_prompt',
        'is_active',
    ];

    /**
     * Tür dönüşümleri (API anahtarı veritabanında AES-256 ile şifrelenir).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'api_key'     => 'encrypted',
        'temperature' => 'decimal:2',
        'max_tokens'  => 'integer',
        'is_active'   => 'boolean',
    ];

    /**
     * Kapsam: Yalnızca aktif AI ayarları.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Aktif Gemini yapılandırmasını getiren yardımcı metot.
     */
    public static function getActiveGeminiConfig(): ?self
    {
        return static::where('provider', 'gemini')
            ->where('is_active', true)
            ->latest()
            ->first();
    }
}

