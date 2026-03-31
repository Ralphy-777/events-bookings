-- SQL script to create Payment table in MySQL
-- Run this in phpMyAdmin or MySQL command line

USE spdata_db;

CREATE TABLE IF NOT EXISTS user_payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    event_id INT NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    client_name VARCHAR(200) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    card_number VARCHAR(16) NULL,
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES user_booking(id) ON DELETE CASCADE,
    INDEX idx_reference (reference_number),
    INDEX idx_booking (booking_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
