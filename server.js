const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const express = require("express");
app.use(express.static("student"));
app.use(express.static("teacher"));
app.use(express.static("screen"));

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
  socket.on('answer', (answer, correct) => {
    if(correct){
      console.log('Correct answer is: ' + answer);
    } else {
      console.log('Passing answer: ' + answer);
      io.sockets.emit('answer', answer);
    }
  });

  socket.on('question', (question, answers) => {
    console.log(question);
    for(var i=0; i<answers.length; i++){
      console.log(answers[i]);
    }
    io.emit('question', question, answers);
  });

  socket.on('join', function (group, id) {
    socket.join(group);
    console.log(id+" ("+group + ") connected");
    switch(group){
      case "teacher":
      break;
      case "student":
      break;
      case "screen":
      break;
    }
  });
});

http.listen(port, () => {
  var ip = require("ip");
  console.log(ip.address()+`:${port}`);
});