<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM services ORDER BY category ASC");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO services (name, price, icon, category, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->name,
            $data->price,
            $data->icon ?? 'Tag',
            $data->category,
            $data->status ?? 'Available'
        ]);
        echo json_encode(["message" => "Service created", "id" => $conn->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $action = $_GET['action'] ?? '';

        if ($action === 'status') {
            $stmt = $conn->prepare("UPDATE services SET status = ? WHERE id = ?");
            $stmt->execute([$data->status, $data->id]);
            echo json_encode(["message" => "Status updated"]);
        } else {
            $stmt = $conn->prepare("UPDATE services SET name=?, price=?, category=?, status=? WHERE id=?");
            $stmt->execute([$data->name, $data->price, $data->category, $data->status, $data->id]);
            echo json_encode(["message" => "Service updated"]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM services WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Service deleted"]);
        break;
}
?>
