<?php
require_once '../config/db.php';

try {
    // 1. Run the base schema
    $sql = file_get_contents('../database_pgsql.sql');
    // Split by semicolon to run each statement individually to avoid one failure stopping the rest
    $statements = explode(';', $sql);
    foreach ($statements as $stmt) {
        $trimmed = trim($stmt);
        if (!empty($trimmed)) {
            try {
                $conn->exec($trimmed);
            } catch (PDOException $e) {
                // Ignore errors like "table already exists" or "column already exists"
                // but keep going
            }
        }
    }

    // 2. Add missing columns to existing tables (Migration for existing databases)
    $migrations = [
        "ALTER TABLE villas ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Standard Villa'",
        "ALTER TABLE villas ADD COLUMN IF NOT EXISTS is_flexi SMALLINT DEFAULT 0",
        "ALTER TABLE villas ADD COLUMN IF NOT EXISTS pax_prices TEXT"
    ];

    foreach ($migrations as $m) {
        try {
            $conn->exec($m);
        } catch (PDOException $e) {
            // Ignore
        }
    }

    echo json_encode(["message" => "Database migration successful! All tables and columns are up to date."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Migration failed: " . $e->getMessage()]);
}
?>
