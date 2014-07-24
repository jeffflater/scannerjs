/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    fs = require('fs'),
    i64 = require('img-to-64'),
    mime = require('mime');

var app = express();
var tempDirectory = 'c:\\tmp'

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

//Sock.io - Real-time Communication
var socketServer = io.listen(server);

//File system watcher...
fs.watch(tempDirectory, function(event, targetFile){
    if (targetFile != null) {
        console.log('Found Target File!');

        var fileName = targetFile.toString();

        getBase64StringFromImage(fileName, function(b64ImageString){
            findDocumentByFileName(fileName, function(foundDocument){
                //Add document to QUE if NOT found...
                if (!foundDocument) {
                    var document = new documentModel();
                    document.fileName = fileName;
                    document.image = b64ImageString;
                    document.dateTimeSent = new Date();
                    document.isSent = false;
                    documentQue.push(document);

                    var info = mime.lookup(tempDirectory+'\\'+fileName);
                    console.log("info-test:", info);
                }
            });
        });
    }
});

//Monitor and transfer QUE'd documents
setInterval(transferDocumentsInQue, 1000);

function transferDocumentsInQue() {
    //Send documents that have not been sent...
    for (var document in documentQue) {
        if (documentQue[document].isSent == false) {
            documentQue[document].isSent = true;
            socketServer.sockets.emit('document', documentQue[document]);
        }
    }
}

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

function getBase64StringFromImage(fileName, callback){
    var file = tempDirectory+'\\'+fileName;
    var mimeType = mime.lookup(file);
    var mimeTypeString = mimeType.toString();

    if (mimeTypeString.indexOf('image') > -1) {
        i64.getImageStrings({
            files: [file],
            css: true
        }, function(err, b64Strings){
            if (err) {
                console.log('err: '+err);
                callback(null);
            }
            b64Strings.forEach(function(b64ImageString){
                console.log('b64ImageString: '+b64ImageString);
                callback(b64ImageString);
            });
        });
    }else{
        callback(null);
    }
}