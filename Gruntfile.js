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


  var gruntConfiguration = {
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'index.js'
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
  config.performAdditionalConfiguration(grunt);


  grunt.registerTask('default', config.defaultGrunt);
};
