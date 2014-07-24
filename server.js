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

//File system watcher...
fs.watch('c:\\tmp', function(event, targetfile){
    var file = targetfile.toString();
    console.log('Sending file: '+file);
    socketServer.sockets.emit('document', { name: file });
});