var express = require('express');
var passport = require('passport');
var models = require('../sequelize/models');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

// Get the user profile
router.get('/', ensureLoggedIn, function(req, res, next) {
  models['User'].findOne({ where: { id: req.user.id}})
  .then(function(user) {
    if(user) {
      res.render('user', { user: user.get({plain:true}) });
    } else {

    }
  })

});

module.exports = router;
