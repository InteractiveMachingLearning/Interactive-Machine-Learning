//var app = require('express')();
var express = require('express');
var app = express();


var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var checkNaturalLanguage = require('./checkNaturalLanguage');



var serveIndex = require('serve-index');
app.use('/records', serveIndex('records')); // shows you the file list
app.use('/records', express.static('records')); // serve the actual files


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

var token_socket = {};

var userbGarbageFlag = false;

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

app.post('/validate', function(req, res) {
	console.log(req.body);
	var ret = [];
	for (var i = 0, len = req.body.length; i < len; i++) {
       ret.push(i);
	}
	res.send(ret);
});

// app.post('/login',function(req,res){
//   var user_name=req.body.user;
//   var password=req.body.password;
//   console.log("User name = "+user_name+", password is "+password);
//   res.end("yes");
// });

class Pair {
	constructor() {
		this.users = [];
		this.userA = -1;
		this.userB = -1;
		this.record = [];
		this.recordCount = 0;
		this.on = true;
		this.serviceCode = makeServiceCode();
		this.userAReward = 0.05;
		this.userBReward = 0.05;
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
	disable() {
		this.on = false;
	}
	isActive() {
		return this.on;
	}
	addRecord(user, msg) {
		this.record.push([user, msg]);
		if(user == this.userB && msg[1] == 'Garbage')
		{
			console.log('UserB selected a garbage question');
			userbGarbageFlag = true;
		}
		this.recordCount += 1;
	}
	printRecord() {
		console.log(this.userAInfo);
		console.log(this.userBInfo);
		console.log(this.record);

	}
	writeRecord() {
		var dt = new Date();
		var utc = dt.toUTCString();
		var fs = require('fs');
		//var file = fs.createWriteStream('records/' + this.serviceCode + " " + utc + ".txt");

		var file;

		file = fs.createWriteStream('records/' + this.serviceCode + ".txt");
		file.on('error', function(err) {});
		var out = {};
		out["userAInfo"] = this.userAInfo;
		out["userBinfo"] = this.userBInfo;
		out["records"] = this.record;
		out["userAReward"] = this.userAReward;
		out["userBReward"] = this.userBReward;
		file.write(JSON.stringify(out));

	// 	file.write(JSON.stringify(this.userAInfo));
	// 	file.write(JSON.stringify(this.userBInfo));
	// 	file.write('\n');
	// 	this.record.forEach(function(v) { file.write(v.join(', ') + '\n'); });
	// 	if(userbGarbageFlag == true)
	// 	{
	// 		file.write('User A replied carefully; User B selected garbage questions. \n');
	// 	}
	// 	else
	// 	{
	// 		file.write('User A replied carefully; User B selected carefully. \n');
	// 	}
	 	file.end();
	}
	userAAddReward() {
		if (this.recordCount > 11) {
			this.userAReward += 0.04;
		}
		
	}
	userBAddReward() {
		if (this.recordCount > 11) {
			this.userBReward += 0.04;
		}
	}
	getAReward() {
		return this.userAReward;
	}
	getBReward() {
		return this.userBReward;
	}
	deductAReward() {
		this.userAReward -= 0.05;
		if (this.userAReward < 0) {
			this.userAReward = 0;
		}
	}
	deductBReward() {
		this.userBReward -= 0.05;
		if (this.userBReward < 0) {
			this.userBReward = 0;
		}
	}
}






var fs = require('fs');
var fileContents = fs.readFileSync('questions_dict.txt');
var questions_dict = JSON.parse(fileContents.toString());

function getQuestions(){
	var collection = [];
	// for (var i = 0; i < questions_dict.length; i++) {
	// 	var rnd = Math.floor(Math.random() * questions_dict[i].length);
	// 	collection.push(questions_dict[i][rnd]);
	// }
	for (const key of Object.keys(questions_dict)) {
    	var rnd = Math.floor(Math.random() * questions_dict[key].length);
    	var pair = [questions_dict[key][rnd], key]
	 	collection.push(pair);
	}

	//Shuffle questions here
	var currentIndex = collection.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {


		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;


		temporaryValue = collection[currentIndex];
		collection[currentIndex] = collection[randomIndex];
		collection[randomIndex] = temporaryValue;
  	}
	return collection;
}

function makeServiceCode() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 10; i++)
	  text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
  }
var collection = getQuestions();
console.log(collection);


var socket_user = {};
var user_socket = {};
var user_room = {};
var room_pair = {};
var socket_name = {};
var id = 0
var room = 0

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
		user_room[id] = room;
		socket.join('room' + room);
		console.log('user ' + id + ' connected to room ' + room);
		if (room_pair[room] == undefined) {
			room_pair[room] = new Pair();
			room_pair[room].addUserA(id, json);
			socket_name[socket.id] = 'User A';
			socket.emit('identity', 0);
		}
		else {
			room_pair[room].addUserB(id, json);
			socket_name[socket.id] = 'User B';
			socket.emit('identity', 1);
			io.sockets.in('room'+ room).emit('chat message', 'System', 'Now both users have connected.');
			io.sockets.in('room'+ room).emit('start signal', '');
			room ++;
		}
		id ++;
	});

socket.on('chat message', function(msg){
	if(socket_name[socket.id] == 'User A' && msg.toLowerCase().trim() != "hi!" && msg.toLowerCase().trim() != "no") {
		console.log("USERID is " + id);
		checkNaturalLanguage.isSentenceValid(msg).then((isValid)=>{
		    console.log("The message is " + msg);
		    if(isValid == true) {
		    	console.log("Valid English");
		    }
		    else
		    {
			    console.log("Non English");
			    room_pair[user_room[socket_user[socket.id]]].deductAReward();
			    socket.emit('validity', 0);
			    socket.emit('current reward', room_pair[user_room[socket_user[socket.id]]].getAReward());
	    	}
   		});
  	}

	if(socket_name[socket.id] == 'User B') {
		if(msg[1] == "Garbage") {
	    	console.log("USERB SELECTED GARBAGE");
	    	socket.emit('validity', 0);
	    	room_pair[user_room[socket_user[socket.id]]].deductBReward();
	    	socket.emit('current reward', room_pair[user_room[socket_user[socket.id]]].getBReward());
		}
	}

	io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('chat message', socket_name[socket.id], msg);
	room_pair[user_room[socket_user[socket.id]]].addRecord(socket_user[socket.id], msg);


	if(socket_name[socket.id] == 'User A') {
		room_pair[user_room[socket_user[socket.id]]].userAAddReward();
		socket.emit('current reward', room_pair[user_room[socket_user[socket.id]]].getAReward());
	}
	else {
		room_pair[user_room[socket_user[socket.id]]].userBAddReward();
		socket.emit('current reward', room_pair[user_room[socket_user[socket.id]]].getBReward());
	}
 });

	socket.on('get questions', function(){
		socket.emit('questions', getQuestions());
	});

	socket.on('experiment complete', function(){
		io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('serviceCode',room_pair[user_room[socket_user[socket.id]]].serviceCode);
	});

	socket.on('disconnect', function(){
		console.log('user ' + socket_user[socket.id] +' disconnected');
		if (socket_user[socket.id] == undefined) {
			return;
		}
		if (!room_pair[user_room[socket_user[socket.id]]].isActive()) {
			return;
		}
		io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('serviceCode',room_pair[user_room[socket_user[socket.id]]].serviceCode);
		io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('chat message', socket_name[socket.id], "user "
			+ socket_name[socket.id] + " has disconnected");
		var otherUser = room_pair[user_room[socket_user[socket.id]]].getOtherUser(socket_user[socket.id]);
		if (otherUser == -1) {
			room ++;
			return;
		}

		socket.leave('room' + user_room[socket_user[socket.id]]);
		user_socket[otherUser].leave('room' + user_room[socket_user[socket.id]]);
		room_pair[user_room[socket_user[socket.id]]].disable();
		room_pair[user_room[socket_user[socket.id]]].printRecord();
		room_pair[user_room[socket_user[socket.id]]].writeRecord();

	});
});

http.listen(port, function(){
	console.log('listening on *:' + port);
});
