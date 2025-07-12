CREATE DATABASE IF NOT EXISTS banana_marketplace;
USE banana_marketplace;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_type ENUM('farmer', 'wholesaler') NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    variety VARCHAR(100) NOT NULL,
    quantity_kg INT NOT NULL,
    price_per_kg DECIMAL(8,2) NOT NULL,
    quality_grade ENUM('premium', 'standard', 'organic') NOT NULL,
    harvest_date DATE NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status ENUM('available', 'sold', 'expired') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    farmer_id INT NOT NULL,
    wholesaler_id INT NOT NULL,
    quantity_kg INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    delivery_date DATE,
    status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wholesaler_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data for testing (password is 'password123')
INSERT INTO users (email, password, name, user_type, phone, location) VALUES 
('farmer@example.com', '$2b$10$rQZ9QmjHp2.8PKgF5wHmvOXgPLfJmG5j2RQNfNJgHrCqFGFqjHIWu', 'John Farmer', 'farmer', '+91-9876543210', 'Kerala, India'),
('wholesaler@example.com', '$2b$10$rQZ9QmjHp2.8PKgF5wHmvOXgPLfJmG5j2RQNfNJgHrCqFGFqjHIWu', 'Mike Wholesaler', 'wholesaler', '+91-9876543211', 'Delhi, India');

-- Sample products
INSERT INTO products (farmer_id, variety, quantity_kg, price_per_kg, quality_grade, harvest_date, description, location) VALUES 
(1, 'Cavendish', 1000, 45.50, 'premium', '2025-07-20', 'Fresh organic bananas from our farm', 'Kerala, India'),
(1, 'Robusta', 800, 38.00, 'standard', '2025-07-22', 'High-quality bananas, perfect for wholesale', 'Kerala, India');
