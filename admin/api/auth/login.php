<?php
/**
 * 관리자 로그인
 * 함온성과 같은 users 테이블을 쓰고, role이 admin인 계정만 들어올 수 있다.
 */
require_once __DIR__ . '/../common/bootstrap.php';
requirePost();

$input = readInput();
$username = trim($input['username'] ?? '');
$password = trim((string)($input['password'] ?? '')); // 함온성 login.php와 같은 처리

if ($username === '' || $password === '') {
    fail(400, '아이디와 비밀번호를 모두 입력해주세요.');
}

// 무차별 대입 방지: 세션당 연속 실패 5회면 1분 대기
$failures = $_SESSION['login_failures'] ?? 0;
$lockedUntil = $_SESSION['login_locked_until'] ?? 0;
if ($lockedUntil > time()) {
    fail(429, '로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.');
}

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT `id`, `username`, `name`, `password`, `role` FROM `users` WHERE `username` = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        $failures++;
        $_SESSION['login_failures'] = $failures;
        if ($failures >= 5) {
            $_SESSION['login_failures'] = 0;
            $_SESSION['login_locked_until'] = time() + 60;
        }
        fail(401, '아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    if ($user['role'] !== 'admin') {
        fail(403, '관리자 계정만 접근할 수 있습니다.');
    }

    session_regenerate_id(true);
    unset($_SESSION['login_failures'], $_SESSION['login_locked_until']);
    $_SESSION['admin'] = [
        'id'       => (int)$user['id'],
        'username' => $user['username'],
        'name'     => $user['name'],
    ];

    respond(200, ['status' => 'success', 'admin' => $_SESSION['admin'], 'csrf' => csrfToken()]);
} catch (Exception $e) {
    error_log('login: ' . $e->getMessage());
    fail(500, '로그인 처리 중 오류가 발생했습니다.');
}
