<?php

namespace App\Filament\Resources\CivilizationResource\Pages;

use App\Filament\Resources\CivilizationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCivilizations extends ListRecords
{
    protected static string $resource = CivilizationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('Yeni Medeniyet Ekle'),
        ];
    }
}

