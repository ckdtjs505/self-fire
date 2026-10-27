<?php
/**
 * 대표 명언(featured) 켜기/끄기 — 목록에서 바로 토글할 때 쓴다.
 */
require_once __DIR__ . '/../common/bootstrap.php';
requirePost();
requireAdmin();

$input = readInput();
$id = (int)($input['id'] ?? 0);
$featured = !empty($input['featured']) ? 1 : 0;

if ($id <= 0) {
    fail(400, '잘못된 요청입니다.');
}

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("UPDATE `quote` SET `featured` = :featured WHERE `id` = :id");
    $stmt->execute(['featured' => $featured, 'id' => $id]);
    respond(200, ['status' => 'success', 'featured' => $featured === 1]);
} catch (Exception $e) {
    error_log('featured: ' . $e->getMessage());
    fail(500, '처리 중 오류가 발생했습니다.');
}
