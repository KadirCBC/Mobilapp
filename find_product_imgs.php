<?php
$html = file_get_contents('treb.html');
preg_match_all('/https:\/\/images\.vcoins\.com\/product_image\/[^\s"\'<>]+/i', $html, $m);
print_r(array_unique($m[0]));

