const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {
	Server
} = require("socket.io");
const io = new Server(server);
const ip = require("ip");
const fs = require('fs');
const open = require('open');
const e = require('express');

const args = process.argv.slice(2);

var port;

switch(args[0]){
	case "neptune":
		port = 3030;
		break;
	case "mercury":
		port = 3010;
		break;
	case "polaris":
		port = 3020;
		break;
}

const decaySpeed = 100;

var currentMode = "main";
var shop = true;

var gallery = [];

app.use('/images', express.static('images'));
app.use('/shared', express.static('shared'));
app.use(express.static("teacher"));
app.use(express.static("student"));
app.use(express.static("shared"));

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


let users = loadJson(args[0]+"_users");
console.log(users);
let teams = loadJson(args[0]+"_teams");
let items = loadJson("items");

function updateTeamMembers() {
	io.emit('clearMembers');
	let userNames = Object.keys(users);
	for (let i = 0; i < userNames.length; i++) {
		let currentUser = users[userNames[i]];
		if (currentUser.team >= 0) {
			io.to("teacher").emit('addMember', currentUser.team, userNames[i], currentUser.name, currentUser.color);
		}
	}
}

io.on('connection', (socket) => {
	socket.on('login', (userID, teacher=false) => {
		if(teacher){
			socket.join('teacher');
			io.to(socket.id).emit('qr', "http://dragons.omorgan.net:"+port);
			updateTeamMembers();
		} else if (!(userID in users)){
			console.log('login failed', userID);
			return;
		} else {
			console.log(users[userID].name+ " connected.");
		}
		io.to(socket.id).emit('updateItems', items);
		//console.log("http://dragons.omorgan.net:"+port);
		updateUser(userID);
		updateShop();
		updateTeam();
		updateXP();
		io.to(socket.id).emit('mode', currentMode);
	});

	socket.on('rename', (team, newName) => {
		teams[team].dragon_name = newName;
		console.log(team, newName);
		updateTeam();
	});

	socket.on('random', () => {
		let userNames = Object.keys(users);
		let currentUser;
		do{
			currentUser = users[userNames[Math.floor(Math.random()*userNames.length)]];
		}while(currentUser.team < 0)
		io.emit('random', currentUser.name);
	});

	socket.on('changeTeam', (id, team) => {
		console.log(id, team);
		let user = users[id];
		console.log("moving", user.name, "to team", team);
		users[id].team = team;
		updateXP();
		updateTeamMembers();
		updateUser();
		updateTeam();
	});

	socket.on('card', (teamID, userID, card) => {
		giveCard(teamID, userID, card);
	});

	//socket.emit('postWhiteboard', userID, pen.art);
	socket.on('postWhiteboard', (userID, art) =>{
		console.log("Recieved 'art' from "+ users[userID].name);
		let selectedIndex = gallery.findIndex(a => a.userID === userID);
		if(selectedIndex < 0){
			gallery.push({
				"userID":userID,
				"art": art
			});
			socket.to("teacher").emit('updateArt', userID, users[userID].name, users[userID].team, art);
		}
	})

	socket.on('forceTeamUpdate', () =>{
		updateTeam();
	})

	socket.on('mode', (newMode) =>{
		console.log("Mode: "+newMode);
		currentMode = newMode;
		io.emit('mode', currentMode);
		if(currentMode == "draw"){
			gallery = [];
		}
		if(currentMode == "main"){
			updateXP();
		}
	})

	socket.on('toggleShop', (open) =>{
		shop = open;
		updateShop();
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
	io.emit('item', user.name, item.name, user.team);
  });

  socket.on('logout', (userID) => {
	console.log("logging out "+userID);
	io.emit('logout', userID);
  });
});

function updateShop(){
	io.emit('toggleShop', shop);
}

function giveCard(teamID, userID, card) {
	if (userID == 0) {
		for (let i = 0; i < Object.keys(users).length; i++) {
			if (users[Object.keys(users)[i]].team == teamID) {
				giveCard(teamID, Object.keys(users)[i], card+3);
			}
		}
	}
	console.log(teamID, userID, card);
	//console.log("card:",teamID, userID, giveCard);

	let xp = 0
	let points = 0;
	let mood = 0;

	switch (card) {
		case 0:
			xp = 8;
			points = 6;
			mood = 1;
			break;
		case 1:
			xp = -5;
			points = -5;
			mood = -5;
			break;
		case 2:
			xp = -8;
			points = -10;
			mood = -10;
			break;
		case 3:
				points = 3;
				mood = 1;
				card = 0;
				break;
		case 4:
				points = -3;
				mood = -2;
				card = 1;
				break;
		case 5:
				points = -5;
				mood = -5;
				card = 2;
				break;		
	}

	xp = Math.round(xp * (1 + (teams[teamID].dragon_mood * 0.003)));

	moodChange(teamID, mood);
		if(userID != 0){
			users[userID].cards[card]++;
			users[userID].points += clamp(points, 0);
		}
		teams[teamID].xp += clamp(xp, 0);
		console.log("XP Change:", teams[teamID].dragon_name, teams[teamID].xp, '(' + xp + ')');

	updateXP(teamID);
	updateTeam(teamID);
	updateUser(userID);
}

function moodChange(team, change) {
	teams[team].dragon_mood = clamp(teams[team].dragon_mood + change, 0, 110);
	updateTeam(team);
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
	saveJson(teams, args[0]+"_teams");
	saveJson(users, args[0]+"_users");
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
	//console.log("update for",users[userID]);
	io.emit('updateUser', userID, users[userID]);
	saveJson(users, args[0]+"_users");
}

function colorChange(teamID, color, isSecondary=false){
	console.log("color Change");
	if(isSecondary){
		teams[teamID].secondary = color;
	} else {
		teams[teamID].primary = color;	
	}
}

function backgroundChange(teamID, newBackground){
	console.log("Background Change");
	teams[teamID].background = newBackground;	
}

let basicColors = [
	"rgb(255, 153, 200)",
	"rgb(252, 246, 189)",
	"rgb(208, 244, 222)",
	"rgb(169, 222, 249)",
	"rgb(228, 193, 249)"
];

function resetTeams(all=false) {
	for (let i = 0; i < 4; i++) {
		let currentTeam = teams[i];
		currentTeam.xp = 0;
		currentTeam.level = 1;
		currentTeam.dragon_name = "Team " + (i+1);
		let random = Math.random();
		if(random < 0.5){
		currentTeam.dragon_type = "normal";
		} else {
			currentTeam.dragon_type = "forest";
		}
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
			currentUser.cards = {
				"0": 0,
				"1": 0,
				"2": 0
			  };
		}
	}
	saveJson(teams, args[0]+"_teams");
	updateUser();
	updateTeam();
}

server.listen(port, () => {
	console.log(ip.address() + ':'+port);
	let url = 'https://LTMhHIN3L4bFhDi0:ORsTMAFKlSuVVBiw@domains.google.com/nic/update?hostname=dragons.omorgan.net&myip='+ip.address();
	require('https').get(url, (res) => {
    	res.on('data', function (body) {
        	console.log(body.toString());
    	});
	});
});