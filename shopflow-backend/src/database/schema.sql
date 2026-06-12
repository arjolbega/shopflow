CREATE DATABASE IF NOT EXISTS shopflow;
USE shopflow;

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email                 VARCHAR(255) NOT NULL UNIQUE,
  password              VARCHAR(255) NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  role                  ENUM('customer', 'admin') DEFAULT 'customer',
  is_verified           BOOLEAN DEFAULT FALSE,
  two_fa_secret         VARCHAR(255) NULL,        -- TOTP secret
  two_fa_enabled        BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email)
);

-- ─── Email Verification Tokens ────────────────────────────────
CREATE TABLE verification_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

-- ─── Password Reset Tokens ────────────────────────────────────
CREATE TABLE password_reset_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

-- ─── Refresh Tokens ───────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       VARCHAR(512) NOT NULL UNIQUE,
  family      VARCHAR(36) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  revoked     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_family (family)
);

-- ─── Categories ───────────────────────────────────────────────
CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  image_url   VARCHAR(500) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug)
);

-- ─── Products ─────────────────────────────────────────────────
CREATE TABLE products (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED NOT NULL,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  description   TEXT NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2) NULL,    -- original price for sale display
  stock         INT UNSIGNED DEFAULT 0,
  sku           VARCHAR(100) NOT NULL UNIQUE,
  is_active     BOOLEAN DEFAULT TRUE,
  is_featured   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_featured (is_featured),
  FULLTEXT INDEX idx_search (name, description)  -- enables fast full-text search
);

-- ─── Product Images ───────────────────────────────────────────
CREATE TABLE product_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  url         VARCHAR(500) NOT NULL,   -- S3 URL
  alt         VARCHAR(255) NULL,
  is_primary  BOOLEAN DEFAULT FALSE,
  sort_order  INT UNSIGNED DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
);

-- ─── Addresses ────────────────────────────────────────────────
CREATE TABLE addresses (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  full_name     VARCHAR(200) NOT NULL,
  line1         VARCHAR(255) NOT NULL,
  line2         VARCHAR(255) NULL,
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100) NOT NULL,
  postal_code   VARCHAR(20) NOT NULL,
  country       VARCHAR(100) NOT NULL DEFAULT 'US',
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- ─── Cart Items ───────────────────────────────────────────────
CREATE TABLE cart_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_cart_item (user_id, product_id),  -- no duplicate products in cart
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Orders ───────────────────────────────────────────────────
CREATE TABLE orders (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  status              ENUM('pending','processing','shipped','delivered','cancelled','refunded')
                      DEFAULT 'pending',
  subtotal            DECIMAL(10,2) NOT NULL,
  shipping_cost       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax                 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total               DECIMAL(10,2) NOT NULL,
  stripe_payment_id   VARCHAR(255) NULL,
  stripe_status       VARCHAR(100) NULL,
  shipping_address    JSON NOT NULL,               -- snapshot of address at order time
  notes               TEXT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_stripe (stripe_payment_id)
);

-- ─── Order Items ──────────────────────────────────────────────
CREATE TABLE order_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      INT UNSIGNED NOT NULL,
  product_id    INT UNSIGNED NOT NULL,
  product_name  VARCHAR(255) NOT NULL,   -- snapshot — product name at time of order
  product_image VARCHAR(500) NULL,       -- snapshot — image at time of order
  price         DECIMAL(10,2) NOT NULL,  -- snapshot — price at time of order
  quantity      INT UNSIGNED NOT NULL,
  subtotal      DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id)
);

-- ─── Product Reviews ──────────────────────────────────────────
CREATE TABLE reviews (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(255) NULL,
  body        TEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_review (product_id, user_id),  -- one review per product per user
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
);

-- ─── Admin Seed ───────────────────────────────────────────────
-- Default admin user (password: Admin@123456 — change immediately)
INSERT INTO users (email, password, first_name, last_name, role, is_verified)
VALUES (
  'admin@shopflow.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VK.s3O.Oe',
  'Shop',
  'Admin',
  'admin',
  TRUE
);

-- Key schema decisions worth knowing:
-- *shipping_address is stored as JSON snapshot on the order — if the user later changes their address, the order still shows the correct address it was shipped to
-- *order_items stores product_name, price, and product_image as snapshots — if a product is deleted or repriced, order history stays accurate
-- *FULLTEXT INDEX on products name + description — enables fast MATCH AGAINST full-text search without a separate search engine
-- *compare_price on products — used to show "was £99, now £59" sale displays
-- *UNIQUE KEY unique_cart_item — prevents the same product appearing twice in a cart, you just update quantity instead
-- *reviews has UNIQUE KEY unique_review — one review per user per product