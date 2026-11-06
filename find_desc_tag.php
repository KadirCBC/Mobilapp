<?php
$html = file_get_contents('treb.html');
$pos = strpos($html, 'Attribution:');
if ($pos !== false) {
    echo "Found at pos $pos:\n";
    echo substr($html, max(0, $pos - 300), 1000) . "\n";
} else {
    echo "Not found with exact string\n";
    // Search case insensitive
    if (preg_match('/RPC\s*IX\s*1118/i', $html, $m, PREG_OFFSET_CAPTURE)) {
        $p = $m[0][1];
        echo "Found with regex at $p:\n";
        echo substr($html, max(0, $p - 300), 1000) . "\n";
    }
}

