<?php
$url = 'https://www.vcoins.com/en/stores/marc_breitsprecher_classical_numismatist/8/product/trebonianus_gallus_ad_251253_pamphylia_perge_19825__artemis/2436324/Default.aspx';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$html = curl_exec($ch);
curl_close($ch);

// 1. Title
$rawTitle = '';
if (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $html, $tm)) {
    $rawTitle = trim(html_entity_decode(strip_tags($tm[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

// 2. Price
$rawPrice = '';
if (preg_match('/(?:US\s*\$|[\$€£])\s*([0-9,]+(?:\.[0-9]{2})?)/i', $html, $pm)) {
    $rawPrice = $pm[0];
}

// 3. Description
$rawDesc = '';
if (preg_match('/(<b>Title:.*?)(?:<a\s+[^>]*followstore|<\/div>)/is', $html, $dm)) {
    $rawDesc = trim(html_entity_decode(strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $dm[1])), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}
if (empty($rawDesc) && preg_match('/(<div[^>]*class="[^"]*description[^"]*"[^>]*>.*?<\/div>)/is', $html, $dm)) {
    $rawDesc = trim(html_entity_decode(strip_tags($dm[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

// 4. Image
$mainImgUrl = '';
if (preg_match('/https:\/\/images\.vcoins\.com\/product_image\/[^\s"\'<>]+/i', $html, $im)) {
    $clean = preg_replace('/(&#39;|,|\);).*$/', '', $im[0]);
    // If it has /5/ replace with /6/ or full size for best resolution
    $mainImgUrl = str_replace('/5/', '/6/', $clean);
}

echo "Title: $rawTitle\n";
echo "Price: $rawPrice\n";
echo "Desc: " . substr($rawDesc, 0, 100) . "...\n";
echo "Main Image: $mainImgUrl\n";

