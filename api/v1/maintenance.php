<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT m.*, v.name as villa_name FROM maintenance m JOIN villas v ON m.villa_id = v.id ORDER BY m.created_at DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO maintenance (villa_id, issue, priority, reported_by) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->villa_id, $data->issue, $data->priority, $data->reported_by]);

        // Also update villa status to Maintenance
        $vStmt = $conn->prepare("UPDATE villas SET status = 'Maintenance' WHERE id = ?");
        $vStmt->execute([$data->villa_id]);

        echo json_encode(["message" => "Maintenance request created"]);
        break;
}
?>
