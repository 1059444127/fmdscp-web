var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, response, next) {
  request('http://localhost:8080/api/destinations', function(error, agentresponse, agentbody) { processresult(error, agentresponse, agentbody, req, response) });
});

router.get('/new', function(req, response, next) {
  response.render('destinations/new');
});

router.get('/update', function(req, response, next) {
  response.render('destinations/update');
});

router.post('/new',function(req, response) {
  if(req.body.submit == 'Add') {
     add(req, response);
  } else {
    response.render('destinations/index');
  }
});

router.post('/update',function(req, response) {
  if(req.body.submit == 'Update') {
     update(req, response);
  } else {
    response.render('destinations/index');
  }
});

function processresult(error, agentresponse, agentbody, req, response) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    response.render('destinations/index', { results: info.result});
  } else {
    req.flash('error', 'Failed');
    response.render('destinations/index', { error: 'query failed'});
  }
}

function add(req, response)
{
  var name = req.body.name;
  var destinationhost=req.body.destinationhost;
  var destinationport = req.body.destinationport;
  var destinationAE = req.body.destinationAE;
  var sourceAE = req.body.sourceAE;

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
        req.flash('success', 'Added');
        response.redirect('/destinations/index');
      }
      else {
        req.flash('error', 'Query Failed');
        response.render('destinations/new', { name, destinationhost, destinationport, destinationAE, sourceAE});
      }
    });
}


function update(req, response)
{
  var name = req.body.name;
  var destinationhost=req.body.destinationhost;
  var destinationport = req.body.destinationport;
  var destinationAE = req.body.destinationAE;
  var sourceAE = req.body.sourceAE;

  //if(name && destinationhost && destinationport && destinationAE && sourceAE)

  var formData = {
    name: name,
    destinationhost: destinationhost,
    destinationport: destinationport,
    destinationAE: destinationAE,
    sourceAE: sourceAE
  }

  require('request').debug = true;

  request.post('http://localhost:8080/api/destinations/', {form: formData},
    function(error, agentresponse, agentbody) {
      if (!error && agentresponse.statusCode == 200) {
        req.flash('success', 'Updated');
        response.redirect('/destinations/index');
      }
      else {
        req.flash('error', 'Failed');
        response.render('destinations/new', { name, destinationhost, destinationport, destinationAE, sourceAE});
      }
    });
}



module.exports = router;
