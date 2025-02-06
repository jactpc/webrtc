const chat = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const socket = new WebSocket('ws://localhost:8081'); // Servidor de chat

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    chat.innerHTML += `<p><strong>${message.username}:</strong> ${message.text}</p>`;
    chat.scrollTop = chat.scrollHeight;
};

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = messageInput.value;
        socket.send(JSON.stringify({ username: 'Usuario', text: text }));
        messageInput.value = '';
    }
});