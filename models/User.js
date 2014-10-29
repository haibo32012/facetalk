var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/facetalk');

var userSchema = new mongoose.Schema({
	name:String,
	email:String,
	channelName:String,
	password:String
});

module.exports = mongoose.model('User',userSchema);