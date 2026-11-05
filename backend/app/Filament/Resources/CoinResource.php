<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CoinResource\Pages;
use App\Filament\Resources\CoinResource\RelationManagers\ProvenancesRelationManager;
use App\Models\Civilization;
use App\Models\Coin;
use App\Models\Mint;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Tabs\Tab;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ViewField;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Support\Enums\FontWeight;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class CoinResource extends Resource
{
    protected static ?string $model = Coin::class;

    protected static ?string $navigationIcon = 'heroicon-o-circle-stack';

    protected static ?string $navigationGroup = 'Nümizmatik Katalog';

    protected static ?string $modelLabel = 'Sikke & Eser';

    protected static ?string $pluralModelLabel = 'Sikkeler';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        $user = auth()->user();

        // Rol ve İzin Yetki Bayrakları
        $canEditBasic       = $user?->can('coins.edit_basic') ?? false;
        $canEditPhysical    = $user?->can('coins.edit_physical') ?? false;
        $canEditDesc        = $user?->can('coins.edit_descriptions') ?? false;
        $canUploadPhotos    = $user?->can('coins.upload_photos') ?? false;
        $canEditReferences  = $user?->can('coins.edit_references') ?? false;
        $canAppraise        = $user?->can('coins.appraise') ?? false;
        $canApprove         = $user?->can('coins.approve') ?? false;

        return $form
            ->schema([
                Tabs::make('CoinDetails')
                    ->tabs([
                        // SEKME 1: Temel Veriler (CatalogEditor, ChiefNumismatist, SuperAdmin)
                        Tab::make('Temel Veriler')
                            ->icon('heroicon-o-identification')
                            ->badge(fn (Get $get) => !$canEditBasic ? 'Salt Okunur' : null)
                            ->schema([
                                Grid::make(2)->schema([
                                    TextInput::make('title')
                                        ->label('Eser / Sikke Başlığı')
                                        ->placeholder('Örn: Kroisos Ağır Altın Stateri')
                                        ->required()
                                        ->disabled(!$canEditBasic)
                                        ->maxLength(255)
                                        ->live(onBlur: true)
                                        ->afterStateUpdated(function (string $operation, $state, Set $set) {
                                            if ($operation === 'create') {
                                                $set('slug', Str::slug($state));
                                            }
                                        }),

                                    TextInput::make('slug')
                                        ->label('Kalıcı Bağlantı (Slug)')
                                        ->required()
                                        ->disabled(!$canEditBasic)
                                        ->unique(Coin::class, 'slug', ignoreRecord: true)
                                        ->maxLength(255),
                                ]),

                                Grid::make(2)->schema([
                                    Select::make('civilization_id')
                                        ->label('Medeniyet & Dönem')
                                        ->relationship('civilization', 'name')
                                        ->searchable()
                                        ->preload()
                                        ->required()
                                        ->disabled(!$canEditBasic)
                                        ->live()
                                        ->afterStateUpdated(fn (Set $set) => $set('mint_id', null)),

                                    Select::make('mint_id')
                                        ->label('Antik Darphane')
                                        ->placeholder('Darphane seçiniz veya aratınız')
                                        ->disabled(!$canEditBasic)
                                        ->options(function (Get $get) {
                                            $civId = $get('civilization_id');
                                            if (!$civId) {
                                                return Mint::pluck('name', 'id');
                                            }
                                            return Mint::where('civilization_id', $civId)->pluck('name', 'id');
                                        })
                                        ->searchable()
                                        ->preload()
                                        ->nullable(),
                                ]),

                                Grid::make(3)->schema([
                                    TextInput::make('ruler')
                                        ->label('Hükümdar / İmparator')
                                        ->placeholder('Örn: Domitian, Nero, Fatih Sultan Mehmed')
                                        ->disabled(!$canEditBasic)
                                        ->maxLength(255),

                                    TextInput::make('year_start')
                                        ->label('Başlangıç Yılı')
                                        ->numeric()
                                        ->disabled(!$canEditBasic)
                                        ->helperText('M.Ö. tarihleri için negatif giriniz (örn: -560)'),

                                    TextInput::make('year_end')
                                        ->label('Bitiş Yılı')
                                        ->numeric()
                                        ->disabled(!$canEditBasic)
                                        ->helperText('Örn: -546 veya 82'),
                                ]),
                            ]),

                        // SEKME 2: Fiziksel Özellikler (CatalogEditor, ChiefNumismatist, SuperAdmin)
                        Tab::make('Fiziksel Özellikler')
                            ->icon('heroicon-o-scale')
                            ->badge(fn () => !$canEditPhysical ? 'Salt Okunur' : null)
                            ->schema([
                                Grid::make(3)->schema([
                                    Select::make('metal_type')
                                        ->label('Maden Türü')
                                        ->options([
                                            'Altın (AU)' => 'Altın (AU)',
                                            'Gümüş (AR)' => 'Gümüş (AR)',
                                            'Bronz (AE)' => 'Bronz (AE)',
                                            'Elektrum (EL)' => 'Elektrum (EL)',
                                            'Bilyon' => 'Bilyon',
                                            'Bakır' => 'Bakır',
                                        ])
                                        ->required()
                                        ->disabled(!$canEditPhysical)
                                        ->native(false),

                                    TextInput::make('standard_name')
                                        ->label('Birim / Tip Standartı')
                                        ->placeholder('Örn: Stater, Tetradrahmi, Denarius, Akçe')
                                        ->required()
                                        ->disabled(!$canEditPhysical)
                                        ->maxLength(100),

                                    Select::make('die_axis')
                                        ->label('Kalıp Açısı (Die Axis)')
                                        ->options([
                                            '12h' => '12h (Kuzey)',
                                            '6h'  => '6h (Güney)',
                                            '1h'  => '1h',
                                            '2h'  => '2h',
                                            '3h'  => '3h',
                                            '7h'  => '7h',
                                            '9h'  => '9h',
                                        ])
                                        ->disabled(!$canEditPhysical)
                                        ->placeholder('Seçiniz'),
                                ]),

                                Grid::make(4)->schema([
                                    TextInput::make('weight_grams')
                                        ->label('Ağırlık')
                                        ->numeric()
                                        ->suffix('gr')
                                        ->step('0.01')
                                        ->disabled(!$canEditPhysical),

                                    TextInput::make('diameter_mm')
                                        ->label('Çap')
                                        ->numeric()
                                        ->suffix('mm')
                                        ->step('0.01')
                                        ->disabled(!$canEditPhysical),

                                    Select::make('condition_grade')
                                        ->label('Kondisyon Derecesi')
                                        ->options([
                                            'FDC' => 'FDC (Fleur de Coin - Kusursuz Çil)',
                                            'UNC' => 'UNC (Uncirculated - Çil)',
                                            'EF'  => 'EF / XF (Extremely Fine - Son Derece Güzel)',
                                            'VF'  => 'VF (Very Fine - Çok Güzel)',
                                            'F'   => 'Fine (Güzel)',
                                            'VG'  => 'Very Good (İyi)',
                                            'Fair' => 'Fair (Zayıf/Yıpranmış)',
                                        ])
                                        ->disabled(!$canEditPhysical)
                                        ->searchable(),

                                    Select::make('rarity_code')
                                        ->label('Nadirlik Kodu')
                                        ->options([
                                            'C'    => 'C (Common - Yaygın)',
                                            'S'    => 'S (Scarce - Kıt)',
                                            'R1'   => 'R1 (Nadir)',
                                            'R2'   => 'R2 (Çok Nadir)',
                                            'R3'   => 'R3 (Olağanüstü Nadir)',
                                            'Ünik' => 'Ünik (Bilinen Tek Örnek)',
                                        ])
                                        ->default('C')
                                        ->disabled(!$canEditPhysical)
                                        ->native(false),
                                ]),
                            ]),

                        // SEKME 3: Görseller & Lejant (Fotoğrafçı Foto Yükleyebilir, Editör Lejant Yazar)
                        Tab::make('Görseller & Lejant')
                            ->icon('heroicon-o-photo')
                            ->schema([
                                Grid::make(2)->schema([
                                    Section::make('Ön Yüz (Avers / Obverse)')
                                        ->schema([
                                            FileUpload::make('avers_image')
                                                ->label('Ön Yüz Makro Fotoğrafı')
                                                ->image()
                                                ->directory('coins/obverse')
                                                ->imageEditor()
                                                ->openable()
                                                ->downloadable()
                                                ->disabled(!$canUploadPhotos)
                                                ->helperText('Yüklendiğinde otomatik WebP ve thumbnail türevleri üretilir.'),

                                            Textarea::make('avers_description')
                                                ->label('Ön Yüz Tasvir & Lejantı')
                                                ->placeholder('Örn: Sağ profilden defne çelenkli büst. Lejant: IMP CAES DOMIT AVG GERM')
                                                ->disabled(!$canEditDesc)
                                                ->rows(4),
                                        ]),

                                    Section::make('Arka Yüz (Revers / Reverse)')
                                        ->schema([
                                            FileUpload::make('revers_image')
                                                ->label('Arka Yüz Makro Fotoğrafı')
                                                ->image()
                                                ->directory('coins/reverse')
                                                ->imageEditor()
                                                ->openable()
                                                ->downloadable()
                                                ->disabled(!$canUploadPhotos)
                                                ->helperText('Yüklendiğinde otomatik WebP ve thumbnail türevleri üretilir.'),

                                            Textarea::make('revers_description')
                                                ->label('Arka Yüz Tasvir & Lejantı')
                                                ->placeholder('Örn: Dört sütunlu tapınak cephesi, alınlıkta küre. Lejant: CAPIT RESTIT')
                                                ->disabled(!$canEditDesc)
                                                ->rows(4),
                                        ]),
                                ]),
                            ]),

                        // SEKME 4: Değerleme & Onay Akışı (ChiefNumismatist & SuperAdmin Yetkisinde)
                        Tab::make('Değerleme & Onay')
                            ->icon('heroicon-o-shield-check')
                            ->badge(fn (Coin $record) => $record->approval_status_label ?? 'Taslak')
                            ->schema([
                                Section::make('Müzayede & Pazar Değerleme Endeksi')
                                    ->description('Yalnızca Baş Nümizmat heyeti tarafından belirlenebilir.')
                                    ->schema([
                                        Grid::make(3)->schema([
                                            TextInput::make('estimated_value_min')
                                                ->label('Tahmini Değer (Min)')
                                                ->numeric()
                                                ->prefix('$')
                                                ->disabled(!$canAppraise)
                                                ->step('1'),

                                            TextInput::make('estimated_value_max')
                                                ->label('Tahmini Değer (Max)')
                                                ->numeric()
                                                ->prefix('$')
                                                ->disabled(!$canAppraise)
                                                ->step('1'),

                                            Select::make('currency')
                                                ->label('Para Birimi')
                                                ->options([
                                                    'USD' => 'USD ($)',
                                                    'EUR' => 'EUR (€)',
                                                    'TRY' => 'TRY (₺)',
                                                    'GBP' => 'GBP (£)',
                                                ])
                                                ->default('USD')
                                                ->disabled(!$canAppraise)
                                                ->native(false),
                                        ]),
                                    ]),

                                KeyValue::make('reference_codes')
                                    ->label('Standart Korpus & Referans Kodları')
                                    ->keyLabel('Katalog (Örn: RIC, RPC, BMC, Sear, SNG)')
                                    ->valueLabel('Referans Kodu (Örn: Cilt II 114)')
                                    ->disabled(!$canEditReferences)
                                    ->helperText('RIC -> II 114, BMC -> BMCRE II 241, Sear -> 2731')
                                    ->reorderable(),

                                // ONAY AKIŞI YÖNETİMİ
                                Section::make('Kurumsal Onay & Canlıya Alma Akışı')
                                    ->schema([
                                        Grid::make(2)->schema([
                                            Select::make('approval_status')
                                                ->label('Onay Durumu')
                                                ->options([
                                                    'draft'          => 'Taslak (Hazırlık Aşamasında)',
                                                    'pending_review' => 'Uzman Onayı Bekliyor',
                                                    'approved'       => 'Onaylandı (Canlı Yayına Hazır)',
                                                    'rejected'       => 'Revizyon İstendi (Düzeltme Bekliyor)',
                                                ])
                                                ->disabled(!$canApprove)
                                                ->required()
                                                ->native(false),

                                            Textarea::make('rejection_reason')
                                                ->label('Revizyon Talebi / Uzman Notu')
                                                ->placeholder('Eserde eksik lejant veya kondisyon düzeltmesi gerekliyse not düşünüz...')
                                                ->disabled(!$canApprove)
                                                ->rows(2),
                                        ]),

                                        Grid::make(2)->schema([
                                            Toggle::make('is_published')
                                                ->label('Mobil Katalogta Canlıya Al')
                                                ->helperText('Yalnızca Baş Nümizmat onayı ile mobil aramada listelenir.')
                                                ->disabled(!$canApprove)
                                                ->onColor('success'),

                                            Toggle::make('is_featured')
                                                ->label('Günün Eseri / Vitrin (Hero)')
                                                ->disabled(!$canApprove)
                                                ->onColor('warning'),
                                        ]),
                                    ]),
                            ]),

                        // SEKME 5: Provenans & Konservasyon (Denetim İzi & Zaman Tüneli)
                        Tab::make('Provenans & Konservasyon')
                            ->icon('heroicon-o-clock')
                            ->badge(fn (?Coin $record) => $record?->provenances()->count() ?: null)
                            ->schema([
                                Section::make('Mülkiyet Geçmişi & Konservasyon Zaman Tüneli (1920 – Günümüz)')
                                    ->description('Eserin el değiştirdiği müzayedeler, eski koleksiyonerler, müze tescil kayıtları ve laboratuvar restorasyon denetim izleri.')
                                    ->schema([
                                        ViewField::make('provenance_timeline')
                                            ->view('filament.components.provenance-timeline'),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        $user = auth()->user();
        $canApprove = $user?->can('coins.approve') ?? false;

        return $table
            ->columns([
                // Ön ve Arka Yüz Minyatür Fotoğrafları
                ImageColumn::make('avers_image')
                    ->label('Ön Yüz')
                    ->circular()
                    ->state(fn (Coin $record): ?string => $record->avers_thumb_url)
                    ->defaultImageUrl('/images/placeholders/coin-avers.png'),

                ImageColumn::make('revers_image')
                    ->label('Arka Yüz')
                    ->circular()
                    ->state(fn (Coin $record): ?string => $record->revers_thumb_url)
                    ->defaultImageUrl('/images/placeholders/coin-revers.png'),

                // Eser Adı & Hükümdar
                TextColumn::make('title')
                    ->label('Eser Adı')
                    ->weight(FontWeight::SemiBold)
                    ->description(fn (Coin $record): string => $record->ruler ? "Hükümdar: {$record->ruler}" : ($record->standard_name ?? ''))
                    ->searchable()
                    ->sortable(),

                // Medeniyet Etiketi
                TextColumn::make('civilization.name')
                    ->label('Medeniyet')
                    ->badge()
                    ->color('primary')
                    ->sortable()
                    ->searchable(),

                // Maden Rozeti
                TextColumn::make('metal_type')
                    ->label('Maden')
                    ->badge()
                    ->color(fn (string $state): string => match (true) {
                        str_contains($state, 'Altın') || str_contains($state, 'AU') => 'warning',
                        str_contains($state, 'Gümüş') || str_contains($state, 'AR') => 'gray',
                        str_contains($state, 'Bronz') || str_contains($state, 'AE') => 'danger',
                        str_contains($state, 'Elektrum') => 'success',
                        default => 'info',
                    })
                    ->sortable(),

                // Tahmini Değer
                TextColumn::make('formatted_value_range')
                    ->label('Tahmini Değer')
                    ->sortable(),

                // Onay Durumu Rozeti (Approval Workflow Status)
                TextColumn::make('approval_status')
                    ->label('Onay Durumu')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'approved'       => 'Onaylandı',
                        'pending_review' => 'Onay Bekliyor',
                        'rejected'       => 'Revizyon',
                        default          => 'Taslak',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'approved'       => 'success',
                        'pending_review' => 'warning',
                        'rejected'       => 'danger',
                        default          => 'gray',
                    }),

                // Yayında / Taslak Anahtarı (Yalnızca Baş Nümizmat tıklayabilir)
                ToggleColumn::make('is_published')
                    ->label('Yayında')
                    ->disabled(!$canApprove)
                    ->onColor('success')
                    ->offColor('danger'),
            ])
            ->filters([
                SelectFilter::make('approval_status')
                    ->label('Onay Durumu')
                    ->options([
                        'draft'          => 'Taslaklar',
                        'pending_review' => 'Uzman Onayı Bekleyenler',
                        'approved'       => 'Onaylanmış Eserler',
                        'rejected'       => 'Revizyon İstenenler',
                    ]),

                SelectFilter::make('civilization_id')
                    ->label('Medeniyet')
                    ->relationship('civilization', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('metal_type')
                    ->label('Maden')
                    ->options([
                        'Altın (AU)' => 'Altın',
                        'Gümüş (AR)' => 'Gümüş',
                        'Bronz (AE)' => 'Bronz',
                        'Elektrum (EL)' => 'Elektrum',
                    ]),

                TernaryFilter::make('is_published')
                    ->label('Yayın Durumu')
                    ->trueLabel('Yayında Olanlar')
                    ->falseLabel('Taslak / Gizli')
                    ->placeholder('Tümü'),
            ])
            ->actions([
                // AKSİYON 1: Onaya Gönder (Editör ve Fotoğrafçı İçin)
                Action::make('submitForReview')
                    ->label('Onaya Gönder')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('info')
                    ->visible(fn (Coin $record): bool => in_array($record->approval_status, ['draft', 'rejected']))
                    ->action(function (Coin $record) {
                        $record->update(['approval_status' => 'pending_review']);
                        Notification::make()
                            ->title('Eser Onaya Gönderildi')
                            ->body('Baş Nümizmat inceleme kuyruğuna iletildi.')
                            ->success()
                            ->send();
                    }),

                // AKSİYON 2: Uzman Onayı Ver (Yalnızca Baş Nümizmat & SuperAdmin)
                Action::make('approveCoin')
                    ->label('Onayla & Yayınla')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Coin $record): bool => $canApprove && $record->approval_status !== 'approved')
                    ->requiresConfirmation()
                    ->modalHeading('Eseri Onayla ve Canlıya Al')
                    ->modalDescription('Bu eserin bilimsel nitelikleri, kondisyonu ve müzayede değerlemesi onaylanıp mobil katalogta yayınlanacaktır.')
                    ->action(function (Coin $record) {
                        $record->update([
                            'approval_status'  => 'approved',
                            'is_published'     => true,
                            'reviewed_by'      => auth()->id(),
                            'reviewed_at'      => now(),
                            'rejection_reason' => null,
                        ]);

                        Notification::make()
                            ->title('Eser Başarıyla Onaylandı')
                            ->body('Eser canlı katalogta yayına alındı.')
                            ->success()
                            ->send();
                    }),

                // AKSİYON 3: Revizyon İste (Yalnızca Baş Nümizmat & SuperAdmin)
                Action::make('requestRevision')
                    ->label('Revizyon İste')
                    ->icon('heroicon-o-arrow-path')
                    ->color('danger')
                    ->visible(fn (Coin $record): bool => $canApprove && $record->approval_status === 'pending_review')
                    ->form([
                        Textarea::make('rejection_reason')
                            ->label('Revizyon Gerekçesi')
                            ->placeholder('Örn: Avers lejantı okunamıyor veya maden kondisyonu EF yerine VF girilmeli...')
                            ->required(),
                    ])
                    ->action(function (Coin $record, array $data) {
                        $record->update([
                            'approval_status'  => 'rejected',
                            'is_published'     => false,
                            'reviewed_by'      => auth()->id(),
                            'reviewed_at'      => now(),
                            'rejection_reason' => $data['rejection_reason'],
                        ]);

                        Notification::make()
                            ->title('Revizyon Talebi İletildi')
                            ->body('Eser editör/fotoğrafçı düzeltme kuyruğuna geri gönderildi.')
                            ->warning()
                            ->send();
                    }),

                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->visible(fn (): bool => auth()->user()?->can('coins.delete') ?? false),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn (): bool => auth()->user()?->can('coins.delete') ?? false),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            ProvenancesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCoins::route('/'),
            'create' => Pages\CreateCoin::route('/create'),
            'edit' => Pages\EditCoin::route('/{record}/edit'),
        ];
    }
}
