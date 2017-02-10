var express = require('express');
var request = require('request');
var async = require('async');
var aws = require('aws-sdk')
aws.config.update({region: "us-west-2"});
aws.config.credentials = new aws.SharedIniFileCredentials({profile: 'default'});
var docClient = new aws.DynamoDB.DocumentClient({convertEmptyValues: true});
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var ensureSite = require('../ensureSite');

var router = express.Router();
//router.use(ensureLoggedIn);
//router.use(ensureSite);

router.post('/addstudy', function(req, res) {
  var studyParams = {
    TableName:"studies",
    Key : {
      site_id: req.body.site_id,
      StudyInstanceUID: req.body.StudyInstanceUID
    },
    UpdateExpression: "SET\
      StudyID = :StudyID, \
      AccessionNumber = :AccessionNumber, \
      PatientName = :PatientName, \
      PatientID = :PatientID, \
      StudyDate = :StudyDate, \
      ModalitiesInStudy = :ModalitiesInStudy, \
      StudyDescription = :StudyDescription, \
      PatientSex = :PatientSex, \
      PatientBirthDate = :PatientBirthDate, \
      ReferringPhysicianName = :ReferringPhysicianName, \
      NumberOfStudyRelatedInstances = :NumberOfStudyRelatedInstances, \
      series = if_not_exists (series, :emptymap) \
      ",
    ExpressionAttributeValues : {
      ':StudyID': req.body.StudyID,
      ':AccessionNumber': req.body.AccessionNumber,
      ':PatientName': req.body.PatientName,
      ':PatientID': req.body.PatientID,
      ':StudyDate': req.body.StudyDate,
      ':ModalitiesInStudy': req.body.ModalitiesInStudy,
      ':StudyDescription': req.body.StudyDescription,
      ':PatientSex': req.body.PatientSex,
      ':PatientBirthDate': req.body.PatientBirthDate,
      ':ReferringPhysicianName': req.body.ReferringPhysicianName,
      ':NumberOfStudyRelatedInstances': req.body.NumberOfStudyRelatedInstances,
      ':emptymap': {}
    },
    ReturnValues: "ALL_NEW"
  }

  docClient.update(studyParams, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data.Attributes);
    }
  });
});


router.post('/addseries', function(req, res, next) {
  // add the series map
  var params = {
    TableName:"studies",
    Key : {
      site_id: req.body.site_id,
      StudyInstanceUID: req.body.StudyInstanceUID
    },
    UpdateExpression: "SET\
      series.#SeriesInstanceUID = if_not_exists(series.#SeriesInstanceUID, :emptymap)",
    ExpressionAttributeNames : {
      SeriesInstanceUID: req.body.SeriesInstanceUID
    },
    ExpressionAttributeValues : {
      ':emptymap': {}
    },
    ReturnValues: "ALL_NEW"
  }

  docClient.update(params, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      var params = {
        TableName:"studies",
        Key : {
          site_id: req.body.site_id,
          StudyInstanceUID: req.body.StudyInstanceUID
        },
        UpdateExpression: "SET\
          series.#SeriesInstanceUID.Modality = :Modality, \
          series.#SeriesInstanceUID.SeriesDescription = :SeriesDescription, \
          series.#SeriesInstanceUID.SeriesNumber = :SeriesNumber, \
          series.#SeriesInstanceUID.SeriesDate = :SeriesDate, \
          series.#SeriesInstanceUID.instances = if_not_exists(series.#SeriesInstanceUID.instances, :emptymap)\
          ",
        ExpressionAttributeNames : {
          SeriesInstanceUID: req.body.SeriesInstanceUID
        },
        ExpressionAttributeValues : {
          ':Modality': req.body.Modality,
          ':SeriesDescription': req.body.SeriesDescription,
          ':SeriesNumber': req.body.SeriesNumber,
          ':SeriesDate': req.body.SeriesDate,
          ':emptymap': {}
        },
        ReturnValues: "ALL_NEW"
      }

      docClient.update(params, function(err, data) {
        if (err) {
          res.json(err);
        } else {
          res.json(data.Attributes);
        }
      });
    }
  });
});

router.post('/addinstance', function(req, res, next) {
  var newStudyParams = {
    TableName:"studies",
    Key : {
      site_id: req.body.site_id,
      StudyInstanceUID: req.body.StudyInstanceUID
    },
    UpdateExpression: "SET\
      series.#SeriesInstanceUID.instances.#SOPInstanceUIDs \
      ",
    ExpressionAttributeNames : {
      '#SeriesInstanceUID': req.body.SeriesInstanceUID,
    },
    ExpressionAttributeValues : {
      ':SOPInstanceUIDs': req.body.SOPInstanceUIDs
    },
    ReturnValues: "ALL_NEW"
  }

  docClient.update(studyParams, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data.Attributes);      
    }
  });
});


router.get('/studiesinfo', function(req, res, next) {
  var params = {
    "TableName": "studies",
    "KeyConditions":{
      "site_id":{
        "ComparisonOperator":"EQ",
        "AttributeValueList": [ req.session.site_id ]
      }
    }
  };

  docClient.query(params, function(err, data) {
    // if there are any errors, return the error
    if (err) {
      req.flash('error', err);
      res.render('destinations/index');
      return;
    }

    res.render('destinations/index', { results: data.Items});
  });
});


module.exports = router;
