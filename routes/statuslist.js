var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, res, next) {
  getstatuslist(req, res);
});

function getstatuslist(req, response) {
  request('http://localhost:8080/api/outsessions',
    function(error, agentresponse, agentbody) {
      if (!error && agentresponse.statusCode == 200) {
        info = JSON.parse(agentbody);

        if(info.sessions) {
          for (var i = 0;i < info.sessions.length; i++) {
            var item = info.sessions[i];
            var d = new Date(item.updatedAt);
            item.updatedAt = d.toLocaleDateString() + " " + d.toLocaleTimeString();
          }
        }

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
