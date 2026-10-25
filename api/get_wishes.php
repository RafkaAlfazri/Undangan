<?php
require_once 'config.php';

try {
    $limit  = isset($_GET['limit'])  ? max(1, min(500, (int)$_GET['limit'])) : 100;
    $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset'])          : 0;
    $pdo = getDB();

    $totalStmt = $pdo->query("SELECT COUNT(*) FROM wishes WHERE is_visible = 1");
    $total = (int) $totalStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT id, name, attendance AS status, message AS text,
               DATE_FORMAT(created_at, '%d %M %Y at %H:%i') AS time,
               created_at
        FROM wishes
        WHERE is_visible = 1
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $wishes = $stmt->fetchAll();

    $stats = $pdo->query("
        SELECT 
            SUM(attendance = 'Hadir')       AS hadir,
            SUM(attendance = 'Tidak Hadir') AS tidak_hadir,
            SUM(attendance = 'Masih Ragu')  AS masih_ragu
        FROM wishes WHERE is_visible = 1
    ")->fetch();

    respond(true, [
        'wishes' => $wishes,
        'total'  => $total,
        'limit'  => $limit,
        'offset' => $offset,
        'statistik' => [
            'hadir'       => (int)($stats['hadir']       ?? 0),
            'tidak_hadir' => (int)($stats['tidak_hadir'] ?? 0),
            'masih_ragu'  => (int)($stats['masih_ragu']  ?? 0),
        ]
    ]);
} catch (Exception $e) {
    respond(false, null, 'Gagal memuat data: ' . $e->getMessage());
}