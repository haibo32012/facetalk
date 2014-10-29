var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/facetalk');

var messageSchema = new mongoose.Schema({
	videoPath:String,
	textMessage: String,
	time: Date,
	
})