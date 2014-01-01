var express = require('express'),
  path = require("path"),
  config = require('./config/config');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);

app.listen(config.port, function() {
	console.log("Server started on port "+config.port);
 	if (process.send) process.send('online');
});


process.on('message', function(message) {
 if (message === 'shutdown') {
   // performCleanup();
   process.exit(0);
 }
});