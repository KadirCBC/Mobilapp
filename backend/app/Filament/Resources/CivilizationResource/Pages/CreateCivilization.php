<?php

namespace App\Filament\Resources\CivilizationResource\Pages;

use App\Filament\Resources\CivilizationResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCivilization extends CreateRecord
{
    protected static string $resource = CivilizationResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}

