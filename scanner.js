var express = require('express');
var app = express();
var open = require('open');
var fs = require('fs');
var xml2js = require('xml2js');
app.use(express.logger());

app.get('/', function(request, response) {
	response.send('<a href="/scanner">open scanner</a>');
});

app.get('/scanner', function(request, response) {
  response.send('Opening scanner program...');
  
  fs.readFile(__dirname + '/scanner.xml', function(err, data){
	xml2js.parseString(data, function (err, result){
		console.dir(result);
		console.log(result.scanner.exePath);
		console.log('done');
		
		open(result.scanner.exePath.toString(), function (err) {
		  if (err) throw err;
			console.log('The user has closed the scanner program!');
		  });
	});
  });
  
  
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});