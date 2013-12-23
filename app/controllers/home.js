var	crc32 = require('crc32'),
	btoa = require('btoa'),
	moment = require('moment'),
	form = require('formidable');

var db = require("./db");

var timespan = require("../models/timespan");


smallHash = function(text) {
	var crc = crc32(text), bytes = [], hash;

	// This implementation seems to be crc32b but I don't care
	// http://stackoverflow.com/questions/15861058/what-is-the-difference-between-crc32-and-crc32b
	for(var p=0; p < crc.length; p+=2) {
		bytes.push(parseInt(crc.substr(p, 2), 16));
	}

	hash = btoa(String.fromCharCode.apply(String, bytes)).
		replace(/=*$/,'').
		replace(/\+/g, '-').
		replace(/\//g, '_');
	return hash;
};


exports.index = function(req, res){
  res.render('index', {
    title: 'Create a new paste',
    encrypted_content: false
  });
};

exports.about = function(req, res) {
	res.render('about', {
		title: 'About'
	});
};

exports.view_paste = function(req, res) {
	var id = req.params.id;

	if (!id) {
		res.send(404, "No identifier provided");
	}
	db.find_one(id, function(err, doc) {
		if (doc) {
			res.render('index', {
				title: 'Paste ' + id,
				encrypted_content: doc.content,
				expire: doc.expire == -1 ? "" : moment(doc.expire).fromNow(),
				never: doc.expire == -1,
				attachments: doc.attachments
			});
		} else {
			res.send(404, id + " not found.");
		}
	});
};

exports.upload = function(req, res) {
	var c = req.body.content;

}
