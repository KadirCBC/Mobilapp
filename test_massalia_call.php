<?php
$_SERVER['REQUEST_URI'] = '/test_ignore';
$_SERVER['REQUEST_METHOD'] = 'GET';

require_once 'backend/server.php';

$pdo = new PDO('mysql:host=127.0.0.1;dbname=numismatics;charset=utf8mb4', 'root', '');
$rawTitle = "Massalia. Marseille. Celtic Imitative Æ14 / Bull";
$rawDesc = "Attribution: LT 1673 type. Date: 2nd - 1st Century BC. Obverse: Laureate head of Apollo right with long curly hair. Reverse: Horned bull charging left, IIII in exergue. Size: 13.96mm. Weight: 1.55 grams. Description: VF. Price: $88.00";
$rawPrice = "$88.00";

$start = microtime(true);
$res = callGeminiForCoinTranslation($pdo, $rawTitle, $rawDesc, $rawPrice);
$duration = round(microtime(true) - $start, 2);

echo "Duration: {$duration}s\n";
echo "RESULT:\n";
print_r($res);
