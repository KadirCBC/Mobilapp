<?php

namespace App\Filament\Resources\CoinResource\Pages;

use App\Filament\Resources\CoinResource;
use App\Models\Civilization;
use App\Services\CoinScraperService;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateCoin extends CreateRecord
{
    protected static string $resource = CoinResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('fetchFromUrl')
                ->label('Dış Bağlantıdan Otomatik İçe Aktar (VCoins vb.)')
                ->icon('heroicon-o-cloud-arrow-down')
                ->color('warning')
                ->modalHeading('Dış Bağlantıdan Otomatik İçe Aktar (VCoins vb.)')
                ->modalDescription('Google Gemini 1.5 nümizmatik AI motoru ile İngilizce açıklamaları Türkçeleştirir ve görselleri WebP olarak kaydeder.')
                ->modalSubmitActionLabel('Verileri Getir ve Çevir')
                ->form([
                    TextInput::make('url')
                        ->label('Ürün / Eser Linki (URL)')
                        ->placeholder('https://www.vcoins.com/en/stores/...')
                        ->required()
                        ->url(),
                ])
                ->action(function (array $data, CoinScraperService $scraper): void {
                    try {
                        $result = $scraper->scrapeAndProcess($data['url']);

                        // Otomatik medeniyet eşleştirme
                        $civId = null;
                        if (!empty($result['civilization'])) {
                            $civ = Civilization::where('name', 'like', "%{$result['civilization']}%")->first();
                            $civId = $civ?->id;
                        }

                        // Form verilerini doldur
                        $this->form->fill([
                            'title'               => $result['title'] ?? '',
                            'ruler'               => $result['ruler'] ?? '',
                            'civilization_id'     => $civId,
                            'metal_type'          => $result['metal_type'] ?? '',
                            'standard_name'       => $result['standard_name'] ?? '',
                            'weight_grams'        => $result['weight_grams'] ?? null,
                            'diameter_mm'         => $result['diameter_mm'] ?? null,
                            'year_start'          => $result['year_start'] ?? null,
                            'year_end'            => $result['year_end'] ?? null,
                            'condition_grade'     => $result['condition_grade'] ?? 'VF',
                            'avers_description'   => $result['avers_description'] ?? '',
                            'revers_description'  => $result['revers_description'] ?? '',
                            'reference_codes'     => $result['reference_codes'] ?? [],
                            'estimated_value_min' => $result['estimated_value_usd'] ?? null,
                            'estimated_value_max' => $result['estimated_value_usd'] ? round($result['estimated_value_usd'] * 1.15, 2) : null,
                            'currency'            => 'USD',
                            'avers_image'         => $result['avers_image'] ?? null,
                            'revers_image'        => $result['revers_image'] ?? null,
                        ]);

                        Notification::make()
                            ->title('Eser bilgileri başarıyla çekildi, Türkçeleştirildi ve form dolduruldu. Lütfen kontrol edip kaydedin.')
                            ->success()
                            ->duration(6000)
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Veri Çekme Hatası')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
