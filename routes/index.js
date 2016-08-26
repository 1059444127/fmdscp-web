var express = require('express');
var request = require('request');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(requst, response, next) {
  response.render('index', { title: 'Express' });
});

function search(requestbody, response)
{
  var patientname=requestbody.patientname;
  var patientid=requestbody.patientid;
  var studydate = getDate(requestbody.studydate);
  var studyinstanceuid = requestbody.studyinstanceuid;

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

  request('http://localhost:8080/studies?' + querystring, function(error, agentresponse, agentbody) { procesresult(error, agentresponse, agentbody, requestbody, response) });
}

function procesresult(error, agentresponse, agentbody, query, response) {
  if (!error && agentresponse.statusCode == 200) {
    info = JSON.parse(agentbody);

    // fix datetime to just date
    if(info.result)
      for (var i = 0; i < info.result.length; i++) {
        var d = new Date(info.result[i].StudyDate);
        console.log(info.result[i].StudyDate);
        console.log(d.toString());
        info.result[i].StudyDate = (1 + d.getMonth()) + "/" + (1 + d.getDay()) + "/" + d.getFullYear();
        d = new Date(info.result[i].PatientBirthDate);
        info.result[i].PatientBirthDate = (1 + d.getMonth()) + "/" + (1 + d.getDay()) + "/" + d.getFullYear();
      }

    response.render('index', { patientname: query.patientname, patientid: query.patientid, studydate: query.studydate, studyinstanceuid: query.studyinstanceuid, results: info.result});
  } else {
    response.render('index', { patientname: query.patientname, patientid: query.patientid, studydate: query.studydate, studyinstanceuid: query.studyinstanceuid, error: 'query failed'});
  }
}

router.post('/',function(requst, response) {
  if(requst.body.submit == 'Search') {
    search(requst.body, response);
  } else {
    response.render('index');
  }
});


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
