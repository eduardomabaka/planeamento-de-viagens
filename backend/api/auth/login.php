<?php
/**
 * TripPlanner - Exemplo de Endpoint de Autenticação
 * POST /api/auth/login.php
 * Body: { "email": "user@x.com", "password": "..." }
 */

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/database.php';

// JWT helper (use firebase/php-jwt em produção)
function createJWT(array $payload): string {
    $secret = getenv('JWT_SECRET') ?: 'sua_chave_secreta_aqui';
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + 86400 * 7; // 7 dias
    $payloadB64 = base64_encode(json_encode($payload));
    $signature = base64_encode(hash_hmac('sha256', "{$header}.{$payloadB64}", $secret, true));
    return "{$header}.{$payloadB64}.{$signature}";
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['email']) || empty($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email e password obrigatórios']);
        exit;
    }

    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
    $stmt->execute(['email' => $input['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($input['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }

    $token = createJWT(['user_id' => $user['id'], 'role' => $user['role']]);

    echo json_encode([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'nome' => $user['nome'],
            'email' => $user['email'],
            'role' => $user['role'],
            'avatar' => $user['avatar'],
            'bio' => $user['bio'],
        ],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
