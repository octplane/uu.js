var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    fs = require('fs'),
    env = process.env.NODE_ENV || 'development';

var db_path = path.join( process.env['UU_PATH'] ||
      process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
      ".uu/");

var db_file = path.join(db_path, "paste_db");
var db_binary = path.join(db_path, "binary_files");

[db_path, db_binary].forEach(function(folder) {
  if(!fs.existsSync(folder)) {
    console.log("Creating folder %s...", folder);
    fs.mkdirSync(folder, "0700");
  }  
});

var reloadPort = 35730;

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'uu.js'
    },
    port: 3000,
    defaultGrunt: ['develop', 'recess', 'uglify', 'watch'],
    gruntConfiguration: {
      watch: {
        options: {
          livereload: reloadPort,
          spawn: false
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

      uglify: {
        'app' : {
           options: {
            beautify: {
              width: 80,
              beautify: true
            }
          }
        }
      }
    },
    extraHead: '<script type="text/javascript" src="//localhost:' + reloadPort + '/livereload.js"></script>',
    performAdditionalConfiguration: function(grunt) {
      var files;
      grunt.config.requires('watch.js.files');
      files = grunt.config('watch.js.files');
      files = grunt.file.expand(files);

      grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
        var done = this.async();
        setTimeout(function () {
          request.get('http://localhost:35730/changed?files=' + files.join(','),  function(err, res) {
              var reloaded = !err && res.statusCode === 200;
              if (reloaded)
                grunt.log.ok('Delayed live reload successful.');
              else
                grunt.log.error('Unable to make a delayed live reload.');
              done(reloaded);
            });
        }, 500);
      });
    }
  },

  production: {
    root: rootPath,
    app: {
      name: 'uu.js'
    },
    port: 8080,
    defaultGrunt: [ 'recess', 'uglify' ],
    gruntConfiguration: {
      uglify: {
        options: {
          compress: true
        }
      }
    },
    extraHead: '',
    performAdditionalConfiguration: function(grunt) {}
  }
};

module.exports = config[env];


config[env].db_path = db_path;
config[env].db_file = db_file;
config[env].db_binary_directory = db_binary;
