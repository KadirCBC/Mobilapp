<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Nümizmatik Katalog Yönetimi') | Sikkelobedi</title>
    <!-- Fonts -->
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
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-canvas);
            color: var(--text-dark);
            min-height: 100vh;
        }

        /* Üst Menü / Navbar */
        .admin-navbar {
            background: #FFFFFF;
            border-bottom: 1px solid var(--border-subtle);
            padding: 0 24px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 50;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .navbar-brand {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            font-weight: 700;
            color: var(--text-dark);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .navbar-nav {
            display: flex;
            align-items: center;
            gap: 8px;
            list-style: none;
        }
        .nav-link {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            color: var(--text-muted);
            text-decoration: none;
            transition: all 0.2s;
        }
        .nav-link:hover, .nav-link.active {
            color: var(--gold-primary);
            background: var(--gold-light);
        }

        .main-wrapper {
            max-width: 1200px;
            margin: 32px auto;
            padding: 0 20px;
        }

        /* Bildirimler */
        .flash-alert {
            padding: 14px 18px;
            border-radius: 10px;
            font-size: 13.5px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #065F46;
        }
    </style>
    @stack('styles')
</head>
<body>

    <header class="admin-navbar">
        <a href="{{ route('admin.coins.index') }}" class="navbar-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9E7B3B" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 6 12 12 16 14"></polygon></svg>
            SİKKELOBEDİ <span>• NÜMİZMATİK YÖNETİM</span>
        </a>

        <ul class="navbar-nav">
            <li><a href="/admin/civilizations" class="nav-link {{ request()->is('admin/civilizations*') ? 'active' : '' }}">🏛️ Medeniyetler</a></li>
            <li><a href="/admin/mints" class="nav-link {{ request()->is('admin/mints*') ? 'active' : '' }}">🗺️ Antik Darphaneler (Harita)</a></li>
            <li><a href="/admin/coins" class="nav-link {{ request()->is('admin/coins*') ? 'active' : '' }}">🪙 Sikke Kataloğu</a></li>
            <li><a href="/admin/ai/settings" class="nav-link {{ request()->is('admin/ai*') ? 'active' : '' }}">✨ Gemini AI Ayarları</a></li>
            <li><a href="/admin/glossary" class="nav-link {{ request()->is('admin/glossary*') ? 'active' : '' }}">📖 Nümizmatik Sözlük</a></li>
            <li><a href="/api/v1/coins" target="_blank" class="nav-link" style="border: 1px solid var(--border-subtle); color: var(--gold-primary);">Canlı JSON API ↗</a></li>
        </ul>
    </header>

    <main class="main-wrapper">
        @if (session('success'))
            <div class="flash-alert">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                <span>{{ session('success') }}</span>
            </div>
        @endif

        @yield('content')
    </main>

    @stack('scripts')
</body>
</html>

