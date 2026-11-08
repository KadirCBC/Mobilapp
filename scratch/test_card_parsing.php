<?php
require_once dirname(__DIR__) . '/backend/server.php';

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
HTML;

preg_match_all('/<div[^>]+class=[\'"][^\'"]*\bitem\b[^\'"]*[\'"][^>]*>(.*?)<\/div\s*>\s*<\/div\s*>\s*<\/div>/is', $sampleHtml, $m);
echo "Kart eşleşti mi: " . (empty($m[0]) ? "HAYIR" : "EVET (" . count($m[0]) . " adet)") . "\n";

if (!empty($m[0])) {
    $card = $m[0][0];
    preg_match('/<img[^>]+(?:src|data-src)=[\'"]([^\'"]+)[\'"]/i', $card, $im);
    $thumb = $im[1] ?? '';
    echo "Thumb: " . $thumb . "\n";
    $avers = str_replace('/M/3/', '/M/5/', $thumb);
    $revers = str_replace('/M/3/', '/M/6/', $thumb);
    echo "Avers: " . $avers . "\n";
    echo "Revers: " . $revers . "\n";
}
