uu.js
=====

UU.js is a private paste website designed for developers and people who want to share screenshot quickly. Also, all text data is encrypted on the server and when using the website to paste text
the encryption key is **NEVER** given to the server.

Features
=======-

UU was designed after <a href='http://stackoverflow.com/questions/9465215/pastie-with-api-and-language-detection'>I started looking</a> for such a tool and didn't find it. Thus, it has some interesting features.

- UU automatically performs some syntax highlighting on the text you paste in it.
- The encrypted text is sent to the server and the server has no way to recover the encryption key.

- You can also upload images to attach to your pastes.

- The paste expires after a given amount of time.

- No javascript tracker, almost no log on the server.
- Very small footprint
- The images or attachments you upload are not encrypted and clearly linked in the database server-side

Install
=======

```
git clone git@github.com:octplane/uu.js.git
cd uu.js
npm install && grunt install
ENV=production grunt

```

Go to http://localhost:3000/ to use the application

From the command line
=====================

```
curl -i -H "expire:60" -F name=upload -F filedata=@some-file.txt http://localhost:3000/
```
or
```
curl -X POST -dtext="Hello World" -dexpire=60 -XPOST http://localhost:3000/
```

The pastes are encrypted too, but the password is generated on the server and might be sniffed on the wire.

Configuration
===========

- UU reads its data from `~/.uu/` or `env['UU_PATH']`. It **must** have write access to this folder in order to work correctly.
- The file upload feature uses Node file upload facility and create temporary files in a tmp folder.

License
======

MIT, see LICENSE file.
