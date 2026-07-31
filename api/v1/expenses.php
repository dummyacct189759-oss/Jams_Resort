<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $stmt = $conn->prepare("SELECT * FROM expenses ORDER BY expense_date DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->category) && !empty($data->amount) && !empty($data->expense_date)) {
            try {
                $stmt = $conn->prepare("INSERT INTO expenses (category, amount, description, expense_date) VALUES (?, ?, ?, ?)");
                if($stmt->execute([$data->category, $data->amount, $data->description ?? '', $data->expense_date])) {
                    echo json_encode(["message" => "Expense added successfully"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to add expense"]);
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data"]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if(!empty($data->id)) {
            try {
                $stmt = $conn->prepare("UPDATE expenses SET category = ?, amount = ?, description = ?, expense_date = ? WHERE id = ?");
                if($stmt->execute([$data->category, $data->amount, $data->description, $data->expense_date, $data->id])) {
                    echo json_encode(["message" => "Expense updated"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Update failed"]);
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        if(isset($_GET['id'])) {
            try {
                $stmt = $conn->prepare("DELETE FROM expenses WHERE id = ?");
                if($stmt->execute([$_GET['id']])) {
                    echo json_encode(["message" => "Expense deleted"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Delete failed"]);
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;
}
?>
