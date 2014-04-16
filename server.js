var http = require('http'),
    fs = require('fs'),
	easyimage = require('easyimage'),
	jsesc = require('jsesc'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    //res.writeHead(200, {'Content-Type': 'text/html'});
    //res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);
var xml2js = require('xml2js');

fs.readFile(__dirname + '/scanner.xml', function(err, data){
	xml2js.parseString(data, function (err, result){
		console.dir(result);
		console.log(result.scanner.outputDirectory);
		console.log('done');
		
		fs.watch(result.scanner.outputDirectory.toString(), function(event, targetfile){
			console.log(event);
			console.log(targetfile);
			var srcimg = result.scanner.outputDirectory.toString() + '\\' + targetfile;
			console.log(srcimg);
			
			var srci = 'c:\\temp\\Image.jpg';
			var desti = 'c:\\temp\\output\\Imageout.jpg';

			easyimage.thumbnail(
{
src:srci, dst:desti,
width:128, height:128,
x:0, y:0
},
function(err, image) {
if (err) throw err;
console.log('Thumbnail created');
console.log(image);
}
);
			
			io.sockets.emit('time', { time: targetfile.toString() });
		});
		
	});
  });

// Send current time to all connected clients
function sendTime() {
    io.sockets.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
//setInterval(sendTime, 10000);

// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    socket.emit('welcome', { message: 'Welcome!' });

    socket.on('i am client', console.log);
});

app.listen(3000);