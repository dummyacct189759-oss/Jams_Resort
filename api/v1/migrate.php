<?php
require_once '../config/db.php';

/**
 * Database Migration Script
 * This script automatically updates the database schema to the latest version
 * without deleting existing data.
 */

try {
    $conn->beginTransaction();

    echo "Starting migration...<br>";

    // 1. Update transactions table
    echo "Updating 'transactions' table... ";

    // Check if deposit_amount exists
    $checkColumn = $conn->query("SHOW COLUMNS FROM transactions LIKE 'deposit_amount'");
    if ($checkColumn->rowCount() == 0) {
        $conn->exec("ALTER TABLE transactions ADD COLUMN deposit_amount DECIMAL(15, 2) DEFAULT 0.00 AFTER total");
        echo "Added 'deposit_amount'. ";
    }

    // Check if status exists
    $checkColumn = $conn->query("SHOW COLUMNS FROM transactions LIKE 'status'");
    if ($checkColumn->rowCount() == 0) {
        $conn->exec("ALTER TABLE transactions ADD COLUMN status ENUM('Reserved', 'Checked-In', 'Completed', 'Cancelled') DEFAULT 'Checked-In' AFTER deposit_amount");
        echo "Added 'status'. ";
    }
    echo "Done.<br>";

    // 2. Create activity_logs table
    echo "Checking 'activity_logs' table... ";
    $conn->exec("CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_name VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    echo "Table verified.<br>";

    // 3. Update users table (ensuring roles are correct)
    echo "Updating 'users' table roles... ";
    // This is more complex because it's an ENUM update, we'll just ensure it's there
    // If you need to add 'Receptionist' which was in your SQL insert but not table definition:
    $conn->exec("ALTER TABLE users MODIFY COLUMN role ENUM('Administrator', 'Cashier', 'Receptionist') NOT NULL");
    echo "Roles updated.<br>";

    // 5. Create expenses table
    echo "Checking 'expenses' table... ";
    $conn->exec("CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Table verified.<br>";

    // 6. Update settings table
    echo "Checking 'settings' table... ";
    $conn->exec("CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        resort_name VARCHAR(255),
        contact_number VARCHAR(50),
        address TEXT,
        service_charge DECIMAL(5, 2) DEFAULT 5.00,
        currency VARCHAR(10) DEFAULT '₱'
    )");

    // Insert initial row if empty
    $checkRows = $conn->query("SELECT COUNT(*) FROM settings");
    if ($checkRows->fetchColumn() == 0) {
        $conn->exec("INSERT INTO settings (id, resort_name, contact_number, address, service_charge, currency)
                    VALUES (1, 'JAMS Luxury Resort & Spa', '+63 912 345 6789', 'Brgy. Monbon Irosin', 5.00, '₱')");
        echo "Initial settings row created. ";
    }

    // Double check for service_charge column (if table already existed but was old)
    $checkColumn = $conn->query("SHOW COLUMNS FROM settings LIKE 'service_charge'");
    if ($checkColumn->rowCount() == 0) {
        $conn->exec("ALTER TABLE settings ADD COLUMN service_charge DECIMAL(5, 2) DEFAULT 5.00");
        echo "Added 'service_charge'. ";
    }
    echo "Done.<br>";

    $conn->commit();
    echo "<br><b>Migration completed successfully!</b>";

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "<br><b>Migration failed:</b> " . $e->getMessage();
}
?>
