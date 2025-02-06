<?php
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;

require __DIR__ . '/../vendor/autoload.php';

class ChatServer implements MessageComponentInterface {
    protected $clients;
    protected $pdo; // Conexión a la base de datos

    public function __construct() {
        $this->clients = new \SplObjectStorage;

        // Conexión a la base de datos
        $host = 'localhost';
        $db = 'videollamadas';
        $user = 'root';
        $pass = '';

        try {
            $this->pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Error de conexión a la base de datos: " . $e->getMessage();
            exit;
        }
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "Nuevo cliente conectado ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        // Decodificar el mensaje recibido
        $data = json_decode($msg, true);

        if (isset($data['username']) && isset($data['text'])) {
            // Guardar el mensaje en la base de datos
            $stmt = $this->pdo->prepare('INSERT INTO mensajes (usuario_id, mensaje) VALUES (?, ?)');
            $stmt->execute([$data['usuario_id'], $data['text']]);

            // Retransmitir el mensaje a todos los clientes
            foreach ($this->clients as $client) {
                if ($client !== $from) {
                    $client->send(json_encode([
                        'username' => $data['username'],
                        'text' => $data['text'],
                        'fecha' => date('Y-m-d H:i:s')
                    ]));
                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Cliente desconectado ({$conn->resourceId})\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}

// Iniciar el servidor de chat en el puerto 8081
$server = IoServer::factory(
    new WsServer(new ChatServer()),
    8081
);

echo "Servidor de chat en ejecución en el puerto 8081\n";
$server->run();
?>