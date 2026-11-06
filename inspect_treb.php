<?php
$html = file_get_contents('treb.html');

libxml_use_internal_errors(true);
$dom = new DOMDocument();
@$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
libxml_clear_errors();
$xpath = new DOMXPath($dom);

echo "=== TITLE CANDIDATES ===\n";
foreach ([
    "//h1",
    "//span[@id='lblItemTitle']",
    "//span[contains(@id, 'ItemTitle')]",
    "//div[contains(@class, 'title')]",
    "//meta[@property='og:title']/@content",
    "//title"
] as $q) {
    $nodes = $xpath->query($q);
    if ($nodes && $nodes->length > 0) {
        echo "$q => " . trim($nodes->item(0)->nodeValue) . "\n";
    }
}

echo "\n=== PRICE CANDIDATES ===\n";
foreach ([
    "//span[@id='lblPrice']",
    "//span[contains(@id, 'Price')]",
    "//div[contains(@class, 'price')]",
    "//meta[@property='product:price:amount']/@content",
] as $q) {
    $nodes = $xpath->query($q);
    if ($nodes && $nodes->length > 0) {
        echo "$q => " . trim($nodes->item(0)->nodeValue) . "\n";
    }
}

echo "\n=== DESCRIPTION / ITEM CONTENT ===\n";
foreach ([
    "//span[@id='lblDescription']",
    "//span[contains(@id, 'Description')]",
    "//div[@id='divDescription']",
    "//div[contains(@id, 'Description')]",
    "//div[contains(@class, 'description')]",
    "//meta[@property='og:description']/@content",
] as $q) {
    $nodes = $xpath->query($q);
    if ($nodes && $nodes->length > 0) {
        echo "$q => " . substr(trim($nodes->item(0)->nodeValue), 0, 150) . "...\n";
    }
}

echo "\n=== ALL IMAGES IN PAGE ===\n";
$imgs = $xpath->query("//img/@src");
foreach ($imgs as $img) {
    $src = $img->nodeValue;
    if (str_contains($src, 'product') || str_contains($src, 'store') || str_contains($src, 'items') || str_contains($src, '.jpg')) {
        echo " - " . $src . "\n";
    }
}

echo "\n=== ALL A HREF IMAGES ===\n";
$anchors = $xpath->query("//a/@href");
foreach ($anchors as $a) {
    $href = $a->nodeValue;
    if (str_contains($href, 'product') || str_contains($href, '.jpg')) {
        echo " A: " . $href . "\n";
    }
}

