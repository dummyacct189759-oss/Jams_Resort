-- Postgres compatible schema for JAMS Resort

CREATE TABLE IF NOT EXISTS villas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    capacity VARCHAR(100),
    category VARCHAR(255) DEFAULT 'Standard Villa',
    amenities TEXT,
    status VARCHAR(50) DEFAULT 'Available',
    is_flexi SMALLINT DEFAULT 0,
    pax_prices TEXT,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    status VARCHAR(50) DEFAULT 'New',
    last_visit DATE,
    total_visits INT DEFAULT 0,
    total_spent DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    icon VARCHAR(50),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    guest_id INT,
    villa_id INT,
    guest_name VARCHAR(255),
    villa_name VARCHAR(255),
    check_in DATE,
    check_out DATE,
    nights INT,
    subtotal DECIMAL(15, 2) NOT NULL,
    tax DECIMAL(15, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    deposit_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Checked-In',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    CONSTRAINT fk_villa FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INT,
    service_id INT,
    service_name VARCHAR(255),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance (
    id SERIAL PRIMARY KEY,
    villa_id INT,
    issue TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Normal',
    status VARCHAR(50) DEFAULT 'Pending',
    reported_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_villa FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    resort_name VARCHAR(255) DEFAULT 'JAMS Luxury Resort & Spa',
    contact_number VARCHAR(50) DEFAULT '+63 912 345 6789',
    address TEXT DEFAULT 'Brgy. Monbon Irosin',
    service_charge DECIMAL(5, 2) DEFAULT 5.00,
    currency VARCHAR(10) DEFAULT '₱'
);

-- Insert Initial Settings
INSERT INTO settings (id, resort_name, contact_number, address, service_charge)
VALUES (1, 'JAMS Luxury Resort & Spa', '+63 912 345 6789', 'Brgy. Monbon Irosin', 5.00)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Data
INSERT INTO villas (name, price, capacity, amenities, status, image) VALUES
('Royal Suite Villa 01', 15000, '4-6 Persons', 'Private Pool, WiFi, Kitchen', 'Available', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400'),
('Royal Suite Villa 02', 15000, '4-6 Persons', 'Private Pool, WiFi, Kitchen', 'Occupied', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=400'),
('Garden View Villa 05', 8500, '2-4 Persons', 'Garden, WiFi, Bathtub', 'Available', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400'),
('Ocean View Villa 08', 12000, '2-4 Persons', 'Ocean View, WiFi, Balcony', 'Cleaning', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400');

INSERT INTO services (name, price, icon, category) VALUES
('Extra Mattress', 500, 'Bed', 'Rental'),
('Cottage Rental', 1500, 'Umbrella', 'Rental'),
('Videoke Machine', 1000, 'Mic2', 'Entertainment'),
('Swimming Pool Pass', 300, 'Droplets', 'Facility');

INSERT INTO guests (name, contact, email, address, status, total_visits, total_spent) VALUES
('Juan Dela Cruz', '0912-345-6789', 'juan.dc@email.com', 'Quezon City', 'Regular', 5, 145000),
('Maria Santos', '0922-555-0123', 'maria.s@email.com', 'Cebu City', 'New', 2, 28500);

INSERT INTO users (name, username, password, role) VALUES
('Admin User', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator'),
('John Doe', 'john', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Receptionist');
