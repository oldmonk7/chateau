var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var db = require('./db');
var Room = require('./models/room');
var Person = require('./models/person');
const NUM_OF_MSG_PER_REQUEST = 3;

app.get('/', function(req, res){
  res.send({ hello: "world"});
});

app.get('/Channel', (req, res) => {
	const url = req.query.url;
	Room.findOneAndUpdate({ url }, {}, { upsert: true, new: true }, function (err, room) {
		res.send({ id: room._id });
	});
});

app.get('/Channel/:id/messages', (req, res) => {
	const channelId = req.params.id;
	const page = req.query.page || 1;
	if (!channelId) {
		throw new Error('No channel Id in the request');
	}
	Room.findOne({ _id: channelId }, (err, room) => {
		if (!room || !room.messages) {
			res.send([]);
		}
		const messages = room.messages;
		const lastNItems = messages.slice(-1 * Math.min(NUM_OF_MSG_PER_REQUEST * page, messages.length));
		let result = [];
		if (lastNItems.length === messages.length) {
			result = messages.slice(0, messages.length % NUM_OF_MSG_PER_REQUEST);
		} else {
			console.log(lastNItems);
			result = lastNItems.slice(0, NUM_OF_MSG_PER_REQUEST);
		}
		res.send({ messages: result });
	})
})


var data = [];
io.on('connection', function(socket){
	// Presence Code
	socket.on('presence', function(msg){
		console.log("Inside Presence socket listener")
		console.log(msg);
		var msgParsed = JSON.parse(msg);
		console.log(msgParsed);
	});


	
	socket.on('chat message', function(chat){
    console.log('message: ' + chat);
    var chatParsed = JSON.parse(chat);
    Room.findByURL(chatParsed.url, function(err, room){
    	console.log(room);
    	if(!err){
    		if(room){
    			room.messages.push({msg : chatParsed.msg, 
  								email: chatParsed.email || 'anon',
  								timestamp : Date.now() });
				room.save();
    		}
    	}
    });

	io.emit(chatParsed.url, [chatParsed]);
	
  });
  	
});


const PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
  console.log('listening on *:3000');
});

