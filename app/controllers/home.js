var	crc32 = require('crc32'),
	btoa = require('btoa'),
	moment = require('moment');
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
			var att = [];
			doc.attachments && doc.attachments.forEach(function(at) {
				att.push("Attachment:/a/" + at.aid + "." + at.aext );
			});
			res.render('index', {
				title: 'Paste ' + id,
				encrypted_content: doc.content,
				expire: doc.expire == -1 ? "" : moment(doc.expire).fromNow(),
				never: doc.expire == -1,
				attachments: att.join("\n")
			});
		} else {
			res.send(404, id + " not found.");
		}
	});
};

var fs = require("fs");

exports.view_attn = function(req, res) {
	var id = req.params.id;
	db.read_binary(id, function(err, stream, header) {
		if (err) {
			console.log(err);
			res.send(500, "Error retrieving "+id);
		}
		res.setHeader('Expires', 0);
		res.type(header.type);
		stream.pipe(res);
	});
}

exports.paste = function(req, res) {
	var atts = null;
	if (req.body.attachments != "")
		atts = JSON.parse(req.body.attachments);
	var paste = {
		content: req.body.content,
		expire: timespan.convertPostToDuration(req.body.expiry_delay, req.body.never_expire),
		never: req.body.never_expire,
		attachments: atts
	}
	db.save(smallHash(JSON.stringify(paste)), paste, function(err, identifier) {
		res.send(200, "/p/" + identifier);
	});

};

var timespan = require("../models/timespan");

var expList = [];
timespan.validTimeStamps.forEach(function (t) {
	expList.push("'" + t.string + "'");
})

var help_text = "\nPaste API:\n" + 
	"curl -dtext='sometext' -dexpire=DURATION -XPOST http://uu.zoy.fr/\n\n" +
	"    expire can be in :\n    " + expList.join(", \n    ") + "\n" +
	"OR\n" +
	"    a number of second until expiration\n"

help = function(reason, req, res) {
	res.send(200, reason + help_text);
}

exports.paste_from_cli = function(req, res) {
	if (!req.body.expire) {
		help("Missing expire parameter.\n", req, res);
	}
	if (req.body.text) {

	}
};

exports.upload = function(req, res) {
	var f = req.files.file;
	db.save_binary(f, function(err, id) {
		res.send(200, id );
	})
};
