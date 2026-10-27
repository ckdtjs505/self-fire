<?php
/**
 * 대시보드 요약: 전체/대표/카테고리 지정 수, 카테고리별 수, 최근 추가된 명언
 */
require_once __DIR__ . '/../common/bootstrap.php';
require_once __DIR__ . '/../common/quote.php';
requireAdmin();

try {
    $pdo = getDbConnection();

    $summary = $pdo->query("
        SELECT COUNT(*) AS total,
               COALESCE(SUM(`featured` = 1), 0) AS featured,
               COALESCE(SUM(`categories` IS NOT NULL AND TRIM(`categories`) <> ''), 0) AS categorized,
               MAX(`id`) AS max_id
        FROM `quote`
    ")->fetch();

    $byCategory = array_fill_keys(QUOTE_CATEGORIES, 0);
    $rows = $pdo->query("SELECT `categories` FROM `quote` WHERE `categories` IS NOT NULL AND TRIM(`categories`) <> ''");
    foreach ($rows as $row) {
        foreach (parseCategories($row['categories']) ?? [] as $id) {
            if (isset($byCategory[$id])) $byCategory[$id]++;
        }
    }

    $recent = $pdo->query("SELECT `id`, `text`, `author`, `featured`, `categories` FROM `quote` ORDER BY `id` DESC LIMIT 5")->fetchAll();

    respond(200, [
        'status' => 'success',
        'data'   => [
            'total'       => (int)$summary['total'],
            'featured'    => (int)$summary['featured'],
            'categorized' => (int)$summary['categorized'],
            'maxId'       => (int)$summary['max_id'],
            'byCategory'  => $byCategory,
            'recent'      => array_map('formatQuote', $recent),
        ],
    ]);
} catch (Exception $e) {
    error_log('stats: ' . $e->getMessage());
    fail(500, '통계를 불러오는 중 오류가 발생했습니다.');
}
