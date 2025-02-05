<?php
// auth.php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Simular autenticación
    if ($data['username'] === 'usuario' && $data['password'] === 'contraseña') {
        echo json_encode(['success' => true, 'message' => 'Autenticación exitosa']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    }
}
?>