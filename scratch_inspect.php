<?php
require_once __DIR__ . '/backend/server.php';
echo "Total coins: " . $pdo->query('SELECT COUNT(*) FROM coins')->fetchColumn() . PHP_EOL;
$stmt = $pdo->query('SELECT id, title FROM coins LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
