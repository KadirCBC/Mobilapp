<?php
$currentUri = $_SERVER['REQUEST_URI'] ?? '';
?>
<header class="admin-navbar">
    <a href="/admin/coins" class="navbar-brand">
        <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color: var(--gold-primary);">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M14.5 9a2.5 2.5 0 0 0-5 0v6a2.5 2.5 0 0 0 5 0"></path>
            <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        SİKKELOBEDİ
        <span class="brand-badge">XAMPP MYSQL • LIVE</span>
    </a>
    <nav class="navbar-nav">
        <a href="/admin/civilizations" class="nav-link <?= str_starts_with($currentUri, '/admin/civilizations') ? 'active' : '' ?>">🏛️ Medeniyetler</a>
        <a href="/admin/mints" class="nav-link <?= str_starts_with($currentUri, '/admin/mints') ? 'active' : '' ?>">🗺️ Antik Darphaneler (Harita)</a>
        <a href="/admin/coins" class="nav-link <?= (str_starts_with($currentUri, '/admin/coins') && !str_starts_with($currentUri, '/admin/coins/create')) ? 'active' : '' ?>">🪙 Sikke Kataloğu</a>
        <a href="/admin/coins/create" class="nav-link <?= str_starts_with($currentUri, '/admin/coins/create') ? 'active' : '' ?>">+ Yeni Sikke Ekle</a>
        <a href="/admin/ai/settings" class="nav-link <?= str_starts_with($currentUri, '/admin/ai') ? 'active' : '' ?>">✨ Gemini AI Ayarları</a>
        <a href="/admin/glossary" class="nav-link <?= str_starts_with($currentUri, '/admin/glossary') ? 'active' : '' ?>">📖 Nümizmatik Sözlük</a>
        <a href="/api/v1/coins" target="_blank" class="nav-link" style="border: 1px solid var(--border-subtle); color: var(--gold-primary);">Canlı JSON API ↗</a>
    </nav>
</header>

