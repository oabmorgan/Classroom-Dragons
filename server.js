const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {
	Server
} = require("socket.io");
const io = new Server(server);
var port = 3000;
const ip = require("ip");
const fs = require('fs');
const open = require('open');
const e = require('express');

const lessonLength = 60;
const lossPerLesson = 50;
const decaySpeed = 150;

var currentMode = "main";
var shop = true;
var history = [];

app.use(express.static("student"));
app.use('/images', express.static('images'));
app.use(express.static("teacher"));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/student/student.html');
});
app.get('/teacher', (req, res) => {
	res.sendFile(__dirname + '/teacher/teacher.html');
});
app.get('/reset', (req, res) => {
	resetTeams();
	res.redirect('/teacher')
});
app.get('/resetall', (req, res) => {
	resetTeams(true);
	res.redirect('/teacher')
});

setInterval(moodDecay, decaySpeed * 1000);

function moodDecay() {
	for (let i = 0; i < 4; i++) {
		moodChange(i, -1);
	}
}

function loadJson(fileName) {
	return JSON.parse(fs.readFileSync(fileName + '.json'));
}

function saveJson(input, fileName) {
	fs.writeFileSync(fileName + '.json', JSON.stringify(input, null, '  '));
}

let users = loadJson("users");
let teams = loadJson("teams");
let items = loadJson("items");
let details = loadJson("details");

port = details["Server Details"].port;

function updateTeamMembers() {
	io.emit('clearMembers');
	let userNames = Object.keys(users);
	for (let i = 0; i < userNames.length; i++) {
		let currentUser = users[userNames[i]];
		if (currentUser.team >= 0) {
			io.emit('addMember', currentUser.team, userNames[i], currentUser.name, currentUser.color);
		}
	}
}

io.on('connection', (socket) => {
	socket.on('login', (userID, teacher) => {
		if ((userID in users)) {
			let user = users[userID];
			user.socket = socket.id;
			console.log('login OK', user.name);
			io.to(socket.id).emit('login', true);
			io.to(socket.id).emit('updateItems', items);
			updateUser(userID);
		} else if (teacher) {
			console.log('Teacher Login');
			socket.join("teacher");
			io.emit('qr', ip.address() + ":"+port);
		} else {
			console.log('login failed', userID);
			io.to(socket.id).emit('login', false);
			return;
		}
		updateShop();
		updateTeam();
		updateTeamMembers();
		updateXP();
		switch(currentMode){
			case "draw":
				if(users[userID].draw){
					io.to(socket.id).emit('openWhiteboard');
				}
			break;
		}
	});

	socket.on('rename', (team, newName) => {
		teams[team].dragon_name = newName;
		console.log(team, newName);
		updateTeam();
	});

	socket.on('changeTeam', (userID, team) => {
		let user = users[userID];
		console.log("moving", user.name, "to team", team);
		users[userID].team = team;
		updateXP();
		updateTeamMembers();
		updateUser(userID);
		updateTeam();
	});

	socket.on('reward', (teamID, userID, xp, points, mood, points_team) => {
		giveReward(teamID, userID, xp, points, mood, points_team);
	});

	socket.on('undo', () => {
		if(history.length > 0){
			let last = history.pop();
			giveReward(last.teamID, last.userID, -last.xp, -last.points, -last.mood, -last.points_team, true);
		}
	});

	//socket.emit('postWhiteboard', userID, pen.art);
	socket.on('postWhiteboard', (userID, art) =>{
		console.log("Recieved 'art' from "+ users[userID].name);
		users[userID].draw = false;
		socket.to("teacher").emit('updateArt', userID, users[userID].name, users[userID].team, art);
	})
	socket.on('openWhiteboard', () =>{
		console.log("drawing Time");
		currentMode = "draw";
		for (let i = 0; i < Object.keys(users).length; i++) {
			let userID = Object.keys(users)[i];
			users[userID].draw = true;
		}
		io.emit('openWhiteboard');
	})
	socket.on('closeWhiteboard', () =>{
		console.log("drawing Time is over");
		currentMode = "main";
		for (let i = 0; i < Object.keys(users).length; i++) {
			let userID = Object.keys(users)[i];
			users[userID].draw = false;
		}
		io.emit('closeWhiteboard');
	})
	socket.on('toggleShop', (open) =>{
		shop = open;
		updateShop();
	});
	socket.on('random', (open) =>{
		var keys = Object.keys(users);
		let result = users[keys[ keys.length * Math.random() << 0]].name; 
		socket.emit('random', result);
	});
	//socket.emit('item', userID, itemID);
  socket.on('item', (userID, itemID) => {
    let user = users[userID];
	let item = items[itemID];
    console.log(user.name,"used item", item.name);
	if(!shop){
		console.log("Shop is closed!");
		return;	
	}
    if(user.points < item.cost){
      console.log("not enough points!");
      return;
    }
	switch(item.effect){
		case "food":
			moodChange(user.team, item.value);
			teams[user.team].dragon_size += item.value/10;
		break;
		case "rename":
			socket.emit("itemRename");
		break;
		case "recolor_1":
			colorChange(user.team, item.value, false);
		break;
		case "recolor_2":
			colorChange(user.team, item.value, true);
		break;
		case "recolor_3":
			colorChange(user.team, item.value, false);
			colorChange(user.team, item.value2, true);
		break;
		case "background":
			backgroundChange(user.team, item.value);
		break;
		}
	//CHEAT
    user.points -= item.cost;
    updateUser(userID);
  });

  socket.on('logout', (userID) => {
	console.log("logging out "+userID);
	io.emit('logout', userID);
  });
});

function updateShop(){
	io.emit('toggleShop', shop);
}

function giveReward(teamID, userID, xp, points, mood, points_team, undo=false) {
	//console.log(teams[teamID].xp);
	xpChange(teamID, xp);
	moodChange(teamID, mood);
	pointsChange(userID, points);
	getTeamMembers(teamID).forEach(memberID =>
		pointsChange(memberID, points_team)
	);
	if(!undo){
		history.push({"teamID":teamID, "userID":userID, "xp":xp, "points":points, "mood":mood, "points_team":points_team});
		if(history.length > 10){ history.shift()};
	}
}

function getTeamMembers(team){
	let members = [];
	for (let i = 0; i < Object.keys(users).length; i++) {
		let userID = Object.keys(users)[i];
		if(users[userID].team == team){
			members.push(userID);
		}
	}
	//console.log(teams[team].dragon_name, members);
	return members;
}

function moodChange(team, change) {
	teams[team].dragon_mood = clamp(teams[team].dragon_mood + change, 0, 110);
	updateTeam(team);
}

function xpChange(team, change) {
	teams[team].xp = clamp(teams[team].xp + change, 0);
	updateXP(team);
}

function pointsChange(userID, change) {
	if(users[userID] == undefined){
		return;
	}
	users[userID].points = clamp(users[userID].points + change, 0);
	updateUser(userID);
}

function clamp(input, min = input, max = input) {
	return Math.min(Math.max(input, min), max);
}

function updateXP(team) {
	if (team == undefined) { //update all teams
		for (let i = 0; i < 4; i++) {
			updateXP(i);
		}
		return;
	}
	let currentTeam = teams[team];
	currentTeam.level = Math.ceil(currentTeam.xp / 100);
	switch(currentTeam.level){
		case 0:
		case 1:
			currentTeam.dragon_evol = 0;
			break;
		case 2:
		case 3:
		case 4:
			currentTeam.dragon_evol = 1;
		break;
		default:
			currentTeam.dragon_evol = 2;
		break;
	}
	io.emit('updateXP', team, currentTeam.xp, currentTeam.level);
	saveJson(teams, "teams");
	saveJson(users, "users");
}

function updateTeam(team) {
	if (team == undefined) { //update all teams
		for (let i = 0; i < 4; i++) {
			updateTeam(i);
		}
		return;
	}
	io.emit('updateTeam', team, teams[team]);
}

function updateUser(userID) {
//	console.log("update for",users[userID].name);
	io.to(users[userID.socket]).emit('updateUser', userID, users[userID]);
	saveJson(users, "users");
}

function colorChange(teamID, color, isSecondary=false){
	console.log("color Change");
	if(isSecondary){
		teams[teamID].secondary = color;
	} else {
		teams[teamID].primary = color;	
	}
	updateTeam(teamID);
}

function backgroundChange(teamID, newBackground){
	console.log("Background Change");
	teams[teamID].background = newBackground;	
	updateTeam(teamID);
}

let basicColors = [
	"rgb(174, 186, 137)",
	"rgb(227, 238, 192)",
	"rgb(255, 212, 163)",
	"rgb(251, 187, 173)",
	"rgb(249, 216, 161)",
	"rgb(238, 255, 204)",
	"rgb(201, 199, 236)",
	"rgb(207, 232, 183)",
	"rgb(214, 225, 233)",
	"rgb(124, 131, 137)",
	"rgb(255, 237, 243)",
];

function resetTeams(all=false) {
	for (let i = 0; i < 4; i++) {
		let currentTeam = teams[i];
		currentTeam.xp = 0;
		currentTeam.level = 1;
		currentTeam.dragon_name = "Team " + (i+1);
		currentTeam.dragon_type = "normal";
		currentTeam.background = "grass";
		currentTeam.primary = basicColors[Math.floor(Math.random()*basicColors.length)];
		currentTeam.secondary = basicColors[Math.floor(Math.random()*basicColors.length)];
    	currentTeam.dragon_evol = 0;
		currentTeam.dragon_size = 25;
		currentTeam.dragon_mood = 100;
	}
	if(all){
		console.log("fullReset");
		let userNames = Object.keys(users);
		for (let i = 0; i < userNames.length; i++) {
			let currentUser = users[userNames[i]];
			currentUser.points = 0;
		}
		io.emit("logout", "all");
	}
	saveJson(teams, "teams");
}

server.listen(port, () => {
	console.log(ip.address() + ':'+port);
	//open('http://'+ip.address() + ':3000/teacher');
});