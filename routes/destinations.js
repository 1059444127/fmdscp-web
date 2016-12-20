var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, response, next) {
  request(process.env.BACKEND_URL + '/api/destinations', function(error, agentresponse, agentbody) { process_destinations_list(error, agentresponse, agentbody, req, response) });
});

router.get('/new', function(req, response, next) {
  response.render('destinations/new');
});

router.post('/new', function(req, response) {
  if(req.body.submit == 'Add') {
     add(req, response);
  } else {
    response.render('destinations/index');
  }
});

router.get('/update/:id',  function(req, response, next) {
  request(process.env.BACKEND_URL + '/api/destinations/' + req.params.id, function(error, agentresponse, agentbody) { process_destinations_get(error, agentresponse, agentbody, req, response) });
});

router.post('/update/:id', function(req, response) {
  if(req.body.submit == 'Update') {
    update(req, response);
  } else if(req.body.submit == 'Delete') {
    // update(req, response);
    response.redirect('/destinations');
  } else {
    response.render('destinations/index');
  }
});

function process_destinations_list(error, agentresponse, agentbody, req, response) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    response.render('destinations/index', { results: info.destinations});
  } else {
    req.flash('error', 'Failed');
    response.render('destinations/index');
  }
}

function process_destinations_get(error, agentresponse, agentbody, req, response) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    var name = info.destination.name;
    var destinationhost = info.destination.destinationhost;
    var destinationport = info.destination.destinationport;
    var destinationAE = info.destination.destinationAE;
    var sourceAE = info.destination.sourceAE;

    response.render('destinations/update', { name, destinationhost, destinationport, destinationAE, sourceAE});
  } else {
    req.flash('error', 'Failed');
    response.render('destinations/update');
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

  request.post(process.env.BACKEND_URL + '/api/destinations', {form: formData},
    function(error, agentresponse, agentbody) {
      if (!error && agentresponse.statusCode == 200) {
        req.flash('success', 'Added');
        response.redirect('/destinations');
      } else {
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

  request.post(process.env.BACKEND_URL + '/api/destinations/' + req.params.id, {form: formData},
    function(error, agentresponse, agentbody) {
      if (!error && agentresponse.statusCode == 200) {
        req.flash('success', 'Updated');
        response.redirect('/destinations');
      } else {
        req.flash('error', 'Failed');
        response.render('destinations/update', { name, destinationhost, destinationport, destinationAE, sourceAE});
      }
    });
}

module.exports = router;
