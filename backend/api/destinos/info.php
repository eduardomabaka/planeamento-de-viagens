<?php
/**
 * TripPlanner - Endpoint de Destinos (integração com APIs externas)
 * GET /api/destinos/info.php?destino=Paris,%20França&data_partida=2026-06-10
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

function load_env_file(string $path): void {
    if (!is_readable($path)) return;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        if ($key && getenv($key) === false) {
            putenv($key . '=' . trim($value, "\"'"));
        }
    }
}

load_env_file(__DIR__ . '/../../../.env');

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

function weather_icon(?string $code): string {
    if (!$code) return '';
    if (str_starts_with($code, '01')) return '☀️';
    if (str_starts_with($code, '02')) return '⛅';
    if (str_starts_with($code, '03') || str_starts_with($code, '04')) return '☁️';
    if (str_starts_with($code, '09') || str_starts_with($code, '10')) return '🌧️';
    if (str_starts_with($code, '11')) return '⛈️';
    if (str_starts_with($code, '13')) return '❄️';
    if (str_starts_with($code, '50')) return '🌫️';
    return '';
}

function destination_terms(string $destino): array {
    $parts = array_values(array_filter(array_map('trim', explode(',', $destino))));
    $last = $parts ? end($parts) : '';
    return array_values(array_unique(array_filter([$last, $destino])));
}

function country_name_pt(array $country): string {
    return $country['translations']['por']['common'] ?? $country['name']['common'] ?? '';
}

function region_pt(?string $region): ?string {
    $regions = [
        'Africa' => 'África',
        'Americas' => 'Américas',
        'Antarctic' => 'Antártida',
        'Asia' => 'Ásia',
        'Europe' => 'Europa',
        'Oceania' => 'Oceânia',
    ];
    return $region ? ($regions[$region] ?? $region) : null;
}

function languages_pt(array $languages): string {
    $names = [];
    foreach ($languages as $code => $fallback) {
        if (class_exists('Locale')) {
            $name = Locale::getDisplayLanguage((string)$code, 'pt');
            $names[] = $name && function_exists('mb_convert_case') ? mb_convert_case($name, MB_CASE_TITLE, 'UTF-8') : ($name ?: $fallback);
        } else {
            $names[] = $fallback;
        }
    }
    return implode(', ', $names);
}

function currency_name_pt(string $currency, ?string $fallback): ?string {
    $known = [
        'AOA' => 'Kwanza angolano',
        'EUR' => 'Euro',
        'USD' => 'Dólar americano',
        'BRL' => 'Real brasileiro',
        'GBP' => 'Libra esterlina',
        'CVE' => 'Escudo cabo-verdiano',
        'MZN' => 'Metical moçambicano',
        'STN' => 'Dobra são-tomense',
        'XOF' => 'Franco CFA da África Ocidental',
        'XAF' => 'Franco CFA da África Central',
    ];
    return $known[$currency] ?? $fallback;
}

try {
    $destino = trim($_GET['destino'] ?? '');
    if (!$destino) {
        http_response_code(400);
        echo json_encode(['error' => 'Destino obrigatório']);
        exit;
    }
    $dataPartida = trim($_GET['data_partida'] ?? '');

    $pdo = Database::getConnection();

    // 1. Buscar país via RestCountries. Tenta o texto completo e, em destinos
    // como "Paris, França", tenta também a última parte.
    $country = [];
    foreach (destination_terms($destino) as $term) {
        $fields = 'name,translations,capital,languages,currencies,timezones,region';
        $countryData = fetch_json('https://restcountries.com/v3.1/name/' . rawurlencode($term) . '?fullText=true&fields=' . $fields);
        if (isset($countryData[0])) {
            $country = $countryData[0];
            break;
        }
        $countryData = fetch_json('https://restcountries.com/v3.1/translation/' . rawurlencode($term) . '?fields=' . $fields);
        if (isset($countryData[0])) {
            $country = $countryData[0];
            break;
        }
        $countryData = fetch_json('https://restcountries.com/v3.1/name/' . rawurlencode($term) . '?fields=' . $fields);
        if (isset($countryData[0])) {
            $country = $countryData[0];
            break;
        }
    }

    if (!$country) {
        http_response_code(404);
        echo json_encode(['error' => 'Não foi possível obter informações automáticas para este destino. Podes continuar e preencher manualmente'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. Clima via OpenWeatherMap.
    $weatherKey = getenv('OPENWEATHER_API_KEY');
    $weatherResult = null;
    if ($weatherKey) {
        $forecast = fetch_json('https://api.openweathermap.org/data/2.5/forecast?q=' . rawurlencode($destino) . '&appid=' . rawurlencode($weatherKey) . '&units=metric&lang=pt');
        $items = $forecast['list'] ?? [];
        if ($items) {
            $target = $dataPartida ? strtotime($dataPartida) : time();
            $closest = $items[0];
            foreach ($items as $item) {
                if (abs(strtotime($item['dt_txt']) - $target) < abs(strtotime($closest['dt_txt']) - $target)) {
                    $closest = $item;
                }
            }
            $weatherResult = [
                'temp' => round((float)$closest['main']['temp']),
                'descricao' => $closest['weather'][0]['description'] ?? '',
                'icon' => weather_icon($closest['weather'][0]['icon'] ?? null),
            ];
        }
    }

    // 3. Câmbio via ExchangeRate API: 1 unidade da moeda local em AOA/Kz.
    $currency = array_key_first($country['currencies'] ?? []);
    if (!$currency) {
        http_response_code(422);
        echo json_encode(['error' => 'Não foi possível obter a moeda local do destino'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $exchange = fetch_json('https://open.er-api.com/v6/latest/' . rawurlencode($currency));
    $rate = $currency === 'AOA' ? 1 : ($exchange['rates']['AOA'] ?? null);
    if (!$rate) {
        http_response_code(502);
        echo json_encode(['error' => 'Não foi possível obter o câmbio em tempo real para Kz'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $result = [
        'pais' => country_name_pt($country),
        'capital' => $country['capital'][0] ?? null,
        'idioma' => languages_pt($country['languages'] ?? []),
        'moeda' => $currency,
        'moeda_nome' => currency_name_pt($currency, $country['currencies'][$currency]['name'] ?? null),
        'cambio' => $rate,
        'cambio_aoa' => $rate,
        'conversao_aoa' => '1 ' . $currency . ' = ' . number_format((float)$rate, 2, ',', '.') . ' Kz',
        'fuso_horario' => implode(', ', $country['timezones'] ?? []),
        'regiao' => region_pt($country['region'] ?? null),
    ];

    if ($weatherResult) {
        $result['clima'] = $weatherResult;
    }

    $json = json_encode($result, JSON_UNESCAPED_UNICODE);

    // Guarda apenas dados resultantes das APIs. O câmbio continua a ser consultado
    // antes de cada resposta para evitar valores inventados.
    $stmt = $pdo->prepare('INSERT INTO destination_cache (destino, dados) VALUES (:d, :data)
                           ON DUPLICATE KEY UPDATE dados = :data, updated_at = NOW()');
    $stmt->execute(['d' => $destino, 'data' => $json]);

    echo $json;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
