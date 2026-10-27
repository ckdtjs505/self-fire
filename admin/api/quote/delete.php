<?php
/**
 * 명언 삭제
 */
require_once __DIR__ . '/../common/bootstrap.php';
requirePost();
requireAdmin();

$input = readInput();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    fail(400, '잘못된 요청입니다.');
}

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("DELETE FROM `quote` WHERE `id` = :id");
    $stmt->execute(['id' => $id]);
    if ($stmt->rowCount() === 0) {
        fail(404, '명언을 찾을 수 없습니다.');
    }
    respond(200, ['status' => 'success']);
} catch (Exception $e) {
    error_log('delete: ' . $e->getMessage());
    fail(500, '삭제 중 오류가 발생했습니다.');
}
