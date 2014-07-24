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

var documentModel = function (fileName, image, dateTimeSent, isSent) {
    this.fileName = fileName;
    this.image = image;
    this.dateTimeSent = dateTimeSent;
    this.isSent = isSent;
};
var documentQue = [];

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

    if (targetfile != null) {
        console.log('Found Target File!');

        var fileName = targetfile.toString();

        findDocumentByFileName(fileName, function(foundDocument){

            console.log('foundDocument: '+foundDocument);

            //Add document to QUE if NOT found...
            if (!foundDocument) {
                var document = new documentModel();
                document.fileName = fileName;
                document.image = null; //todo: figure out how to transfer image
                document.dateTimeSent = new Date();
                document.isSent = false;

                documentQue.push(document);
            }

            //Send documents that have not been sent...
            for (var document in documentQue) {
                if (documentQue[document].isSent == false) {
                    socketServer.sockets.emit('document', documentQue[document]);
                    documentQue[document].isSent = true;
                }
            }

        });
    }
});

function findDocumentByFileName(fileName, callback) {
    var foundDocument = false;
    console.log('documentQue.length: '+documentQue.length);

    for (var document in documentQue) {
        if (documentQue[document].fileName === fileName) {
            foundDocument = true;
            break;
        }
    }
    callback(foundDocument);
}