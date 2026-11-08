<?php
$pdo = new PDO("mysql:host=127.0.0.1", "root", "");
$dbs = $pdo->query("SHOW DATABASES")->fetchAll(PDO::FETCH_COLUMN);
print_r($dbs);

foreach ($dbs as $db) {
    if (str_contains($db, 'numis') || str_contains($db, 'coin') || str_contains($db, 'sikke')) {
        $pdo->query("USE `$db`");
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "DB: $db -> Tables: " . implode(', ', $tables) . "\n";
        if (in_array('coins', $tables)) {
            $cnt = $pdo->query("SELECT count(*) FROM coins")->fetchColumn();
            echo "   coins count: $cnt\n";
        }
    }
}
