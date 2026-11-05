@extends('admin.layout')

@section('title', 'Sikkeler & Eser Kataloğu')

@push('styles')
<style>
    .index-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 24px;
    }
    .page-title {
        font-family: 'Cinzel', serif;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-dark);
    }
    .page-subtitle {
        font-size: 13.5px;
        color: var(--text-muted);
        margin-top: 2px;
    }

    /* Filtre Barı */
    .filter-card {
        background: #FFFFFF;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
        padding: 16px 20px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .filter-form {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    .filter-input {
        padding: 9px 14px;
        border: 1.5px solid var(--border-subtle);
        border-radius: 8px;
        font-size: 13.5px;
        color: var(--text-dark);
        outline: none;
        background: #FFFFFF;
    }
    .filter-input:focus {
        border-color: var(--gold-primary);
    }

    /* Tablo */
    .table-card {
        background: #FFFFFF;
        border-radius: 14px;
        border: 1px solid var(--border-subtle);
        box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.05);
        overflow: hidden;
    }
    .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    .data-table th {
        background: #F8FAFC;
        padding: 14px 18px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-subtle);
    }
    .data-table td {
        padding: 16px 18px;
        font-size: 13.5px;
        border-bottom: 1px solid #F1F5F9;
        vertical-align: middle;
    }
    .data-table tr:hover {
        background-color: #FAFAFA;
    }

    /* Minyatür Fotoğraflar */
    .coin-thumbs {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .thumb-img {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--gold-border);
        background: #F1F5F9;
    }

    /* Rozetler */
    .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge-gold { background: rgba(245, 158, 11, 0.15); color: #B45309; }
    .badge-silver { background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; }
    .badge-bronze { background: rgba(239, 68, 68, 0.12); color: #B91C1C; }
    .badge-electrum { background: rgba(16, 185, 129, 0.15); color: #047857; }
    .badge-civilization { background: var(--gold-light); color: var(--gold-primary); border: 1px solid var(--gold-border); }

    /* Butonlar */
    .btn {
        padding: 9px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        border: none;
        transition: all 0.2s;
    }
    .btn-gold { background: var(--gold-primary); color: #FFFFFF; }
    .btn-gold:hover { background: var(--gold-hover); }
    .btn-outline { background: #FFFFFF; border: 1.5px solid var(--border-subtle); color: var(--text-dark); }
    .btn-outline:hover { background: #F8FAFC; }
    .btn-sm { padding: 6px 10px; font-size: 12px; }

    /* Toggle Switch */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 22px;
    }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
        position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
        background-color: #CBD5E1; transition: .2s; border-radius: 20px;
    }
    .toggle-slider:before {
        position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px;
        background-color: white; transition: .2s; border-radius: 50%;
    }
    input:checked + .toggle-slider { background-color: #10B981; }
    input:checked + .toggle-slider:before { transform: translateX(18px); }

    .pagination-wrapper {
        padding: 16px 20px;
        display: flex;
        justify-content: flex-end;
        background: #FFFFFF;
        border-top: 1px solid var(--border-subtle);
    }
</style>
@endpush

@section('content')
    <div class="index-header">
        <div>
            <h1 class="page-title">Sikke & Tarihi Eser Kataloğu</h1>
            <p class="page-subtitle">Toplam {{ $coins->total() }} tescilli nümizmatik eser listeleniyor</p>
        </div>
        <a href="{{ route('admin.coins.create') }}" class="btn btn-gold">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Yeni Sikke Ekle
        </a>
    </div>

    <!-- Filtre Çubuğu -->
    <div class="filter-card">
        <form action="{{ route('admin.coins.index') }}" method="GET" class="filter-form">
            <input type="text" name="search" class="filter-input" placeholder="Başlık, hükümdar veya standart ara..." value="{{ request('search') }}" style="min-width: 260px;">

            <select name="civilization_id" class="filter-input">
                <option value="">Tüm Medeniyetler</option>
                @foreach ($civilizations as $civ)
                    <option value="{{ $civ->id }}" {{ request('civilization_id') == $civ->id ? 'selected' : '' }}>{{ $civ->name }}</option>
                @endforeach
            </select>

            <select name="metal_type" class="filter-input">
                <option value="">Tüm Madenler</option>
                <option value="Altın" {{ request('metal_type') === 'Altın' ? 'selected' : '' }}>Altın (AU)</option>
                <option value="Gümüş" {{ request('metal_type') === 'Gümüş' ? 'selected' : '' }}>Gümüş (AR)</option>
                <option value="Bronz" {{ request('metal_type') === 'Bronz' ? 'selected' : '' }}>Bronz (AE)</option>
                <option value="Elektrum" {{ request('metal_type') === 'Elektrum' ? 'selected' : '' }}>Elektrum (EL)</option>
            </select>

            <select name="is_published" class="filter-input">
                <option value="">Yayın Durumu (Tümü)</option>
                <option value="1" {{ request('is_published') === '1' ? 'selected' : '' }}>Yayında Olanlar</option>
                <option value="0" {{ request('is_published') === '0' ? 'selected' : '' }}>Taslaklar</option>
            </select>

            <button type="submit" class="btn btn-outline">Filtrele</button>
            @if(request()->hasAny(['search', 'civilization_id', 'metal_type', 'is_published']))
                <a href="{{ route('admin.coins.index') }}" class="btn btn-outline" style="color: #64748B;">Temizle</a>
            @endif
        </form>
    </div>

    <!-- Tablo Kartı -->
    <div class="table-card">
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 110px;">Görseller</th>
                    <th>Eser Başlığı & Hükümdar</th>
                    <th>Medeniyet / Darphane</th>
                    <th>Maden</th>
                    <th>Tahmini Değer</th>
                    <th style="width: 90px; text-align: center;">Yayında</th>
                    <th style="width: 140px; text-align: right;">İşlemler</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($coins as $coin)
                    <tr>
                        <!-- Görseller (Avers & Revers) -->
                        <td>
                            <div class="coin-thumbs">
                                <img src="{{ $coin->avers_thumb_url ?? asset($coin->avers_image ?? 'images/placeholders/coin-avers.png') }}" 
                                     alt="Avers" class="thumb-img" title="Ön Yüz (Avers)">
                                <img src="{{ $coin->revers_thumb_url ?? asset($coin->revers_image ?? 'images/placeholders/coin-revers.png') }}" 
                                     alt="Revers" class="thumb-img" title="Arka Yüz (Revers)">
                            </div>
                        </td>

                        <!-- Başlık & Hükümdar -->
                        <td>
                            <div style="font-weight: 700; color: var(--text-dark);">{{ $coin->title }}</div>
                            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                                @if($coin->ruler) Hükümdar: {{ $coin->ruler }} • @endif
                                {{ $coin->standard_name }} ({{ $coin->formatted_period }})
                            </div>
                        </td>

                        <!-- Medeniyet / Darphane -->
                        <td>
                            <span class="badge badge-civilization">{{ $coin->civilization?->name ?? '-' }}</span>
                            @if($coin->mint)
                                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Darphane: {{ $coin->mint->name }}</div>
                            @endif
                        </td>

                        <!-- Maden Rozeti -->
                        <td>
                            @php
                                $metal = $coin->metal_type;
                                $badgeClass = match(true) {
                                    str_contains($metal, 'Altın') || str_contains($metal, 'AU') => 'badge-gold',
                                    str_contains($metal, 'Gümüş') || str_contains($metal, 'AR') => 'badge-silver',
                                    str_contains($metal, 'Bronz') || str_contains($metal, 'AE') => 'badge-bronze',
                                    str_contains($metal, 'Elektrum') => 'badge-electrum',
                                    default => 'badge-silver',
                                };
                            @endphp
                            <span class="badge {{ $badgeClass }}">{{ $metal }}</span>
                        </td>

                        <!-- Fiyat -->
                        <td style="font-weight: 600; color: #1E293B;">
                            {{ $coin->formatted_value_range ?? '-' }}
                        </td>

                        <!-- Yayın Durumu (AJAX Toggle) -->
                        <td style="text-align: center;">
                            <label class="toggle-switch">
                                <input type="checkbox" onchange="togglePublishStatus({{ $coin->id }}, this)" {{ $coin->is_published ? 'checked' : '' }}>
                                <span class="toggle-slider"></span>
                            </label>
                        </td>

                        <!-- Aksiyonlar -->
                        <td style="text-align: right;">
                            <div style="display: inline-flex; gap: 6px;">
                                <a href="{{ route('admin.coins.edit', $coin) }}" class="btn btn-outline btn-sm" title="Düzenle">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Düzenle
                                </a>

                                <form action="{{ route('admin.coins.destroy', $coin) }}" method="POST" onsubmit="return confirm('Bu eseri silmek istediğinizden emin misiniz?')" style="display:inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-outline btn-sm" style="color: #EF4444;" title="Sil">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
                            Kriterlere uygun sikke bulunamadı.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Sayfalama -->
        <div class="pagination-wrapper">
            {{ $coins->links() }}
        </div>
    </div>
@endsection

@push('scripts')
<script>
    async function togglePublishStatus(coinId, el) {
        try {
            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const res = await fetch(`/admin/coins/${coinId}/toggle-publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (!data.success) {
                el.checked = !el.checked;
                alert('Yayın durumu değiştirilemedi.');
            }
        } catch (e) {
            el.checked = !el.checked;
            alert('Sunucu hatası oluştu.');
        }
    }
</script>
@endpush

