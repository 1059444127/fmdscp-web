var express = require('express');
var request = require('request');
var moment = require('moment');
var async = require('async');
var router = express.Router();

router.get('/:studyinstanceuid', function(req, response, next) {
  getstudy(req, response);
});

router.post('/:studyinstanceuid/send',function(req, response) {
  if(req.body.submit == 'Send') {
    var formData = {
      destination: req.body.destination,
    }

    request.post('http://localhost:8080/api/studies/' + req.params.studyinstanceuid + '/send', {form: formData},
      function(error, agentresponse, agentbody) {
        if (!error && agentresponse.statusCode == 200) {
          req.flash('success', 'Sending');
          response.redirect('/statuslist');
        }
        else {
          req.flash('error', 'Backend Failed');
          response.redirect('/statuslist');
        }
      });
  } else {
    response.render('index');
  }
});

function getstudy(req, response) {
  async.parallel({
  destinations: function(callback) {
    request('http://localhost:8080/api/destinations',
      function(error, agentresponse, agentbody) {
        process_destinations_list(error, agentresponse, agentbody, callback)
      });
  },
  study: function(callback) {
    request.get('http://localhost:8080/api/studies/' + req.params.studyinstanceuid,
      function(error, agentresponse, agentbody) {
        if (!error && agentresponse.statusCode == 200) {
          info = JSON.parse(agentbody);
          if(info.study) {
            var d = new Date(info.study.StudyDate);
            info.study.StudyDate = (1 + d.getMonth()) + "/" + (1 + d.getDay()) + "/" + d.getFullYear();
            var d = new Date(info.study.PatientBirthDate);
            info.study.PatientBirthDate = (1 + d.getMonth()) + "/" + (1 + d.getDay()) + "/" + d.getFullYear();
          }

          if(info.series) {
            for (var i = 0;i < info.series.length; i++) {
              var item = info.series[i];
              var d = new Date(item.SeriesDate);
              item.SeriesDate = (1 + d.getMonth()) + "/" + (1 + d.getDay()) + "/" + d.getFullYear();
            }
          }

          callback(null, info.study);
        }
        else {
          callback('destination query failed', null);
        }
      });
  }},
  function(err, results) {
    if(!err)
    {
      response.render('studies', { study: results.study, destinations: results.destinations});
    } else {
      req.flash('error', 'Query failed');
      response.render('studies', { });
    }
  });
}



function process_destinations_list(error, agentresponse, agentbody, callback) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    callback(null, info.destinations);
  } else {
    callback('destination query failed', null);
  }
}


module.exports = router;
