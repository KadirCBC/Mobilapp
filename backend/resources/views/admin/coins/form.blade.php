@extends('admin.layout')

@section('title', $coin->exists ? 'Sikke Düzenle: ' . $coin->title : 'Yeni Sikke Ekle')

@push('styles')
<style>
    .form-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
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

    /* Tab Menüsü */
    .tab-nav {
        display: flex;
        gap: 8px;
        background: #FFFFFF;
        padding: 6px;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        overflow-x: auto;
    }
    .tab-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 13.5px;
        font-weight: 600;
        color: var(--text-muted);
        background: transparent;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        transition: all 0.2s;
    }
    .tab-btn:hover {
        color: var(--gold-primary);
    }
    .tab-btn.active {
        background: var(--gold-light);
        color: var(--gold-primary);
        box-shadow: 0 1px 3px rgba(158, 123, 59, 0.1);
    }

    /* Form Kartı & Alanlar */
    .card {
        background: #FFFFFF;
        border-radius: 16px;
        border: 1px solid var(--border-subtle);
        box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.06);
        padding: 32px;
        margin-bottom: 24px;
    }
    .tab-content {
        display: none;
    }
    .tab-content.active {
        display: block;
        animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .form-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .form-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .form-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }

    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 13.5px; font-weight: 600; color: var(--text-dark); margin-bottom: 7px; }
    .form-helper { font-size: 12px; color: var(--text-muted); margin-top: 5px; }
    .form-control {
        width: 100%;
        padding: 10px 14px;
        border: 1.5px solid var(--border-subtle);
        border-radius: 8px;
        font-size: 13.5px;
        color: var(--text-dark);
        background: #FFFFFF;
        outline: none;
        transition: border-color 0.2s;
    }
    .form-control:focus {
        border-color: var(--gold-primary);
        box-shadow: 0 0 0 3px rgba(158, 123, 59, 0.12);
    }

    /* Görsel Yükleyici & Önizleme */
    .image-upload-box {
        border: 2px dashed var(--border-subtle);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        background: #F8FAFC;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
    }
    .image-upload-box:hover {
        border-color: var(--gold-primary);
        background: var(--gold-light);
    }
    .preview-circle {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        object-fit: cover;
        margin: 0 auto 12px;
        border: 3px solid var(--gold-primary);
        background: #FFFFFF;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        display: block;
    }

    /* Butonlar */
    .btn {
        padding: 11px 22px;
        border-radius: 8px;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        border: none;
        transition: all 0.2s;
    }
    .btn-gold { background: var(--gold-primary); color: #FFFFFF; }
    .btn-gold:hover { background: var(--gold-hover); }
    .btn-outline { background: #FFFFFF; border: 1.5px solid var(--border-subtle); color: var(--text-dark); }
    .btn-outline:hover { background: #F8FAFC; }

    /* Switch */
    .toggle-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        background: #F8FAFC;
        border: 1px solid var(--border-subtle);
        border-radius: 10px;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
        position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
        background-color: #CBD5E1; transition: .25s; border-radius: 30px;
    }
    .slider:before {
        position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px;
        background-color: white; transition: .25s; border-radius: 50%;
    }
    input:checked + .slider { background-color: var(--gold-primary); }
    input:checked + .slider:before { transform: translateX(22px); }
</style>
@endpush

@section('content')
    <div class="form-header">
        <div>
            <h1 class="page-title">{{ $coin->exists ? 'Sikke Düzenle: ' . $coin->title : 'Yeni Nümizmatik Eser Ekle' }}</h1>
            <p class="page-subtitle">Katalog tipolojisi, metrik ölçümler, yüksek çözünürlüklü WebP fotoğraflar ve referanslar</p>
        </div>
        <a href="{{ route('admin.coins.index') }}" class="btn btn-outline">
            &larr; Listeye Dön
        </a>
    </div>

    @if ($errors->any())
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; color: #991B1B; padding: 14px 18px; border-radius: 10px; margin-bottom: 20px;">
            <strong>Lütfen formdaki hataları düzeltiniz:</strong>
            <ul style="margin-left: 20px; margin-top: 6px; font-size: 13px;">
                @foreach ($errors->all() as $err)
                    <li>{{ $err }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- ⚡ Altın Vurgulu Otomatik Veri Çekme & AI Çeviri Barı (#9E7B3B) -->
    <div class="card" style="background: linear-gradient(135deg, #FBF8F2 0%, #FFFFFF 100%); border: 2px solid #9E7B3B; border-radius: 16px; padding: 22px 28px; margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.15);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(158, 123, 59, 0.15); display: flex; align-items: center; justify-content: center; color: #9E7B3B;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
                <div>
                    <h3 style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 700; color: #1A1D20; margin: 0;">
                        Dış Bağlantıdan Otomatik İçe Aktar (VCoins vb.)
                    </h3>
                    <p style="font-size: 12px; color: #64748B; margin: 2px 0 0 0;">
                        Google Gemini 1.5 nümizmatik AI motoru ile İngilizce açıklamaları Türkçeleştirir ve görselleri WebP olarak kaydeder.
                    </p>
                </div>
            </div>
            <span style="background: #9E7B3B; color: #FFFFFF; font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px; padding: 4px 10px; border-radius: 20px;">
                YAPAY ZEKA ENTEGRASYONU
            </span>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="url" id="scraper_url" class="form-control" placeholder="https://www.vcoins.com/en/stores/..." style="flex: 1; min-width: 300px; background: #FFFFFF; border-color: rgba(158, 123, 59, 0.4); font-size: 13.5px;">
            <button type="button" id="btn_fetch_url" class="btn btn-gold" onclick="fetchCoinFromUrl()" style="white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; padding: 11px 24px; font-weight: 700; background: #9E7B3B; border-color: #9E7B3B;">
                <span id="fetch_spinner" style="display: none; width: 14px; height: 14px; border: 2px solid #FFF; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></span>
                <svg id="fetch_icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path></svg>
                <span id="fetch_btn_text">Verileri Getir ve Çevir</span>
            </button>
        </div>

        <div id="fetch_status_box" style="display: none; margin-top: 14px; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;"></div>
    </div>

    <!-- 4 Sekmeli Navigasyon Çubuğu -->
    <div class="tab-nav">
        <button type="button" class="tab-btn active" onclick="switchTab('tab-basic', this)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Sekme 1: Temel Bilgiler
        </button>
        <button type="button" class="tab-btn" onclick="switchTab('tab-physical', this)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12"></path><path d="M6 12h12"></path></svg>
            Sekme 2: Fiziksel Veriler
        </button>
        <button type="button" class="tab-btn" onclick="switchTab('tab-images', this)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Sekme 3: Görseller & Rölyef
        </button>
        <button type="button" class="tab-btn" onclick="switchTab('tab-references', this)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Sekme 4: Değerleme & Referanslar
        </button>
    </div>

    <form action="{{ $coin->exists ? route('admin.coins.update', $coin) : route('admin.coins.store') }}" method="POST" enctype="multipart/form-data">
        @csrf
        @if ($coin->exists)
            @method('PUT')
        @endif

        <input type="hidden" name="avers_image" id="avers_image" value="{{ old('avers_image', $coin->avers_image) }}">
        <input type="hidden" name="revers_image" id="revers_image" value="{{ old('revers_image', $coin->revers_image) }}">

        <!-- SEKME 1: Temel Bilgiler -->
        <div id="tab-basic" class="tab-content active">
            <div class="card">
                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="form-label" for="title">Sikke / Eser Başlığı *</label>
                        <input type="text" name="title" id="title" class="form-control" value="{{ old('title', $coin->title) }}" placeholder="Örn: Kroisos Ağır Altın Stateri" required>
                        <div class="form-helper">SEO dostu kalıcı bağlantı (slug) otomatik oluşturulur.</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="ruler">Hükümdar / İmparator</label>
                        <input type="text" name="ruler" id="ruler" class="form-control" value="{{ old('ruler', $coin->ruler) }}" placeholder="Örn: Domitian, Nero, Fatih Sultan Mehmed">
                    </div>
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="form-label" for="civilization_id">Medeniyet & Dönem *</label>
                        <select name="civilization_id" id="civilization_id" class="form-control" onchange="loadMintsByCivilization(this.value)" required>
                            <option value="">Medeniyet Seçiniz...</option>
                            @foreach ($civilizations as $civ)
                                <option value="{{ $civ->id }}" {{ old('civilization_id', $coin->civilization_id) == $civ->id ? 'selected' : '' }}>{{ $civ->name }} ({{ $civ->era_period }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="mint_id">Antik Darphane</label>
                        <select name="mint_id" id="mint_id" class="form-control">
                            <option value="">Darphane Seçiniz...</option>
                            @foreach ($mints as $m)
                                <option value="{{ $m->id }}" {{ old('mint_id', $coin->mint_id) == $m->id ? 'selected' : '' }}>{{ $m->name }} @if($m->ancient_name) ({{ $m->ancient_name }}) @endif</option>
                            @endforeach
                        </select>
                        <div class="form-helper">Medeniyete göre darphaneler dinamik filtrelenir.</div>
                    </div>
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="form-label" for="year_start">Başlangıç Yılı</label>
                        <input type="number" name="year_start" id="year_start" class="form-control" value="{{ old('year_start', $coin->year_start) }}" placeholder="-560">
                        <div class="form-helper">M.Ö. tarihleri için negatif tam sayı giriniz (örn: M.Ö. 560 için -560).</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="year_end">Bitiş Yılı</label>
                        <input type="number" name="year_end" id="year_end" class="form-control" value="{{ old('year_end', $coin->year_end) }}" placeholder="-546">
                        <div class="form-helper">Örn: -546 veya M.S. için 82.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SEKME 2: Fiziksel Veriler -->
        <div id="tab-physical" class="tab-content">
            <div class="card">
                <div class="form-grid-3">
                    <div class="form-group">
                        <label class="form-label" for="metal_type">Maden Türü *</label>
                        <select name="metal_type" id="metal_type" class="form-control" required>
                            <option value="Altın (AU)" {{ old('metal_type', $coin->metal_type) === 'Altın (AU)' ? 'selected' : '' }}>Altın (AU)</option>
                            <option value="Gümüş (AR)" {{ old('metal_type', $coin->metal_type) === 'Gümüş (AR)' ? 'selected' : '' }}>Gümüş (AR)</option>
                            <option value="Bronz (AE)" {{ old('metal_type', $coin->metal_type) === 'Bronz (AE)' ? 'selected' : '' }}>Bronz (AE)</option>
                            <option value="Elektrum (EL)" {{ old('metal_type', $coin->metal_type) === 'Elektrum (EL)' ? 'selected' : '' }}>Elektrum (EL)</option>
                            <option value="Bilyon" {{ old('metal_type', $coin->metal_type) === 'Bilyon' ? 'selected' : '' }}>Bilyon</option>
                            <option value="Bakır" {{ old('metal_type', $coin->metal_type) === 'Bakır' ? 'selected' : '' }}>Bakır</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="standard_name">Birim / Tip Standartı *</label>
                        <input type="text" name="standard_name" id="standard_name" class="form-control" value="{{ old('standard_name', $coin->standard_name) }}" placeholder="Stater, Tetradrahmi, Denarius, Sultani" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="die_axis">Kalıp Açısı (Die Axis)</label>
                        <select name="die_axis" id="die_axis" class="form-control">
                            <option value="">Seçiniz</option>
                            @foreach(['12h', '6h', '1h', '2h', '3h', '7h', '9h'] as $axis)
                                <option value="{{ $axis }}" {{ old('die_axis', $coin->die_axis) === $axis ? 'selected' : '' }}>{{ $axis }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <div class="form-grid-4">
                    <div class="form-group">
                        <label class="form-label" for="weight_grams">Ağırlık (Gram)</label>
                        <input type="number" step="0.01" name="weight_grams" id="weight_grams" class="form-control" value="{{ old('weight_grams', $coin->weight_grams) }}" placeholder="16.92">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="diameter_mm">Çap (Milimetre)</label>
                        <input type="number" step="0.01" name="diameter_mm" id="diameter_mm" class="form-control" value="{{ old('diameter_mm', $coin->diameter_mm) }}" placeholder="27.50">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="condition_grade">Kondisyon Derecesi</label>
                        <select name="condition_grade" id="condition_grade" class="form-control">
                            <option value="">Seçiniz</option>
                            <option value="FDC" {{ old('condition_grade', $coin->condition_grade) === 'FDC' ? 'selected' : '' }}>FDC (Kusursuz Çil)</option>
                            <option value="UNC" {{ old('condition_grade', $coin->condition_grade) === 'UNC' ? 'selected' : '' }}>UNC (Çil)</option>
                            <option value="EF" {{ old('condition_grade', $coin->condition_grade) === 'EF' ? 'selected' : '' }}>EF / XF (Son Derece Güzel)</option>
                            <option value="VF" {{ old('condition_grade', $coin->condition_grade) === 'VF' ? 'selected' : '' }}>VF (Çok Güzel)</option>
                            <option value="Fine" {{ old('condition_grade', $coin->condition_grade) === 'Fine' ? 'selected' : '' }}>Fine (Güzel)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="rarity_code">Nadirlik Kodu</label>
                        <select name="rarity_code" id="rarity_code" class="form-control">
                            @foreach(['C' => 'C (Yaygın)', 'S' => 'S (Kıt)', 'R1' => 'R1 (Nadir)', 'R2' => 'R2 (Çok Nadir)', 'R3' => 'R3 (Aşırı Nadir)', 'Ünik' => 'Ünik'] as $code => $label)
                                <option value="{{ $code }}" {{ old('rarity_code', $coin->rarity_code) === $code ? 'selected' : '' }}>{{ $label }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- SEKME 3: Görseller & Rölyef -->
        <div id="tab-images" class="tab-content">
            <div class="card">
                <div class="form-grid-2">
                    <!-- Ön Yüz (Avers) -->
                    <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px;">
                        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--text-dark);">Ön Yüz (Avers / Obverse)</h3>

                        <div class="image-upload-box" onclick="document.getElementById('avers_image_file').click()">
                            <img id="avers-preview" class="preview-circle" 
                                 src="{{ $coin->avers_thumb_url ?? asset($coin->avers_image ?? 'images/placeholders/coin-avers.png') }}" 
                                 alt="Ön Yüz Önizleme">
                            <div style="font-weight: 600; font-size: 13px; color: var(--gold-primary);">Makro Fotoğraf Yükle</div>
                            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">JPG, PNG veya WebP (Otomatik optimize edilir)</div>
                            <input type="file" name="avers_image_file" id="avers_image_file" accept="image/*" style="display: none;" onchange="previewImage(this, 'avers-preview')">
                        </div>

                        <div class="form-group" style="margin-top: 16px;">
                            <label class="form-label" for="avers_description">Ön Yüz Tasvir & Lejant Metni</label>
                            <textarea name="avers_description" id="avers_description" class="form-control" rows="4" placeholder="Örn: Sağ profilden defne çelenkli büst. Lejant: IMP CAES DOMIT AVG GERM P M TR P">{{ old('avers_description', $coin->avers_description) }}</textarea>
                        </div>
                    </div>

                    <!-- Arka Yüz (Revers) -->
                    <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px;">
                        <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--text-dark);">Arka Yüz (Revers / Reverse)</h3>

                        <div class="image-upload-box" onclick="document.getElementById('revers_image_file').click()">
                            <img id="revers-preview" class="preview-circle" 
                                 src="{{ $coin->revers_thumb_url ?? asset($coin->revers_image ?? 'images/placeholders/coin-revers.png') }}" 
                                 alt="Arka Yüz Önizleme">
                            <div style="font-weight: 600; font-size: 13px; color: var(--gold-primary);">Makro Fotoğraf Yükle</div>
                            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">JPG, PNG veya WebP (Otomatik optimize edilir)</div>
                            <input type="file" name="revers_image_file" id="revers_image_file" accept="image/*" style="display: none;" onchange="previewImage(this, 'revers-preview')">
                        </div>

                        <div class="form-group" style="margin-top: 16px;">
                            <label class="form-label" for="revers_description">Arka Yüz Tasvir & Lejant Metni</label>
                            <textarea name="revers_description" id="revers_description" class="form-control" rows="4" placeholder="Örn: Dört sütunlu tapınak cephesi, alınlıkta küre. Lejant: CAPIT RESTIT">{{ old('revers_description', $coin->revers_description) }}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SEKME 4: Değerleme & Referanslar -->
        <div id="tab-references" class="tab-content">
            <div class="card">
                <div class="form-grid-3">
                    <div class="form-group">
                        <label class="form-label" for="estimated_value_min">Tahmini Taban Fiyat</label>
                        <input type="number" step="1" name="estimated_value_min" id="estimated_value_min" class="form-control" value="{{ old('estimated_value_min', $coin->estimated_value_min) }}" placeholder="1200">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="estimated_value_max">Tahmini Tavan Fiyat</label>
                        <input type="number" step="1" name="estimated_value_max" id="estimated_value_max" class="form-control" value="{{ old('estimated_value_max', $coin->estimated_value_max) }}" placeholder="2800">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="currency">Para Birimi</label>
                        <select name="currency" id="currency" class="form-control">
                            <option value="USD" {{ old('currency', $coin->currency) === 'USD' ? 'selected' : '' }}>USD ($)</option>
                            <option value="EUR" {{ old('currency', $coin->currency) === 'EUR' ? 'selected' : '' }}>EUR (€)</option>
                            <option value="TRY" {{ old('currency', $coin->currency) === 'TRY' ? 'selected' : '' }}>TRY (₺)</option>
                            <option value="GBP" {{ old('currency', $coin->currency) === 'GBP' ? 'selected' : '' }}>GBP (£)</option>
                        </select>
                    </div>
                </div>

                @php
                    $refString = '';
                    if (!empty($coin->reference_codes)) {
                        $parts = [];
                        foreach ($coin->reference_codes as $k => $v) {
                            $parts[] = "{$k}: {$v}";
                        }
                        $refString = implode("\n", $parts);
                    }
                @endphp

                <div class="form-group">
                    <label class="form-label" for="reference_codes_raw">Standart Nümizmatik Referans Kodları (RIC, RPC, BMC, Sear)</label>
                    <textarea name="reference_codes_raw" id="reference_codes_raw" class="form-control" rows="4" placeholder="RIC: II 114&#10;BMCRE: 241&#10;Sear: 2731">{{ old('reference_codes_raw', $refString) }}</textarea>
                    <div class="form-helper">Her satıra bir katalog kodu yazınız (Örn: "RIC: II 114"). Otomatik JSON olarak serileştirilir.</div>
                </div>

                <div class="form-grid-2" style="margin-top: 24px;">
                    <div class="toggle-wrapper">
                        <div>
                            <div style="font-weight: 700; font-size: 14px;">Mobil Katalogta Yayınla</div>
                            <div class="form-helper">Açık olduğunda arama motorunda ve medeniyet listelerinde listelenir.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" name="is_published" value="1" {{ old('is_published', $coin->is_published ?? true) ? 'checked' : '' }}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="toggle-wrapper">
                        <div>
                            <div style="font-weight: 700; font-size: 14px;">Günün Eseri / Vitrin (Hero)</div>
                            <div class="form-helper">Ana sayfa tepe vitrininde öne çıkarılır.</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" name="is_featured" value="1" {{ old('is_featured', $coin->is_featured ?? false) ? 'checked' : '' }}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Alt Kaydet Butonu -->
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
            <a href="{{ route('admin.coins.index') }}" class="btn btn-outline">İptal</a>
            <button type="submit" class="btn btn-gold" style="padding: 12px 32px; font-size: 14.5px;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                {{ $coin->exists ? 'Değişiklikleri Kaydet' : 'Sikkeyi Kataloğa Ekle' }}
            </button>
        </div>
    </form>
@endsection

@push('scripts')
<script>
    function switchTab(tabId, btnEl) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        btnEl.classList.add('active');
    }

    function previewImage(input, previewId) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById(previewId).src = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    async function loadMintsByCivilization(civilizationId) {
        const mintSelect = document.getElementById('mint_id');
        mintSelect.innerHTML = '<option value="">Yükleniyor...</option>';

        if (!civilizationId) {
            mintSelect.innerHTML = '<option value="">Darphane Seçiniz...</option>';
            return;
        }

        try {
            const res = await fetch(`/admin/civilizations/${civilizationId}/mints`);
            const mints = await res.json();
            
            let options = '<option value="">Darphane Seçiniz...</option>';
            mints.forEach(m => {
                const ancient = m.ancient_name ? ` (${m.ancient_name})` : '';
                options += `<option value="${m.id}">${m.name}${ancient}</option>`;
            });
            mintSelect.innerHTML = options;
        } catch (e) {
            mintSelect.innerHTML = '<option value="">Darphaneler yüklenemedi</option>';
        }
    }

    async function fetchCoinFromUrl() {
        const urlInput = document.getElementById('scraper_url');
        const url = urlInput.value.trim();
        const btn = document.getElementById('btn_fetch_url');
        const btnText = document.getElementById('fetch_btn_text');
        const spinner = document.getElementById('fetch_spinner');
        const icon = document.getElementById('fetch_icon');
        const statusBox = document.getElementById('fetch_status_box');

        if (!url) {
            alert('Lütfen geçerli bir ürün URL adresi giriniz.');
            urlInput.focus();
            return;
        }

        btn.disabled = true;
        btnText.innerText = 'Çözümleniyor...';
        spinner.style.display = 'inline-block';
        icon.style.display = 'none';
        statusBox.style.display = 'block';
        statusBox.style.background = '#EFF6FF';
        statusBox.style.color = '#1E40AF';
        statusBox.style.border = '1px solid #BFDBFE';
        statusBox.innerHTML = '⏳ Sayfa içeriği çekiliyor, Gemini 1.5 ile Türkçeleştiriliyor ve görseller WebP olarak sunucuya indiriliyor. Lütfen bekleyiniz...';

        try {
            const response = await fetch('{{ route('admin.coins.fetch_from_url') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const res = await response.json();

            if (res.success && res.data) {
                const d = res.data;

                // Form Alanlarını Otomatik Doldur
                if (d.title) document.getElementById('title').value = d.title;
                if (d.ruler) document.getElementById('ruler').value = d.ruler;
                if (d.civilization_id) {
                    const civSelect = document.getElementById('civilization_id');
                    civSelect.value = d.civilization_id;
                    loadMintsByCivilization(d.civilization_id);
                }
                if (d.metal_type) {
                    const metalSelect = document.getElementById('metal_type');
                    if (metalSelect) {
                        const target = d.metal_type.toLowerCase();
                        for (let opt of metalSelect.options) {
                            const val = opt.value.toLowerCase();
                            if (val.includes(target) || target.includes(val) || 
                               (target.includes('altın') && val.includes('altın')) || 
                               (target.includes('gümüş') && val.includes('gümüş')) || 
                               (target.includes('bronz') && val.includes('bronz')) || 
                               (target.includes('elektrum') && val.includes('elektrum'))) {
                                metalSelect.value = opt.value;
                                break;
                            }
                        }
                    }
                }
                if (d.standard_name) {
                    const stdInput = document.getElementById('standard_name');
                    if (stdInput) stdInput.value = d.standard_name;
                }
                if (d.weight_grams) {
                    const wInput = document.getElementById('weight_grams');
                    if (wInput) wInput.value = d.weight_grams;
                }
                if (d.diameter_mm) {
                    const diaInput = document.getElementById('diameter_mm');
                    if (diaInput) diaInput.value = d.diameter_mm;
                }
                if (d.year_start !== null && d.year_start !== undefined) {
                    const ysInput = document.getElementById('year_start');
                    if (ysInput) ysInput.value = d.year_start;
                }
                if (d.year_end !== null && d.year_end !== undefined) {
                    const yeInput = document.getElementById('year_end');
                    if (yeInput) yeInput.value = d.year_end;
                }
                if (d.condition_grade) {
                    const condSelect = document.getElementById('condition_grade');
                    if (condSelect) {
                        for (let opt of condSelect.options) {
                            if (opt.value.toLowerCase() === d.condition_grade.toLowerCase()) {
                                condSelect.value = opt.value;
                                break;
                            }
                        }
                    }
                }
                if (d.avers_description) {
                    const avDesc = document.getElementById('avers_description');
                    if (avDesc) avDesc.value = d.avers_description;
                }
                if (d.revers_description) {
                    const rvDesc = document.getElementById('revers_description');
                    if (rvDesc) rvDesc.value = d.revers_description;
                }
                if (d.estimated_value_min) {
                    const minPrice = document.getElementById('estimated_value_min');
                    if (minPrice) minPrice.value = d.estimated_value_min;
                }
                if (d.estimated_value_max) {
                    const maxPrice = document.getElementById('estimated_value_max');
                    if (maxPrice) maxPrice.value = d.estimated_value_max;
                }

                // Referans Kodları
                if (d.reference_codes) {
                    const refInput = document.getElementById('reference_codes_raw');
                    if (refInput) {
                        if (typeof d.reference_codes === 'object') {
                            refInput.value = Object.entries(d.reference_codes).map(([k, v]) => `${k}: ${v}`).join('\n');
                        } else {
                            refInput.value = d.reference_codes;
                        }
                    }
                }

                // Görselleri Güncelle
                if (d.avers_image && d.avers_image_url) {
                    const aversHidden = document.getElementById('avers_image');
                    if (aversHidden) aversHidden.value = d.avers_image;
                    const aversPrev = document.getElementById('avers-preview');
                    if (aversPrev) aversPrev.src = d.avers_image_url;
                }
                if (d.revers_image && d.revers_image_url) {
                    const reversHidden = document.getElementById('revers_image');
                    if (reversHidden) reversHidden.value = d.revers_image;
                    const reversPrev = document.getElementById('revers-preview');
                    if (reversPrev) reversPrev.src = d.revers_image_url;
                }

                statusBox.style.background = '#ECFDF5';
                statusBox.style.color = '#065F46';
                statusBox.style.border = '1px solid #A7F3D0';
                statusBox.innerHTML = '✨ <strong>Eser bilgileri başarıyla çekildi, Türkçeleştirildi ve form dolduruldu. Lütfen kontrol edip kaydedin.</strong>';
            } else {
                throw new Error(res.message || 'Veriler alınamadı.');
            }
        } catch (err) {
            statusBox.style.background = '#FEF2F2';
            statusBox.style.color = '#991B1B';
            statusBox.style.border = '1px solid #FECACA';
            statusBox.innerHTML = '❌ <strong>Hata:</strong> ' + (err.message || 'Bir hata oluştu.');
        } finally {
            btn.disabled = false;
            btnText.innerText = 'Verileri Çek & Doldur';
            spinner.style.display = 'none';
            icon.style.display = 'inline-block';
        }
    }
</script>
@endpush

