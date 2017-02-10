var Server = require('socket.io');
var request = require('request');
var aws = require('aws-sdk')
aws.config.update({region: "us-west-2"});
aws.config.credentials = new aws.SharedIniFileCredentials({profile: 'default'});
var docClient = new aws.DynamoDB.DocumentClient();
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

    getDestinations(function(err, data) {
      socket.emit('setDestinations', data);
    });
  });

// they are a frontend
  socket.on('front_end', (data) => {
    console.log('frontend connected');

    socket.join('frontends');

    // update status list with the latest
    request(process.env.BACKEND_URL + '/api/outsessions',
      function(error, agentresponse, agentbody) {
        if (!error && agentresponse.statusCode == 200) {
          info = JSON.parse(agentbody);
          socket.emit('setoutsessions', info.sessions)
        }
      }
    );
  });

});

function getDestinations(callback) {
  var params = {
    "TableName": "destinations",
    "KeyConditions":{
      "site_id":{
        "ComparisonOperator":"EQ",
        "AttributeValueList":["wowowow"]
      }
    }
  };

  docClient.query(params, function(err, data) {
    // if there are any errors, return the error
    if (err) {
      callback(err);
    }

    callback(null, data.Items);    
  });
};

io.sendoutDestination = function() {
  getDestinations(function(err, data){
    io.to('backend-xyz').emit('setDestinations', data );
  });
}


module.exports = io;
