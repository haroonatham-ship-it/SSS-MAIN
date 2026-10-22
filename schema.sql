CREATE DATABASE IF NOT EXISTS sss_institution
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sss_institution;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  course VARCHAR(120) NOT NULL,
  education VARCHAR(120) NOT NULL,
  message VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_students_created_at (created_at),
  INDEX idx_students_course (course)
);
