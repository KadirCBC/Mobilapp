<?php

declare(strict_types=1);

echo "=== Sikkelobedi Nümizmatik Veritabanı Temiz Kurulum & 27 Sikke UTF-8 Aktarımı ===\n";

$host = '127.0.0.1';
$port = '3306';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'",
    ]);

    // 1. Veritabanını Temizle & Yeniden Oluştur
    $pdo->exec("DROP DATABASE IF EXISTS numismatics");
    $pdo->exec("CREATE DATABASE numismatics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE numismatics");
    $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

    echo "[1/4] `numismatics` veritabanı utf8mb4_unicode_ci olarak sıfırdan oluşturuldu.\n";

    // 2. Tabloları Oluştur
    $pdo->exec("
        CREATE TABLE civilizations (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            era_period VARCHAR(255) NOT NULL,
            description TEXT NULL,
            cover_image VARCHAR(255) NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            INDEX idx_slug (slug),
            INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE mints (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            civilization_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            ancient_name VARCHAR(255) NULL,
            latitude DECIMAL(10, 7) NULL,
            longitude DECIMAL(10, 7) NULL,
            description TEXT NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE,
            INDEX idx_civ_name (civilization_id, name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE coins (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            civilization_id BIGINT UNSIGNED NOT NULL,
            mint_id BIGINT UNSIGNED NULL,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            ruler VARCHAR(255) NULL,
            metal_type VARCHAR(30) NOT NULL,
            standard_name VARCHAR(50) NOT NULL,
            weight_grams DECIMAL(8, 2) NULL,
            diameter_mm DECIMAL(8, 2) NULL,
            die_axis VARCHAR(10) NULL,
            year_start INT NULL,
            year_end INT NULL,
            rarity_code VARCHAR(20) DEFAULT 'C',
            condition_grade VARCHAR(30) NULL,
            estimated_value_min DECIMAL(12, 2) NULL,
            estimated_value_max DECIMAL(12, 2) NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            avers_description TEXT NULL,
            revers_description TEXT NULL,
            avers_image VARCHAR(500) NULL,
            revers_image VARCHAR(500) NULL,
            reference_codes JSON NULL,
            is_featured TINYINT(1) DEFAULT 0,
            is_published TINYINT(1) DEFAULT 1,
            approval_status VARCHAR(30) DEFAULT 'approved',
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE,
            FOREIGN KEY (mint_id) REFERENCES mints(id) ON DELETE SET NULL,
            INDEX idx_civ_pub (civilization_id, is_published),
            INDEX idx_published (is_published),
            INDEX idx_featured (is_featured),
            INDEX idx_slug (slug)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE ai_settings (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            provider VARCHAR(50) DEFAULT 'gemini',
            api_key VARCHAR(255) NULL,
            model_name VARCHAR(100) DEFAULT 'gemini-1.5-flash',
            temperature DECIMAL(3, 2) DEFAULT 0.20,
            system_prompt TEXT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE glossary (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            term VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL UNIQUE,
            definition TEXT NOT NULL,
            category VARCHAR(50) DEFAULT 'Genel',
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE ai_scan_logs (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            coin_id BIGINT UNSIGNED NULL,
            user_id BIGINT UNSIGNED NULL,
            avers_image_path VARCHAR(255) NULL,
            revers_image_path VARCHAR(255) NULL,
            identified_title VARCHAR(255) NULL,
            civilization VARCHAR(100) NULL,
            ruler VARCHAR(100) NULL,
            confidence_score INT DEFAULT 0,
            raw_response JSON NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    echo "[2/4] Veritabanı tabloları (civilizations, mints, coins, glossary, ai_settings) oluşturuldu.\n";

    // 3. Medeniyetleri Ekle
    $civStmt = $pdo->prepare("
        INSERT INTO civilizations (id, name, slug, era_period, description, cover_image, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    ");

    $civData = [
        [1, 'Roma İmparatorluğu', 'roma-imparatorlugu', 'M.Ö. 27 - M.S. 476', 'Augustus ile başlayan, Aureus, Denarius ve Sestertius sikke sisteminin hâkim olduğu antik Roma dönemi.', 'civilizations/roman_empire.webp'],
        [2, 'Antik Yunan', 'antik-yunan', 'M.Ö. 600 - M.Ö. 31', 'Atina baykuşlu Tetradrahmileri ve Büyük İskender darplarıyla tanınan Helenistik çağ.', 'civilizations/ancient_greece.webp'],
        [3, 'Lidya Krallığı', 'lidya-kralligi', 'M.Ö. 650 - M.Ö. 546', 'Dünyada parayı ilk kez icat eden Sardes merkezli krallık, Kroisos altın ve elektrum staterleri.', 'civilizations/lydia.webp'],
        [4, 'Bizans İmparatorluğu', 'bizans-imparatorlugu', 'M.S. 491 - 1453', 'Solidus ve Histamenon altın sikkeleri, İsa ve imparator büstü ikonografileriyle ünlü Doğu Roma.', 'civilizations/byzantine.webp'],
        [5, 'Osmanlı İmparatorluğu', 'osmanli-imparatorlugu', '1299 - 1922', 'Osman Gazi akçesiyle başlayan, Fatih ve Kanuni altın sultanileri ve tuğralı kuruşlarıyla 6 asırlık imparatorluk.', 'civilizations/ottoman.webp'],
        [6, 'Fenike & Helenistik', 'fenike-helenistik', 'M.Ö. 1200 - M.Ö. 50', 'Akdeniz deniz ticaretine yön veren kadırgalı bronz ve gümüş Arados adası darpları.', 'civilizations/phoenicia.webp'],
        [7, 'Sasani & Kuşan İmparatorluğu', 'sasani-kusan', 'M.S. 224 - 651', 'İpek Yolu kavşağı Merv ve Baktriya darpları, Ataşgah ateş sunaklı I. Şapur birimleri.', 'civilizations/sasanian.webp'],
        [8, 'Baktriya & Hint-İskit', 'baktriya-hint-iskit', 'M.Ö. 250 - M.S. 100', 'Orta Asya steplerinden gelen göçebe Yuezhi ve İskit krallıklarının nadir gümüş drahmileri.', 'civilizations/bactria.webp'],
        [9, 'Endülüs & İslam Medeniyeti', 'endulus-islam', 'M.S. 711 - 1492', 'Fatımi halifeliği ve Endülüs Emevileri devri altın dinarları, Kufi hat sanatlı şaheserler.', 'civilizations/islamic.webp'],
        [10, 'Latin Amerika & Dünya Mirası', 'latin-amerika-dunya-mirasi', '16. - 19. Yüzyıl', 'Potosi ve Cuzco darphaneli 8 Reales taç sikkeleri, Simon Bolivar ve İnka güneşi tasvirleri.', 'civilizations/americas.webp'],
    ];

    foreach ($civData as $c) {
        $civStmt->execute($c);
    }

    // 4. Darphaneleri Ekle
    $mintStmt = $pdo->prepare("
        INSERT INTO mints (id, civilization_id, name, ancient_name, latitude, longitude, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");

    $mintData = [
        [1, 1, 'Antakya (Antiochia)', 'Ἀντιόχεια / Antiochia ad Orontem', 36.2021000, 36.1606000, 'Roma İmparatorluğu\'nun Doğu Akdeniz ticaret ve lejyon finansman başkenti. Nero, Vespasian ve Domitian tetradrahmilerinin ana darphanesi.'],
        [2, 3, 'Sardis (Sardes)', 'Σάρδεις / Sardis', 38.4883000, 28.0403000, 'Tarihte ilk madeni paranın basıldığı, nümizmatik biliminin beşiği sayılan darphane. Kroisos altın ve elektrum staterlerinin vatanı.'],
        [3, 1, 'Efes (Ephesos)', 'Ἔφεσος / Ephesos', 37.9411000, 27.3419000, 'Artemis Tapınağı gölgesindeki devasa darphane; bal arısı ve geyik motifli Greko-Romen sikkeler.'],
        [4, 1, 'Bergama (Pergamon)', 'Πέργαμον / Pergamon', 39.1325000, 27.1839000, 'Helenistik ve Roma eyalet nümizmatiğinin yüksek kabartmalı Cistophoric gümüş darphanesi.'],
        [5, 4, 'Konstantinopolis (İstanbul)', 'Constantinopolis / Byzantion', 41.0082000, 28.9784000, 'Bin yılı aşkın süre küresel altın standardı olan Solidus ve Fatih/Kanuni dönemi altın Sultani darphanesi.'],
        [6, 1, 'Roma (Moneta Caesaris)', 'Roma / Caput Mundi', 41.8902000, 12.4922000, 'Juno Moneta Tapınağı yanında kurulan imparatorluğun kalbi; Aureus, Denarius ve Sestertius darphanesi.'],
        [7, 2, 'Atina (Attika Darphanesi)', 'Ἀθῆναι / Athenai', 37.9715000, 23.7257000, 'Laurion gümüş madenleriyle beslenen, arka yüzündeki baykuş motifiyle antik çağın en güvenilen rezerv parası.'],
        [8, 1, 'İskenderiye (Alexandria)', 'Ἀλεξάνδρεια / Alexandria ad Aegyptum', 31.2001000, 29.9187000, 'Ptolemaioslar, Kleopatra ve Roma dönemi Mısır kalın bilyon tetradrahmilerinin darphanesi.'],
        [9, 2, 'Amphipolis', 'Ἀμφίπολις / Amphipolis', 40.8222000, 23.8475000, 'Büyük İskender ve Makedonya Krallığı\'nın askeri sefer finansman darphanesi.'],
        [10, 5, 'Bursa & Söğüt (Osmanlı)', 'Prusa ad Olympum / Bursa', 40.1885000, 29.0610000, 'Osman Gazi\'nin ilk akçesini bastığı Söğüt ve Orhan Gazi\'nin ilk düzenli başkent darphanesi Bursa.'],
    ];

    foreach ($mintData as $m) {
        $mintStmt->execute($m);
    }

    // 5. 27 Sikkeyi Ekle
    $coinStmt = $pdo->prepare("
        INSERT INTO coins (
            id, civilization_id, mint_id, title, slug, ruler, metal_type, standard_name,
            weight_grams, diameter_mm, die_axis, year_start, year_end, rarity_code,
            condition_grade, estimated_value_min, estimated_value_max, currency,
            avers_description, revers_description, avers_image, revers_image,
            reference_codes, is_featured, is_published, approval_status, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, 1, 'approved', NOW(), NOW()
        )
    ");

    $coinsData = [
        [1, 1, 1, 'Nero AR Tetradrahmi (Antakya)', 'nero-ar-tetradrahmi-antakya', 'İmparator Nero (M.S. 54-68)', 'Gümüş (AR)', 'Tetradrahmi', 14.24, 25.00, '6h', 63, 63, 'R1', 'VF', 750.00, 795.00, 'USD', 'NERWN KAISAR SEBASTOS lejantı. Sağa bakan defne çelenkli ve aegis pelerinli genç İmparator Nero büstü; yüksek kabartmalı, ince detaylı portre.', 'ETOUS BIR.I lejantı. Şimşek demeti üzerinde sağa dönük duran Roma lejyon kartalı, kanatları açık, sağ tarafta palmiye dalı sembolü.', 'https://images.vcoins.com/product_image/18/2/6/2pTKe9DxbZH8C75g4mcSN7w9tF6qr3.jpg', 'https://images.vcoins.com/product_image/18/2/6/2pTKe9DxbZH8C75g4mcSN7w9tF6qr3.jpg', json_encode(['RPC' => 'I 4189', 'McAlee' => '258'], JSON_UNESCAPED_UNICODE), 1],
        [2, 1, 1, 'Nero Gümüş Tetradrahmi (Antioch)', 'nero-gumus-tetradrahmi-antioch', 'İmparator Nero', 'Gümüş (AR)', 'Tetradrahmi', 14.80, 26.00, '12h', 54, 68, 'R1', 'VF', 500.00, 550.00, 'USD', 'Defne çelenkli Nero başı, sağa dönük; zarif boyun kıvrımları ve Julio-Claudian hanedan çizgileri.', 'Şimşek üzerinde duran kartal motifi, etrafında Grekçe eyalet lejantları.', 'https://images.vcoins.com/product_image/18/4/6/4jXTJr2c6rJNG7dT9moDx5ZkPo3cnt.jpg', 'https://images.vcoins.com/product_image/18/4/6/4jXTJr2c6rJNG7dT9moDx5ZkPo3cnt.jpg', json_encode(['RPC' => 'I 4182', 'Prieur' => '82'], JSON_UNESCAPED_UNICODE), 0],
        [3, 1, 1, 'Domitian Eyalet Tetradrahmisi', 'domitian-eyalet-tetradrahmisi', 'İmparator Domitian (M.S. 81-96)', 'Gümüş (AR)', 'Tetradrahmi', 14.10, 25.50, '6h', 81, 96, 'R2', 'EF', 480.00, 525.00, 'USD', 'İmparator Domitian büstü, sağa dönük, defne çelenkli; sert ve kararlı yüz hatları.', 'Şimşek üzerinde kartal, kanatları hafif açık, önünde harf işareti (darphane görevlisi amblemi).', 'https://images.vcoins.com/product_image/18/Z/6/zJ3EF4nLycY5gP7q8x2JeSQ29wmSWo.jpg', 'https://images.vcoins.com/product_image/18/Z/6/zJ3EF4nLycY5gP7q8x2JeSQ29wmSWo.jpg', json_encode(['RPC' => 'II 2014', 'McAlee' => '398'], JSON_UNESCAPED_UNICODE), 0],
        [4, 1, 6, 'Vespasian & Titus Caesar İkili Büst Sikkesi', 'vespasian-titus-caesar-ikili-bust-sikkesi', 'Vespasian & Titus Caesar', 'Gümüş (AR)', 'Tetradrahmi', 14.95, 26.00, '12h', 69, 79, 'R2', 'EF', 1800.00, 1990.00, 'USD', 'İmparator Vespasian\'ın sağa bakan defne çelenkli büstü; olgun, kırışık hatlı karakteristik Flavius portresi.', 'Oğlu ve veliahdı Titus Caesar\'ın büstü; genç hatlar ve sağa bakan duruş.', 'https://images.vcoins.com/product_image/18/9/6/9j2NTx3ct2GW5bfCjxP7YP8g6wNKpg.jpg', 'https://images.vcoins.com/product_image/18/9/6/9j2NTx3ct2GW5bfCjxP7YP8g6wNKpg.jpg', json_encode(['RPC' => 'II 1941', 'RIC' => 'II 141'], JSON_UNESCAPED_UNICODE), 1],
        [5, 1, 8, 'Vespasian İskenderiye Stili Tetradrahmi', 'vespasian-iskenderiye-stili-tetradrahmi', 'İmparator Vespasian', 'Gümüş (AR)', 'Tetradrahmi', 15.12, 25.00, '6h', 69, 79, 'R2', 'VF', 1350.00, 1500.00, 'USD', 'Mısır/İskenderiye darphanesi sanatçılarının üslubuyla stilize edilmiş Vespasian portresi.', 'Kutsal Roma kartalı ve palmiye motifi, yüksek kabartmalı darp.', 'https://images.vcoins.com/product_image/18/M/6/mCt42x8QYig5zG7WS6jajD9aLoo2w3.jpg', 'https://images.vcoins.com/product_image/18/M/6/mCt42x8QYig5zG7WS6jajD9aLoo2w3.jpg', json_encode(['RPC' => 'II 1968', 'Dattari' => '380'], JSON_UNESCAPED_UNICODE), 0],
        [6, 1, 1, 'Titus As Caesar Erken Dönem Tetradrahmisi', 'titus-as-caesar-erken-donem-tetradrahmisi', 'Titus Caesar', 'Gümüş (AR)', 'Tetradrahmi', 14.30, 24.50, '12h', 69, 79, 'R1', 'VF', 700.00, 750.00, 'USD', 'Genç Titus Caesar büstü, defne çelenkli, sağa dönük.', 'Kartal şimşek demeti üzerinde, kanatları gergin, Grekçe unvan lejantı.', 'https://images.vcoins.com/product_image/18/P/6/Pkm4Ms6R8Jf5t7PKEpE2n5gMsA3bxf.jpg', 'https://images.vcoins.com/product_image/18/P/6/Pkm4Ms6R8Jf5t7PKEpE2n5gMsA3bxf.jpg', json_encode(['RPC' => 'II 1955', 'McAlee' => '379'], JSON_UNESCAPED_UNICODE), 0],
        [7, 1, 1, 'Vespasian İri Kartallı Tetradrahmi', 'vespasian-iri-kartalli-tetradrahmi', 'İmparator Vespasian', 'Gümüş (AR)', 'Tetradrahmi', 15.05, 25.80, '6h', 69, 79, 'R2', 'EF', 1700.00, 1900.00, 'USD', 'Vespasian\'ın sağa dönük defne çelenkli başı; geniş alın ve karakteristik tebessüm.', 'Geniş kanatlı heybetli Roma kartalı, şimşek üzerinde; mükemmel gümüş tonu.', 'https://images.vcoins.com/product_image/18/G/6/gF8F6Mt2C43rmAB5JP7sTpX69BAbQy.jpg', 'https://images.vcoins.com/product_image/18/G/6/gF8F6Mt2C43rmAB5JP7sTpX69BAbQy.jpg', json_encode(['RPC' => 'II 1935', 'Prieur' => '112'], JSON_UNESCAPED_UNICODE), 0],
        [8, 1, 1, 'Nero Gençlik Büstü Tetradrahmi', 'nero-genclik-bustu-tetradrahmi', 'İmparator Nero', 'Gümüş (AR)', 'Tetradrahmi', 14.65, 25.00, '12h', 54, 68, 'R1', 'Fine', 800.00, 890.00, 'USD', 'Tahta yeni çıktığı döneme ait genç Nero profili; defne çelengi ve yumuşak yüz hatları.', 'Kutsal kartal şimşek üzerinde, sola dönük baş, gagasında çelenk.', 'https://images.vcoins.com/product_image/18/M/6/mJZ76cEAaD9PDbr4w5TRzNe8F2Kt8Q.jpg', 'https://images.vcoins.com/product_image/18/M/6/mJZ76cEAaD9PDbr4w5TRzNe8F2Kt8Q.jpg', json_encode(['RPC' => 'I 4176', 'McAlee' => '245'], JSON_UNESCAPED_UNICODE), 0],
        [9, 1, 1, 'Nero Seleucis & Pieria Tetradrahmi (Çil Kondisyon)', 'nero-seleucis-pieria-tetradrahmi-cil', 'İmparator Nero', 'Gümüş (AR)', 'Tetradrahmi', 14.78, 26.20, '6h', 54, 68, 'R3', 'FDC', 2500.00, 2800.00, 'USD', 'Görkemli Nero portresi; saç lüleleri tek tek belirgin, çelenk kurdeleleri omuzlara dökülmüş.', 'Şimşek üzerinde kanatlarını kabartmış duran zafer kartalı; pürüzsüz gümüş ayna zemin.', 'https://images.vcoins.com/product_image/18/W/6/Wen6j5TY95TxK3w4fSw4Ge2B7Ea6o8.jpg', 'https://images.vcoins.com/product_image/18/W/6/Wen6j5TY95TxK3w4fSw4Ge2B7Ea6o8.jpg', json_encode(['RPC' => 'I 4185', 'Wruck' => '39'], JSON_UNESCAPED_UNICODE), 1],
        [10, 1, 1, 'Vespasian Seleucis Eyalet Tetradrahmisi', 'vespasian-seleucis-eyalet-tetradrahmisi', 'İmparator Vespasian', 'Gümüş (AR)', 'Tetradrahmi', 14.50, 25.00, '12h', 69, 79, 'R1', 'VF', 720.00, 800.00, 'USD', 'Vespasian sağa bakan büstü; derin kesim ve etkileyici gölgelendirme.', 'Şimşek üzerinde duran kartal ve darphane tarih lejantı.', 'https://images.vcoins.com/product_image/18/9/6/9XnWYK5jqfH46jaWFcP8y7aFD4k2k3.jpg', 'https://images.vcoins.com/product_image/18/9/6/9XnWYK5jqfH46jaWFcP8y7aFD4k2k3.jpg', json_encode(['RPC' => 'II 1947', 'Prieur' => '120'], JSON_UNESCAPED_UNICODE), 0],
        [11, 1, 1, 'Titus Caesar Palmiyeli Gümüş Tetradrahmi', 'titus-caesar-palmiyeli-gumus-tetradrahmi', 'Titus Caesar', 'Gümüş (AR)', 'Tetradrahmi', 14.42, 25.10, '6h', 69, 79, 'R1', 'VF', 800.00, 890.00, 'USD', 'Titus Caesar defne çelenkli başı, sağa dönük, etrafında Grek unvanları.', 'Kartal figürü ve arka planda zafer sembolü Fenike palmiyesi.', 'https://images.vcoins.com/product_image/18/S/6/sk2Hn6Qm4qQABp8pxFR5b3RdyZ37Nw.jpg', 'https://images.vcoins.com/product_image/18/S/6/sk2Hn6Qm4qQABp8pxFR5b3RdyZ37Nw.jpg', json_encode(['RPC' => 'II 1958', 'Bellinger' => '132'], JSON_UNESCAPED_UNICODE), 0],
        [12, 1, 1, 'İmparator Galba Antakya Tetradrahmisi (Dört İmparator Yılı)', 'imparator-galba-antakya-tetradrahmisi', 'İmparator Servius Sulpicius Galba', 'Gümüş (AR)', 'Tetradrahmi', 14.85, 26.00, '12h', 68, 69, 'R3', 'EF', 4800.00, 5500.00, 'USD', 'Galba\'nın yaşlı, kemikli ve askeri disiplini temsil eden sert profili; defne çelengi.', 'Şimşek üzerinde kartal, kanatları açık, gagasında çelenk tutmakta.', 'https://images.vcoins.com/product_image/18/J/6/JSz59aE8GQk4Co6Be3H9Dj8NDGf7qX.jpg', 'https://images.vcoins.com/product_image/18/J/6/JSz59aE8GQk4Co6Be3H9Dj8NDGf7qX.jpg', json_encode(['RPC' => 'I 4198', 'Prieur' => '99'], JSON_UNESCAPED_UNICODE), 1],
        [13, 1, 4, 'Severus Alexander Deultum Bronz Sikkesi', 'severus-alexander-deultum-bronz-sikkesi', 'İmparator Severus Alexander (M.S. 222-235)', 'Bronz (AE)', 'Æ 26', 8.86, 26.00, '12h', 222, 235, 'R1', 'VF', 120.00, 135.00, 'USD', 'İmparator Severus Alexander defne çelenkli büstü, zırhlı ve pelerinli.', 'Deultum kolonisinin koruyucu tanrısı tasviri, COL FL PAC DEVLT lejantı.', 'https://images.vcoins.com/product_image/9/K/6/kLn5Re9wp3oPEy342yAmjK79P6eST5.jpg', 'https://images.vcoins.com/product_image/9/K/6/kLn5Re9wp3oPEy342yAmjK79P6eST5.jpg', json_encode(['Varbanov' => '2145'], JSON_UNESCAPED_UNICODE), 0],
        [14, 2, 7, 'Teselya Pelinna Atlı Savaşçı Sikkesi', 'teselya-pelinna-atli-savasci-sikkesi', 'Pelinna Meclisi', 'Bronz (AE)', 'Chalkous', 2.45, 14.50, '6h', -425, -350, 'R1', 'Fine', 75.00, 90.00, 'USD', 'Şaha kalkmış savaş atı üzerinde mızraklı Teselyalı süvari figürü.', 'P-E-T-A harfleriyle Pelinna nympha büstü veya miğferli savaş tanrısı.', 'https://images.vcoins.com/product_image/334/Q/6/qL8F85GjQ3o9nm2L4BpYXs7K6RTtqD.jpg', 'https://images.vcoins.com/product_image/334/Q/6/qL8F85GjQ3o9nm2L4BpYXs7K6RTtqD.jpg', json_encode(['BCD Thessaly' => '1234'], JSON_UNESCAPED_UNICODE), 0],
        [15, 6, 3, 'Fenike Arados Adası Bronz Sikkesi', 'fenike-arados-adasi-bronz-sikkesi', 'Arados Senatosu', 'Bronz (AE)', 'AE17', 3.80, 17.00, '12h', -206, -51, 'R1', 'VF', 55.00, 68.00, 'USD', 'Denizler tanrısı Zeus sakallı başı, defne çelenkli.', 'Fenike savaş kadırgası (bireme) pruvası, denizde kürek çekerken.', 'https://images.vcoins.com/product_image/33/Z/6/zJB2F7i5kS8trEQ9A5zo4iyDX3Sn6F.jpg', 'https://images.vcoins.com/product_image/33/Z/6/zJB2F7i5kS8trEQ9A5zo4iyDX3Sn6F.jpg', json_encode(['HGC' => '10, 89'], JSON_UNESCAPED_UNICODE), 0],
        [16, 7, 8, 'Kuşano-Sasani Şapur I Birimi (Merv Darphanesi)', 'kusano-sasani-sapur-i-birimi-merv', 'I. Şapur (Sasani Şahenşahı)', 'Bakır', 'AE Unit', 4.10, 18.00, '3h', 241, 272, 'R2', 'Fine', 150.00, 179.00, 'USD', 'Sasani tarzı korinli ve küreli taç giymiş I. Şapur büstü, Pehlevi lejantı.', 'Zerdüşt kutsal ateş sunağı (Ataşgah) ve sunağın iki yanında duran nöbetçiler.', 'https://images.vcoins.com/product_image/307/B/6/bBe5s6Ea4oCDT2kf8xnMnL97Y73jzF.jpg', 'https://images.vcoins.com/product_image/307/B/6/bBe5s6Ea4oCDT2kf8xnMnL97Y73jzF.jpg', json_encode(['Göbl' => 'I/1'], JSON_UNESCAPED_UNICODE), 0],
        [17, 8, 2, 'Yuezhi Krallığı Sapadbizes Gümüş Drahmisi', 'yuezhi-kralligi-sapadbizes-gumus-drahmisi', 'Kral Sapadbizes', 'Gümüş (AR)', 'Drahmi', 1.85, 15.00, '12h', -100, -1, 'R2', 'VF', 200.00, 235.00, 'USD', 'Miğferli kral portresi, sağa dönük; İskit-Kuşan göçebe estetiğiyle bezenmiş yüz hatları.', 'Kuşan aslanı veya mitolojik kutsal boğa figürü, Grek-Baktriya alfabesiyle kralın unvanı.', 'https://images.vcoins.com/product_image/314/Y/6/Yr5wdjC48oHMJx9q3mFPD7zawb6F2Q.jpg', 'https://images.vcoins.com/product_image/314/Y/6/Yr5wdjC48oHMJx9q3mFPD7zawb6F2Q.jpg', json_encode(['Senior' => 'B1.1'], JSON_UNESCAPED_UNICODE), 0],
        [18, 9, 5, 'Endülüs Fatımi Halifeliği Altın Dinarı (Ünik)', 'endulus-fatimi-halifeligi-altin-dinari-unik', 'El-Muizz Li-Dinillah', 'Altın (AU)', 'Dinar', 4.15, 21.00, '12h', 953, 975, 'R3', 'FDC', 4000.00, 4600.00, 'USD', 'İç içe üç dairesel halka içerisinde Kufi yazı ile Kelime-i Tevhid ve halifenin unvanları.', 'Merkezde Fatımi davet ibaresi, çevresinde darphane yeri ve basım yılı içeren Kufi halka.', 'https://images.vcoins.com/product_image/307/X/6/xx4Rj3WwmGq7Bc6d5Jana9AoSc8GfK.jpg', 'https://images.vcoins.com/product_image/307/X/6/xx4Rj3WwmGq7Bc6d5Jana9AoSc8GfK.jpg', json_encode(['Album' => '697'], JSON_UNESCAPED_UNICODE), 1],
        [19, 10, 6, 'Peru Cuzco 8 Reales (Konfederasyon Güneşi)', 'peru-cuzco-8-reales-konfederasyon-gunesi', 'Peru-Bolivya Konfederasyonu', 'Gümüş (AR)', '8 Reales', 26.81, 39.00, '6h', 1838, 1838, 'R2', 'EF', 1400.00, 1550.00, 'USD', 'İnka mitolojisinden ilham alan görkemli ışın saçan Güneş Tanrısı (Inti) yüzü, CONFEDERACION lejantı.', 'Peru cumhuriyet arması: lama, kınakına ağacı ve bereket boynuzu; Cuzco darphane damgası.', 'https://images.vcoins.com/product_image/322/L/6/Lb78y5XGpB3qdEC6C4kQPd2r8NzKM9.jpg', 'https://images.vcoins.com/product_image/322/L/6/Lb78y5XGpB3qdEC6C4kQPd2r8NzKM9.jpg', json_encode(['KM' => '170.4'], JSON_UNESCAPED_UNICODE), 0],
        [20, 10, 5, 'Bolivya Potosi 8 Soles General Simon Bolivar', 'bolivya-potosi-8-soles-simon-bolivar', 'General Simon Bolivar Onuruna', 'Gümüş (AR)', '8 Soles', 27.00, 38.50, '12h', 1840, 1840, 'R1', 'FDC', 4000.00, 465.00, 'USD', 'Güney Amerika bağımsızlık kahramanı General Simon Bolivar üniformalı büstü, sağa dönük.', 'Tarihi Cerro Rico (Zengin Tepe) gümüş madeni manzarası, iki lama ve palmiye ağacı altında altı yıldız.', 'https://images.vcoins.com/product_image/37/E/6/eS8RP2XxEHw3f6WS7MCtbr9Bd5NX4K.jpg', 'https://images.vcoins.com/product_image/37/E/6/eS8RP2XxEHw3f6WS7MCtbr9Bd5NX4K.jpg', json_encode(['KM' => '97'], JSON_UNESCAPED_UNICODE), 0],
        [21, 2, 9, 'Büyük İskender Zafer Tetradrahmisi', 'buyuk-iskender-zafer-tetradrahmisi', 'III. Aleksandros (Büyük İskender)', 'Gümüş (AR)', 'Tetradrahmi', 17.20, 28.00, '12h', -336, -323, 'R2', 'EF', 1600.00, 1850.00, 'USD', 'Aslan postu başlığı içinde genç Herakles büstü, sağa bakan kararlı profil.', 'Tahtında oturan Zeus Aëtophoros; sol elinde asa, sağ elinde kutsal kartal, Grekçe ALEXANDROU lejantı.', 'https://images.vcoins.com/product_image/322/e/6/eQnN84bZ76G5R84594u3v6bL5h4D6K.jpg', 'https://images.vcoins.com/product_image/322/e/6/eQnN84bZ76G5R84594u3v6bL5h4D6K.jpg', json_encode(['Price' => '442'], JSON_UNESCAPED_UNICODE), 1],
        [22, 2, 6, 'Syracuse Saf Altın Stateri (Persephone)', 'syracuse-saf-altin-stateri-persephone', 'Tiran Agathokles (M.Ö. 317 – 289)', 'Altın (AU)', 'Stater', 4.28, 16.50, '12h', -317, -289, 'R3', 'FDC', 3200.00, 3600.00, 'USD', 'Sağa bakan dalgalı saçlı tanrıça Kore/Persephone başı, zarif saç örgüsü; yüksek kabartmalı Helenistik altın darp.', 'Görkemli iki atlı savaş arabası (Biga) süren kanatlı Nike zafer tanrıçası figürü ve darphane monogramı.', 'https://images.vcoins.com/product_image/307/X/6/xx4Rj3WwmGq7Bc6d5Jana9AoSc8GfK.jpg', 'https://images.vcoins.com/product_image/307/X/6/xx4Rj3WwmGq7Bc6d5Jana9AoSc8GfK.jpg', json_encode(['HGC' => '2, 1278'], JSON_UNESCAPED_UNICODE), 1],
        [23, 5, 10, 'Osman Gazi İlk Gümüş Akçesi (1299)', 'osman-gazi-ilk-gumus-akcesi-1299', 'Osman Gazi (Fahrüddin)', 'Gümüş (AR)', 'Akçe', 1.15, 15.00, '12h', 1299, 1326, 'R4', 'VF', 12000.00, 15000.00, 'USD', 'Darb-ı Osman bin Ertuğrul halledallahu mülkehu ibaresi, erken dönem Selçuklu-İlhanlı tesirli hat kompozisyonu.', 'Kelime-i Şehadet ve Hulefa-i Raşidin isimleri, nümizmatik tescilli darp dairesi.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Coin_of_Osman_I.jpg/500px-Coin_of_Osman_I.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Coin_of_Osman_I.jpg/500px-Coin_of_Osman_I.jpg', json_encode(['Damalı' => '01-OG-01'], JSON_UNESCAPED_UNICODE), 1],
        [24, 5, 10, 'Orhan Gazi Bursa Darbı Tarihli Akçe', 'orhan-gazi-bursa-darbi-tarihli-akce', 'Orhan Gazi (Şücâeddin)', 'Gümüş (AR)', 'Akçe', 1.18, 16.00, '12h', 1326, 1362, 'R2', 'EF', 1000.00, 1200.00, 'USD', 'Orhan bin Osman Bursa ibaresi, daire ve nokta bezemeli geometrik bordür.', 'Halledallahu mülkehu ve darphane tarihi, berrak gümüş darp.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Akche_Orhan_I.jpg/500px-Akche_Orhan_I.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Akche_Orhan_I.jpg/500px-Akche_Orhan_I.jpg', json_encode(['Damalı' => '02-OH-04'], JSON_UNESCAPED_UNICODE), 0],
        [25, 5, 5, 'Fatih Sultan Mehmed Kostantiniyye İlk Altın Sultani', 'fatih-sultan-mehmed-kostantiniyye-ilk-altin-sultani', 'Fatih Sultan Mehmed (Ebü\'l-Feth)', 'Altın (AU)', 'Sultani', 3.45, 20.00, '12h', 1477, 1481, 'R3', 'FDC', 7500.00, 8900.00, 'USD', 'Sultanü\'l-berreyn ve hakanü\'l-bahreyn es-Sultan Mehmed bin Murad Han azze nasruhu unvan lejantı.', 'Dâribü\'n-nadri sâhibü\'l-izzi ve\'n-nasri fi\'l-berri ve\'l-bahr duribe fi Kostantiniyye 882.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Gold_Sultani_Mehmed_II_Kostantiniyye_882_AH.jpg/500px-Gold_Sultani_Mehmed_II_Kostantiniyye_882_AH.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Gold_Sultani_Mehmed_II_Kostantiniyye_882_AH.jpg/500px-Gold_Sultani_Mehmed_II_Kostantiniyye_882_AH.jpg', json_encode(['Pere' => '83'], JSON_UNESCAPED_UNICODE), 1],
        [26, 5, 5, 'Kanuni Sultan Süleyman Altın Sultani (Sultanü\'l-Berreyn)', 'kanuni-sultan-suleyman-altin-sultani', 'Kanuni Sultan Süleyman (Muhteşem)', 'Altın (AU)', 'Sultani', 3.52, 20.50, '12h', 1520, 1566, 'R2', 'EF', 2400.00, 2750.00, 'USD', 'Sultan Süleyman Şah bin Selim Şah azze nasruhu duribe fi Kostantiniyye sene 926.', 'Dâribü\'n-nadri sâhibü\'l-izzi ve\'n-nasr altın dua halkası ve hat sanatı.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sultani_Suleiman_I_Constantinople_926_AH.jpg/500px-Sultani_Suleiman_I_Constantinople_926_AH.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sultani_Suleiman_I_Constantinople_926_AH.jpg/500px-Sultani_Suleiman_I_Constantinople_926_AH.jpg', json_encode(['Pere' => '174'], JSON_UNESCAPED_UNICODE), 1],
        [27, 5, 5, 'II. Abdülhamid Tuğralı 100 Kuruş Altın Lira', 'ii-abdulhamid-tugrali-100-kurus-altin-lira', 'II. Abdülhamid', 'Altın (AU)', '100 Kuruş Lira', 7.21, 22.00, '12h', 1876, 1909, 'R1', 'UNC', 1200.00, 1350.00, 'USD', 'Merkezde zarif el-Gazi unvanlı II. Abdülhamid tuğrası, sağında gül dalı motifi, altta cülus yılı.', 'Duribe fi Kostantiniyye 1293 ve meşe dalı defne çelengi bordürü.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ottoman_100_Kurus_1327_AH_Abdul_Hamid_II.jpg/500px-Ottoman_100_Kurus_1327_AH_Abdul_Hamid_II.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ottoman_100_Kurus_1327_AH_Abdul_Hamid_II.jpg/500px-Ottoman_100_Kurus_1327_AH_Abdul_Hamid_II.jpg', json_encode(['KM' => '738'], JSON_UNESCAPED_UNICODE), 1],
    ];

    foreach ($coinsData as $cn) {
        $coinStmt->execute($cn);
    }

    // 6. AI Ayarları
    $pdo->exec("
        INSERT INTO ai_settings (id, provider, api_key, model_name, temperature, system_prompt, is_active, created_at, updated_at) 
        VALUES (1, 'gemini', 'MOCK_GEMINI_API_KEY_LOCAL', 'gemini-1.5-flash', 0.20, 'Sen kıdemli bir nümizmat ve antik sikke uzmanısın. Eseri analiz et ve JSON formatında yanıt ver.', 1, NOW(), NOW())
    ");

    // 7. Sözlük Verileri (Glossary)
    $glossStmt = $pdo->prepare("INSERT INTO glossary (term, slug, definition, category, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
    $glossaryTerms = [
        ['Avers', 'avers', 'Sikkenin ön yüzü (Obverse); genellikle hükümdar büstü veya baş tanrı tasviri bulunur.', 'Temel'],
        ['Revers', 'revers', 'Sikkenin arka yüzü (Reverse); genellikle imparatorluk arması, kutsal figür veya lejant barındırır.', 'Temel'],
        ['Tetradrahmi', 'tetradrahmi', 'Antik Grek dünyasında 4 drahmi değerindeki en yaygın standart gümüş sikke birimi.', 'Metroloji'],
        ['Denarius', 'denarius', 'Roma Cumhuriyeti ve İmparatorluğu\'nun bel kemiğini oluşturan ana gümüş sikke.', 'Metroloji'],
        ['Sultani', 'sultani', 'Fatih Sultan Mehmed tarafından 1477\'de bastırılan Osmanlı\'nın ilk saf altın sikkesi.', 'Osmanlı'],
        ['Kalıp Açısı (Die Axis)', 'kalip-acisi-die-axis', 'Ön yüz düz tutulduğunda arka yüzün saat kadranına göre dönüklük yönü (örn: 12h, 6h).', 'Teknik'],
        ['FDC (Fleur de Coin)', 'fdc', 'Kusursuz çil kondisyon; hiç tedavüle çıkmamış ve darp parlaklığını koruyan sikke.', 'Kondisyon'],
    ];
    foreach ($glossaryTerms as $g) {
        $glossStmt->execute($g);
    }

    echo "[3/4] 10 Medeniyet, 10 Darphane, 27 Zengin Sikke ve Nümizmatik Sözlük veritabanına işlendi.\n";

    // 4. Doğrulama
    $coinCount = $pdo->query("SELECT COUNT(*) FROM coins")->fetchColumn();
    $civCount = $pdo->query("SELECT COUNT(*) FROM civilizations")->fetchColumn();
    $mintCount = $pdo->query("SELECT COUNT(*) FROM mints")->fetchColumn();

    echo "[4/4] Doğrulama Özeti:\n";
    echo "  - Toplam Sikke: {$coinCount} adet\n";
    echo "  - Toplam Medeniyet: {$civCount} adet\n";
    echo "  - Toplam Darphane: {$mintCount} adet\n";

    echo "\n✨ Temiz Kurulum ve Tohumlama Başarıyla Tamamlandı!\n";
} catch (Exception $e) {
    echo "HATA: " . $e->getMessage() . "\n";
    exit(1);
}
