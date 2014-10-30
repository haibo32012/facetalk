var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var uuid = require('node-uuid');
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

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log('Server listening at port %d',port);
});

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
    res.status(404);
    res.render('404.html');
    return;
});

app.use(function(req,res,next) {
    res.status(403);
    res.render('403.html');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.html', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
        message: err.message,
        error: {}
    });
});

// Socket.io Chat
var usernames = {};
var numUsers = 0;
var currentRoom = {};

io.on('connection', function (socket) {
  //socket.join('home');
  socket.on('rooms',function() {
    //socket.emit('rooms',io.sockets.manager.rooms);
  });
  
  var addedUser = false;
  var fileName = uuid.v1() + '.webm';
  var videoFile = path.join('public/video',fileName);
  socket.on('new message', function(data) {
    console.log(data.video);
    fs.writeFileSync(videoFile,data.video,'base64',function(err) {
      if (err) throw err;
      console.log('successful saved!');
    });
    socket.broadcast.emit('new message', {
        username: socket.username,
        video: "video/" + fileName,
        message: data.message
      });
  });

  // when the client emits 'new message', this listens and executes


  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});



//module.exports = app;
