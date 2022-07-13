const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {	Server } = require("socket.io");
const io = new Server(server);
const port = 3000;
const ip = require("ip");
const fs = require('fs');

const decaySpeed = 100; //approx -25% in 45min

app.use(express.static("student"));
app.use('/images', express.static('images'));
app.use(express.static("teacher"));

app.get('/', (req, res) => {res.sendFile(__dirname + '/student/student.html');});
app.get('/teacher', (req, res) => {res.sendFile(__dirname + '/teacher/teacher.html');});
app.get('/reset', (req, res) => {resetTeams(); res.redirect('/teacher')});

setInterval(moodDecay, decaySpeed * 1000);

function moodDecay() {
  console.log("Mood Decay");
  for(let i=0; i<4; i++){
    moodChange(i, -1);
    updateTeam(i);
  }
}

function loadJson(fileName){
  return JSON.parse(fs.readFileSync(fileName+'.json'));
}

function saveJson(input, fileName){
  fs.writeFileSync(fileName+'.json', JSON.stringify(input, null, '  '));
}

let users = loadJson("users");
saveJson(users, "users");

let teams = loadJson("teams");


function updateUsers(){
  io.emit('clearMembers');
  let userNames = Object.keys(users);
  for(let i=0; i<userNames.length; i++){
    let currentUser = users[userNames[i]];
    io.emit('addMember', currentUser.team, userNames[i], currentUser.name, currentUser.color);
  }
}

io.on('connection', (socket) => {
	console.log('a user connected');
  
	socket.on('login', (userID) => {
		console.log('login',userID);
    //socket.on('updateDragon', function(team, name, type, size, primaryColor, secondayColor
    updateTeam();
    updateXP();
    updateUsers();
	});

  socket.on('changeTeam', (id, team) => {
    let user = users[id];
    console.log("moving",user.name,"to team",team);
    users[id].team = team;
    console.log(user.team);
    updateTeam();
    updateXP();
    updateUsers();
  });

  socket.on('card', (team, member, giveCard) => {
    console.log("card:",team, member, giveCard);
    let xpChange = 0;
    switch(giveCard){
      case 0:
        //green
        xpChange = 10 + Math.round(teams[team].dragon_mood/10);
        moodChange(team, 1);
        if(member != 0){
          users[member].green = users[member].green+1;
          console.log(users[member].green);
        }
        break;
      case 1:
        //yellow
        xpChange = -5;
        moodChange(team, -5);
        if(member != 0){
          users[member].yellow  = users[member].yellow + 1;
        }
        break;
      case 2:
        //red
        xpChange = -10;
        moodChange(team, -10);
        if(member != 0){
          users[member].red = users[member].red + 1;
        }
        break;
    }
    if(member == 0){
      xpChange *= 3;
    }
    teams[team].xp = Math.max(0, teams[team].xp + xpChange);
    console.log("XP Change:",teams[team].dragon_name, teams[team].xp,'('+xpChange+')');
    updateXP();
  });
});

function moodChange(team, change){
  teams[team].dragon_mood += change;
  if(teams[team].dragon_mood < 0){
    teams[team].dragon_mood = 0;
  }
  if(teams[team].dragon_mood > 100){
    teams[team].dragon_mood = 100;
  }
}

function updateXP(team){
  if(team == undefined){ //update all teams
    for(let i=0; i<4; i++){
      updateXP(i);
    }
    return;
  }

  let currentTeam = teams[team];
  io.emit('updateXP', team, currentTeam.xp, currentTeam.level);
  saveJson(teams, "teams");
  saveJson(users, "users");
}

function updateTeam(team){
  if(team == undefined){
    for(let i=0; i<4; i++){
      let currentTeam = teams[i];
      io.emit('updateDragon', i, currentTeam.dragon_name,currentTeam.dragon_type, currentTeam.dragon_size, currentTeam.primary, currentTeam.secondary);
    }
  } else {
    let currentTeam = teams[team];
    io.emit('updateDragon', team, currentTeam.dragon_name,currentTeam.dragon_type, currentTeam.dragon_size, currentTeam.primary, currentTeam.secondary);
  }
}

function resetTeams(){
  for(let i=0; i<4; i++){
    let currentTeam = teams[i];
    currentTeam.xp = 0;
    currentTeam.level = 0;
    currentTeam.dragon_name = "Team "+i;
    currentTeam.dragon_type = "egg";
    currentTeam.dragon_size = 25;
    currentTeam.dragon_mood = 50;
  }
  saveJson(teams, "teams");
}

server.listen(3000, () => {
	console.log(ip.address() + ':3000');
});