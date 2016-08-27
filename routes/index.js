var express = require('express');
var request = require('request');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, response, next) {
  response.render('index', { title: 'Express' });
});

router.post('/',function(req, response) {
  if(req.body.submit == 'Search') {
    search(req, response);
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
  console.log("query=" + querystring);

  request('http://localhost:8080/studies?' + querystring, function(error, agentresponse, agentbody) { processresult(error, agentresponse, agentbody, req, response) });
}

function processresult(error, agentresponse, agentbody, req, response) {
  var patientname = req.body.patientname;
  var patientid = req.body.patientid;
  var studydate = req.body.studydate;
  var studyinstanceuid = req.body.studyinstanceuid;

  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    if(info.result)
      for (var i = 0; i < info.result.length; i++) {
        var d = new Date(info.result[i].StudyDate);
        info.result[i].StudyDate = (1 + d.getMonth()) + "/" + (1 + d.getDay()) + "/" + d.getFullYear();
        d = new Date(info.result[i].PatientBirthDate);
        info.result[i].PatientBirthDate = (1 + d.getMonth()) + "/" + (1 + d.getDay()) + "/" + d.getFullYear();
      }

    response.render('index', { patientname, patientid, studydate, studyinstanceuid, results: info.result});
  } else {
    req.flash('error', 'Query failed');
    response.render('index', { patientname, patientid, studydate, studyinstanceuid});
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
