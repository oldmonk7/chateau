const express = require('express');
const bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var db = require('./db');
var Room = require('./models/room');
var User = require('./models/user');
const NUM_OF_MSG_PER_REQUEST = 3;

app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send({ hello: "world"});
});

app.get('/Channel', (req, res) => {
	const url = req.query.url;
	Room.findOneAndUpdate({ url }, {}, { upsert: true, new: true }, function (err, room) {
		res.send({ id: room._id });
	});
});

app.get('/User/:id', async (req, res) => {
	const id = req.params.id;
	if (!id) {
		return;
	}

	User.findOne({ _id: id }, (err, user) => {
		if (!err) {
			res.send({ user });
		} else {
			throw err;
		}
	})
});

app.post('/User', async (req, res) => {
	const newUser = req.body;
	if (!newUser.email) {
		throw new Error('User should have an email');
	}
	if (!newUser.userName) {
		throw new Error('User should have a userName');
	}
	const userToSave = new User(newUser);
	const user = await userToSave.save();
	res.send(user);
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
		Room.findById(chatParsed.id, (err, room) => {
			if(err) {
				console.log(err);
				return;
			}
			if(room){
				room.messages.push({
					msg : chatParsed.msg, 
					email: chatParsed.email || 'anon',
					timestamp : chatParsed.timestamp || Date.now()
				});
				room.save();
			}
		});

	io.emit(chatParsed.id, [chatParsed]);
	
  });
  	
});


const PORT = process.env.PORT || 9001;
http.listen(PORT, function(){
  console.log(`listening on *: ${PORT}`);
});

