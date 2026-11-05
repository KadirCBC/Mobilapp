<?php

namespace App\Models;

use App\Observers\CoinObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([CoinObserver::class])]
class Coin extends Model
{
    use HasFactory;

    /**
     * Toplu atanabilir öznitelikler.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'civilization_id',
        'mint_id',
        'title',
        'slug',
        'ruler',
        'metal_type',
        'standard_name',
        'weight_grams',
        'diameter_mm',
        'die_axis',
        'year_start',
        'year_end',
        'rarity_code',
        'condition_grade',
        'estimated_value_min',
        'estimated_value_max',
        'currency',
        'avers_description',
        'revers_description',
        'avers_image',
        'revers_image',
        'reference_codes',
        'is_featured',
        'is_published',
        'approval_status',
        'created_by',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    /**
     * JSON serileştirmesinde otomatik dahil edilecek erişimciler.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'inventory_code',
        'formatted_period',
        'formatted_value_range',
        'approval_status_label',
        'avers_thumb_url',
        'avers_medium_url',
        'revers_thumb_url',
        'revers_medium_url',
    ];

    /**
     * Tür dönüşümleri.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight_grams'        => 'decimal:2',
        'diameter_mm'         => 'decimal:2',
        'estimated_value_min' => 'decimal:2',
        'estimated_value_max' => 'decimal:2',
        'year_start'          => 'integer',
        'year_end'            => 'integer',
        'reference_codes'     => 'array',
        'is_featured'         => 'boolean',
        'is_published'        => 'boolean',
        'reviewed_at'         => 'datetime',
    ];

    /**
     * Sikkenin ait olduğu medeniyet.
     */
    public function civilization(): BelongsTo
    {
        return $this->belongsTo(Civilization::class);
    }

    /**
     * Sikkenin basıldığı antik darphane.
     */
    public function mint(): BelongsTo
    {
        return $this->belongsTo(Mint::class);
    }

    /**
     * Sikkeye ait provenans (koleksiyon & mülkiyet geçmişi) ve konservasyon denetim kayıtları.
     */
    public function provenances(): HasMany
    {
        return $this->hasMany(CoinProvenance::class)->orderBy('event_date', 'asc');
    }

    /**
     * Bu sikke ile eşleşen mobil AI kamera tarama ve teşhis günlükleri.
     */
    public function aiScanLogs(): HasMany
    {
        return $this->hasMany(AiScanLog::class, 'matched_coin_id');
    }

    /**
     * Eseri sisteme ilk kaydeden editör veya fotoğrafçı.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Eseri onaylayan / değerleyen Baş Nümizmat.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Kapsam: Yalnızca onaylanmış VE yayında olan sikkeler.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
                     ->where('approval_status', 'approved');
    }

    /**
     * Kapsam: Onay bekleyen sikkeler (Baş Nümizmat inceleme kuyruğu).
     */
    public function scopePendingReview(Builder $query): Builder
    {
        return $query->where('approval_status', 'pending_review');
    }

    /**
     * Kapsam: Onaylanmış eserler.
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Kapsam: Taslak durumundaki eserler.
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('approval_status', 'draft');
    }

    /**
     * Kapsam: Vitrin / Öne çıkan eserler.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Kapsam: Belirli bir medeniyete ait sikkeler.
     */
    public function scopeByCivilization(Builder $query, int $civilizationId): Builder
    {
        return $query->where('civilization_id', $civilizationId);
    }

    /**
     * Kapsam: Belirli bir metal tipine göre filtreleme (Örn: Altın, Gümüş).
     */
    public function scopeByMetal(Builder $query, string $metal): Builder
    {
        return $query->where('metal_type', 'like', "%{$metal}%");
    }

    /**
     * Kurumsal Nümizmatik Envanter Kodu (#NUM-2026-X).
     */
    public function getInventoryCodeAttribute(): string
    {
        return "#NUM-2026-{$this->id}";
    }

    /**
     * Geçici süreli imzalı (Signed URL) ön yüz filigranlı görsel bağlantısı üretir.
     */
    public function getSignedAversUrl(int $minutes = 120): string
    {
        return \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'api.coins.watermarked_image',
            now()->addMinutes($minutes),
            ['coin' => $this->id, 'type' => 'avers']
        );
    }

    /**
     * Geçici süreli imzalı (Signed URL) arka yüz filigranlı görsel bağlantısı üretir.
     */
    public function getSignedReversUrl(int $minutes = 120): string
    {
        return \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'api.coins.watermarked_image',
            now()->addMinutes($minutes),
            ['coin' => $this->id, 'type' => 'revers']
        );
    }

    /**
     * Türkçe onay durumu etiketi.
     */
    public function getApprovalStatusLabelAttribute(): string
    {
        return match ($this->approval_status) {
            'approved'       => 'Onaylandı (Canlıda)',
            'pending_review' => 'Uzman Onayı Bekliyor',
            'rejected'       => 'Revizyon İstendi',
            default          => 'Taslak',
        };
    }

    /**
     * Okunabilir kronoloji dönemi formatlayıcı (M.Ö. / M.S. biçimlendirmesi).
     */
    public function getFormattedPeriodAttribute(): string
    {
        if (is_null($this->year_start) && is_null($this->year_end)) {
            return 'Tarihlenemedi';
        }

        $formatYear = function (?int $year) {
            if (is_null($year)) {
                return '';
            }
            return $year < 0 ? 'M.Ö. ' . abs($year) : 'M.S. ' . $year;
        };

        if (!is_null($this->year_start) && !is_null($this->year_end)) {
            if ($this->year_start === $this->year_end) {
                return $formatYear($this->year_start);
            }
            return $formatYear($this->year_start) . ' – ' . $formatYear($this->year_end);
        }

        return $formatYear($this->year_start ?? $this->year_end);
    }

    /**
     * Biçimlendirilmiş tahmini müzayede değer aralığı.
     */
    public function getFormattedValueRangeAttribute(): ?string
    {
        if (is_null($this->estimated_value_min) && is_null($this->estimated_value_max)) {
            return null;
        }

        $symbol = match (strtoupper($this->currency ?? 'USD')) {
            'USD' => '$',
            'EUR' => '€',
            'TRY' => '₺',
            'GBP' => '£',
            default => $this->currency . ' ',
        };

        if ($this->estimated_value_min && $this->estimated_value_max) {
            return sprintf(
                '%s%s – %s%s',
                $symbol,
                number_format($this->estimated_value_min, 0, ',', '.'),
                $symbol,
                number_format($this->estimated_value_max, 0, ',', '.')
            );
        }

        $val = $this->estimated_value_min ?? $this->estimated_value_max;
        return $symbol . number_format($val, 0, ',', '.');
    }

    /**
     * Ön yüz minyatür (Thumbnail 300x300) WebP görsel bağlantısı.
     */
    public function getAversThumbUrlAttribute(): ?string
    {
        return $this->buildDerivativeUrl($this->avers_image, '_thumb.webp');
    }

    /**
     * Ön yüz orta boy (Medium 800x800) WebP görsel bağlantısı.
     */
    public function getAversMediumUrlAttribute(): ?string
    {
        return $this->buildDerivativeUrl($this->avers_image, '_medium.webp');
    }

    /**
     * Arka yüz minyatür (Thumbnail 300x300) WebP görsel bağlantısı.
     */
    public function getReversThumbUrlAttribute(): ?string
    {
        return $this->buildDerivativeUrl($this->revers_image, '_thumb.webp');
    }

    /**
     * Arka yüz orta boy (Medium 800x800) WebP görsel bağlantısı.
     */
    public function getReversMediumUrlAttribute(): ?string
    {
        return $this->buildDerivativeUrl($this->revers_image, '_medium.webp');
    }

    /**
     * Türev WebP URL oluşturucu yardımcı metot (cPanel doğrudan web yolu uyumlu).
     */
    protected function buildDerivativeUrl(?string $path, string $suffix): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $info = pathinfo($path);
        $dirname = $info['dirname'] ?? '';
        $filename = $info['filename'] ?? '';

        $derivativePath = ($dirname !== '.' && $dirname !== '' ? $dirname . '/' : '') . $filename . $suffix;

        return asset($derivativePath);
    }
}
