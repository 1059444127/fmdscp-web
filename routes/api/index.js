var express = require('express');
var request = require('request');


var router = express.Router();

var studies = require('./studies');
router.use('/studies', studies);



module.exports = router;
