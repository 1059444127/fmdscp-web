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

    request.post(process.env.BACKEND_URL + '/api/studies/' + req.params.studyinstanceuid + '/send', {form: formData},
      function(error, agentresponse, agentbody) {
        if (!error && agentresponse.statusCode == 200) {
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
    request(process.env.BACKEND_URL + '/api/destinations',
      function(error, agentresponse, agentbody) {
        process_destinations_list(error, agentresponse, agentbody, callback)
      });
  },
  study: function(callback) {
    request.get(process.env.BACKEND_URL + '/api/studies/' + req.params.studyinstanceuid,
      function(error, agentresponse, agentbody) {
        if (!error && agentresponse.statusCode == 200) {
          info = JSON.parse(agentbody);
          if(info.study) {
            var item = info.study;
            item.StudyDateFormatted = moment(item.StudyDate).format('l');
            item.PatientBirthDateFormatted = moment(item.PatientBirthDate).format('l');
          }

          if(info.series) {
            for (var i = 0;i < info.series.length; i++) {
              var item = info.series[i];
              item.SeriesDateFormatted = moment(item.SeriesDate).format('l');
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
      response.render('studies', { study: results.study, destinations: results.destinations, config});
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
