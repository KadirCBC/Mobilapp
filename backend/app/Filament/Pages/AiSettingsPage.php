<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class AiSettingsPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cpu-chip';

    protected static ?string $navigationGroup = 'Yapay Zeka & Sistem';

    protected static ?string $navigationLabel = 'AI Kontrol Merkezi';

    protected static ?string $title = 'Gemini AI Kontrol Merkezi';

    protected static ?int $navigationSort = 10;

    protected static string $view = 'filament.pages.ai-settings-page';

    /**
     * Tıklandığında doğrudan modern Blade yönetim ekranına yönlendirebilir veya gömülü sunabilir.
     */
    public static function getNavigationUrl(): string
    {
        return route('admin.ai.settings');
    }
}

