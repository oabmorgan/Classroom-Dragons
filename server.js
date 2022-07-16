const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {	Server } = require("socket.io");
const io = new Server(server);
const port = 3000;
const ip = require("ip");
const fs = require('fs');
const open = require('open');

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
  
  socket.on('rename', (team, newName) => {
    teams[team].dragon_name = newName;
    console.log(team, newName);
    updateTeam();
  });

  socket.on('changeTeam', (id, team) => {
    let user = users[id];
    console.log("moving",user.name,"to team",team);
    users[id].team = team;
    updateTeam();
    updateXP();
    updateTeamMembers();
  });

  socket.on('card', (teamID, userID, card) => {
    giveCard(teamID, userID, card);
  });
});

function giveCard(teamID, userID, card){
  if(userID == 0){
    for(let i=0; i<Object.keys(users).length; i++){
      if(users[Object.keys(users)[i]].team == teamID){
        giveCard(teamID, Object.keys(users)[i], card);
      }
    }
    return;
  }
  console.log(teamID,userID,card);
  //console.log("card:",teamID, userID, giveCard);

  let xp;
  let points;
  let mood;

  switch(card){
    case 0:
      xp = 10;
      points = 5;
      mood = 1;
    break;
    case 1:
      xp = -5;
      points = -5;
      mood = -5;
    break;
    case 2:
      xp = -10;
      points = -10;
      mood = -10;
    break;
  }

  moodChange(teamID, mood);
  xp = Math.round(xp * (1+(teams[teamID].dragon_mood/100)));

  users[userID].cards[giveCard] ++;
  users[userID].points += clamp(points, 0);
  teams[teamID].xp += clamp(xp, 0);

  console.log("XP Change:",teams[teamID].dragon_name, teams[teamID].xp,'('+xp+')');

  updateXP(teamID);
  updateTeam(teamID);
  updateUser(userID);
}

function moodChange(team, change){
  teams[team].dragon_mood = clamp(teams[team].dragon_mood + change, 0, 100);
}

function clamp(input, min=input, max=input){
  return Math.min(Math.max(input, min), max);
}

function updateXP(team){
  if(team == undefined){ //update all teams
    for(let i=0; i<4; i++){
      updateXP(i);
    }
    return;
  }
  let currentTeam = teams[team];
  let currentLevel = currentTeam.level;
  let newLevel = Math.ceil(currentTeam.xp / 100);
  if(newLevel > currentLevel){
    teams[team].level = newLevel;
  }
  io.emit('updateXP', team, currentTeam.xp, currentTeam.level);
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
  //console.log("update for",users[userID]);
  io.emit('updateUser', userID, users[userID]);
}

function resetTeams(){
  for(let i=0; i<4; i++){
    let currentTeam = teams[i];
    currentTeam.xp = 0;
    currentTeam.level = 1;
    currentTeam.dragon_name = "Team "+i;
    currentTeam.dragon_type = "egg";
    currentTeam.dragon_size = 25;
    currentTeam.dragon_mood = 50;
  }
  saveJson(teams, "teams");
}

server.listen(3000, () => {
	console.log(ip.address() + ':3000');
  //open('http://'+ip.address() + ':3000/teacher');
});