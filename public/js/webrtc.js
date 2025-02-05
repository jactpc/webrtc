const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let peerConnection;

// Configuración de ICE Servers (STUN/TURN)
const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Obtener acceso a la cámara y micrófono
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        localStream = stream;
    })
    .catch(error => console.error('Error al acceder a los dispositivos:', error));

// Conexión WebSocket para señalización
const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.offer) {
        // Crear una nueva conexión RTCPeerConnection
        peerConnection = new RTCPeerConnection(configuration);

        // Añadir el stream local
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Manejar el stream remoto
        peerConnection.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };

        // Manejar ICE candidates
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.send(JSON.stringify({ candidate: event.candidate }));
            }
        };

        // Establecer la oferta remota
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));

        // Crear y enviar una respuesta
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.send(JSON.stringify({ answer: answer }));
    } else if (message.candidate) {
        // Añadir el candidato ICE
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
};