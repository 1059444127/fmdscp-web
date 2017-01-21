var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('express-flash');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var passport = require('passport');
var passportconfig = require('./passportawsconfig');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var connection = mysql.createConnection(process.env.DATABASE_URL);
var options = {

};

var sessionStore = new MySQLStore(options, connection);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', store: sessionStore, cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true}));
app.use(flash());

passportconfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// pass the socketio server to the request
app.use(function(req, res, next) {
  req.socketio = app.socketio;
  next();
  });

// routes
var routes = require('./routes/index');
app.use('/', routes);

var studies = require('./routes/studies');
app.use('/studies', studies);

var statuslist = require('./routes/statuslist');
app.use('/statuslist', statuslist);

var destinations = require('./routes/destinations');
app.use('/destinations', destinations);

var setupsystem = require('./routes/setupsystem');
app.use('/setupsystem', setupsystem);

var user = require('./routes/user');
app.use('/user', user);

var sites = require('./routes/sites');
app.use('/sites', sites);



// webpack to compile react client files
var compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
  },
  historyApiFallback: true,
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
