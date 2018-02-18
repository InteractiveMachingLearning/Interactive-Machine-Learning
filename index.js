var app = require('express')();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

var token_socket = {};


app.get('/hello', function(req, res){
	res.send('<h1>Hello world</h1>');
});


app.get('/cookie',function(req, res){
     res.cookie('cookie_name', 'cookie_value').send('Cookie is set');
});

app.get('/check', function(req, res) {
  console.log("Cookies :  ", req.cookies);
});

app.post('/form', function(req, res) {
	console.log("form received");
	//console.log('You sent the name "' + req.body.name + '".');
	//console.log('You sent the age"' + req.body.age + '".');
	//res.send('You sent the name "' + req.body.name + '".');
	res.sendFile(__dirname + '/index.html');
});

class Pair {
	constructor() {
		this.users = [];
		this.userA = -1;
		this.userB = -1;
	}
	addUserA(user, userInfo) {
		this.users.push(user);
		this.userA = user;
		this.userAInfo = userInfo;
	}
	addUserB(user, userInfo) {
		this.users.push(user);
		this.userB = user;
		this.userBInfo = userInfo;
	}
	getUserA() {
		return this.userA;
	}
	getUserB() {
		return this.userB;
	}
	getOtherUser(user) {
		if (user == this.userA) {
			return this.userB;
		}
		return this.userA;
	}
}


var socket_user = {};
var user_socket = {};
var user_room = {};
var room_pair = {};
var socket_name = {};
var id = 0

var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + "/" + "style.css");
});

io.on('connection', function(socket){
	console.log('someone connected to server');
	socket.on('survey data', function(json){
		console.log(json);
		socket_user[socket.id] = id;
		user_socket[id] = socket;
		var room = Math.floor(id/2);
		user_room[id] = room;
		if (room_pair[room] == undefined) {
			room_pair[room] = new Pair();
			room_pair[room].addUserA(id, json);
			socket_name[socket.id] = 'User A';
		}
		else {
			room_pair[room].addUserB(id, json);
			socket_name[socket.id] = 'User B';
		}
		socket.join('room' + room);
		console.log('user ' + id + ' connected to room ' + room);
		id ++;
	});

	socket.on('chat message', function(msg){
		io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('chat message', socket_name[socket.id], msg);
	});

	socket.on('disconnect', function(){
		io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('chat message', socket_name[socket.id], "user "
			+ socket_name[socket.id] + " has disconnected");
		var otherUser = room_pair[user_room[socket_user[socket.id]]].getOtherUser(socket_user[socket.id]);
		socket.leave('room' + user_room[socket_user[socket.id]]);
		user_socket[otherUser].leave('room' + user_room[socket_user[socket.id]]);
		console.log('user ' + socket_user[socket.id] +' disconnected');
	});
});

http.listen(port, function(){
	console.log('listening on *:' + port);
});
