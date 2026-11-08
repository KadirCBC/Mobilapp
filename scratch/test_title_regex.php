<?php

$sampleHtml = <<<HTML
<div class="item">
    <div class="product_image">
        <a href="/en/coins/ancient/greek/pontos_amisos_ae20_thyrsus-12345.aspx">
            <img src="https://images.vcoins.com/product_image/109/M/3/364-1002.jpg" alt="Ancient Coins - Pontos Amisos AE20 Thyrsus resting against cista mystica">
        </a>
    </div>
    <div class="description">
        <a href="/en/coins/ancient/greek/pontos_amisos_ae20_thyrsus-12345.aspx">Pontos Amisos AE20 Thyrsus resting against cista mystica</a>
    </div>
    <div class="price">US $ 65.00</div>
</div>
HTML;

preg_match_all('/<div[^>]+class=[\'"][^\'"]*\bitem\b[^\'"]*[\'"][^>]*>(.*?)(?=(?:<div[^>]+class=[\'"][^\'"]*\bitem\b|\s*<\/div\s*>\s*<div\s+id=|\s*$))/is', $sampleHtml, $m);

foreach ($m[0] as $card) {
    $title = '';
    if (preg_match('/(?:class=[\'"]description[\'"][^>]*>|<p[^>]*class=[\'"]description[\'"][^>]*>)\s*<a[^>]*>(.*?)<\/a>/is', $card, $tm)) {
        $title = trim(strip_tags($tm[1]));
    } elseif (preg_match('/<img[^>]+alt=[\'"]([^\'"]+)[\'"]/i', $card, $im)) {
        $title = trim(preg_replace('/^Ancient Coins\s*-\s*/i', '', $im[1]));
    }
    echo "Yakalanan Başlık: $title\n";
}
