var express = require('express'),
  path = require("path"),
  config = require('./config/config');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);

app.listen(config.port);
