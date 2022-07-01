const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const e = require('express');
const express = require("express");
const { connect } = require('http2');
const port = process.env.PORT || 3000;
const ip = require("ip");

const xpMultiplier = 2.2;
const xpTeamMultiplier = 5.2;
var qid=0;
var address;

app.use(express.static("student"));
app.use(express.static("images"));
app.use(express.static("teacher"));
app.use(express.static("screen"));

//https://www.convertcsv.com/csv-to-json.htm
var users = {
    "2022003@seto-solan.ed.jp": {
       "realName": "Ema",
       "socket": "",
       "class": "1-2",
       "team": 1,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022010@seto-solan.ed.jp": {
       "realName": "Toma",
       "socket": "",
       "class": "1-2",
       "team": 1,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022076@seto-solan.ed.jp": {
       "realName": "Koshi",
       "socket": "",
       "class": "1-2",
       "team": 3,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022004@seto-solan.ed.jp": {
       "realName": "Chihiro",
       "socket": "",
       "class": "1-2",
       "team": 0,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022013@seto-solan.ed.jp": {
       "realName": "Yutaro",
       "socket": "",
       "class": "1-2",
       "team": 0,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022045@seto-solan.ed.jp": {
       "realName": "Fuma",
       "socket": "",
       "class": "1-2",
       "team": 3,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022038@seto-solan.ed.jp": {
       "realName": "Takumi",
       "socket": "",
       "class": "1-2",
       "team": 2,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022002@seto-solan.ed.jp": {
       "realName": "Ryotaro",
       "socket": "",
       "class": "1-2",
       "team": 2,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022009@seto-solan.ed.jp": {
       "realName": "Fuku",
       "socket": "",
       "class": "1-2",
       "team": 1,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022016@seto-solan.ed.jp": {
       "realName": "Yuta",
       "socket": "",
       "class": "1-2",
       "team": 0,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022025@seto-solan.ed.jp": {
       "realName": "Ruriju",
       "socket": "",
       "class": "1-2",
       "team": 3,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022069@seto-solan.ed.jp": {
       "realName": "Kippei",
       "socket": "",
       "class": "1-2",
       "team": 0,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022077@seto-solan.ed.jp": {
       "realName": "Mio",
       "socket": "",
       "class": "1-2",
       "team": 3,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022054@seto-solan.ed.jp": {
       "realName": "Wako",
       "socket": "",
       "class": "1-2",
       "team": 2,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022022@seto-solan.ed.jp": {
       "realName": "Yua",
       "socket": "",
       "class": "1-2",
       "team": 2,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022070@seto-solan.ed.jp": {
       "realName": "Andy",
       "socket": "",
       "class": "1-2",
       "team": 1,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022062@seto-solan.ed.jp": {
       "realName": "Taisei",
       "socket": "",
       "class": "1-2",
       "team": 0,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022046@seto-solan.ed.jp": {
       "realName": "Koga",
       "socket": "",
       "class": "1-2",
       "team": 0,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022059@seto-solan.ed.jp": {
       "realName": "Mariya",
       "socket": "",
       "class": "1-2",
       "team": 1,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022049@seto-solan.ed.jp": {
       "realName": "Ichiro",
       "socket": "",
       "class": "1-2",
       "team": 3,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022072@seto-solan.ed.jp": {
       "realName": "Kenji",
       "socket": "",
       "class": "1-2",
       "team": 1,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022034@seto-solan.ed.jp": {
       "realName": "Umeka",
       "socket": "",
       "class": "1-2",
       "team": 2,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022047@seto-solan.ed.jp": {
       "realName": "Kengo",
       "socket": "",
       "class": "1-2",
       "team": 2,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022044@seto-solan.ed.jp": {
       "realName": "Leo",
       "socket": "",
       "class": "1-2",
       "team": 0,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022048@seto-solan.ed.jp": {
       "realName": "Yuito",
       "socket": "",
       "class": "1-2",
       "team": 3,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
    },
    "2022073@seto-solan.ed.jp": {
       "realName": "Wataru",
       "socket": "",
       "class": "1-2",
       "team": 1,
       "goals": [],
       "xp": 0,
       "green": 0,
       "yellow": 0,
       "red": 0,
       "answer": -1
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
            socket_old.disconnect();
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
        io.emit('cardAlert', card, teams[email-1].name);
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
    io.emit('cardAlert', card, teams[user.team].name, user.realName);
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
        io.emit('updateTeams', email, users[email].realName, users[email].team);
    }
}

http.listen(port, () => {
    address = ip.address()+':'+port;
    console.log('Server Started');
    console.log('listening on '+address);
});