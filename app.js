var app = require('express')(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	ent = require('ent'),
	fs = require('fs'),
	redis = require("redis");

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});
        
io.sockets.on('connection', function (socket, pseudo) {

	socket.on('new_client', function(pseudo) {
		pseudo = ent.encode(pseudo);
		socket.pseudo = pseudo;
		socket.broadcast.emit('new_client', pseudo);
	});
	
    var sub = redis.createClient(), 
		pub = redis.createClient();
	sub.subscribe("messages");

	socket.on('message', function (message) {
		message = ent.encode(message);
		pub.publish('messages', JSON.stringify({message: message, pseudo: socket.pseudo}));
	});

	sub.on("message", function (channel, message) {    
		socket.emit('messages', {pseudo: JSON.parse(message).pseudo, message: JSON.parse(message).message});
	});
        
});

server.listen(8080);