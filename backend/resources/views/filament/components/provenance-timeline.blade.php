@php
    $coin = $getRecord();
    $provenances = $coin ? $coin->provenances()->orderBy('event_date', 'asc')->get() : collect();
@endphp

<div class="py-2">
    @if (!$coin)
        <div class="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center bg-gray-50/50 dark:bg-gray-800/30">
            <x-filament::icon icon="heroicon-o-clock" class="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Yeni Eser Kaydı</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Eseri ilk kez kaydettikten sonra geçmiş mülkiyet, müzayede satışları ve restorasyon raporlarını ekleyebilirsiniz.</p>
        </div>
    @elseif ($provenances->isEmpty())
        <div class="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center bg-gray-50/50 dark:bg-gray-800/30">
            <x-filament::icon icon="heroicon-o-archive-box-x-mark" class="mx-auto h-10 w-10 text-amber-500/70 mb-3" />
            <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Kayıtlı Provenans / Konservasyon İzi Bulunamadı</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                Bu sikke için henüz tescilli bir eski koleksiyon, müzayede faturası veya restorasyon denetim kaydı girilmemiş. Sayfa altındaki "Provenans & Restorasyon Kayıtları" panelinden ilk olayı ekleyebilirsiniz.
            </p>
        </div>
    @else
        <div class="relative pl-6 sm:pl-8 border-l-2 border-amber-500/30 dark:border-amber-500/20 ml-4 my-4 space-y-8">
            @foreach ($provenances as $index => $item)
                @php
                    $colors = match($item->event_type) {
                        'auction_sale'          => ['dot' => 'bg-amber-500', 'badge' => 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50', 'icon' => 'heroicon-m-banknotes'],
                        'collection_transfer'   => ['dot' => 'bg-blue-500', 'badge' => 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50', 'icon' => 'heroicon-m-arrows-right-left'],
                        'museum_registration'   => ['dot' => 'bg-emerald-500', 'badge' => 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50', 'icon' => 'heroicon-m-building-library'],
                        'conservation_cleaning' => ['dot' => 'bg-purple-500', 'badge' => 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50', 'icon' => 'heroicon-m-sparkles'],
                        'expert_certification'  => ['dot' => 'bg-rose-500', 'badge' => 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50', 'icon' => 'heroicon-m-document-check'],
                        default                 => ['dot' => 'bg-gray-500', 'badge' => 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300', 'icon' => 'heroicon-m-clock'],
                    };
                @endphp

                <div class="relative group">
                    {{-- Dikey Çizgi Üzerindeki Nokta (Node Dot) --}}
                    <div class="absolute -left-[31px] sm:-left-[39px] top-1.5 flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-900 border-2 border-amber-500 shadow-sm ring-4 ring-white dark:ring-gray-950">
                        <span class="w-2.5 h-2.5 rounded-full {{ $colors['dot'] }}"></span>
                    </div>

                    {{-- Zaman Tüneli Kartı --}}
                    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800/60">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {{ $item->event_date?->translatedFormat('d F Y') ?? $item->event_date?->format('Y') }}
                                </span>
                                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border {{ $colors['badge'] }}">
                                    <x-filament::icon :icon="$colors['icon']" class="w-3.5 h-3.5" />
                                    {{ $item->event_type_label }}
                                </span>
                            </div>

                            @if ($item->formatted_price)
                                <div class="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                                    Çekiç: {{ $item->formatted_price }}
                                </div>
                            @endif
                        </div>

                        {{-- Kurum ve Lot Bilgisi --}}
                        @if ($item->auction_house || $item->lot_number)
                            <div class="mt-2.5 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                @if ($item->auction_house)
                                    <span class="inline-flex items-center gap-1">
                                        <x-filament::icon icon="heroicon-m-building-office" class="w-3.5 h-3.5 text-gray-400" />
                                        {{ $item->auction_house }}
                                    </span>
                                @endif
                                @if ($item->lot_number)
                                    <span class="text-gray-400">•</span>
                                    <span class="text-gray-500 dark:text-gray-400">{{ $item->lot_number }}</span>
                                @endif
                            </div>
                        @endif

                        {{-- Detaylı Açıklama / Restorasyon Rapor Metni --}}
                        <div class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {{ $item->description }}
                        </div>

                        {{-- Ekli Belge / PDF / Fatura Butonu --}}
                        @if ($item->document_url)
                            <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <a href="{{ asset($item->document_url) }}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline">
                                    <x-filament::icon icon="heroicon-o-document-arrow-down" class="w-4 h-4" />
                                    Tescil Belgesi / Restorasyon Raporu (PDF/Görsel)
                                </a>
                                <span class="text-[11px] text-gray-400 uppercase tracking-wider font-mono">Tescilli Arşiv</span>
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>

