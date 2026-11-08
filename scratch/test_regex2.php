<?php

$sampleHtml = <<<HTML
<div class="item">
    <div class="product_image">
        <a href="/en/coins/ancient/greek/pontos_amisos_ae20_thyrsus-12345.aspx">
            <img src="https://images.vcoins.com/product_image/109/M/3/364-1002.jpg" alt="Pontos Amisos AE20 Thyrsus resting against cista mystica">
        </a>
    </div>
    <p class="description">
        <a href="/en/coins/ancient/greek/pontos_amisos_ae20_thyrsus-12345.aspx">Pontos Amisos AE20 Thyrsus resting against cista mystica</a>
    </p>
    <div class="price">US $ 65.00</div>
</div>
<div class="item">
    <div class="product_image">
        <a href="/en/coins/ancient/greek/skepsis_troas_ae12-12346.aspx">
            <img src="https://images.vcoins.com/product_image/109/M/3/364-1003.jpg" alt="Skepsis, Troas AE12 forepart Pegasos rt / Palm tree">
        </a>
    </div>
    <p class="description">
        <a href="/en/coins/ancient/greek/skepsis_troas_ae12-12346.aspx">Skepsis, Troas AE12 forepart Pegasos rt / Palm tree</a>
    </p>
    <div class="price">US $ 45.00</div>
</div>
HTML;

// 1. Çok daha esnek ve güçlü item yakalama regex'i
preg_match_all('/<div[^>]+class=[\'"][^\'"]*\bitem\b[^\'"]*[\'"][^>]*>(.*?)(?=(?:<div[^>]+class=[\'"][^\'"]*\bitem\b|\s*<\/div\s*>\s*<div\s+id=|\s*$))/is', $sampleHtml, $m);

echo "1. Regex Eşleşme: " . count($m[0]) . " adet\n";

if (!empty($m[0])) {
    foreach ($m[0] as $k => $card) {
        preg_match('/<img[^>]+(?:src|data-src)=[\'"]([^\'"]+)[\'"]/i', $card, $im);
        $thumb = $im[1] ?? '';
        preg_match('/<p[^>]+class=[\'"]description[\'"][^>]*><a[^>]*>(.*?)<\/a>/is', $card, $tm);
        $title = trim(strip_tags($tm[1] ?? ''));
        echo "Kart #" . ($k+1) . ": Title: $title | Thumb: $thumb\n";
    }
}
