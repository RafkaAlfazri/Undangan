-- =====================================================
-- DATABASE: undangan_db
-- Undangan Pernikahan Masita & Haddi Fawwaz
-- Tanggal: 21 Maret 2027
-- =====================================================

CREATE DATABASE IF NOT EXISTS `undangan_db`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `undangan_db`;

-- TABEL: wishes (Ucapan & RSVP) — KOSONG
CREATE TABLE IF NOT EXISTS `wishes` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `attendance` ENUM('Hadir','Tidak Hadir','Masih Ragu') NOT NULL,
    `message` TEXT NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_attendance` (`attendance`),
    KEY `idx_visible` (`is_visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABEL: guests (Daftar Tamu) — KOSONG
CREATE TABLE IF NOT EXISTS `guests` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'Umum',
    `phone` VARCHAR(20) DEFAULT NULL,
    `sent_status` ENUM('Belum','Terkirim') DEFAULT 'Belum',
    `sent_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_slug` (`slug`),
    KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABEL: settings
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(50) NOT NULL,
    `setting_value` TEXT DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABEL: admin
CREATE TABLE IF NOT EXISTS `admin` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `nama_lengkap` VARCHAR(100) DEFAULT NULL,
    `last_login` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VIEW: v_wishes
CREATE OR REPLACE VIEW `v_wishes` AS
SELECT
    `id`,
    `name`,
    `attendance`,
    `message`,
    DATE_FORMAT(`created_at`, '%d %M %Y at %H:%i') AS `time_formatted`,
    `created_at`
FROM `wishes`
WHERE `is_visible` = 1
ORDER BY `created_at` DESC;

-- Pengaturan website
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('wedding_date',  '2027-03-21 09:00:00'),
('bride_name',    'Masita'),
('groom_name',    'Haddi Fawwaz'),
('akad_date',     '2027-03-20 08:00:00'),
('resepsi_date',  '2027-03-21 09:00:00'),
('location',      'Jl. Kona 1, Kp. Bulak Poncol, RT 001/RW 009, Kel. Cinangka, Kec. Sawangan, Kota Depok'),
('maps_url',      'https://maps.app.goo.gl/xwGNK9Lh7uBSPNiZA');

-- Admin default (username: admin, password: admin123)
INSERT INTO `admin` (`username`, `password`, `nama_lengkap`) VALUES
('admin', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1HlCS4bZJ18JuywdBxUjPXOZgzWnHi2', 'Administrator');

SELECT 'Database undangan_db berhasil dibuat ✅' AS `Status`,
       (SELECT COUNT(*) FROM wishes) AS `total_wishes`,
       (SELECT COUNT(*) FROM guests) AS `total_guests`;