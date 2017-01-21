var express = require('express');
var request = require('request');
var async = require('async');
var aws = require('aws-sdk')
aws.config.update({region: "us-west-2"});
aws.config.credentials = new aws.SharedIniFileCredentials({profile: 'default'});
var docClient = new aws.DynamoDB.DocumentClient();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const uuid = require('uuid/v4');

var router = express.Router();

// everything here needs to be logged in
router.use(ensureLoggedIn);

router.get('/', function(req, res, next) {
  var params = {
    TableName: "users",
    Key:{
      email: req.user.email
    }
  };

  docClient.get(params, function(err, data) {
    if (err) {
      req.flash('error', err);
      res.render('sites');
      return;
    }
    if (data.Item) {
      // get list of site_ids for the user
      var sites = data.Item.sites.map(function(a) {return a.site_id;});

      // now get all the site info
      async.mapLimit(sites, 5, function(site_id, callback) {
        var params = {
          TableName: "sites",
          Key: {
            "site_id": site_id
          }
        };
        docClient.get(params, function(err, data) {
          callback(err, data.Item);
        });
      }, function(err, results) {
        res.render('sites', {sites: results});
      });
    } else {
      req.flash('error', 'Unknown user');
      res.render('sites');
    }
  });
});

router.get('/new', function(req, res, next) {
  res.render('sites/new');
});

router.post('/new', function(req, res) {
  if(req.body.submit == 'Add') {
     add(req, res);
  } else {
    res.render('sites/index');
  }
});

router.get('/update/:id', function(req, res, next) {
  var params = {
    TableName: "sites",
    Key:{
      site_id: req.params.id,
    }
  };

  docClient.get(params, function(err, data) {
    // if there are any errors, return the error
    if (err) {
      req.flash('error', err);
      res.render('sites/update');
      return;
    }
    if (data.Item) {
      res.render('sites/update', data.Item);
    } else {
      req.flash('error', 'Unknown site');
      res.render('sites/update');
    }
  });
});

router.post('/update/:id', function(req, res) {
  if(req.body.submit == 'Update') {
    update(req, res);
  } else if(req.body.submit == 'Delete') {
    deleteSite(req, res);
  } else {
    res.render('sites/index');
  }
});

function add(req, res)
{
  // create the site
  var site = {
    site_id: uuid(),
    name: req.body.name,
    city: req.body.city,
    users: [ { email: req.user.email }]      
  }
  var params = {
    TableName:"sites",
    Item : site
  }
  docClient.put(params, function(err, data) {
    if (err) {
      req.flash('error', err);
      res.render('sites/new', site);
    } else {
      // add site to the current user
      var params = {
        TableName: "users",
        Key:{
          email: req.user.email
        },
        UpdateExpression: "SET sites = list_append(sites, :i)",
        ExpressionAttributeValues : {
          ':i': [ { site_id: site.site_id, name: site.name }  ],
        }
      };

      docClient.update(params, function(err, data) {
        if (err) {
          req.flash('error', err);
          res.render('sites/new', site);
          return;
        }

        req.session.site_id = site.site_id;
        res.redirect('/sites');
      });
    }
  });

}

function update(req, res)
{
  var params = {
    TableName:"sites",
    Key : {
      site_id: req.params.id
    },
    UpdateExpression: "SET #aname = :name, city = :city",
    ExpressionAttributeNames : {
      '#aname': "name"
    },
    ExpressionAttributeValues : {
      ':name': req.body.name,
      ':city': req.body.city
    }
  }
  docClient.update(params, function(err, data) {
    if (err) {
      req.flash('error', err);
      res.render('sites/update', params.Item);
    } else {
      res.redirect('/sites');
    }
  });
}

function deleteSite(req, res)
{
  req.flash('error', "delete not implemented at the moment.");
  res.render('sites');
  return;

}


module.exports = router;
