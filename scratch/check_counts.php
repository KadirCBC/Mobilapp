<?php
$pdo = new PDO("mysql:host=127.0.0.1;dbname=numismatics", "root", "");
echo "Toplam: " . $pdo->query("SELECT count(*) FROM coins")->fetchColumn() . "\n";
$rows = $pdo->query("SELECT id, title, weight_grams, estimated_value_min FROM coins ORDER BY id DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);
