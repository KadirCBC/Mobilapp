<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>AI Kontrol Merkezi | Sikkelobedi Nümizmatik</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bg-canvas: #F8F9FA;
            --card-bg: #FFFFFF;
            --gold-primary: #9E7B3B;
            --gold-hover: #83642D;
            --gold-light: #FBF8F2;
            --gold-border: rgba(158, 123, 59, 0.25);
            --text-dark: #1E293B;
            --text-muted: #64748B;
            --border-subtle: #E2E8F0;
            --success-green: #10B981;
            --danger-red: #EF4444;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-canvas);
            color: var(--text-dark);
            line-height: 1.5;
            padding: 32px 16px;
        }

        .container {
            max-width: 920px;
            margin: 0 auto;
        }

        /* Başlık & Breadcrumb */
        .page-header {
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
        }
        .header-title-group h1 {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            color: var(--text-dark);
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .header-title-group p {
            font-size: 14px;
            color: var(--text-muted);
            margin-top: 4px;
        }
        .gold-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--gold-light);
            border: 1px solid var(--gold-border);
            color: var(--gold-primary);
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
        }

        /* Ana Kart */
        .card {
            background: var(--card-bg);
            border-radius: 16px;
            border: 1px solid var(--border-subtle);
            box-shadow: 0 4px 20px -2px rgba(158, 123, 59, 0.06);
            padding: 32px;
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 17px;
            font-weight: 700;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border-subtle);
        }

        .form-group {
            margin-bottom: 24px;
        }
        .form-label {
            display: block;
            font-size: 13.5px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 8px;
        }
        .form-helper {
            font-size: 12.5px;
            color: var(--text-muted);
            margin-top: 6px;
        }

        /* Toggle Anahtarı */
        .toggle-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            background: var(--gold-light);
            border: 1px solid var(--gold-border);
            border-radius: 12px;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 52px;
            height: 28px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #CBD5E1; transition: .3s; border-radius: 34px;
        }
        .slider:before {
            position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px;
            background-color: white; transition: .3s; border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        input:checked + .slider { background-color: var(--gold-primary); }
        input:checked + .slider:before { transform: translateX(24px); }

        /* Model Seçim Kartları */
        .model-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
        }
        .model-card {
            border: 2px solid var(--border-subtle);
            border-radius: 12px;
            padding: 18px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            background: #FFFFFF;
        }
        .model-card:hover {
            border-color: var(--gold-border);
            background: #FAFAF9;
        }
        .model-card.active {
            border-color: var(--gold-primary);
            background: var(--gold-light);
            box-shadow: 0 0 0 1px var(--gold-primary);
        }
        .model-card input[type="radio"] {
            position: absolute; opacity: 0;
        }
        .model-title {
            font-weight: 700;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .model-desc {
            font-size: 12.5px;
            color: var(--text-muted);
            margin-top: 6px;
        }

        /* API Key Maske & Doğrulama */
        .api-input-wrapper {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .input-group {
            position: relative;
            flex: 1;
        }
        .form-control {
            width: 100%;
            padding: 11px 40px 11px 14px;
            border: 1.5px solid var(--border-subtle);
            border-radius: 10px;
            font-size: 14px;
            font-family: inherit;
            color: var(--text-dark);
            transition: border-color 0.2s;
        }
        .form-control:focus {
            outline: none;
            border-color: var(--gold-primary);
            box-shadow: 0 0 0 3px rgba(158, 123, 59, 0.12);
        }
        .eye-toggle-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-muted);
            padding: 4px;
        }

        /* Butonlar */
        .btn {
            padding: 11px 20px;
            border-radius: 10px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
            text-decoration: none;
            border: none;
        }
        .btn-gold {
            background: var(--gold-primary);
            color: #FFFFFF;
        }
        .btn-gold:hover {
            background: var(--gold-hover);
        }
        .btn-outline-gold {
            background: #FFFFFF;
            border: 1.5px solid var(--gold-primary);
            color: var(--gold-primary);
        }
        .btn-outline-gold:hover {
            background: var(--gold-light);
        }

        /* Slider */
        .slider-container {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .range-slider {
            flex: 1;
            accent-color: var(--gold-primary);
            cursor: pointer;
        }
        .slider-badge {
            background: var(--gold-light);
            color: var(--gold-primary);
            border: 1px solid var(--gold-border);
            font-weight: 700;
            font-size: 13px;
            padding: 4px 12px;
            border-radius: 8px;
            min-width: 60px;
            text-align: center;
        }

        /* Textarea */
        textarea.form-control {
            resize: vertical;
            min-height: 140px;
            line-height: 1.6;
            font-size: 13px;
        }

        /* Canlı Bildirim / Alert */
        .alert-box {
            display: none;
            padding: 14px 18px;
            border-radius: 10px;
            font-size: 13.5px;
            margin-top: 12px;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        }
        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #065F46;
        }
        .alert-danger {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #991B1B;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .spinner {
            display: none;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(158, 123, 59, 0.3);
            border-top-color: var(--gold-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>

<div class="container">
    <!-- Üst Başlık -->
    <div class="page-header">
        <div class="header-title-group">
            <h1>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9E7B3B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                AI Kontrol Merkezi
            </h1>
            <p>Google Gemini AI Çok Modlu (Multimodal) Nümizmatik Teşhis & Spektrogram Ayarları</p>
        </div>
        <div class="gold-badge">
            <span style="width:7px; height:7px; background:#10B981; border-radius:50%; display:inline-block;"></span>
            Google Generative Language v1beta
        </div>
    </div>

    @if (session('success'))
        <div class="alert-box alert-success" style="display: flex; margin-bottom: 20px;">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            <span>{{ session('success') }}</span>
        </div>
    @endif

    <form action="{{ route('admin.ai.settings.update') }}" method="POST">
        @csrf

        <!-- KART 1: Servis Durumu ve Model Seçimi -->
        <div class="card">
            <div class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Motor Yapılandırması
            </div>

            <!-- Servis Aktif/Pasif Toggle -->
            <div class="form-group">
                <div class="toggle-wrapper">
                    <div>
                        <div style="font-weight: 700; font-size: 14.5px;">Gemini AI Nümizmatik Servis Durumu</div>
                        <div class="form-helper">Açık olduğunda mobil kamera taramasında sikke spektrogram ve lejant analizi canlı çalışır.</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" name="is_active" value="1" {{ old('is_active', $setting->is_active) ? 'checked' : '' }}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <!-- Model Seçimi -->
            <div class="form-group">
                <label class="form-label">Yapay Zeka Modeli</label>
                <div class="model-grid">
                    <label class="model-card {{ old('model_name', $setting->model_name) === 'gemini-1.5-flash' ? 'active' : '' }}" onclick="selectModel('gemini-1.5-flash', this)">
                        <input type="radio" name="model_name" value="gemini-1.5-flash" {{ old('model_name', $setting->model_name) === 'gemini-1.5-flash' ? 'checked' : '' }}>
                        <div class="model-title">
                            <span>Gemini 1.5 Flash</span>
                            <span style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #047857; padding: 2px 8px; border-radius: 6px;">Önerilen / Hızlı</span>
                        </div>
                        <div class="model-desc">Mobil taramalar için ultra hızlı yanıt süresi (~1.8s). Düşük gecikme ve yüksek tipoloji doğruluğu.</div>
                    </label>

                    <label class="model-card {{ old('model_name', $setting->model_name) === 'gemini-1.5-pro' ? 'active' : '' }}" onclick="selectModel('gemini-1.5-pro', this)">
                        <input type="radio" name="model_name" value="gemini-1.5-pro" {{ old('model_name', $setting->model_name) === 'gemini-1.5-pro' ? 'checked' : '' }}>
                        <div class="model-title">
                            <span>Gemini 1.5 Pro</span>
                            <span style="font-size: 11px; background: rgba(158, 123, 59, 0.15); color: var(--gold-primary); padding: 2px 8px; border-radius: 6px;">Derin Analiz</span>
                        </div>
                        <div class="model-desc">Aşınmış lejantlar ve mikroskobik patina kristalleşmesi için en yüksek mantıksal kavrayış kapasitesi.</div>
                    </label>
                </div>
            </div>
        </div>

        <!-- KART 2: API Anahtarı & Canlı Doğrulama -->
        <div class="card">
            <div class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Kimlik Doğrulama & Güvenlik
            </div>

            <div class="form-group">
                <label class="form-label" for="api_key_input">Gemini API Key</label>
                <div class="api-input-wrapper">
                    <div class="input-group">
                        <input type="password" id="api_key_input" name="api_key" class="form-control" 
                               placeholder="{{ $setting->api_key ? '•••••••••••••••••••••••••••••••• (Kayıtlı ve Şifrelenmiş)' : 'AIzaSy...' }}" 
                               value="{{ old('api_key') }}" autocomplete="off">
                        <button type="button" class="eye-toggle-btn" onclick="togglePasswordVisibility()" title="Göster / Gizle">
                            <svg id="eye-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>

                    <button type="button" class="btn btn-outline-gold" id="btn-test-connection" onclick="testGeminiConnection()">
                        <span class="spinner" id="test-spinner"></span>
                        <svg id="test-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Bağlantıyı Doğrula
                    </button>
                </div>
                <div class="form-helper">Anahtarınız veritabanında OpenSSL AES-256 algoritmasıyla şifrelenir; düz metin olarak depolanmaz.</div>

                <!-- Canlı Test Sonucu Bildirim Kutusu -->
                <div id="connection-alert" class="alert-box">
                    <span id="alert-icon"></span>
                    <span id="alert-message"></span>
                </div>
            </div>
        </div>

        <!-- KART 3: Parametreler & Nümizmatik Sistem Promptu -->
        <div class="card">
            <div class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Model İnce Ayarları & Sistem Direktifi
            </div>

            <!-- Temperature Slider -->
            <div class="form-group">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <label class="form-label" style="margin-bottom:0;">Temperature (Üretkenlik & Kesinlik)</label>
                    <span class="slider-badge" id="temp-display">{{ number_format(old('temperature', $setting->temperature), 2) }}</span>
                </div>
                <div class="slider-container">
                    <span style="font-size:11px; color:var(--text-muted); font-weight:600;">0.00 (Bilimsel Kesinlik)</span>
                    <input type="range" class="range-slider" name="temperature" min="0.00" max="1.00" step="0.05" 
                           value="{{ old('temperature', $setting->temperature) }}" id="temp-slider" oninput="updateTempDisplay(this.value)">
                    <span style="font-size:11px; color:var(--text-muted); font-weight:600;">1.00 (Yaratıcı)</span>
                </div>
                <div class="form-helper">Nümizmatik katalog eşleşmelerinde halüsinasyon riskini sıfırlamak için <strong>0.15 - 0.25</strong> aralığı önerilir.</div>
            </div>

            <!-- Max Tokens -->
            <input type="hidden" name="max_tokens" value="{{ old('max_tokens', $setting->max_tokens ?? 2048) }}">

            <!-- Sistem Promptu -->
            <div class="form-group">
                <label class="form-label">Nümizmatik Sistem Promptu (Uzman Yönergesi)</label>
                <textarea name="system_prompt" class="form-control" rows="8">{{ old('system_prompt', $setting->system_prompt) }}</textarea>
                <div class="form-helper">Gemini modelinin fotoğrafı incelerken takip edeceği akademisyen ve antik sikke uzmanı rol talimatlarıdır.</div>
            </div>

            <!-- Kaydet Butonu -->
            <div style="text-align: right; margin-top: 16px;">
                <button type="submit" class="btn btn-gold" style="padding: 12px 28px; font-size: 14.5px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    Değişiklikleri Kaydet
                </button>
            </div>
        </div>
    </form>
</div>

<script>
    function selectModel(val, cardEl) {
        document.querySelectorAll('.model-card').forEach(el => el.classList.remove('active'));
        cardEl.classList.add('active');
        cardEl.querySelector('input[type="radio"]').checked = true;
    }

    function togglePasswordVisibility() {
        const input = document.getElementById('api_key_input');
        input.type = input.type === 'password' ? 'text' : 'password';
    }

    function updateTempDisplay(val) {
        document.getElementById('temp-display').textContent = parseFloat(val).toFixed(2);
    }

    async function testGeminiConnection() {
        const apiKey = document.getElementById('api_key_input').value;
        const model = document.querySelector('input[name="model_name"]:checked')?.value || 'gemini-1.5-flash';
        
        const btn = document.getElementById('btn-test-connection');
        const spinner = document.getElementById('test-spinner');
        const icon = document.getElementById('test-icon');
        const alertBox = document.getElementById('connection-alert');
        const alertMsg = document.getElementById('alert-message');

        btn.disabled = true;
        spinner.style.display = 'inline-block';
        icon.style.display = 'none';
        alertBox.style.display = 'none';

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const response = await fetch("{{ route('admin.ai.test') }}", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ api_key: apiKey, model_name: model })
            });

            const data = await response.json();
            alertBox.style.display = 'flex';

            if (data.success) {
                alertBox.className = 'alert-box alert-success';
                alertMsg.innerHTML = `<strong>API Aktif ve Doğrulandı!</strong> (${data.model} yanıt verdi - ${data.latency_ms}ms)`;
            } else {
                alertBox.className = 'alert-box alert-danger';
                alertMsg.innerHTML = `<strong>Bağlantı Hatası:</strong> ${data.message}`;
            }
        } catch (err) {
            alertBox.style.display = 'flex';
            alertBox.className = 'alert-box alert-danger';
            alertMsg.innerHTML = `<strong>Bağlantı Hatası:</strong> Sunucuya ulaşılamadı (${err.message})`;
        } finally {
            btn.disabled = false;
            spinner.style.display = 'none';
            icon.style.display = 'inline-block';
        }
    }
</script>

</body>
</html>

