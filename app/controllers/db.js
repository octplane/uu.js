var  config = require("../../config/config");
var db = require('nosql').load(config.db_file, config.db_binary_directory);
var fs = require('fs');


exports.save = function(identifier, content, cb) {
	content._id = identifier;

	db.insert(content, function() {
		cb(null, identifier);
	}, "Inserting document "+identifier);
};

exports.find_one = function(identifier, cb) {
	db.one(function (doc) {
		if (doc._id == identifier)
			return doc;
	}, function(doc) {
		cb(null, doc);
	});
}

exports.save_binary = function(file, cb) {
	fs.readFile(file.path, function(err, data) {
		var id = db.binary.insert(file.name, file.type, data);
		cb(null, id);
	});
}

exports.read_binary = function(id, cb) {
	db.binary.read(id, function(err, stream, header) {
		// header.name;   - file name
		// header.size;   - file size
		// header.type;   - content type
		// header.width;  - image width
		// header.height; - image height

		cb(err, stream, header);
	});
}