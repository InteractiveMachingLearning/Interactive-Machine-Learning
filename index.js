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
		this.record = [];
		this.on = true;
		this.serviceCode = makeServiceCode();
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
		var file = fs.createWriteStream('records/' + this.serviceCode + " " + utc + ".txt");
		file.on('error', function(err) {});
		file.write(JSON.stringify(this.userAInfo));
		file.write(JSON.stringify(this.userBInfo));
		file.write('\n');
		this.record.forEach(function(v) { file.write(v.join(', ') + '\n'); });
		file.end();
	}
}




// var fs = require('fs');
// var $ = jQuery = require('jQuery');
// require('./node_modules/jquery/src/jquery.csv.js');

// var sample = './questions.csv';
// fs.readFile(sample, 'UTF-8', function (err, csv) {
//   if (err) { console.log(err); }
//   $.csv.toArrays(csv, {}, function (err, data) {
//     if (err) { console.log(err); }
//     for (var i = 0, len = data.length; i < len; i++) {
//       console.log(data[i]);
//     }
//   });
// });
// var csv = require('csv');
// var obj = csv();
// function MyCSV(Fone, Ftwo, Fthree) {
//     this.FieldOne = Fone;
//     this.FieldTwo = Ftwo;
//     this.FieldThree = Fthree;
// };

// var MyData = [];
// obj.from.path('./questions.csv').to.array(function (data) {
//     for (var index = 0; index < data.length; index++) {
//         MyData.push(new MyCSV(data[index][0], data[index][1], data[index][2]));
//     }
//     console.log(MyData);
// });

// var fs = require('fs');
// var $ = jQuery = require('jquery');
// $.csv = require('jquery-csv');

// var questions;
// var aaa = "ddddd";

// function getCSV() {
// 	var sample = './questions.csv';
// 	fs.readFile(sample, 'UTF-8', function(err, csv) {
// 		$.csv.toArrays(csv, {}, function(err, data) {
// 			questions = JSON.parse(JSON.stringify(data));
// 			//console.log(questions);
// 			return questions[0][0];
// 		});
// 	});
// }

// questions = getCSV();
// console.log(questions);

// var questions = [];

// var fs = require('fs');
// fs.readFile('questions.csv', function(err, data) {
//     if(err) throw err;
//     var array = data.toString().split("\n");
//     for(i in array) {
//     	questions.push(array[i]);
//         //console.log(array[i]);
//     }
// });


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
		io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('chat message', socket_name[socket.id], msg);
		room_pair[user_room[socket_user[socket.id]]].addRecord(socket_user[socket.id], msg);
	});

	socket.on('get questions', function(){
		socket.emit('questions', getQuestions());
	});

	socket.on('experiment complete', function(){
		io.sockets.in('room'+ user_room[socket_user[socket.id]]).emit('serviceCode',room_pair[user_room[socket_user[socket.id]]].serviceCode);
	});

	socket.on('disconnect', function(){
		console.log('user ' + socket_user[socket.id] +' disconnected');
		if (!room_pair[user_room[socket_user[socket.id]]].isActive()) {
			return;
		}
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
