<?php
require_once '../config/db.php';

try {
    $sql = file_get_contents('../database_pgsql.sql');
    $conn->exec($sql);
    echo json_encode(["message" => "Database migration successful! All tables created."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Migration failed: " . $e->getMessage()]);
}
?>
