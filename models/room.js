'use strict'
var mongoose = require('../db');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
  url:  String,
  messages : [
  	{ msg: String, 
  	  email: String,
  	  timestamp : Date 
  }]
  
});


roomSchema.statics.findByURL = function (url, cb) {
  return this.findOne({ url: url }, cb);
}

var Room = mongoose.model('Room', roomSchema);

module.exports = Room;

