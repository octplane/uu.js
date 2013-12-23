module.exports = function(app){

	//home route
	var home = require('../app/controllers/home');


	app.get('/', home.index);
	app.get('/about', home.about);
	app.get('/p/:id', home.view_paste);

	app.post('/paste', home.paste);
	app.post('/file-upload', home.upload);

};

