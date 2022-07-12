const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;
const ip = require("ip");
const fs = require('fs');

app.use(express.static("student"));
app.use('/images', express.static('images'));
app.use(express.static("teacher"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/student/student.html');
  });
  
  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('login', (userID) => {
        console.log(userID);
        io.emit('updateXP', 0, 50);
        io.emit('updateDragon', team, name, type, size, primaryColor, secondayColor);
    });
  });
  
  server.listen(3000, () => {
    console.log('listening on *:3000');
  });