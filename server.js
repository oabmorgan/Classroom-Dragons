const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const e = require('express');
const express = require("express");
const { connect } = require('http2');
const port = process.env.PORT || 3000;
const ip = require("ip");
const fs = require('fs');

const xpMultiplier = 2.2;
const xpTeamMultiplier = 5.2;
var qid=0;
var address;

app.use(express.static("student"));
app.use(express.static("images"));
app.use(express.static("teacher"));
app.use(express.static("screen"));

//https://www.convertcsv.com/csv-to-json.htm

let rawdata = fs.readFileSync('users.json');
let users = JSON.parse(rawdata);

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
var goals = [];

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
app.get('/teacher', (req, res) => {
    res.sendFile(__dirname + '/teacher/teacher.html');
});
app.get('/screen', (req, res) => {
    res.sendFile(__dirname + '/screen/screen.html');
});

io.on('connection', (socket) => {
    //User joins, save their socket
    socket.on('join', function (email) {
        console.log("attempted connection: ",email);
        if(email == "screen"){
            console.error("New Screen Connected");
            socket.join("screens");
            io.to(socket.id).emit('qr', address);
            updateXP();
            return;   
        }
        if(email == "teacher"){
            console.error("New Teacher Connected");
            socket.join("teachers");
            updateTeams();
            updateXP();
            updateGoals();
            return;   
        }
        //Catch unregistered emails
        if(users[email] == undefined){
            console.error("Unregistered email: "+email);
            io.to(socket.id).emit("login", -1);
            return;
        }
        let socket_old = io.sockets.sockets.get(users[email].socket);
        if(socket_old != undefined){
            io.to(users[email].socket).emit("login", -2);
        }
        users[email].socket = socket.id;
        console.log(users[email].realName + " connected. ("+email+", "+users[email].team+")");
        io.to(socket.id).emit("login", users[email].team, users[email].realName);
        io.to(socket.id).emit("updatecard", users[email].green, users[email].yellow, users[email].red);
        updateXP();
        updateGoals();
        updateConnections();
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
        updateConnections();
    });

    socket.on('setGoal', (setReward, setDescription) => {
        goals.push({id:qid++, description:setDescription, reward:setReward});
        console.log("added a new goal");
        updateGoals();
    });

    socket.on('setQuestion', (question, answers) => {
        console.log("new question: "+question, answers);
        io.emit("askQuestion", -1, question, answers);
    });

    socket.on('setTeam', (email, team) => {
        if(users[email] != undefined){
            console.log("setting "+email+" to team "+team);
            users[email].team = team;
            updateTeams();
        }
    });

    socket.on('setCorrect', (answer) => {
        console.log("Correct answer is: "+answer);
        for (const email in users) {
            let user = users[email];
            if(user.answer == answer){
                giveCard(email, "green");
                console.log(user.realName+" got it right!");
            }
            user.answer = -1;
        }
    });

    socket.on('giveCard', (email, card) => {
        giveCard(email, card);
        console.log("Giving a "+card+" card");
    });

    socket.on('cancelGoal', (id) => {
        goals.splice(id, 1); 
        console.log("clearning goal");
        updateGoals();
    });

    socket.on('sendAnswer', (email, questionID, answerID) => {
        let user = users[email];
        user.answer = answerID;
        console.log(user.realName + " answerered "+answerID);
    });

    socket.on('completeGoal', (email, goalid) => {
        let user = users[email];
        for(let i=0; i<goals.length; i++){
            if(goals[i].qid == goalid){
                user.goals.push(goals[i].qid);
                let xpReward = goals[i].reward * xpMultiplier;
                users[email].xp += xpReward;
                teams[users[email].team].xp += xpReward;
                updateXP();
            }
        }
    });

    socket.on('xp', (id, amount) => {
        if(teams[id] != undefined){
            giveTeamXP(id, amount);
            return;
        }
        if(users[id] != undefined){
            giveUserXP(id, amount);
        }
    });
});

function giveTeamXP(id, amount){
    console.log("teamXP");
    let team = teams[id];

    //multipier for positive xp
    amount = Math.max(amount, amount*xpTeamMultiplier);

    //add xp - keep positive
    team.xp = Math.max(amount + team.xp, 0);
    console.log(team.name + " team got "+amount + "xp! (x5 bonus)");
        
    //Check for level up
    if(team.xp > team.level*100){
        team.level++;
        console.log(team.name + " is now level "+team.level);
    }

    updateXP();
}

function updateConnections(){
    for (const email in users) {
        if(users[email].socket != ""){
            io.emit('setConnectionState', email, true);
        } else {
            io.emit('setConnectionState', email, false);
        }

    }
}

function giveUserXP(id, amount){
    let user = users[id];
    let team = teams[users[id].team];

    //multipier for positive xp
    amount = Math.max(amount, amount*xpMultiplier);

    //add xp - keep positive
    team.xp = Math.max(amount + team.xp, 0);
    user.xp = Math.max(amount + user.xp, 0);

    console.log(user.realName + " got "+amount + "xp!");
    console.log(team.name + " team got "+amount + "xp!");

    //Check for level up
    if(team.xp > team.level*100){
        team.level++;
        console.log(team.name + " is now level "+team.level);
    }

    updateXP();
}

function giveCard(email, card){
    if(users[email] == undefined){
        console.log("givecard to team "+teams[email-1].name);
        switch(card){
            case "green":
                giveTeamXP(email-1, 10);
                break;
            case "yellow":
                giveTeamXP(email-1, -5);
                break;
            case "red":
                giveTeamXP(email-1, -10);
                break;
        }
        io.emit('cardAlert', card, email-1, teams[email-1].name);
        return;
    }
    console.log("givecard "+email,card);
    let user = users[email];
    switch(card){
        case "green":
            user.green ++;
            giveUserXP(email, 10);
            break;
        case "yellow":
            user.yellow ++;
            giveUserXP(email, -5);
            break;
        case "red":
            user.red ++;
            giveUserXP(email, -10);
            break;
    }
    io.emit('cardAlert', card, user.team, teams[user.team].name, user.realName);
    io.to(user.socket).emit("updatecard", user.green, user.yellow, user.red);
}

function updateGoals(){
    console.log("Updating Goals");
    io.emit('updateGoals', goals);
}

function updateXP(){
    console.log("Updating XP");
    for(let i=0; i<Object.keys(teams).length; i++){
        io.emit('updatexp', i, teams[i].xp);
    }
}

function updateTeams(){
    console.log("Updating Teams");
    io.emit('updateTeams', "clear");
    for (const email in users) {
        io.emit('updateTeams', email, users[email].realName, users[email].team, teams[users[email].team].name);
    }
    updateXP();
    let data = JSON.stringify(users);
    fs.writeFileSync('users.json', data);
}

http.listen(port, () => {
    address = ip.address()+':'+port;
    console.log('Server Started');
    console.log('listening on '+address);
});