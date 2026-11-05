<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoinProvenance extends Model
{
    use HasFactory;

    /**
     * Tablo adı.
     *
     * @var string
     */
    protected $table = 'coin_provenances';

    /**
     * Toplu atanabilir öznitelikler.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'coin_id',
        'event_date',
        'event_type',
        'auction_house',
        'lot_number',
        'price_realized',
        'currency',
        'description',
        'document_url',
    ];

    /**
     * Tür dönüşümleri.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'event_date'     => 'date',
        'price_realized' => 'decimal:2',
    ];

    /**
     * JSON çıktısında otomatik dahil edilecek erişimciler.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'event_type_label',
        'formatted_price',
    ];

    /**
     * İlgili sikke.
     */
    public function coin(): BelongsTo
    {
        return $this->belongsTo(Coin::class);
    }

    /**
     * Türkçe olay türü etiketi.
     */
    public function getEventTypeLabelAttribute(): string
    {
        return match ($this->event_type) {
            'auction_sale'          => 'Müzayede Satışı',
            'collection_transfer'   => 'Koleksiyon Değişimi',
            'museum_registration'   => 'Müze Tescili & Envanter Kaydı',
            'conservation_cleaning' => 'Konservasyon & Restorasyon',
            'expert_certification'  => 'Nümizmatik Ekspertiz & Sertifikasyon',
            default                 => ucfirst(str_replace('_', ' ', $this->event_type)),
        };
    }

    /**
     * Olay türü için renk kodu.
     */
    public function getEventTypeColorAttribute(): string
    {
        return match ($this->event_type) {
            'auction_sale'          => 'warning', // Kehribar / Altın
            'collection_transfer'   => 'info',    // Mavi
            'museum_registration'   => 'success', // Yeşil
            'conservation_cleaning' => 'purple',  // Mor / Restorasyon
            'expert_certification'  => 'primary', // Kırmızı / Damga
            default                 => 'gray',
        };
    }

    /**
     * Biçimlendirilmiş çekiç/alım fiyatı.
     */
    public function getFormattedPriceAttribute(): ?string
    {
        if (is_null($this->price_realized)) {
            return null;
        }

        $symbol = match (strtoupper($this->currency ?? 'USD')) {
            'USD' => '$',
            'EUR' => '€',
            'TRY' => '₺',
            'GBP' => '£',
            'CHF' => 'CHF ',
            default => $this->currency . ' ',
        };

        return $symbol . number_format($this->price_realized, 0, ',', '.');
    }
}

