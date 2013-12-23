var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    fs = require('fs'),
    env = process.env.NODE_ENV || 'development';

var db_path = path.join( process.env['UU_PATH'] ||
      process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
      ".uu/");

var db_file = path.join(db_path, "paste_db");

if(!fs.existsSync(db_path)) {
  console.log("Creating folder %s...", db_path);
  fs.mkdirSync(db_path, "0700");
}

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
    port: 3000
  }
};

module.exports = config[env];


config[env].db_path = db_path;
config[env].db_file = db_file;
