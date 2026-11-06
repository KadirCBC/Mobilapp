CREATE DATABASE IF NOT EXISTS numismatics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE numismatics;

-- 1. Medeniyetler Tablosu
CREATE TABLE IF NOT EXISTS civilizations (
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

-- 2. Darphaneler Tablosu
CREATE TABLE IF NOT EXISTS mints (
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

-- 3. Sikkeler Tablosu
CREATE TABLE IF NOT EXISTS coins (
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
    avers_image VARCHAR(255) NULL,
    revers_image VARCHAR(255) NULL,
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

-- 4. AI Ayarları Tablosu
CREATE TABLE IF NOT EXISTS ai_settings (
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

-- 5. AI Tarama Kayıtları (ai_scan_logs) Tablosu
CREATE TABLE IF NOT EXISTS ai_scan_logs (
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

-- Başlangıç Verilerini Ekle (Seed Data)
INSERT INTO civilizations (id, name, slug, era_period, description, is_active, created_at, updated_at) VALUES
(1, 'Roma İmparatorluğu', 'roma-imparatorlugu', 'M.Ö. 27 - M.S. 476', 'Augustus ile başlayan, Aureus, Denarius ve Sestertius sikke sisteminin hâkim olduğu antik Roma dönemi.', 1, NOW(), NOW()),
(2, 'Antik Yunan', 'antik-yunan', 'M.Ö. 600 - M.Ö. 31', 'Atina baykuşlu Tetradrahmileri ve Büyük İskender darplarıyla tanınan Helenistik çağ.', 1, NOW(), NOW()),
(3, 'Bizans İmparatorluğu', 'bizans-imparatorlugu', 'M.S. 491 - 1453', 'Solidus ve Histamenon altın sikkeleri, İsa ve imparator büstü ikonografileriyle ünlü Doğu Roma.', 1, NOW(), NOW()),
(4, 'Lidya Krallığı', 'lidya-kralligi', 'M.Ö. 650 - M.Ö. 546', 'Dünyada parayı ilk kez icat eden Sardes merkezli krallık, Kroisos altın ve elektrum staterleri.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO mints (id, civilization_id, name, ancient_name, latitude, longitude, description, created_at, updated_at) VALUES
(1, 1, 'Roma Darphanesi', 'Roma', 41.8902000, 12.4922000, 'İmparatorluk merkez darphanesi, Moneta tapınağı mevkii.', NOW(), NOW()),
(2, 2, 'Atina', 'Athenai', 37.9715000, 23.7257000, 'Ünlü Attika standartı baykuşlu Tetradrahmilerin basıldığı darphane.', NOW(), NOW()),
(3, 3, 'Konstantinopolis', 'Byzantion', 41.0082000, 28.9784000, 'Bizans başkent darphanesi, CONOB damgalı soliduslar.', NOW(), NOW()),
(4, 4, 'Sardes', 'Sardis', 38.4883000, 28.0403000, 'Lidya Krallığı başkenti, tarihteki ilk altın ve gümüş sikke basım yeri.', NOW(), NOW()),
(5, 2, 'Amphipolis', 'Amphipolis', 40.8222000, 23.8475000, 'Makedonya Krallığı ve Büyük İskender döneminin stratejik darphanesi.', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO coins (id, civilization_id, mint_id, title, slug, ruler, metal_type, standard_name, weight_grams, diameter_mm, die_axis, year_start, year_end, rarity_code, condition_grade, estimated_value_min, estimated_value_max, currency, avers_description, revers_description, avers_image, revers_image, reference_codes, is_featured, is_published, approval_status, created_at, updated_at) VALUES
(1, 1, 1, 'Domitian Gümüş Denarius (Minerva Tasvirli)', 'domitian-gumus-denarius-minerva', 'Domitian', 'Gümüş (AR)', 'Denarius', 3.45, 19.20, '6h', 81, 96, 'C', 'EF', 185.00, 240.00, 'USD', 'Sağa bakan defne çelenkli imparator büstü. Lejant: IMP CAES DOMIT AVG GERM P M TR P XV', 'Minerva ayakta sağ elinde mızrak, sol elinde kalkan tutuyor. Lejant: IMP XXI COS XVI CENS P P P', 'coins/domitian_denarius_avers.webp', 'coins/domitian_denarius_revers.webp', '{"RIC": "II 721", "BMCRE": "198", "RSC": "273"}', 1, 1, 'approved', NOW(), NOW()),
(2, 4, 4, 'Kroisos Ağır Altın Stateri', 'kroisos-agir-altin-stateri', 'Kroisos', 'Altın (AU)', 'Ağır Stater', 10.76, 16.50, '12h', -560, -546, 'R1', 'UNC', 8500.00, 12000.00, 'USD', 'Karşı karşıya bakan kükreyen aslan ve boğa ön kısımları.', 'İki adet derin incuse (içbükey) damga izi.', 'coins/croesus_stater_avers.webp', 'coins/croesus_stater_revers.webp', '{"BMC": "Lydia 30", "SNG": "von Aulock 2873"}', 1, 1, 'approved', NOW(), NOW()),
(3, 2, 5, 'Büyük İskender Tetradrahmi', 'buyuk-iskender-tetradrahmi', 'III. Aleksandros', 'Gümüş (AR)', 'Tetradrahmi', 17.15, 28.00, '12h', -336, -323, 'S', 'EF', 1400.00, 2100.00, 'USD', 'Aslan postlu Herakles sağ profilden büstü.', 'Tahtta oturan Zeus Aetophoros, sağ elinde kartal tutuyor. Lejant: ALEXANDROU', 'coins/alexander_tetradrachm_avers.webp', 'coins/alexander_tetradrachm_revers.webp', '{"Price": "442", "Muller": "1301"}', 0, 1, 'approved', NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO ai_settings (id, provider, api_key, model_name, temperature, system_prompt, is_active, created_at, updated_at) VALUES
(1, 'gemini', 'MOCK_GEMINI_API_KEY_LOCAL', 'gemini-1.5-flash', 0.20, 'Sen kıdemli bir nümizmat ve antik sikke uzmanısın. Eseri analiz et ve JSON formatında yanıt ver.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE provider=VALUES(provider);

