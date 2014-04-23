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
"curl -i -H 'expire:60' -F name=upload -F filedata=@some-file.txt http://uu.zoy.fr/\n" +
"curl -X POST -dtext='Hello World' -dexpire=60 -XPOST http://uu.zoy.fr/\n" +
"    expire can be in :\n    " + expList.join(", \n    ") + "\n" +
  "OR\n" +
"    a number of second until expiration (-1 for never)\n";

help = function(reason, req, res) {
  res.send(500, reason + help_text);
}

function generatePassword(length) {
  var pass = "";
  sjcl.random.randomWords(length/4).forEach(function(e) {
    var u,d,t,q;
    u = e & 0x000000FF;
    d = (e & 0x0000FF00) >> 8 ;
    t = (e & 0x00FF0000) >> 16;
    q = (e & 0xFF000000) >> 32;
    st = String.fromCharCode(u,d,t,q);
    pass += st;
  });
  return pass;
}

function expireValueToDuration(requestVal) {
  var expire;
  if (requestVal == "-1") {
    expire = -1;
  } else if (timespan.labelToDuration[requestVal]) {
    expire = timespan.convertPostToDuration(requestVal);
  } else {
    expire = Date.now() + requestVal * 1000;
  }
  return expire
}

exports.paste_from_cli = function(req, res) {
  var expire = Date.now() + 7*24*3600*1000;
  var password = generatePassword(12);

  var paste = {
    never: (req.headers.expire && req.headers.expire === "-1") || (req.headers.never_expire && req.headers.never_expire === "yes") ,
    attachments: null
  };

  if ("files" in req && "filedata" in req.files) {
    fs.readFile(req.files.filedata.path, function (err, data) {
      var text = data.toString("utf-8");

      if (req.headers.expire) {
        console.log(req.headers.expire);
        expire = expireValueToDuration(req.headers.expire);
      }
      var encrypted = sjcl.encrypt(password, text);
      var content = encrypted;

      paste.content = content;
      paste.expire = expire;

      db.save(smallHash(JSON.stringify(paste)), paste, function(err, identifier) {
        res.redirect(303, "http://uu.zoy.fr/p/" + identifier + "#x=" + btoa(password));
      });
    });
  } else if("body" in req && "text" in req.body) {
    var text = req.body.text;

    if (req.body.expire) {
      expire = expireValueToDuration(req.body.expire);
    }

    paste.content = sjcl.encrypt(password, text);;
    paste.expire = expire;

    db.save(smallHash(JSON.stringify(paste)), paste, function(err, identifier) {
      res.redirect(303, "http://uu.zoy.fr/p/" + identifier + "#x=" + btoa(password));
    });
  } else {
    help("No filedata in files or body in request.", req, res);
  }
};

exports.upload = function(req, res) {
  var f = req.files.file;
  db.save_binary(f, function(err, id) {
    res.send(200, id );
  })
};
