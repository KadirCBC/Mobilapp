<?php
$html = file_get_contents('treb.html');
preg_match_all('/Attribution/i', $html, $matches, PREG_OFFSET_CAPTURE);
foreach ($matches[0] as $match) {
    $p = $match[1];
    echo "=== Occurrence at $p ===\n";
    echo substr($html, max(0, $p - 150), 400) . "\n\n";
}

