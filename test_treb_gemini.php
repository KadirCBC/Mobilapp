<?php
$key = 'AQ.Ab8RN6LDYF9x9OYqEhFb9TSk42T5ZdESoAMipeWkR3O4azLoJw';
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" . urlencode($key);

$desc = "Title: Trebonianus Gallus (AD 251-253). Pamphylia. Perge Æ25 / Artemis
Attribution: RPC IX 1118
Date: AD 251-253
Obverse: ΑΥ Κ Γ ΟΥЄΙ ΤΡЄ ΓΑΛΛΟΝ, laureate, draped and cuirassed bust right, seen from behind; globe below
Reverse: ΠЄΡΓ-ΑΙΩΝ, Artemis Pergaia, radiate with crescent on shoulder, standing right, holding bow and arrow
Size: 25.27mm
Weight: 5.75 grams
Description: VF
Price: US$ 95.00";

$systemInstruction = "Sen uluslararası kıdemli bir nümizmat ve antik sikke uzmanısın. Sana sunulan İngilizce nümizmatik ürün metnini analiz et, terimleri Türkçe nümizmatik literatürüne uygun olarak çevir ve tam olarak şu JSON şemasında yanıt ver:
{
  \"title\": \"Türkçe tam sikke adı\",
  \"civilization\": \"Medeniyet: Roma İmparatorluğu, Roma Eyalet, Antik Yunan vb.\",
  \"ruler\": \"Hükümdar / İmparator\",
  \"metal_type\": \"Altın (AU), Gümüş (AR), Bronz (AE), Elektrum vb.\",
  \"standard_name\": \"Æ25, Denarius, Tetradrahmi, vb.\",
  \"weight_grams\": 5.75,
  \"diameter_mm\": 25.27,
  \"die_axis\": \"6h\",
  \"year_start\": 251,
  \"year_end\": 253,
  \"condition_grade\": \"VF\",
  \"avers_description\": \"Ön yüzün Türkçe tasvir ve lejant açıklaması\",
  \"revers_description\": \"Arka yüzün Türkçe tasvir ve lejant açıklaması\",
  \"reference_codes\": {\"RPC\": \"IX 1118\"},
  \"estimated_value_min\": 95.0
}
Sadece saf JSON formatında yanıt ver.";

$payload = [
    'contents' => [
        ['role' => 'user', 'parts' => [['text' => $systemInstruction . "\n\n" . $desc]]]
    ],
    'generationConfig' => [
        'responseMimeType' => 'application/json'
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$res = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Gemini Response:\n$res\n";

