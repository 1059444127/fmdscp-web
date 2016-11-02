var Sequelize = require('sequelize');
var express = require('express');
var request = require('request');
var config = require('../config');
var router = express.Router();

router.get('/', function(req, response, next) {
  response.render('setupsystem');
});

router.post('/',function(req, response) {
  if(req.body.submit == 'Install DB') {
    installdb();
    req.flash('success', 'Created');
    response.render('setupsystem');
  } else if(req.body.submit == 'Stop Backend') {
    request.post(config.backend + '/api/shutdown', {},
      function(error, agentresponse, agentbody) {
        if (!error && agentresponse.statusCode == 200) {
          req.flash('success', 'Shutdown');
          response.render('setupsystem');
        }
        else {
          req.flash('error', 'Backend Failed');
          response.render('setupsystem');
        }
      });
  }
});

function installdb() {
  var sequelize = new Sequelize(config.db_name, config.db_username, config.db_password, {
    host: config.db_host,
    dialect: 'mysql',
    define: {
    charset: 'utf8',
    collate: 'utf8_general_ci'
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },

  });

  sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

  var Destination = sequelize.define('destination', {
    name: {type: Sequelize.STRING},
    destinationhost: {type: Sequelize.STRING},
    destinationport: {type: Sequelize.INTEGER},
    destinationAE: {type: Sequelize.STRING},
    sourceAE: {type: Sequelize.STRING}
  });

  var patient_study = sequelize.define('patient_study', {
    StudyInstanceUID: {type: Sequelize.STRING, unique: true},
    StudyID: {type: Sequelize.STRING},
    AccessionNumber: {type: Sequelize.STRING},
    PatientName: {type: Sequelize.STRING},
    PatientID: {type: Sequelize.STRING},
    StudyDate: {type: Sequelize.DATE},
    ModalitiesInStudy: {type: Sequelize.STRING},
    StudyDescription: {type: Sequelize.STRING},
    PatientSex: {type: Sequelize.STRING},
    PatientBirthDate: {type: Sequelize.DATE},
    ReferringPhysicianName: {type: Sequelize.STRING},
    NumberOfStudyRelatedInstances: {type: Sequelize.INTEGER}
  });

  var Series = sequelize.define('series', {
    SeriesInstanceUID: {type: Sequelize.STRING, unique: true},
    Modality: {type: Sequelize.STRING},
    SeriesDescription: {type: Sequelize.STRING},
    SeriesNumber: {type: Sequelize.INTEGER},
    SeriesDate: {type: Sequelize.DATE},
    patient_study_id: {type: Sequelize.INTEGER, references: {model: patient_study, key: 'id'} }
  });

  var Instance = sequelize.define('instance', {
    SOPInstanceUID: {type: Sequelize.STRING},
    InstanceNumber: {type: Sequelize.INTEGER},
    series_id: {type: Sequelize.INTEGER, references: {model: Series, key: 'id'} }
  });

  var Outgoing_sessions = sequelize.define('outgoing_session', {
    uuid: {type: Sequelize.STRING},
    queued: {type: Sequelize.INTEGER},
    StudyInstanceUID: {type: Sequelize.STRING},
    PatientName: {type: Sequelize.STRING},
    PatientID: {type: Sequelize.STRING},
    destination_id: {type: Sequelize.INTEGER, references: {model: Destination, key: 'id'} },
    status: {type: Sequelize.STRING},
  });
  // force: true will drop the table if it already exists
  sequelize.sync({force: false}).then(function () {
    // Table created

  });
}

module.exports = router;
