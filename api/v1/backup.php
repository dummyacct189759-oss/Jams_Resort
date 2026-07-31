<?php
require_once '../config/db.php';

// This is a simplified backup script
// In a real production environment, you would use mysqldump
// Here we generate a simple JSON export of the main tables

$tables = ['villas', 'guests', 'services', 'transactions', 'users', 'settings', 'inventory'];
$backup = [];

foreach ($tables as $table) {
    try {
        $stmt = $conn->prepare("SELECT * FROM $table");
        $stmt->execute();
        $backup[$table] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Skip table if it doesn't exist
        $backup[$table] = ["error" => "Table not found. Please re-import database.sql"];
    }
}

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="jams_resort_backup_'.date('Y-m-d').'.json"');

echo json_encode($backup, JSON_PRETTY_PRINT);
exit();
?>
