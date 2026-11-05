<?php

namespace App\Filament\Resources\CoinResource\Pages;

use App\Filament\Resources\CoinResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCoin extends CreateRecord
{
    protected static string $resource = CoinResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}

