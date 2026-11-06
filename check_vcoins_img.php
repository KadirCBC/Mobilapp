<?php
$imgUrl = 'https://images.vcoins.com/product_image/8/J/6/j84FGrP6a5JRAZo7Lk9J3XstTmw8i2.jpg';
$ch = curl_init($imgUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
$bin = curl_exec($ch);
curl_close($ch);

file_put_contents('test_coin.jpg', $bin);
$sz = getimagesize('test_coin.jpg');
print_r($sz);

