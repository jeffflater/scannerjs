var express = require('express');
var app = express();
var fs = require('fs');
var xml2js = require('xml2js');
app.use(express.logger());

app.get('/documents', function(request, response) {
  response.send('Searching for scanned documents...');
  
  fs.readFile(__dirname + '/scanner.xml', function(err, data){
	xml2js.parseString(data, function (err, result){
		console.dir(result);
		console.log(result.scanner.outputDirectory);
		console.log('done');
		
		fs.readdir(result.scanner.outputDirectory.toString(), function(err, files) {
			for(var i in files){
				var file = files[i];
				console.log(file);
			}
		});
		
		fs.watch(result.scanner.outputDirectory.toString(), function(event, targetfile){
			console.log(event);
			console.log(targetfile);
		});
		
	});
  });
  
  
});

var port = process.env.PORT || 5001;
app.listen(port, function() {
  console.log("Listening on " + port);
});