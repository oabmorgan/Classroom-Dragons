const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const express = require("express");
const port = process.env.PORT || 3000;
const ip = require("ip");
const fs = require('fs'); //save/load

//set static folders
app.use(express.static("images"));
app.use(express.static("shared"));
app.use(express.static("student"));
app.use(express.static("teacher"));

//http listener
http.listen(port, () => {
    address = ip.address()+':'+port;
    console.log('Listening on '+address);
});

//handle address
app.get('/', (req, res) => {
    console.log(req);
    res.sendFile(__dirname + '/student/student.html');
});
app.get('/teacher', (req, res) => {
    res.sendFile(__dirname + '/teacher/teacher.html');
});

//serve connection
io.on('connection', (socket) => {
})