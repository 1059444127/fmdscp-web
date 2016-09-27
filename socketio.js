var Server = require('socket.io');

var io = new Server();

io.on('connection', (socket) => {
  console.log('connection');

});

module.exports = io;
