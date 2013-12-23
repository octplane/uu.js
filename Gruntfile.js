'use strict';

var request = require('request');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-recess');

  var reloadPort = 35729, files;

  grunt.initConfig({
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
        files: [
          'public/css/*.css'
        ],
        tasks: [ 'recess' ]
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
          // ,'compiled/js/app.js' : [
          //   'public/js/uu.js',
          //   'public/js/sjcl.js',
          //   'public/js/dropzone.js',
          //   'public/js/jquery-1.6.1.min.js',
          //   'public/hi/highlight.pack.js'] 
        }
      }
    }
  });

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

  grunt.registerTask('default', ['develop', 'recess', 'watch']);
};
