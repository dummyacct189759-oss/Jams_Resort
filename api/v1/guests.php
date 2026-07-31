<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM guests ORDER BY created_at DESC");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO guests (name, contact, email, address, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data->name, $data->contact, $data->email, $data->address, 'New']);
        echo json_encode(["message" => "Guest created", "id" => $conn->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("UPDATE guests SET name=?, contact=?, email=?, address=? WHERE id=?");
        $stmt->execute([$data->name, $data->contact, $data->email, $data->address, $data->id]);
        echo json_encode(["message" => "Guest updated"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM guests WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Guest deleted"]);
        break;
}
?>
