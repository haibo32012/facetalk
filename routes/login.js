var User = require('../lib/user');

exports.showLogin = function(req,res) {
	res.render('login.html');
};

exports.login = function(req,res,next) {
	var data = req.body.user;
	User.authenticate(data.name, data.pass, function(err, user) {
		if (err) return next(err);
		if (user) {
			req.session.uid = user.id;
			console.log(user.id);
			res.redirect('/');
		} else {
			res.error("Sorry! invalid credentials.");
			res.redirect('back');
		}
	});
};

exports.logout = function(req,res) {
	req.session.destroy(function(err) {
		if (err) throw err;
		res.redirect('/');
	})
};