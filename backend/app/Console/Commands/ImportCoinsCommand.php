<?php

namespace App\Console\Commands;

use App\Services\NumismaticImportService;
use Illuminate\Console\Command;

class ImportCoinsCommand extends Command
{
    /**
     * Komut imzası (cPanel Cron veya SSH üzerinden çalıştırılabilir).
     *
     * @var string
     */
    protected $signature = 'numismatic:import 
                            {file : İçe aktarılacak CSV/Excel dosya yolu} 
                            {--no-images : Harici görsel indirmeyi atla}';

    /**
     * Komut açıklaması.
     *
     * @var string
     */
    protected $description = 'Nümizmatik sikke ve tarihi eserleri CSV/Excel dosyasından parçalı (chunking) olarak içe aktarır';

    public function handle(NumismaticImportService $service): int
    {
        $filePath = $this->argument('file');
        $downloadImages = !$this->option('no-images');

        if (!file_exists($filePath)) {
            $this->error("Dosya bulunamadı: {$filePath}");
            return self::FAILURE;
        }

        $this->info("Nümizmatik veri içe aktarma işlemi başlatılıyor...");
        $this->line("Dosya: {$filePath}");
        $this->line("Görsel İndirme: " . ($downloadImages ? 'Aktif' : 'Pasif'));

        $startTime = microtime(true);
        $report = $service->import($filePath, $downloadImages);
        $duration = round(microtime(true) - $startTime, 2);

        $this->newLine();
        $this->info("=== İÇE AKTARMA SONUÇ RAPORU ===");
        $this->line("Toplam İşlenen Satır : {$report['total_rows']}");
        $this->line("Başarıyla Eklenen    : {$report['imported_count']}");
        $this->line("Hatalı / Atlanan     : {$report['failed_count']}");
        $this->line("Toplam Süre          : {$duration} saniye");

        if (!empty($report['failed_rows'])) {
            $this->newLine();
            $this->error("=== HATALI SATIRLAR RAPORU ===");

            $tableRows = [];
            foreach ($report['failed_rows'] as $failure) {
                $tableRows[] = [
                    'Satır'   => $failure['row'],
                    'Başlık'  => Str::limit($failure['title'], 30),
                    'Hatalar' => implode(' | ', $failure['errors']),
                ];
            }

            $this->table(['Satır No', 'Eser Adı', 'Hata Sebebi'], $tableRows);
        }

        return self::SUCCESS;
    }
}

