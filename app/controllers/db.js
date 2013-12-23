var  config = require("../../config/config");
var db = require('nosql').load(config.db_file, config.db_binary_directory);


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