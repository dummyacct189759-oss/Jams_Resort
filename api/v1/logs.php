<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get all logs
        try {
            $stmt = $conn->prepare("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 500");
            $stmt->execute();
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($logs);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create new log entry
        $data = json_decode(file_get_contents("php://input"));

        if(!empty($data->action)) {
            try {
                $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, user_name, action, details, ip_address) VALUES (?, ?, ?, ?, ?)");

                $user_id = $data->user_id ?? null;
                $user_name = $data->user_name ?? 'System';
                $action = $data->action;
                $details = $data->details ?? '';
                $ip = $_SERVER['REMOTE_ADDR'];

                if($stmt->execute([$user_id, $user_name, $action, $details, $ip])) {
                    echo json_encode(["message" => "Log entry created"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Failed to create log entry"]);
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

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>
