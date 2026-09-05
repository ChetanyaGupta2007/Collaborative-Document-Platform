const { Server } = require('socket.io');

let io;

function initIO(server, corsOptions) {
    io = new Server(server, corsOptions);
    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized yet");
    }

    return io;
}

module.exports = { initIO, getIO };