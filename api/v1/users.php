<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT id, name, username, role, status, last_login, created_at FROM users ORDER BY name ASC");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $password = password_hash($data->password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (name, username, password, role, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data->name, $data->username, $password, $data->role, 'Active']);
        echo json_encode(["message" => "User created", "id" => $conn->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if (isset($_GET['action'])) {
            if ($_GET['action'] === 'status') {
                $stmt = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
                $stmt->execute([$data->status, $data->id]);
                echo json_encode(["message" => "Status updated"]);
            } elseif ($_GET['action'] === 'password') {
                $password = password_hash($data->password, PASSWORD_DEFAULT);
                $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                $stmt->execute([$password, $data->id]);
                echo json_encode(["message" => "Password reset successfully"]);
            }
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "User deleted"]);
        break;
}
?>
