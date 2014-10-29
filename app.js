var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var compress = require('compression');
var RedisStore = require('connect-redis')(session);
var user = require('./lib/middleware/user');

var routes = require('./routes/index');
var users = require('./routes/users');
var reg = require('./routes/reg');
var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('facetalk'));
app.use(compress());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'facetalk',
    store: new RedisStore({
        host:'localhost',
        port:6379
    })
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(user);
app.get('/', function(req,res) {
    res.render('starter-template.html');
});

app.get('/reg',reg.showRegister);
app.post('/reg',reg.register);

app.get('/login',login.showLogin);
app.post('/login',login.login);

app.get('/logout',login.logout);

app.use('/users', users);

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
