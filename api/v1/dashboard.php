<?php
require_once '../config/db.php';

$stats = [];

// 1. Revenue Today
$stmt = $conn->prepare("SELECT SUM(total) as today_revenue FROM transactions WHERE DATE(created_at) = CURDATE()");
$stmt->execute();
$stats['today_revenue'] = $stmt->fetch(PDO::FETCH_ASSOC)['today_revenue'] ?? 0;

// 2. Total Transactions
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM transactions");
$stmt->execute();
$stats['total_transactions'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

// 3. Active Guests (Guests checked in today or with active occupied villas)
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM villas WHERE status = 'Occupied'");
$stmt->execute();
$stats['occupied_villas'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

// 4. Available Villas
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM villas WHERE status = 'Available'");
$stmt->execute();
$stats['available_villas'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

// 5. Total Guests
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM guests");
$stmt->execute();
$stats['total_guests'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

echo json_encode($stats);
?>
