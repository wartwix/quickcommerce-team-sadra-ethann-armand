CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0
);

INSERT INTO products (name, price, stock) VALUES
  ('Laptop HP', 799.99, 15),
  ('Souris Logitech', 25.50, 50),
  ('Clavier Mécanique', 89.99, 30),
  ('Écran Dell 24"', 199.00, 20),
  ('Webcam HD', 59.99, 40);
