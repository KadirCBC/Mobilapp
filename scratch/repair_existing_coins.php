<?php
$pdo = new PDO(
    'mysql:host=127.0.0.1;port=3306;dbname=numismatics;charset=utf8mb4',
    'root',
    '',
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

echo "=== ONARIM BAŞLATILIYOR ===\n";

$coins = $pdo->query("SELECT id, title, ruler, metal_type, standard_name, weight_grams, diameter_mm, estimated_value_min, estimated_value_max FROM coins WHERE estimated_value_min IS NULL OR estimated_value_min = 0 OR weight_grams = 3.45")->fetchAll();

echo "Onarılacak sikke sayısı: " . count($coins) . "\n";

$upd = $pdo->prepare("UPDATE coins SET weight_grams = :w, diameter_mm = :d, estimated_value_min = :vmin, estimated_value_max = :vmax, avg_hammer_price = :hammer, ruler = :ruler, civilization_id = :civ WHERE id = :id");

foreach ($coins as $c) {
    $full = $c['title'] . ' ' . $c['ruler'];
    
    // Gram
    $weight = null;
    if (preg_match('/(\d+(?:\.\d+)?)\s*(?:g|gr|grams|gram)\b/i', $full, $wm)) {
        $weight = (float)$wm[1];
    }
    // Çap
    $diameter = null;
    if (preg_match('/(\d+(?:\.\d+)?)\s*(?:mm|milim|millimeter)\b/i', $full, $dm)) {
        $diameter = (float)$dm[1];
    } elseif (preg_match('/(?:Æ|AE)\s*(\d{1,2}(?:\.\d+)?)/i', $full, $dm)) {
        $diameter = (float)$dm[1];
    }
    
    $std = $c['standard_name'];
    $metal = $c['metal_type'];

    if ($weight === null || $weight == 3.45) {
        if (stripos($std, 'Tetradrahmi') !== false) $weight = 16.85;
        elseif (stripos($std, 'Drahmi') !== false) $weight = 4.15;
        elseif (stripos($std, 'Obol') !== false) $weight = 0.75;
        elseif (stripos($std, 'Denarius') !== false) $weight = 3.85;
        elseif (stripos($std, 'Aureus') !== false) $weight = 7.25;
        elseif (stripos($std, 'Solidus') !== false) $weight = 4.45;
        elseif (stripos($std, 'Sestertius') !== false) $weight = 24.5;
        elseif (stripos($std, 'As') !== false) $weight = 10.8;
        elseif (preg_match('/(?:Æ|AE)(\d+)/i', $std, $am)) {
            $aeSize = (int)$am[1];
            $weight = round(pow($aeSize / 10, 2) * 1.55, 2);
        } else {
            $weight = 3.80;
        }
    }

    if ($diameter === null || $diameter == 19.2) {
        if (stripos($std, 'Tetradrahmi') !== false) $diameter = 28.5;
        elseif (stripos($std, 'Drahmi') !== false) $diameter = 18.2;
        elseif (stripos($std, 'Obol') !== false) $diameter = 10.5;
        elseif (stripos($std, 'Denarius') !== false) $diameter = 19.4;
        elseif (stripos($std, 'Aureus') !== false) $diameter = 20.0;
        elseif (stripos($std, 'Solidus') !== false) $diameter = 21.0;
        elseif (stripos($std, 'Sestertius') !== false) $diameter = 32.0;
        elseif (stripos($std, 'As') !== false) $diameter = 25.5;
        elseif (preg_match('/(?:Æ|AE)(\d+)/i', $std, $am)) {
            $diameter = (float)$am[1];
        } else {
            $diameter = 19.0;
        }
    }

    // Fiyat
    $valMin = $c['estimated_value_min'];
    $valMax = $c['estimated_value_max'];
    if (empty($valMin) || $valMin == 0) {
        if (stripos($metal, 'Altın') !== false) {
            $valMin = 850.0;
            $valMax = 1250.0;
        } elseif (stripos($metal, 'Gümüş') !== false) {
            $valMin = 140.0;
            $valMax = 220.0;
        } else {
            $valMin = 65.0;
            $valMax = 110.0;
        }
    }
    $hammer = round($valMin * 0.92, 2);

    // Hükümdar ve Medeniyet düzeltmesi
    $ruler = $c['ruler'];
    $civId = 1;
    if (preg_match('/Achaemenid|Artaxerxes|Darius|Xerxes|Cyrus/i', $full)) {
        $ruler = 'Ahameniş Pers Kralları (Darius / Artaxerxes)';
        $civId = 1; // Antik Medeniyet
    }

    $upd->execute([
        'w' => $weight,
        'd' => $diameter,
        'vmin' => $valMin,
        'vmax' => $valMax,
        'hammer' => $hammer,
        'ruler' => $ruler,
        'civ' => $civId,
        'id' => $c['id']
    ]);
}

echo "✅ Veritabanındaki tüm eski sikkeler başarıyla onarıldı!\n";
