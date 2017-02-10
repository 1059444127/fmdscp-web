var express = require('express');
var passport = require('passport');
var aws = require('aws-sdk')
aws.config.update({region: "us-west-2"});
aws.config.credentials = new aws.SharedIniFileCredentials({profile: 'default'});
var docClient = new aws.DynamoDB.DocumentClient();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var ensureSite = require('./ensureSite')
var router = express.Router();

// Get the user profile
router.get('/profile', ensureLoggedIn, function(req, res, next) {
  res.render('user/profile', { user: req.user, site_id: req.session.site_id });
});

router.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/switchsite', ensureLoggedIn, function(req, res) {
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
      res.render('user/switchsite', {sites: data.Item.sites, site_id: req.session.site_id});
    }
  });
});

router.post('/switchsite', ensureLoggedIn, function(req, res) {
  req.session.site_id = req.body.site_id;
  res.redirect('/');
});



module.exports = router;
