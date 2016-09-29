var Server = require('socket.io');

var io = new Server();

io.on('connection', (socket) => {
  socket.on('agent_auth', (data) => {
    socket.agent_auth = data.access_token;
  });

  socket.on('log', (data) => {
      //console.log('log');
      // console.log(data.context + ":" + data.message);
  });

  socket.on('updateoutsessionitem', (data) => {
    io.emit('updateoutsessionitem', data)
  });
});

module.exports = io;
