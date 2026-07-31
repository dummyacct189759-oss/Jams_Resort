<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            $stmt = $conn->prepare("SELECT * FROM settings WHERE id = 1");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $result = null;
        }

        if (!$result) {
            // Provide default if row doesn't exist
            $result = [
                "resort_name" => "JAMS Luxury Resort & Spa",
                "contact_number" => "+63 912 345 6789",
                "address" => "Brgy. Monbon Irosin",
                "service_charge" => 5.00,
                "currency" => "₱"
            ];
        }
        echo json_encode($result);
        break;

    case 'POST':
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));

        $sql = "UPDATE settings SET
                resort_name = ?,
                contact_number = ?,
                address = ?,
                service_charge = ?
                WHERE id = 1";

        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data->resort_name,
            $data->contact_number,
            $data->address,
            $data->service_charge
        ]);

        if ($stmt->rowCount() == 0) {
            // If row 1 didn't exist for some reason, insert it
            $stmt = $conn->prepare("INSERT INTO settings (id, resort_name, contact_number, address, service_charge) VALUES (1, ?, ?, ?, ?)");
            $stmt->execute([
                $data->resort_name,
                $data->contact_number,
                $data->address,
                $data->service_charge
            ]);
        }

        echo json_encode(["message" => "Settings updated successfully"]);
        break;
}
?>
