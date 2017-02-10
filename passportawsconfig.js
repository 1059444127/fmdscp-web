// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = require('wordpress-hash-node');
var aws = require('aws-sdk')
aws.config.update({region: "us-west-2"});
aws.config.credentials = new aws.SharedIniFileCredentials({profile: 'default'});
var docClient = new aws.DynamoDB.DocumentClient();

// expose this function to our app using module.exports
module.exports = function(passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    return done(null, user.email);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    var params = {
      TableName: "users",
      "KeyConditions":{
        "email":{
          "ComparisonOperator":"EQ",
          "AttributeValueList":[ id.toLowerCase().trim() ]
        }
      }
    };

    docClient.query(params, function(err, data) {
      // if there are any errors, return the error
      if (err) {
        return done(err);
      }

      if (data.Items.length == 1) {
        return done(null, data.Items[0]);
      } else {
        return done(null, false);
      }
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    var params = {
      "TableName":"users",
      "KeyConditions":{
        "email":{
          "ComparisonOperator":"EQ",
          "AttributeValueList":[ "email:" + email.toLowerCase().trim()]
        }
      }
    };
    docClient.query(params, function(err,data){
      if (err) {
        return done(err);
      }
      if (data.Items.length > 0) {
        return done(null, false, req.flash('error', 'That email is already taken.'));
      } else {
        var params = {
          "TableName":"users",
          "Item" : {
            "email":{"S": "email:" + email.toLowerCase().trim()},
            "name":{"S": req.body.name},
            "password":{"S": hasher.HashPassword(password.trim())}
          }
        }
        dynamodb.putItem(params, function(err, data) {
          if (err) {
            return done(null, false, req.flash('error', "Apologies, please try again now. ("+err+")"));
          } else {
            return done(null, { email, password } );
          }
        });

      }

    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) { // callback with email and password from our form
    var params = {
      "TableName": "users",
      "KeyConditions": {
        "email": {
          "ComparisonOperator": "EQ",
          "AttributeValueList": [ "email:" + email.toLowerCase().trim() ]
        }
      }
    };

    docClient.query(params, function(err, data) {
      if (err) {
        return done(err);
      }
      if (data.Items.length == 1) {
        if (!hasher.CheckPassword(password, data.Items[0].password)) {
          return done(null, false, req.flash('error', 'Oops! Wrong password.'));
        } else {
          return done(null, data.Items[0]);
        }
      } else {
        return done(null, false, req.flash('error', 'User not found'));
      }
    });
  }));

  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    },
    function(token, refreshToken, profile, done) {
      var params = {
        TableName: "users",
        Key: {
          email: "facebook:" + profile.id
        }
      };
      docClient.get(params, function(err, data) {
        if (err)
          return done(err);

        if (data.Item) {          
          return done(null, data.Item); // user found, return that user
        } else {
          var params = {
            "TableName": "users",
            "Item": {
              "email": "facebook:" + profile.id,
              "token": token,
              "name": profile.displayName
            }
          }
          // add the user
          docClient.putItem(params, function(err, data) {
            if (err) {
              return done(err);
            } else {
              return done(null, params.Item);
            }
          });
        }
      });
    }
  ));
};
