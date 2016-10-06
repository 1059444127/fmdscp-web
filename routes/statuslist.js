var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, res, next) {
  getstatuslist(req, res);
});


router.post('/cancel', function(req, res, next) {
  request.post('http://localhost:8080/api/outsessions/cancel', { form: {uuid: req.body.uuid} },
    function(error, agentresponse, agentbody) {
      if (!error && agentresponse.statusCode == 200) {
        res.json({result: 'ok'});
      }
      else {
        res.json({result: 'fail'});
      }
    });
});


function getstatuslist(req, response) {
  request('http://localhost:8080/api/outsessions',
    function(error, agentresponse, agentbody) {
      if (!error && agentresponse.statusCode == 200) {
        info = JSON.parse(agentbody);
        response.render('statuslist', { sessions: info.sessions});
      }
      else {
        req.flash('error', 'Backend Failed');
        response.render('statuslist', { sessions: []});
      }
    }
  );
}


module.exports = router;
