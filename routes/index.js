var express = require('express');
var request = require('request');
var moment = require('moment');
var async = require('async');
var passport = require('passport');
var config = require('../config');
var router = express.Router();

// home page
router.get('/', function(req, response, next) {
  response.render('index', { title: 'Express' });
});

var env = {
  AUTH0_CLIENT_ID: config.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: config.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: config.AUTH0_CALLBACK_URL
};

// Render the login template
router.get('/login', function(req, res) {
    res.render('login', { env: env });
});

// Perform session logout and redirect to homepage
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Perform the final stage of authentication and redirect to '/user'
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/user');
});

router.post('/',function(req, response) {
  if(req.body.submit == 'Search') {
    search(req, response);
  } else if(req.body.submit == 'Send') {
      var formData = {
        StudyInstanceUID: req.body.StudyInstanceUID,
        destination: req.body.destination,
      }

      request.post(config.backend + '/api/studies/send', {form: formData},
        function(error, agentresponse, agentbody) {
          if (!error && agentresponse.statusCode == 200) {
            req.flash('success', 'Sent');
            response.redirect('/index');
          }
          else {
            req.flash('error', 'Backend Failed');
            response.render('index');
          }
        });
  } else {
    response.render('index');
  }
});

function search(req, response)
{
  var patientname=req.body.patientname;
  var patientid=req.body.patientid;
  var studydate = getDate(req.body.studydate);
  var studyinstanceuid = req.body.studyinstanceuid;

  var querystring = "";
  if(patientname)
    querystring += 'PatientName=' + patientname;
  if(patientid)
  {
    if(querystring.length > 0)  querystring += '&';
    querystring += 'PatientID=' + patientid;
  }
  if(studydate && studydate.isValid())
  {
    if(querystring.length > 0)  querystring += '&';
    querystring += 'StudyDate=' + studydate.format('YYYY-MM-DD');
  }
  if(studyinstanceuid)
  {
    // overide any previous query
    querystring = 'StudyInstanceUID=' + studyinstanceuid;
  }

  async.parallel({
  destinations: function(callback) {
    request(config.backend + '/api/destinations',
      function(error, agentresponse, agentbody) {
        process_destinations_list(error, agentresponse, agentbody, callback)
      });
  },
  studies: function(callback) {
    request(config.backend + '/api/studies?' + querystring,
      function(error, agentresponse, agentbody) {
        processresult(error, agentresponse, agentbody, callback)
      });
  }},
  function(err, results) {
    var patientname = req.body.patientname;
    var patientid = req.body.patientid;
    var studydate = req.body.studydate;
    var studyinstanceuid = req.body.studyinstanceuid;
    if(!err)
    {
      response.render('index', { patientname, patientid, studydate, studyinstanceuid, results: results.studies, destinations: results.destinations});
    } else {
      req.flash('error', 'Query failed');
      response.render('index', { patientname, patientid, studydate, studyinstanceuid});
    }
  });
}

function processresult(error, agentresponse, agentbody, callback) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    if(info.studies) {
      for (var i = 0;i < info.studies.length; i++) {
        var item = info.studies[i];
        item.StudyDateFormatted = moment(item.StudyDate).format('l');
        item.PatientBirthDateFormatted = moment(item.PatientBirthDate).format('l');
      }
    }

    callback(null, info.studies)
  } else {
    callback('study query failed', null);
  }
}

function process_destinations_list(error, agentresponse, agentbody, callback) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    callback(null, info.destinations);
  } else {
    callback('destination query failed', null);
  }
}


function getDate(dateAsString)
{
  var nativeDateFormat = /^\d{4}-\d{2}-\d{2}$/;
  var datepickerDateFormat = /^\d{2}\/\d{2}\/\d{2}$/;

  var result = dateAsString;

  if (nativeDateFormat.test(result))
    result = moment(result, 'YYYY-MM-DD');
  else if (datepickerDateFormat.test(result))
    result = moment(result, 'MM/DD/YY');
  else
    result = moment(result);

  return result;
}

module.exports = router;
