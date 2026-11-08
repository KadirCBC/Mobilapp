<?php
// Test GD Image Crop on panoramic 2:1 ratio
$w = 400;
$h = 200;
$im = imagecreatetruecolor($w, $h);
$red = imagecolorallocate($im, 255, 0, 0);
$blue = imagecolorallocate($im, 0, 0, 255);

// Sol yarı kırmızı (Ön Yüz)
imagefilledrectangle($im, 0, 0, 199, 199, $red);
// Sağ yarı mavi (Arka Yüz)
imagefilledrectangle($im, 200, 0, 399, 199, $blue);

$cropLeft = imagecrop($im, ['x' => 0, 'y' => 0, 'width' => 200, 'height' => 200]);
$cropRight = imagecrop($im, ['x' => 200, 'y' => 0, 'width' => 200, 'height' => 200]);

echo "Left: " . imagesx($cropLeft) . "x" . imagesy($cropLeft) . "\n";
echo "Right: " . imagesx($cropRight) . "x" . imagesy($cropRight) . "\n";
echo "SUCCESS!\n";
