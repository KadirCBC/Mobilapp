<?php
$sampleItem = <<<HTML
<div class="item">
    <div class="item-info">
        <div id="ctl13_ctl00_ctl01_divImage" class="block-img">
            <a id="ctl13_ctl00_ctl01_lnkImage" href="/en/stores/nbnumismatics/109/product/troas__alexandria__valerian__ae_as_horse_grazing_right/2438859/Default.aspx"><img id="ctl13_ctl00_ctl01_imgImage" title="Ancient Coins - Troas  Alexandria  Valerian  AE As horse grazing right" src="https://images.vcoins.com/product_image/109/M/3/mQ9M4Tidw2AdNnm65ZKbqX7oP8Cg3t.jpg" alt="Ancient Coins - Troas  Alexandria  Valerian  AE As horse grazing right" /></a>
        </div>
        <div class="item-detail">
            <p class="description"><a href="/en/stores/nbnumismatics/109/product/troas__alexandria__valerian__ae_as_horse_grazing_right/2438859/Default.aspx">Pontos Amisos AE20 Thyrsus resting against</a></p>
            <div class="prices"><span class='newitemsprice' content='99.00'>99.00</span></div>
        </div>
    </div>
</div>
HTML;

$_POST = [
    'html' => $sampleItem,
    'auto_commit' => false,
];
$_SERVER['REQUEST_URI'] = '/api/v1/coins/harvest_category';
$_SERVER['REQUEST_METHOD'] = 'POST';

ob_start();
require __DIR__ . '/../backend/server.php';
$out = ob_get_clean();
echo $out;
