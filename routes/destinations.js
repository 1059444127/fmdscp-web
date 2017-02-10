var express = require('express');
var request = require('request');
var aws = require('aws-sdk')
aws.config.update({region: "us-west-2"});
aws.config.credentials = new aws.SharedIniFileCredentials({profile: 'default'});
var docClient = new aws.DynamoDB.DocumentClient();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var ensureSite = require('./ensureSite');

var router = express.Router();
router.use(ensureLoggedIn);
router.use(ensureSite);

router.get('/', function(req, res, next) {
  var params = {
    "TableName": "destinations",
    "KeyConditions":{
      "site_id":{
        "ComparisonOperator":"EQ",
        "AttributeValueList": [ req.session.site_id ]
      }
    }
  };

  docClient.query(params, function(err, data) {
    // if there are any errors, return the error
    if (err) {
      req.flash('error', err);
      res.render('destinations/index');
      return;
    }

    res.render('destinations/index', { results: data.Items});
  });
});

router.get('/new', function(req, res, next) {
  res.render('destinations/new');
});

router.post('/new', function(req, res) {
  if(req.body.submit == 'Add') {
     add(req, res);
  } else {
    res.render('destinations/index');
  }
});

router.get('/update/:id',  function(req, res, next) {
  var params = {
    TableName: "destinations",
    Key:{
      site_id: req.session.site_id,
      id: parseInt(req.params.id)
    }
  };

  docClient.get(params, function(err, data) {
    // if there are any errors, return the error
    if (err) {
      req.flash('error', err);
      res.render('destinations/update');
      return;
    }
    if (data.Item) {
      res.render('destinations/update', data.Item);
    } else {
      req.flash('error', 'Unknown destination');
      res.render('destinations/update');
    }
  });
});

router.post('/update/:id', function(req, res) {
  if(req.body.submit == 'Update') {
    update(req, res);
  } else if(req.body.submit == 'Delete') {
    deleteDestination(req, res);
  } else {
    res.render('destinations/index');
  }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function add(req, res)
{
    var params = {
      TableName:"destinations",
      Item : {
        site_id: req.session.site_id,
        id: getRandomInt(1, 1000),
        name: req.body.name,
        destinationhost: req.body.destinationhost,
        destinationport: parseInt(req.body.destinationport),
        destinationAE: req.body.destinationAE,
        sourceAE: req.body.sourceAE
      }
    }
    docClient.put(params, function(err, data) {
      if (err) {
        req.flash('error', err);
        res.render('destinations/new', params.Item);
      } else {
        res.redirect('/destinations');
        req.socketio.sendoutDestination();
      }
    });
}


function update(req, res)
{
  var params = {
    TableName:"destinations",
    Key : {
      site_id: req.session.site_id,
      id: parseInt(req.params.id)
    },
    UpdateExpression: "SET #aname = :name, destinationhost = :destinationhost, destinationport = :destinationport, destinationAE = :destinationAE, sourceAE = :sourceAE",
    ExpressionAttributeNames : {
      '#aname': "name"
    },
    ExpressionAttributeValues : {
      ':name': req.body.name,
      ':destinationhost': req.body.destinationhost,
      ':destinationport': parseInt(req.body.destinationport),
      ':destinationAE': req.body.destinationAE,
      ':sourceAE': req.body.sourceAE
    }
  }
  docClient.update(params, function(err, data) {
    if (err) {
      req.flash('error', err);
      res.render('destinations/update', params.Item);
    } else {
      res.redirect('/destinations');
      req.socketio.sendoutDestination();
    }
  });
}

function deleteDestination(req, res)
{
  var params = {
    TableName: "destinations",
    Key:{
      site_id: req.session.site_id,
      id: parseInt(req.params.id)
    }
  };

  docClient.delete(params, function(err, data) {
    // if there are any errors, return the error
    if (err) {
      req.flash('error', err);
      res.render('destinations/update', params.Item);
      return;
    }

    res.redirect('/destinations');
    req.socketio.sendoutDestination();
  });
}


module.exports = router;
