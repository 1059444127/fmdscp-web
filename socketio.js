var Server = require('socket.io');
var request = require('request');
var io = new Server();

io.on('connection', (socket) => {

  // two types of connection will come in backend, or web/react

  // they are a backend
  socket.on('agent_auth', (data) => {
    console.log('backend connected');

    socket.agent_auth = data.access_token;
    socket.join('backend-xyz');

    // set up to receive log
    socket.on('log', (data) => {
        //console.log('log');
        // console.log(data.context + ":" + data.message);
    });

    // set up to receive sessions
    socket.on('updateoutsessionitem', (data) => {
      // just send it out to everyone
      socket.to('frontends').emit('updateoutsessionitem', data);
    });

  });

// they are a frontend
  socket.on('front_end', (data) => {
    console.log('frontend connected');
    
    socket.join('frontends');

    // update status list with the latest
    request('http://localhost:8080/api/outsessions',
      function(error, agentresponse, agentbody) {
        if (!error && agentresponse.statusCode == 200) {
          info = JSON.parse(agentbody);
          socket.emit('setoutsessions', info.sessions)
        }
      }
    );
  });

});

module.exports = io;
