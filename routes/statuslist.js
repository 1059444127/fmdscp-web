var Sequelize = require('sequelize');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('statuslist', { title: 'Express' });
});

module.exports = router;
