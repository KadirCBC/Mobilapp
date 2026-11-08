<?php
require_once dirname(__DIR__) . '/backend/server.php';

$testCoins = [
    'Pontos Amisos AE20 Thyrsus resting against cista mystica',
    'Skepsis, Troas AE12 forepart Pegasos rt / Palm tree',
    'Ionia, Ephesos AE16.5 Bee / Stag grazing',
    'Lydia, Sardes AE23 veiled Tyche / Zeus Lydios',
    'Phoenicia. Arados. Civic issue &#198;15 / Galley',
    'Arabia. Pre-Islamic. Jabal Kenzen. Anonymous AE unit',
    'Sicily. Syracuse. Hieron II (275-215 BC) &#198;27',
    'Thrace. Maroneia &#198;16 / Dionysos head rt',
    'Kings of Thrace. Lysimachos (305-281 BC) AE20',
];

echo "=== NUMISMATIC PARSING TEST ===\n\n";

foreach ($testCoins as $idx => $rawTitle) {
    $decodedTitle = decodeNumismaticHtml($rawTitle);
    list($metal, $metalCode) = detectNumismaticMetal($decodedTitle);
    $std = detectNumismaticStandard($decodedTitle);
    $ruler = detectNumismaticRuler($decodedTitle);
    list($civId, $civName) = detectNumismaticCivilization($decodedTitle);
    list($mintId, $mintName) = detectNumismaticMint($decodedTitle);

    echo ($idx + 1) . ". RAW: " . $rawTitle . "\n";
    echo "   Maden:        " . $metal . " [" . $metalCode . "]\n";
    echo "   Nominal:      " . $std . "\n";
    echo "   Hükümdar:     " . $ruler . "\n";
    echo "   Medeniyet:    " . $civName . "\n";
    echo "   Darphane:     " . ($mintName ?: 'Belirtilmedi') . "\n";
    echo "------------------------------------------------------------\n";
}
