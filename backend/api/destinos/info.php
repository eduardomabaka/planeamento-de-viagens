<?php
/**
 * TripPlanner - Endpoint de Destinos (integração com APIs externas)
 * GET /api/destinos/info.php?destino=Paris
 *
 * Agrega dados de:
 *  - OpenWeatherMap (clima)
 *  - RestCountries (país, idioma, moeda, fuso)
 *  - ExchangeRate API (câmbio)
 */

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../config/database.php';

function fetch_json(string $url): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true) ?: [];
}

try {
    $destino = trim($_GET['destino'] ?? '');
    if (!$destino) {
        http_response_code(400);
        echo json_encode(['error' => 'Destino obrigatório']);
        exit;
    }

    $pdo = Database::getConnection();

    // 1. Verificar cache (válido por 24h)
    $stmt = $pdo->prepare('SELECT * FROM destination_cache WHERE destino = :d AND updated_at > NOW() - INTERVAL 24 HOUR');
    $stmt->execute(['d' => $destino]);
    $cached = $stmt->fetch();

    if ($cached) {
        echo $cached['dados'];
        exit;
    }

    // 2. Buscar país via RestCountries
    $countryName = explode(',', $destino);
    $countryName = trim(end($countryName));
    $countryData = fetch_json("https://restcountries.com/v3.1/name/{$countryName}?fields=name,capital,languages,currencies,timezones,cca2");
    $country = $countryData[0] ?? [];

    // 3. Clima via OpenWeatherMap
    $weatherKey = getenv('OPENWEATHER_API_KEY');
    $weather = [];
    if ($weatherKey) {
        $weather = fetch_json("https://api.openweathermap.org/data/2.5/weather?q={$destino}&appid={$weatherKey}&units=metric&lang=pt");
    }

    // 4. Câmbio via ExchangeRate API
    $currency = array_key_first($country['currencies'] ?? []) ?? 'EUR';
    $exchange = fetch_json("https://open.er-api.com/v6/latest/EUR");
    $rate = $exchange['rates'][$currency] ?? 1;

    $result = [
        'pais' => $country['name']['common'] ?? $destino,
        'capital' => $country['capital'][0] ?? null,
        'idioma' => implode(', ', $country['languages'] ?? []),
        'moeda' => $currency,
        'cambio' => $rate,
        'fuso_horario' => $country['timezones'][0] ?? 'GMT+0',
        'clima' => [
            'temp' => $weather['main']['temp'] ?? 20,
            'descricao' => $weather['weather'][0]['description'] ?? 'N/D',
            'icon' => '🌤️',
        ],
        'contactos_emergencia' => [
            'embaixada' => 'N/D',
            'hospital' => '112',
            'policia' => '112',
        ],
        'dicas_culturais' => ['Informar-se sobre costumes locais'],
        'atracoes' => [],
        'vacinas' => ['Consultar médico antes da viagem'],
        'hoteis' => [],
        'transporte' => ['Táxi', 'Transportes públicos'],
    ];

    $json = json_encode($result, JSON_UNESCAPED_UNICODE);

    // 5. Guardar em cache
    $stmt = $pdo->prepare('INSERT INTO destination_cache (destino, dados) VALUES (:d, :data)
                           ON DUPLICATE KEY UPDATE dados = :data, updated_at = NOW()');
    $stmt->execute(['d' => $destino, 'data' => $json]);

    echo $json;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
