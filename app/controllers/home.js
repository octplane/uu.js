var crc32 = require('crc32'),
  btoa = require('btoa'),
  moment = require('moment'),
  sjcl = require('sjcl'),
  crypto = require('crypto');

var db = require("./db");

var timespan = require("../models/timespan");

crypto.randomBytes(1024/8, function(ex, buf) {
  if (ex) throw ex;
  var buf = crypto.randomBytes(1024/8).toString('utf8');
  sjcl.random.addEntropy(buf.toString('utf8'), 1024, "crypto.randomBytes" );
});


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
  res.send(500, reason + help_text);
}

function generatePassword(length) {
  var pass = Math.abs(sjcl.random.randomWords(1)[0]);
  var p = "";
  while (p.length < length) {
    p = p + String.fromCharCode(97 + (pass % 26));
    pass = pass / 26;
    if(pass < 1) {
      pass = Math.abs(sjcl.random.randomWords(1)[0]);
    }
  }
  return p;
}

exports.paste_from_cli = function(req, res) {
  var text = "";

  if (req.headers["content-type"] === "application/x-www-form-urlencoded" && !(text in req.body)) {
    text = Object.keys(req.body)[0];
  }

  if (text === "text") {
    if (!req.body.text) {
      console.log(req.body);
      help("Missing text parameter", req, res);
    }
    text = req.body.text;
  }

  var expire = Date.now() + 7*24*3600*1000;
  if (req.body.expire) {
    if (req.body.expire == "-1") {
      expire = -1;
    } else if (timespan.labelToDuration[req.body.expire]) {
      expire = timespan.convertPostToDuration(req.body.expire);
    } else {
      expire = Date.now() + req.body.expire * 1000;
    }
  }
  var password = generatePassword(6);
  var encrypted = sjcl.encrypt(password, text);
  var content = encrypted;

  var paste = {
    content: content,
    expire: expire,
    never: req.body.never_expire,
    attachments: null
  }

  db.save(smallHash(JSON.stringify(paste)), paste, function(err, identifier) {
    res.redirect(303, "http://uu.zoy.fr/p/" + identifier + "#x=" + password);
  });
};

exports.upload = function(req, res) {
  var f = req.files.file;
  db.save_binary(f, function(err, id) {
    res.send(200, id );
  })
};
