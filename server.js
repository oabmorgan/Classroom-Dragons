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


function updateTeamMembers(){
  io.emit('clearMembers');
  let userNames = Object.keys(users);
  for(let i=0; i<userNames.length; i++){
    let currentUser = users[userNames[i]];
    //users[userNames[i]].points = 0;
    //users[userNames[i]].green = 0;
    //users[userNames[i]].red = 0;
    //users[userNames[i]].yellow = 0;
    if(currentUser.team >= 0){
      io.emit('addMember', currentUser.team, userNames[i], currentUser.name, currentUser.color);
    }
  }
}

io.on('connection', (socket) => {  
	socket.on('login', (userID, teacher) => {
    if ((userID in users)){
      let user = users[userID];
      console.log('login OK',user.name);
      io.to(socket.id).emit('login', true);
      updateUser(userID);
      updateTeam();
      updateXP();
    } else if(teacher){
      console.log('Teacher Login');
      updateTeamMembers();
      io.emit('qr', ip.address()+":3000");
      updateTeam();
      updateXP();
    } else{
      console.log('login failed',userID);
      io.to(socket.id).emit('login', false);
    }
	});

  socket.on('changeTeam', (id, team) => {
    let user = users[id];
    console.log("moving",user.name,"to team",team);
    users[id].team = team;
    console.log(user.team);
    updateTeam();
    updateXP();
    updateTeamMembers();
  });

  socket.on('card', (teamID, userID, giveCard) => {
    console.log("card:",teamID, userID, giveCard);
    let xpChange = 0;
    switch(giveCard){
      case 0:
        //green
        xpChange = 10 + Math.round(teams[teamID].dragon_mood/10);
        moodChange(teamID, 1);
        if(userID != 0){
          users[userID].green = users[userID].green+1;
          users[userID].points = users[userID].points+10;
          console.log(users[userID].green);
        }
        break;
      case 1:
        //yellow
        xpChange = -5;
        moodChange(teamID, -5);
        if(userID != 0){
          users[userID].yellow  = users[userID].yellow + 1;
          users[userID].points = users[userID].points - 10;
        }
        break;
      case 2:
        //red
        xpChange = -10;
        moodChange(teamID, -10);
        if(userID != 0){
          users[userID].red = users[userID].red + 1;
          users[userID].points = users[userID].points - 20;
        }
        break;
    }
    if(userID == 0){
      xpChange *= 3;
    }
    teams[teamID].xp = Math.max(0, teams[teamID].xp + xpChange);
    users[userID].points = Math.max(0, users[userID].points);
    console.log("XP Change:",teams[teamID].dragon_name, teams[teamID].xp,'('+xpChange+')');
    updateXP(teamID);
    updateTeam(teamID);
    updateUser(userID);
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
  io.emit('updateXP', team, teams[team].xp, teams[team].level);
  saveJson(teams, "teams");
  saveJson(users, "users");
}

function updateTeam(team){
  if(team == undefined){ //update all teams
    for(let i=0; i<4; i++){
      updateTeam(i);
    }
    return;
  }
  io.emit('updateTeam', team, teams[team]);
}

function updateUser(userID){
  console.log("update for",users[userID]);
  io.emit('updateUser', userID, users[userID]);
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