<?php
require_once '../config/db.php';

// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                $stmt = $conn->prepare("SELECT * FROM villas WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $stmt = $conn->prepare("SELECT * FROM villas ORDER BY id ASC");
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            echo json_encode($result);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $raw_input = file_get_contents("php://input");
            $data = json_decode($raw_input);

            if (!$data) {
                throw new Exception("Invalid JSON input or request too large.");
            }

            $stmt = $conn->prepare("INSERT INTO villas (name, price, capacity, category, amenities, status, is_flexi, pax_prices, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data->name,
                $data->price,
                $data->capacity,
                $data->category ?? 'Standard Villa',
                $data->amenities,
                $data->status ?? 'Available',
                (isset($data->is_flexi) && $data->is_flexi) ? 1 : 0,
                isset($data->pax_prices) ? json_encode($data->pax_prices) : null,
                $data->image ?? null
            ]);
            echo json_encode(["message" => "Villa created", "id" => $conn->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            $raw_input = file_get_contents("php://input");
            $data = json_decode($raw_input);

            if (!$data) {
                throw new Exception("Invalid JSON input.");
            }

            if (isset($_GET['status_only'])) {
                $stmt = $conn->prepare("UPDATE villas SET status = ? WHERE id = ?");
                $stmt->execute([$data->status, $data->id]);
            } else {
                if (!isset($data->id)) {
                    throw new Exception("Villa ID is required for update");
                }

                $stmt = $conn->prepare("UPDATE villas SET name=?, price=?, capacity=?, category=?, amenities=?, status=?, is_flexi=?, pax_prices=?, image=? WHERE id=?");
                $stmt->execute([
                    $data->name,
                    $data->price,
                    $data->capacity,
                    $data->category ?? 'Standard Villa',
                    $data->amenities,
                    $data->status,
                    (isset($data->is_flexi) && $data->is_flexi) ? 1 : 0,
                    isset($data->pax_prices) ? json_encode($data->pax_prices) : null,
                    $data->image ?? null,
                    $data->id
                ]);
            }
            echo json_encode(["message" => "Villa updated successfully"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) throw new Exception("ID required");
            $stmt = $conn->prepare("DELETE FROM villas WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Villa deleted"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
