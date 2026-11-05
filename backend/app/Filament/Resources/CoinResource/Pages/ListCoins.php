<?php

namespace App\Filament\Resources\CoinResource\Pages;

use App\Filament\Resources\CoinResource;
use App\Services\NumismaticImportService;
use Filament\Actions;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\FileUpload;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Storage;

class ListCoins extends ListRecords
{
    protected static string $resource = CoinResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Toplu İçe Aktarma Aksiyonu (cPanel & Chunking Uyumlu)
            Actions\Action::make('importCoins')
                ->label('Toplu CSV / Excel İçe Aktar')
                ->icon('heroicon-o-arrow-up-tray')
                ->color('success')
                ->modalHeading('Nümizmatik Katalog Toplu İçe Aktarma')
                ->modalDescription('CSV dosyanızı yükleyerek medeniyet, hükümdar, maden, darphane ve görsel bağlantılarını otomatik içe aktarabilirsiniz.')
                ->form([
                    FileUpload::make('import_file')
                        ->label('Veri Dosyası (CSV / TXT)')
                        ->acceptedFileTypes(['text/csv', 'text/plain', 'application/vnd.ms-excel', 'text/x-csv'])
                        ->disk('local')
                        ->directory('imports/temp')
                        ->required()
                        ->helperText('Kolon başlıkları otomatik algılanır (Medeniyet, Hükümdar, Maden, Gramaj, Görseller vb.)'),

                    Checkbox::make('download_images')
                        ->label('Harici Görsel Linklerini Otomatik İndir ve Yerel Depoya Kaydet')
                        ->helperText('İşaretlenirse harici web URL\'leri indirilip optimize edilerek depolanır.')
                        ->default(true),
                ])
                ->action(function (array $data, NumismaticImportService $service) {
                    $relativeFilePath = $data['import_file'];
                    $fullPath = Storage::disk('local')->path($relativeFilePath);
                    $downloadImages = (bool) ($data['download_images'] ?? true);

                    $report = $service->import($fullPath, $downloadImages);

                    // Geçici yükleme dosyasını temizle
                    @unlink($fullPath);

                    if ($report['imported_count'] > 0) {
                        Notification::make()
                            ->title('İçe Aktarma Tamamlandı')
                            ->body("{$report['imported_count']} adet sikke/eser başarıyla kataloğa eklendi.")
                            ->success()
                            ->send();
                    }

                    if ($report['failed_count'] > 0) {
                        $errorMessages = [];
                        foreach (array_slice($report['failed_rows'], 0, 5) as $failed) {
                            $errorMessages[] = "Satır {$failed['row']} ({$failed['title']}): " . implode(', ', $failed['errors']);
                        }
                        if (count($report['failed_rows']) > 5) {
                            $errorMessages[] = '... ve ' . (count($report['failed_rows']) - 5) . ' satır daha.';
                        }

                        Notification::make()
                            ->title("Hatalı Satırlar Bildirimi ({$report['failed_count']} Satır Atlandı)")
                            ->body(implode("\n", $errorMessages))
                            ->warning()
                            ->persistent()
                            ->send();
                    }
                }),

            Actions\CreateAction::make()
                ->label('Yeni Sikke Ekle')
                ->icon('heroicon-o-plus-circle'),
        ];
    }
}
