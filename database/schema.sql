-- ShopSmart Database Schema
-- Run this file first: mysql -u root -p < schema.sql

DROP DATABASE IF EXISTS shopsmart;
CREATE DATABASE shopsmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopsmart;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(100),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SUBCATEGORIES
-- ============================================================
CREATE TABLE subcategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_subcat_category (category_id)
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discount_percent INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 4.0,
  review_count INT DEFAULT 0,
  stock INT DEFAULT 100,
  image_url VARCHAR(500) NOT NULL,
  category_id INT NOT NULL,
  subcategory_id INT NOT NULL,
  featured TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
  INDEX idx_products_category (category_id),
  INDEX idx_products_subcategory (subcategory_id),
  INDEX idx_products_price (price),
  INDEX idx_products_rating (rating),
  FULLTEXT INDEX idx_products_search (name, description)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  payment_method ENUM('COD','UPI','CARD') NOT NULL DEFAULT 'COD',
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','Confirmed','Shipped','Delivered') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user (user_id)
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (order_id)
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- ============================================================
-- SEED CATEGORIES + SUBCATEGORIES
-- ============================================================
INSERT INTO categories (id, name, slug, icon, image_url) VALUES
(1, 'Electronics', 'electronics', 'fa-laptop', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80'),
(2, 'Fashion', 'fashion', 'fa-shirt', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80'),
(3, 'Home & Living', 'home-living', 'fa-couch', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80');

INSERT INTO subcategories (id, category_id, name, slug, image_url) VALUES
(1, 1, 'Smartphones', 'smartphones', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'),
(2, 1, 'Laptops', 'laptops', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'),
(3, 1, 'Smartwatches', 'smartwatches', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'),
(4, 1, 'Headphones', 'headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'),
(5, 1, 'Cameras', 'cameras', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'),
(6, 1, 'Computer Accessories', 'computer-accessories', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'),
(7, 2, "Men's Clothing", 'mens-clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'),
(8, 2, "Women's Clothing", 'womens-clothing', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80'),
(9, 2, 'Footwear', 'footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80'),
(10, 2, 'Fashion Accessories', 'fashion-accessories', 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&q=80'),
(11, 3, 'Furniture', 'furniture', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'),
(12, 3, 'Home Decor', 'home-decor', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80'),
(13, 3, 'Kitchen', 'kitchen', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80'),
(14, 3, 'Lighting', 'lighting', 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=600&q=80'),
(15, 3, 'Storage', 'storage', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80');
