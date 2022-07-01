const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const { debug } = require('console');
const express = require("express");
app.use(express.static("student"));
app.use(express.static("teacher"));
app.use(express.static("screen"));

var teams = {
  team0:{
    name:"Team 1",
    xp:0,
    level:0,
    IDs:[]
  },
  team1:{
    name:"Team 2",
    xp:0,
    level:0,
    IDs:[]
  },
  team2:{
    name:"Team 3",
    xp:0,
    level:0,
    IDs:[]
  },
  team3:{
    name:"Team 4",
    xp:0,
    level:0,
    IDs:[]
  }
}

var currentGoalion = {
  goalion: "",
  correctAnswer: -1,
  answer0:{
    answer: "",
    IDs: []
  },
  answer1:{
    answer: "",
    IDs: []
  },
  answer2:{
    answer: "",
    IDs: []
  },
  answer3:{
    answer: "",
    IDs: []
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/student/student.html');
});

app.get('/teacher', (req, res) => {
  res.sendFile(__dirname + '/teacher/teacher.html');
});

app.get('/screen', (req, res) => {
  res.sendFile(__dirname + '/screen/screen.html');
});

io.on('connection', (socket) => {
  socket.on('answer', (answer) => {
    console.log(answer.ID+" answered "+ answer.ansNumber);
    currentGoalion["answer"+answer.ansNumber].IDs.push(answer.ID);
    io.emit('answer', currentGoalion);
  });

  socket.on('goalion', (goalion) => {
    currentGoalion = goalion;
    console.log(goalion.goalion);
    if(currentGoalion.correctAnswer >= 0){
      console.log("Answer was: "+currentGoalion.correctAnswer);
      currentGoalion["answer"+currentGoalion.correctAnswer].IDs.forEach(ID =>{
        for(var i=0; i<4; i++){
          teams["team"+i].IDs.forEach(member => console.log(member));
          if(teams["team"+i].IDs.includes(ID)){
            console.log("Points for team "+i);
            giveXP(i, 10);
          }
        }
      });
    }
    io.emit('goalion', goalion);
  });

  socket.on('join', function (group, id) {
    socket.join(group);
    console.log(id+" ("+group + ") connected");
    switch(group){
      case "teacher":
      break;
      case "student":
        teams["team0"].IDs.push(id);
        io.to("teacher").emit('join', id);
      break;
      case "screen":
        console.log("Sending qr code");
        var ip = require("ip");
        io.to("screen").emit('qr', ip.address()+":"+port);
      break;
    }
  });
});

http.listen(port, () => {
  var ip = require("ip");
  console.log(ip.address()+`:${port}`);
});

function giveXP(team, count){
  teams["team"+team].xp += count;
  console.log("Team " + team + " has " + teams["team"+team].xp + "xp");
}