const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var port = 3000;
const ip = require("ip");

app.get('/', (req, res) => {
	res.sendFile(__dirname + 'whiteboard.html');
});

app.get('/teacher', (req, res) => {
	res.sendFile(__dirname + 'gallery.html');
});

io.on('connection', (socket) => {
	socket.on('login', (userID, teacher) => {
	});
});

server.listen(port, () => {
	console.log(ip.address() + ':'+port);
});