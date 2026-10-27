<?php
/**
 * quote.php
 * 명언 테이블(quote) 관련 공통 함수
 *
 * categories 컬럼은 쉼표 구분 문자열로 저장한다. (get_all.php는 JSON 배열/쉼표 문자열 모두 읽는다)
 * NULL이면 앱이 본문 키워드로 자동 분류한다.
 */

/** 앱(data/quote-categories.ts)의 CategoryId와 맞춘다. */
const QUOTE_CATEGORIES = ['success', 'effort', 'courage', 'happiness', 'love', 'relation', 'life', 'wisdom', 'bible'];

/** DB 값 → 카테고리 id 배열 (없으면 null) */
function parseCategories($raw): ?array
{
    if ($raw === null || trim((string)$raw) === '') return null;
    $decoded = json_decode($raw, true);
    $list = is_array($decoded) ? $decoded : explode(',', (string)$raw);
    $ids = array_values(array_filter(array_map('trim', array_map('strval', $list)), 'strlen'));
    return $ids ?: null;
}

/** 입력 배열 → 저장할 문자열 (허용된 id만, 비면 NULL) */
function serializeCategories($input): ?string
{
    if (!is_array($input)) return null;
    $ids = array_values(array_unique(array_intersect(array_map('strval', $input), QUOTE_CATEGORIES)));
    return $ids ? implode(',', $ids) : null;
}

function formatQuote(array $row): array
{
    return [
        'id'         => (int)$row['id'],
        'text'       => $row['text'],
        'author'     => $row['author'],
        'featured'   => (int)$row['featured'] === 1,
        'categories' => parseCategories($row['categories']),
    ];
}

/** 띄어쓰기·문장부호만 다른 문장은 같은 명언으로 본다. (data/quote-cleaner.js의 dedupeKey와 같은 규칙) */
function dedupeKey(string $text): string
{
    return preg_replace('/[^0-9a-zA-Z가-힣]/u', '', $text);
}

/** 같은 문장의 다른 명언 id (없으면 null) */
function findDuplicate(PDO $pdo, string $text, int $excludeId = 0): ?int
{
    $key = dedupeKey($text);
    if ($key === '') return null;
    $stmt = $pdo->prepare("SELECT `id`, `text` FROM `quote` WHERE `id` <> :id");
    $stmt->execute(['id' => $excludeId]);
    while ($row = $stmt->fetch()) {
        if (dedupeKey((string)$row['text']) === $key) return (int)$row['id'];
    }
    return null;
}
