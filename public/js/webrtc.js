// Elementos del DOM
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// Variables globales
let localStream;
let peerConnection;

// Configuración de ICE Servers (STUN/TURN)
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Servidor STUN público de Google
        // Si necesitas TURN, añade tus credenciales aquí
    ]
};

// Obtener acceso a la cámara y micrófono
async function startLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error('Error al acceder a los dispositivos:', error);
    }
}

// Conexión WebSocket para señalización
const socket = new WebSocket('ws://localhost:8080'); // Servidor de señalización

// Manejar mensajes recibidos del servidor de señalización
socket.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.offer) {
        // Crear una nueva conexión RTCPeerConnection
        peerConnection = new RTCPeerConnection(configuration);

        // Añadir el stream local a la conexión
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Manejar el stream remoto
        peerConnection.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0];
        };

        // Manejar ICE candidates
        peerConnection.onicecandidate = (event) => {
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
    } else if (message.answer) {
        // Establecer la respuesta remota
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
    } else if (message.candidate) {
        // Añadir el candidato ICE
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
};

// Iniciar la videollamada
async function startCall() {
    await startLocalStream();

    // Crear una nueva conexión RTCPeerConnection
    peerConnection = new RTCPeerConnection(configuration);

    // Añadir el stream local a la conexión
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Manejar el stream remoto
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Manejar ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.send(JSON.stringify({ candidate: event.candidate }));
        }
    };

    // Crear una oferta y enviarla al servidor de señalización
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ offer: offer }));
}

// Iniciar la llamada cuando la página esté lista
window.onload = () => {
    startCall();
};