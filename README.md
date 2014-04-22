uu.js
=====

Another port of my wonderful private paste. This time in js.

Features
=======

- It was designed after <a href='http://stackoverflow.com/questions/9465215/pastie-with-api-and-language-detection'>I started looking</a> for such a tool and didn't find it. Thus, it has some interesting features.
- UU automatically performs some syntax highlighting on the text you paste in it.
- The pasted text is **encrypted on the client** using a generated key that is known only by the browser.
- The encrypted text is sent to the server and the server has no way to recover the encryption key.
- You can also upload images to attach to your pastes.
- The paste expires after a given amount of time.
- The paste is encrypted on the server and cannot be read without the key you have in the url
- The images or attachments you upload are not encrypted and clearly linked in the database server-side
- No javascript tracker, almost no log on the server.
- Very small footprint

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
curl -X POST -d @LICENSE -XPOST http://localhost:3000/
```
or
```
curl -X POST -dtext="Hello World" -XPOST http://localhost:3000/ -dexpire=60
```

- Note that there is **no** random encryption possible yet on this endpoint.


Configuration
===========

UU reads its data from `~/.uu/` or `env['UU_PATH']`. It **must** have write access to this folder in order to work correctly.

License
======

MIT, see LICENSE file.
