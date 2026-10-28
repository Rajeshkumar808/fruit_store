CREATE TABLE IF NOT EXISTS fruits (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  image VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_fruits_name (name)
);

INSERT INTO fruits (name, price, quantity, image) VALUES
('Apple', 120.00, 50, NULL),
('Banana', 60.00, 100, NULL),
('Orange', 80.00, 75, NULL),
('Mango', 150.00, 40, NULL),
('Grapes', 90.00, 35, NULL),
('Strawberry', 180.00, 20, NULL);
