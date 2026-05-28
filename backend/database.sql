-- ============================================================
-- Fernando's Fruits & Veggies – Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS vegetable_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE vegetable_store;

-- Users (admins & staff)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','staff') NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  security_question VARCHAR(255),
  security_answer VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Products inventory
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'kg',
  supplier VARCHAR(100),
  expiration_date DATE,
  low_stock_threshold INT DEFAULT 10,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sales transactions
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','gcash','card') NOT NULL,
  payment_reference VARCHAR(100),
  status ENUM('pending','completed','cancelled') DEFAULT 'completed',
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Sale items (details of each transaction)
CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Payments (tracks payment status and reference numbers)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash','gcash','card') NOT NULL,
  paymongo_payment_id VARCHAR(100),   -- stores the unique reference (REF-…)
  status ENUM('pending','paid','failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB;