var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chatoo');

// var db = mongoose.connection;

module.exports = mongoose;