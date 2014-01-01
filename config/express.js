var express = require('express'),
  config = require('./config'),
  db = require("../app/controllers/db");


var ejs = require('ejs');
ejs.open = '<?';
ejs.close = '?>';


module.exports = function(app, config) {
  app.configure(function () {
    app.set('port', config.port);
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'ejs');

    app.use(express.compress());

    app.use(function(req, res, next) {
      res.locals.extraHead = config.extraHead
      next();
    });

    app.use(express.favicon(config.root + '/public/img/favicon.ico'));
    app.use('/c/', express.static(config.root + '/compiled/'));
    app.use('/b/', express.static(config.root + '/bower_components/'));
    
    app.use(express.static(config.root + '/public/'));

    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    app.use(db.cleanup);
    // Main routing table
    app.use(app.router);

    // And the 404 finally
    app.use(function(req, res) {
      res.status(404).render('404', { title: '404' });
    });

  });
};
