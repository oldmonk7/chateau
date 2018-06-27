
var mongoose = require('../db');
var Schema = mongoose.Schema;


var personSchema = new Schema({
	name : String,
	password: String,
	email : String
});

personSchema.methods.isDuplicate = function(email){
	return this.model('Person').find({email : email});
}

var Person = mongoose.model('Person', personSchema);

module.exports = Person;