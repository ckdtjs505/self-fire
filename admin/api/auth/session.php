<?php
/**
 * 현재 로그인 상태 확인. 로그인 중이면 CSRF 토큰을 함께 내려준다.
 */
require_once __DIR__ . '/../common/bootstrap.php';

$admin = currentAdmin();
respond(200, $admin
    ? ['status' => 'success', 'loggedIn' => true, 'admin' => $admin, 'csrf' => csrfToken()]
    : ['status' => 'success', 'loggedIn' => false]);
