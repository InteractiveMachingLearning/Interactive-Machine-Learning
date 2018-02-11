var app = require('express')();

app.get('/hello', function(req, res){
	res.send('<h1>Hello world</h1>');
});

var sockets = {};
var sockets2 = {};
var id = 0

var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	sockets[socket.id] = id;
	sockets2[id] = socket;

	console.log('user ' + id + ' connected');

	socket.on('chat message', function(msg){
		io.emit('chat message', sockets[socket.id], msg);
	});

	socket.on('disconnect', function(){
		console.log('user ' + sockets[socket.id] +' disconnected');
	});
 
	id ++;
});

http.listen(port, function(){
	console.log('listening on *:' + port);
});
