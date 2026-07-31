<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] == 'availability') {
            $villa_id = $_GET['villa_id'];
            $check_in = $_GET['check_in'];
            $check_out = $_GET['check_out'];

            // Check if there are any overlapping transactions for this villa that are not Cancelled
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count
                FROM transactions
                WHERE villa_id = ?
                AND status != 'Cancelled'
                AND (
                    (check_in <= ? AND check_out > ?) OR
                    (check_in < ? AND check_out >= ?) OR
                    (? <= check_in AND ? >= check_out)
                )
            ");
            $stmt->execute([$villa_id, $check_in, $check_in, $check_out, $check_out, $check_in, $check_out]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(["available" => $result['count'] == 0]);
            break;
        }

        $stmt = $conn->prepare("SELECT * FROM transactions ORDER BY created_at DESC");
        $stmt->execute();
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($transactions as &$t) {
            $itemStmt = $conn->prepare("SELECT * FROM transaction_items WHERE transaction_id = ?");
            $itemStmt->execute([$t['id']]);
            $t['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode($transactions);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        try {
            $conn->beginTransaction();

            // 1. Insert Transaction
            $stmt = $conn->prepare("INSERT INTO transactions (guest_id, villa_id, guest_name, villa_name, subtotal, tax, total, deposit_amount, payment_method, status, check_in, check_out, nights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $status = $data->status ?? 'Checked-In';

            $stmt->execute([
                $data->guest_id ?? null,
                $data->villa_id ?? null,
                $data->guest_name ?? $data->guestName,
                $data->villa_name ?? $data->villaName ?? null,
                $data->subtotal,
                $data->tax,
                $data->total,
                $data->deposit_amount ?? 0.00,
                $data->payment_method ?? $data->paymentMethod ?? 'Cash',
                $status,
                $data->check_in ?? $data->checkIn ?? null,
                $data->check_out ?? $data->checkOut ?? null,
                $data->nights ?? 1
            ]);
            $transactionId = $conn->lastInsertId();

            // 2. Insert Items
            if (isset($data->items) && is_array($data->items)) {
                $itemStmt = $conn->prepare("INSERT INTO transaction_items (transaction_id, service_id, service_name, quantity, price) VALUES (?, ?, ?, ?, ?)");
                foreach ($data->items as $item) {
                    $itemStmt->execute([
                        $transactionId,
                        $item->id ?? null,
                        $item->name ?? $item->service_name,
                        $item->quantity,
                        $item->price
                    ]);
                }
            }

            // 3. Update Villa Status
            if (isset($data->villa_id)) {
                $newVillaStatus = 'Available';
                if ($status === 'Reserved') $newVillaStatus = 'Reserved';
                if ($status === 'Checked-In') $newVillaStatus = 'Occupied';

                $vStmt = $conn->prepare("UPDATE villas SET status = ? WHERE id = ?");
                $vStmt->execute([$newVillaStatus, $data->villa_id]);
            }

            // 4. Update Guest Stats (only for non-cancelled)
            if (isset($data->guest_id) && $status !== 'Cancelled') {
                $gStmt = $conn->prepare("UPDATE guests SET total_visits = total_visits + 1, total_spent = total_spent + ?, last_visit = CURDATE() WHERE id = ?");
                $gStmt->execute([$data->total, $data->guest_id]);
            }

            $conn->commit();
            echo json_encode(["message" => "Transaction completed", "id" => $transactionId]);

        } catch (Exception $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));

        if (isset($_GET['action']) && $_GET['action'] == 'status') {
            try {
                $conn->beginTransaction();

                // Update transaction status
                $stmt = $conn->prepare("UPDATE transactions SET status = ? WHERE id = ?");
                $stmt->execute([$data->status, $data->id]);

                // Sync Villa status
                $tStmt = $conn->prepare("SELECT villa_id FROM transactions WHERE id = ?");
                $tStmt->execute([$data->id]);
                $t = $tStmt->fetch(PDO::FETCH_ASSOC);

                if ($t && $t['villa_id']) {
                    $newVillaStatus = 'Available';
                    if ($data->status === 'Reserved') $newVillaStatus = 'Reserved';
                    if ($data->status === 'Checked-In') $newVillaStatus = 'Occupied';
                    if ($data->status === 'Completed') $newVillaStatus = 'Cleaning';

                    $vStmt = $conn->prepare("UPDATE villas SET status = ? WHERE id = ?");
                    $vStmt->execute([$newVillaStatus, $t['villa_id']]);
                }

                $conn->commit();
                echo json_encode(["message" => "Status updated"]);
            } catch (Exception $e) {
                if ($conn->inTransaction()) $conn->rollBack();
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;
}
?>
