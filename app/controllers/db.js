var  config = require("../../config/config");
var db = require('nosql').load(config.db_file, config.db_binary_directory);
var fs = require('fs');


exports.cleanup = function(req, res, next) {
	db.remove(function (doc) {
		if (!doc)
			return false;
		var willDelete = false;
		if (doc.expire == -1)
			willDelete = false;

		if (!doc.expire)
			willDelete = true

		willDelete = (doc.expire - Date.now()) < 0;
		if (!willDelete)
			return false;
		if (doc.attachments) {
			doc.attachments.forEach(function(at) {
				console.log("[CLEANUP] Deleting attachment " + at.aid);
				db.binary.remove(at.aid);
			});
		}
		return true;
	}, function(count) {
		console.log("[CLEANUP] Removed "+count+ " items.");
	}
	);
	next();
}

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