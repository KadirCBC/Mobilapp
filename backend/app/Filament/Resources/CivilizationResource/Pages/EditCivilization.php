<?php

namespace App\Filament\Resources\CivilizationResource\Pages;

use App\Filament\Resources\CivilizationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCivilization extends EditRecord
{
    protected static string $resource = CivilizationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make()->label('Medeniyeti Sil'),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}

