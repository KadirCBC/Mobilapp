<?php

namespace App\Filament\Widgets;

use App\Models\Civilization;
use App\Models\Coin;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class NumismaticStatsOverview extends BaseWidget
{
    /**
     * Widget yenileme aralığı (opsiyonel).
     */
    protected static ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        $totalCoins = Coin::count();
        $publishedCoins = Coin::published()->count();
        $totalCivilizations = Civilization::count();

        // Toplam tahmini koleksiyon değeri (Max değerler toplamı üzerinden)
        $totalValue = Coin::where('currency', 'USD')->sum('estimated_value_max')
            + (Coin::where('currency', 'EUR')->sum('estimated_value_max') * 1.08)
            + (Coin::where('currency', 'TRY')->sum('estimated_value_max') / 35.0);

        $formattedValue = '$' . number_format($totalValue, 0, ',', '.');

        return [
            Stat::make('Toplam Eser & Sikke', number_format($totalCoins, 0, ',', '.'))
                ->description("{$publishedCoins} Eser Çevrimiçi Yayında")
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success')
                ->chart([$totalCoins - 15, $totalCoins - 10, $totalCoins - 4, $totalCoins]),

            Stat::make('Tahmini Koleksiyon Değeri', $formattedValue)
                ->description('Global Müzayede & Korpus Endeksi')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('warning')
                ->chart([65, 80, 95, 120, 145, 170]),

            Stat::make('Kayıtlı Medeniyet & Çağ', $totalCivilizations)
                ->description('Yunan, Roma, Bizans, Osmanlı vb.')
                ->descriptionIcon('heroicon-m-globe-alt')
                ->color('primary'),
        ];
    }
}

