<?php
/**
 * bootstrap.php
 * 셀프파이어 어드민 API 공통 처리: 세션, JSON 응답, DB 연결, 관리자 권한 확인
 *
 * 어드민 페이지와 API는 같은 도메인에서 서비스하므로 CORS는 열지 않는다.
 * 세션 이름을 따로 써서 함온성 사이트 로그인과 섞이지 않게 한다.
 */

header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-cache, no-store, must-revalidate");

$isSecure = (isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) === 'on')
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https');

session_name('SELFFIRE_ADMIN');
session_set_cookie_params([
    'lifetime' => 60 * 60 * 12, // 12시간
    'path'     => '/',
    'httponly' => true,
    'secure'   => $isSecure,
    'samesite' => 'Strict',
]);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** JSON으로 응답하고 종료한다. */
function respond(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit();
}

function fail(int $code, string $message, array $extra = []): void
{
    respond($code, array_merge(['status' => 'error', 'message' => $message], $extra));
}

function requirePost(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        fail(405, 'POST 요청만 허용됩니다.');
    }
}

/** 요청 본문(JSON 또는 form)을 배열로 */
function readInput(): array
{
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : $_POST;
}

/**
 * config/db_config.php 위치를 찾는다.
 * 서버마다 어드민을 올리는 경로가 달라도 되도록 상위 폴더로 올라가며 찾는다.
 * (함온성과 같은 서버라면 www 바깥의 config/db_config.php를 그대로 쓴다)
 */
function findDbConfig(): ?string
{
    $dir = __DIR__;
    for ($i = 0; $i < 8; $i++) {
        $candidate = $dir . '/config/db_config.php';
        if (is_file($candidate)) return $candidate;
        $parent = dirname($dir);
        if ($parent === $dir) break;
        $dir = $parent;
    }
    return null;
}

function getDbConnection(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $config = findDbConfig();
    if ($config === null) {
        fail(500, 'config/db_config.php를 찾을 수 없습니다.');
    }
    require_once $config;

    $dsn = sprintf("mysql:host=%s;port=%s;dbname=%s;charset=%s", DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        error_log("DB Connection Error: " . $e->getMessage());
        fail(500, '데이터베이스 연결 실패');
    }
    return $pdo;
}

function currentAdmin(): ?array
{
    return $_SESSION['admin'] ?? null;
}

/** 로그인한 관리자만 통과. 쓰기 요청은 CSRF 토큰도 확인한다. */
function requireAdmin(): void
{
    if (!currentAdmin()) {
        fail(401, '로그인이 필요합니다.');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!hash_equals($_SESSION['csrf'] ?? '', $token)) {
            fail(403, '세션이 만료되었습니다. 새로고침 후 다시 시도하세요.');
        }
    }
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}
