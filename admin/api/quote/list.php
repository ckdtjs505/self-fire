<?php
/**
 * 명언 목록 (검색·필터·페이지)
 *   q         본문/작가 검색어
 *   featured  1이면 대표 명언만
 *   category  카테고리 id, 'none'이면 미지정(자동 분류)만
 *   sort      'id_desc'(기본) | 'id_asc'
 *   page, limit
 */
require_once __DIR__ . '/../common/bootstrap.php';
require_once __DIR__ . '/../common/quote.php';
requireAdmin();

$q        = trim($_GET['q'] ?? '');
$featured = ($_GET['featured'] ?? '') === '1';
$category = $_GET['category'] ?? '';
$sort     = ($_GET['sort'] ?? '') === 'id_asc' ? 'ASC' : 'DESC';
$page     = max(1, (int)($_GET['page'] ?? 1));
$limit    = min(100, max(1, (int)($_GET['limit'] ?? 20)));

$where = [];
$params = [];

if ($q !== '') {
    if (ctype_digit($q)) {
        $where[] = "(`id` = :qid OR `text` LIKE :q1 OR `author` LIKE :q2)";
        $params['qid'] = (int)$q;
    } else {
        $where[] = "(`text` LIKE :q1 OR `author` LIKE :q2)";
    }
    $like = '%' . addcslashes($q, '%_\\') . '%';
    $params['q1'] = $like;
    $params['q2'] = $like;
}
if ($featured) {
    $where[] = "`featured` = 1";
}
if ($category === 'none') {
    $where[] = "(`categories` IS NULL OR TRIM(`categories`) = '')";
} elseif (in_array($category, QUOTE_CATEGORIES, true)) {
    // 쉼표 구분 문자열과 JSON 배열("...") 저장 형식 모두 찾는다.
    $where[] = "(FIND_IN_SET(:cat1, REPLACE(`categories`, ' ', '')) > 0 OR `categories` LIKE :cat2)";
    $params['cat1'] = $category;
    $params['cat2'] = '%"' . $category . '"%';
}

$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

try {
    $pdo = getDbConnection();

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `quote`" . $whereSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $offset = ($page - 1) * $limit;
    $stmt = $pdo->prepare(
        "SELECT `id`, `text`, `author`, `featured`, `categories` FROM `quote`" . $whereSql .
        " ORDER BY `id` " . $sort . " LIMIT " . $limit . " OFFSET " . $offset
    );
    $stmt->execute($params);

    respond(200, [
        'status' => 'success',
        'data'   => array_map('formatQuote', $stmt->fetchAll()),
        'total'  => $total,
        'page'   => $page,
        'limit'  => $limit,
    ]);
} catch (Exception $e) {
    error_log('list: ' . $e->getMessage());
    fail(500, '목록을 불러오는 중 오류가 발생했습니다.');
}
