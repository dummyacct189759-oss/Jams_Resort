<?php
require_once '../config/db.php';

try {
    // 1. Run the base schema
    $sql = file_get_contents('../database_pgsql.sql');
    $conn->exec($sql);

    // 2. Add missing columns to existing tables (Migration for existing databases)
    $migrations = [
        "ALTER TABLE villas ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Standard Villa'",
        "ALTER TABLE villas ADD COLUMN IF NOT EXISTS is_flexi SMALLINT DEFAULT 0",
        "ALTER TABLE villas ADD COLUMN IF NOT EXISTS pax_prices TEXT"
    ];

    foreach ($migrations as $m) {
        $conn->exec($m);
    }

    echo json_encode(["message" => "Database migration successful! All tables and columns are up to date."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Migration failed: " . $e->getMessage()]);
}
?>
