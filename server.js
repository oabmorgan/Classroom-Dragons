const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const e = require('express');
const express = require("express");
const { connect } = require('http2');
const port = process.env.PORT || 3000;
const ip = require("ip");

var address;

app.use(express.static("student"));
app.use(express.static("teacher"));
app.use(express.static("screen"));

var users = {
    "teacher@seto-solan.ed.jp": {
       "socket": "",
       "userType": "teacher",
       "realName": "Mr. Oliver",
       "class": "1-2",
       "team": 0,
       "quest": "",
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answers": ""
    },
    "omorgan@seto-solan.ed.jp": {
       "socket": "",
       "userType": "student",
       "realName": "Oliver",
       "class": "1-2",
       "team": 1,
       "quest": "",
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answers": ""
    },
    "student@seto-solan.ed.jp": {
       "socket": "",
       "userType": "student",
       "realName": "MORG",
       "class": "1-2",
       "team": 2,
       "quest": "",
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answers": ""
    }
}

var teams = {
    0:{
        "name":"Team 0",
        "xp":0,
        "level":0
    },
    1:{
        "name":"Team 1",
        "xp":0,
        "level":0
    },
    2:{
        "name":"Team 2",
        "xp":0,
        "level":0
    },
    3:{
        "name":"Team 3",
        "xp":0,
        "level":0
    }
}

function socketToEmail(socket){
    for (const email in users) {
        if(users[email].socket == socket){
            return email;
        }
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/student/student.html');
});
app.get('/screen', (req, res) => {
    res.sendFile(__dirname + '/screen/screen.html');
});

io.on('connection', (socket) => {
    //User joins, save their socket
    socket.on('join', function (email) {
        if(email == "screen"){
            console.error("New Screen Connected");
            socket.join("screens");
            io.to(socket.id).emit('qr', address);
            for(let i=0; i<Object.keys(teams).length; i++){
                io.to(socket.id).emit('updatexp', i, teams[i].xp);
            }
            return;   
        }
        //Catch unregistered emails
        if(users[email] == undefined){
            console.error("Unregistered email: "+email);
            io.to(socket.id).emit("login", false);
            return;
        }
        users[email].socket = socket.id;
        console.log(users[email].realName + " connected. ("+email+")");
        io.to(socket.id).emit("login", true);
        socket.join("students");
    });

    //User disconnects, clear socket
    socket.on('disconnect', () => {
        if(socket != undefined){
            let email = socketToEmail(socket.id);
            if(email != null){
                console.log(users[email].realName + " disconnected. ("+email+")");
                users[email].socket = "";
            }
        }
    });

    socket.on('xp', (email, amount) => {
        if(users[email] != undefined){
            let user = users[email];
            //dont let xp go negative
            if(user.xp < 0){ user.xp = 0};

            //give user xp
            user.xp += amount;
            console.log(user.realName + " got "+amount + "xp! ("+user.xp+")");
            io.to(user.socket).emit('xp', amount, user.xp);

            //give users team xp
            if(user.team == null){return};
            let team = teams[user.team];
            team.xp += amount;
            console.log(team.name + " team got "+amount + "xp!");
            io.emit('updatexp', user.team, team.xp);
        }
    });
});

http.listen(port, () => {
    address = ip.address()+':'+port;
    console.log('listening on '+address);
});