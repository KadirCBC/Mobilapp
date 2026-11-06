<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=numismatics;charset=utf8mb4', 'root', '');
$aiSetting = $pdo->query("SELECT * FROM ai_settings WHERE provider = 'gemini' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
echo "AI Setting in DB:\n";
print_r($aiSetting);

$apiKey = trim($aiSetting['api_key']);
echo "API Key Length: " . strlen($apiKey) . "\n";
echo "First 10 chars: " . substr($apiKey, 0, 10) . "\n";

// Test listing models with this key
$url = "https://generativelanguage.googleapis.com/v1beta/models?key=" . urlencode($apiKey);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $code\n";
$data = json_decode($res, true);
if (isset($data['models'])) {
    echo "Available Models:\n";
    foreach ($data['models'] as $m) {
        if (str_contains($m['name'], 'flash')) {
            echo " - " . $m['name'] . "\n";
        }
    }
} else {
    echo "Error response:\n$res\n";
}
