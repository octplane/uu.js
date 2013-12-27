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

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'uu.js'
    },
    port: 3000
  },

  test: {
    root: rootPath,
    app: {
      name: 'uu.js'
    },
    port: 3000
  },

  production: {
    root: rootPath,
    app: {
      name: 'uu.js'
    },
    port: 8080
  }
};

module.exports = config[env];


config[env].db_path = db_path;
config[env].db_file = db_file;
config[env].db_binary_directory = db_binary;
