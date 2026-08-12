const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Client WebSocket connecté: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client WebSocket déconnecté: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    console.warn('⚠️ Client Socket.io non encore initialisé');
  }
  return io;
}

function emitScanEvent(transactionData) {
  if (io) {
    io.emit('scan_event', transactionData);
  }
}

function emitCardRecharged(rechargeData) {
  if (io) {
    io.emit('card_recharged', rechargeData);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitScanEvent,
  emitCardRecharged
};
