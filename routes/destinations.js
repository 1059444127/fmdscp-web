var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(requst, response, next) {
  request('http://localhost:8080/api/destinations', function(error, agentresponse, agentbody) { procesresult(error, agentresponse, agentbody, response) });
});

function procesresult(error, agentresponse, agentbody, response) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    response.render('destinations', { results: info.result});
  } else {
    response.render('destinations', { error: 'query failed'});
  }
}

function add(requestbody, response)
{
  var name = requestbody.name;
  var destinationhost=requestbody.destinationhost;
  var destinationport = requestbody.destinationport;
  var destinationAE = requestbody.destinationAE;
  var sourceAE = requestbody.sourceAE;

  //if(name && destinationhost && destinationport && destinationAE && sourceAE)

  var formData = {
    name: name,
    destinationhost: destinationhost,
    destinationport: destinationport,
    destinationAE: destinationAE,
    sourceAE: sourceAE
  }

  require('request').debug = true;

  request.post('http://localhost:8080/api/destinations', {form: formData},
    function(error, agentresponse, agentbody) {
      if (!error && agentresponse.statusCode == 200) {
        response.redirect('/destinations');
      }
      else {
        response.render('destinations', { error: 'Error'});
      }
    });
}

router.post('/',function(requst, response) {
  if(requst.body.submit == 'Add') {
     add(requst.body, response);
  } else {
    response.render('destinations');
  }
});


module.exports = router;
