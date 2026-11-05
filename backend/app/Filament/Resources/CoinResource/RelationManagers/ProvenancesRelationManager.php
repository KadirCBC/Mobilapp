<?php

namespace App\Filament\Resources\CoinResource\RelationManagers;

use App\Models\CoinProvenance;
use Filament\Forms;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProvenancesRelationManager extends RelationManager
{
    protected static string $relationship = 'provenances';

    protected static ?string $title = 'Provenans & Konservasyon Denetim Kayıtları';

    protected static ?string $modelLabel = 'Provenans / Konservasyon Kaydı';

    protected static ?string $pluralModelLabel = 'Provenans & Restorasyon Geçmişi';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make(2)->schema([
                    DatePicker::make('event_date')
                        ->label('Olay / İşlem Tarihi')
                        ->required()
                        ->default(now())
                        ->native(false)
                        ->displayFormat('d/m/Y'),

                    Select::make('event_type')
                        ->label('Olay / Kayıt Türü')
                        ->options([
                            'auction_sale'          => 'Müzayede Satışı',
                            'collection_transfer'   => 'Koleksiyon Değişimi',
                            'museum_registration'   => 'Müze Tescili & Envanter Kaydı',
                            'conservation_cleaning' => 'Konservasyon & Restorasyon',
                            'expert_certification'  => 'Nümizmatik Ekspertiz & Sertifikasyon',
                        ])
                        ->required()
                        ->native(false),
                ]),

                Grid::make(3)->schema([
                    TextInput::make('auction_house')
                        ->label('Müzayede Evi / Kurum')
                        ->placeholder('Örn: Leu Numismatik, Sotheby\'s, NGC'),

                    TextInput::make('lot_number')
                        ->label('Lot / Envanter No')
                        ->placeholder('Örn: Lot 214 veya Env. No 1934/12'),

                    Grid::make(2)->schema([
                        TextInput::make('price_realized')
                            ->label('Çekiç Fiyatı')
                            ->numeric()
                            ->prefix('$')
                            ->step('1'),

                        Select::make('currency')
                            ->label('Birim')
                            ->options([
                                'USD' => 'USD ($)',
                                'EUR' => 'EUR (€)',
                                'CHF' => 'CHF',
                                'GBP' => 'GBP (£)',
                                'TRY' => 'TRY (₺)',
                            ])
                            ->default('USD')
                            ->native(false),
                    ]),
                ]),

                Textarea::make('description')
                    ->label('Açıklama / Restorasyon ve Provenans Detayları')
                    ->placeholder('Örn: Eser 1928 yılında Dr. Jacob Hirsch Müzayedesi Lot 84\'te satılmıştır. 1974 yılında B. Peus koleksiyonuna geçmiştir. 2012 yılında hafif ultrasonik yüzey temizliği yapılmış, patina korunmuştur.')
                    ->required()
                    ->rows(4)
                    ->columnSpanFull(),

                FileUpload::make('document_url')
                    ->label('Tescil Belgesi, Fatura veya Restorasyon Raporu (PDF / Görsel)')
                    ->directory('provenance-docs')
                    ->acceptedFileTypes(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
                    ->openable()
                    ->downloadable()
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('description')
            ->columns([
                TextColumn::make('event_date')
                    ->label('Tarih')
                    ->date('d.m.Y')
                    ->sortable(),

                TextColumn::make('event_type_label')
                    ->label('Olay Türü')
                    ->badge()
                    ->color(fn (CoinProvenance $record): string => $record->event_type_color),

                TextColumn::make('auction_house')
                    ->label('Müzayede / Kurum')
                    ->description(fn (CoinProvenance $record): ?string => $record->lot_number),

                TextColumn::make('formatted_price')
                    ->label('Fiyat')
                    ->placeholder('-'),

                TextColumn::make('description')
                    ->label('Özet Açıklama')
                    ->limit(50),

                IconColumn::make('document_url')
                    ->label('Belge')
                    ->boolean()
                    ->trueIcon('heroicon-o-document-check')
                    ->falseIcon('heroicon-o-minus')
                    ->trueColor('success'),
            ])
            ->defaultSort('event_date', 'asc')
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Yeni Provenans / Olay Ekle')
                    ->icon('heroicon-o-plus-circle'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}

