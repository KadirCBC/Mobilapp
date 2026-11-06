<?php
$html = file_get_contents('treb.html');

$rawTitle = '';
$rawDesc = '';
$rawPrice = '';

// Title
if (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $html, $tm)) {
    $rawTitle = trim(html_entity_decode(strip_tags($tm[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

// Price
if (preg_match('/(?:US\s*)?[\$\€\£]\s*([0-9,]+(?:\.[0-9]{2})?)/i', $html, $pm)) {
    $rawPrice = $pm[0];
}

// Description
if (preg_match('/(<b>Title:.*?)(?:<a\s+[^>]*followstore|<\/div>)/is', $html, $dm)) {
    $rawDesc = trim(html_entity_decode(strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $dm[1])), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

echo "RAW TITLE: $rawTitle\n";
echo "RAW PRICE: $rawPrice\n";
echo "RAW DESC:\n$rawDesc\n";

