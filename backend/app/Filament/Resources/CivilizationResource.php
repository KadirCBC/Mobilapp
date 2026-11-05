<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CivilizationResource\Pages;
use App\Models\Civilization;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CivilizationResource extends Resource
{
    protected static ?string $model = Civilization::class;

    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';

    protected static ?string $navigationGroup = 'Nümizmatik Katalog';

    protected static ?string $modelLabel = 'Medeniyet & Çağ';

    protected static ?string $pluralModelLabel = 'Medeniyetler';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('name')
                    ->label('Medeniyet Adı')
                    ->placeholder('Örn: Antik Yunan & Helenistik, Roma İmparatorluğu')
                    ->required()
                    ->maxLength(255)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (string $operation, $state, Set $set) => 
                        $operation === 'create' ? $set('slug', Str::slug($state)) : null
                    ),

                TextInput::make('slug')
                    ->label('Kalıcı Bağlantı (Slug)')
                    ->required()
                    ->unique(Civilization::class, 'slug', ignoreRecord: true),

                TextInput::make('era_period')
                    ->label('Tarihsel Dönem')
                    ->placeholder('Örn: M.Ö. 700 – M.S. 476')
                    ->maxLength(100),

                FileUpload::make('cover_image')
                    ->label('Kapak / Arka Plan Görseli')
                    ->image()
                    ->directory('civilizations'),

                Textarea::make('description')
                    ->label('Tarihsel & Nümizmatik Açıklama')
                    ->rows(3)
                    ->columnSpanFull(),

                Toggle::make('is_active')
                    ->label('Aktif')
                    ->default(true)
                    ->onColor('success'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('cover_image')
                    ->label('Kapak')
                    ->circular(),

                TextColumn::make('name')
                    ->label('Medeniyet')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('era_period')
                    ->label('Dönem'),

                TextColumn::make('coins_count')
                    ->label('Sikke Sayısı')
                    ->counts('coins')
                    ->badge()
                    ->color('warning'),

                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCivilizations::route('/'),
            'create' => Pages\CreateCivilization::route('/create'),
            'edit' => Pages\EditCivilization::route('/{record}/edit'),
        ];
    }
}

