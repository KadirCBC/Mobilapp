<?php
$img = imagecreatefromjpeg('test_coin.jpg');
$w = imagesx($img);
$h = imagesy($img);

echo "Dimensions: {$w}x{$h}\n";

$halfW = (int)($w / 2);

// Left half (Avers)
$avers = imagecrop($img, ['x' => 0, 'y' => 0, 'width' => $halfW, 'height' => $h]);
// Right half (Revers)
$revers = imagecrop($img, ['x' => $halfW, 'y' => 0, 'width' => $halfW, 'height' => $h]);

imagewebp($avers, 'crop_avers.webp', 88);
imagewebp($revers, 'crop_revers.webp', 88);

imagedestroy($avers);
imagedestroy($revers);
imagedestroy($img);

echo "Saved crop_avers.webp (" . filesize('crop_avers.webp') . " bytes)\n";
echo "Saved crop_revers.webp (" . filesize('crop_revers.webp') . " bytes)\n";

