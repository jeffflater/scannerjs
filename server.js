/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    fs = require('fs'),
    easyimage = require('easyimage'),
    jsesc = require('jsesc'),
    xml2js = require('xml2js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3005);// jshint ignore:line
app.set('views', path.join(__dirname, 'views'));// jshint ignore:line
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));// jshint ignore:line
app.use(express.static(path.join(__dirname, 'public')));// jshint ignore:line

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

///HTTP Server
var server = http.createServer(app);

//Listen via http
server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//Sock.io - Real-time Annotations
var socketServer = io.listen(server);

// Send current time to all connected clients
function sendTime() {
    socketServer.sockets.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 10000);

// Emit welcome message on connection
socketServer.sockets.on('connection', function(socket) {
    socket.emit('welcome', { message: 'Welcome!' });

    socket.on('i am client', console.log);
});