var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var db = require('./db');
var Room = require('./models/room');
var Person = require('./models/person');

app.get('/', function(req, res){
  res.sendJSON({ hello: "world"});
});


var data = [];
io.on('connection', function(socket){
	// Presence Code
	socket.on('presence', function(msg){
		console.log("Inside Presence socket listener")
		console.log(msg);
		var msgParsed = JSON.parse(msg);
		console.log(msgParsed);
		//Checking the db for the URL
		Room.findByURL(msgParsed.url, function(err, room){
	    	
	    	console.log(room);
	    	console.log(err);
	    	if(!err){
	    		if(room){
	    			io.emit(msgParsed.url, room.messages);
	    		}
	    		else{
	    			console.log("Do Nothing");
	    		}
	    	}
    	});




		// if(!data.hasOwnProperty(msgParsed.url)){
			
		// 	console.log("Presence " + msgParsed.url);
		// 	data[msgParsed.url] = [];
		// 	console.log(data);
		// }
		// else{
		// 	io.emit(msgParsed.url, data[msgParsed.url]);
		// 	// for(var i=0; i<20; i=i+2){
		// 	// 	setTimeout(function(){
		// 	// 	io.emit(msgParsed.url, "TEST1");	
		// 	// }, 100 * i);
		// 	// }
			
			
		// }
	});
	// console.log("*************Data*****************");
	// console.log(data)
	// console.log("******************************");

	
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
    		else{
    			var newRoom = new Room({url : chatParsed.url});
    			newRoom.messages.push({msg : chatParsed.msg, 
  								email: chatParsed.email || 'anon' ,
  								timestamp : Date.now() });
				newRoom.save();
    		}
    	}
    });
    
		
    // data[chatParsed.url].push(chatParsed.msg);
    // console.log(data);

	io.emit(chatParsed.url, [chatParsed]);
	
  });
  	
});


const PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
  console.log('listening on *:3000');
});

