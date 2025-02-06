<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Videollamada y Chat</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/styles.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1 class="text-center my-4">Videollamada y Chat</h1>
        <div class="row">
            <div class="col-md-6">
                <video id="localVideo" autoplay muted class="w-100"></video>
                <video id="remoteVideo" autoplay class="w-100"></video>
            </div>
            <div class="col-md-6">
                <div id="chat" class="border p-3" style="height: 300px; overflow-y: scroll;"></div>
                <input type="text" id="messageInput" class="form-control mt-3" placeholder="Escribe un mensaje...">
            </div>
        </div>
    </div>
    <script src="js/webrtc.js"></script>
    <script src="js/chat.js"></script>
</body>
</html>