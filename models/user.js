'use strict'
var mongoose = require('../db');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name:  String,
  email: String,
  userName: String
});


var User = mongoose.model('User', userSchema);

module.exports = User;

