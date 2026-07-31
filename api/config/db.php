<?php
// 1. Handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

// 2. Database configuration for Render Postgres
// The DATABASE_URL is usually provided by Render as an environment variable
$db_url = getenv('DATABASE_URL');

if ($db_url) {
    // Parsing the Postgres URL
    $dbopts = parse_url($db_url);
    $host = $dbopts["host"];
    $port = isset($dbopts["port"]) ? $dbopts["port"] : "5432";
    $user = $dbopts["user"];
    $pass = $dbopts["pass"];
    $db_name = ltrim($dbopts["path"], '/');

    $dsn = "pgsql:host=$host;port=$port;dbname=$db_name";
} else {
    // Fallback for local development (MySQL)
    $host = "localhost";
    $db_name = "jams_resort";
    $user = "root";
    $pass = "";
    $dsn = "mysql:host=$host;dbname=$db_name";
}

try {
    $conn = new PDO($dsn, $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // For MySQL, set names. Postgres usually handles this via DSN or it's default.
    if (strpos($dsn, 'mysql') !== false) {
        $conn->exec("set names utf8");
    }
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
    exit();
}
?>
