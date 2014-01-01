'use strict';

var request = require('request');
var config = require('./config/config');
var merge = require('recursive-merge');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  var reloadPort = 35729, files;

  var gruntConfiguration = {
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'index.js'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      css: {
        files: [ 'public/css/*.css' ],
        tasks: [ 'recess' ]
      },
      public_js: {
        files: [ 'public/js/*.js' ],
        tasks: [ 'uglify' ]
      },
      js: {
        files: [
          'app.js',
          'app/**/*.js',
          'config/*.js',
          'public/**/*'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      ejs: {
        files: ['app/views/**/*.ejs'],
        options: { livereload: reloadPort }
      }
    },
    recess: {
      dist: {
        options: {
          compile: true,
          compress: false
        },
        files: { 
          'compiled/css/app.css' : ['public/css/*.css']
        }
      }
    },
    uglify: {
      'app' : {
        files: { 
          'compiled/js/app.js' : [
            'public/js/jquery-1.6.1.min.js',
            'public/js/uu.js',
            'bower_components/sjcl/sjcl.js',
            'bower_components/dropzone/downloads/dropzone.js',
            'bower_components/highlightjs/highlight.pack.js'
          ]
        },
        options: {
          compress: false
        }
      }
    }
  };

  gruntConfiguration = merge(gruntConfiguration, config.gruntConfiguration);

  grunt.initConfig(gruntConfiguration);

  grunt.config.requires('watch.js.files');
  files = grunt.config('watch.js.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function(err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded)
            grunt.log.ok('Delayed live reload successful.');
          else
            grunt.log.error('Unable to make a delayed live reload.');
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('default', config.defaultGrunt);
};
