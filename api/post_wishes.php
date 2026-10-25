<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, null, 'Gunakan metode POST');
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$name       = trim($input['name']       ?? '');
$attendance = trim($input['attendance'] ?? '');
$message    = trim($input['message']    ?? '');

$errors = [];
if ($name === '')                       $errors[] = 'Nama wajib diisi';
elseif (mb_strlen($name) > 100)         $errors[] = 'Nama maksimal 100 karakter';
elseif (mb_strlen($name) < 2)           $errors[] = 'Nama minimal 2 karakter';

if (!in_array($attendance, ['Hadir','Tidak Hadir','Masih Ragu'], true))
    $errors[] = 'Konfirmasi tidak valid';

if ($message === '')                    $errors[] = 'Ucapan wajib diisi';
elseif (mb_strlen($message) > 1000)     $errors[] = 'Ucapan maksimal 1000 karakter';
elseif (mb_strlen($message) < 3)        $errors[] = 'Ucapan minimal 3 karakter';

if (!empty($errors)) respond(false, null, implode(', ', $errors));

try {
    $pdo = getDB();
    $ip  = getClientIP();

    $spamCheck = $pdo->prepare("
        SELECT COUNT(*) FROM wishes 
        WHERE ip_address = :ip 
        AND created_at > (NOW() - INTERVAL 10 MINUTE)
    ");
    $spamCheck->execute([':ip' => $ip]);
    if ((int)$spamCheck->fetchColumn() >= 5) {
        respond(false, null, 'Terlalu banyak ucapan. Coba lagi nanti ya 🙏');
    }

    $name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    $stmt = $pdo->prepare("
        INSERT INTO wishes (name, attendance, message, ip_address, user_agent)
        VALUES (:name, :attendance, :message, :ip, :ua)
    ");
    $stmt->execute([
        ':name'       => $name,
        ':attendance' => $attendance,
        ':message'    => $message,
        ':ip'         => $ip,
        ':ua'         => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)
    ]);

    $newId = $pdo->lastInsertId();

    $stmt = $pdo->prepare("
        SELECT id, name, attendance AS status, message AS text,
               DATE_FORMAT(created_at, '%d %M %Y at %H:%i') AS time
        FROM wishes WHERE id = :id
    ");
    $stmt->execute([':id' => $newId]);
    $wish = $stmt->fetch();

    respond(true, $wish, 'Ucapan berhasil dikirim! Terima kasih 🤍');
} catch (Exception $e) {
    respond(false, null, 'Gagal menyimpan ucapan: ' . $e->getMessage());
}