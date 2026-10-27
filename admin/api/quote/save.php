<?php
/**
 * 명언 추가/수정
 *   id 없으면 추가, 있으면 수정
 *   같은 문장이 이미 있으면 409 (force: true면 그대로 저장)
 */
require_once __DIR__ . '/../common/bootstrap.php';
require_once __DIR__ . '/../common/quote.php';
requirePost();
requireAdmin();

$input = readInput();
$id         = (int)($input['id'] ?? 0);
$text       = trim((string)($input['text'] ?? ''));
$author     = trim((string)($input['author'] ?? ''));
$featured   = !empty($input['featured']) ? 1 : 0;
$categories = serializeCategories($input['categories'] ?? null);
$force      = !empty($input['force']);

if (mb_strlen($text) < 5) {
    fail(400, '명언 본문은 5자 이상이어야 합니다. (앱에서 5자 미만은 제외됩니다)');
}
if (mb_strlen($text) > 1000 || mb_strlen($author) > 100) {
    fail(400, '본문은 1000자, 작가는 100자 이하로 입력해주세요.');
}

try {
    $pdo = getDbConnection();

    if (!$force) {
        $dup = findDuplicate($pdo, $text, $id);
        if ($dup !== null) {
            fail(409, "같은 문장의 명언이 이미 있습니다. (#{$dup})", ['duplicateId' => $dup]);
        }
    }

    $params = [
        'text'       => $text,
        'author'     => $author,
        'featured'   => $featured,
        'categories' => $categories,
    ];

    if ($id > 0) {
        $stmt = $pdo->prepare("
            UPDATE `quote`
            SET `text` = :text, `author` = :author, `featured` = :featured, `categories` = :categories
            WHERE `id` = :id
        ");
        $stmt->execute($params + ['id' => $id]);
        $exists = $pdo->prepare("SELECT 1 FROM `quote` WHERE `id` = :id");
        $exists->execute(['id' => $id]);
        if (!$exists->fetchColumn()) {
            fail(404, '명언을 찾을 수 없습니다.');
        }
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO `quote` (`text`, `author`, `featured`, `categories`)
            VALUES (:text, :author, :featured, :categories)
        ");
        $stmt->execute($params);
        $id = (int)$pdo->lastInsertId();
    }

    $row = $pdo->prepare("SELECT `id`, `text`, `author`, `featured`, `categories` FROM `quote` WHERE `id` = :id");
    $row->execute(['id' => $id]);

    respond(200, ['status' => 'success', 'data' => formatQuote($row->fetch())]);
} catch (Exception $e) {
    error_log('save: ' . $e->getMessage());
    fail(500, '저장 중 오류가 발생했습니다.');
}
