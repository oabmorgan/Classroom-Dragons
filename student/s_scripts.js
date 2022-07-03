var socket = io();
var email;
var team;
var myXP = 0;
var myName;
var myGoals;

var tickInterval;

var questionID = -1;

window.onload = function(){
  let savedEmail = document.cookie;
  document.getElementById("MyteamxpFill").style.height = 0+"%";
  if(savedEmail.length){
    email = savedEmail;
    socket.emit('join', email);
    console.log("Saved Email: "+email);
  }
  document.getElementById("sumbitButton").addEventListener('click', function(){
    email = document.getElementById("email").value+"@seto-solan.ed.jp";
    socket.emit('join', email);
  });
}

function tick(){
  let bigCard = document.getElementById("bigCard");
  let xpFill = document.getElementById("MyteamxpFill");

  let xpFillPct = parseInt(xpFill.style.height);
  let xpTargetPct = myXP%100;
  let xpDifference = xpTargetPct - xpFillPct;

  if (Math.abs(xpTargetPct - xpFillPct) > 3){
    let newPct = xpFillPct + Math.ceil(xpDifference*0.3);
    if(newPct >= 100){
      newPct -= 100;
    }
    xpFill.style.height = newPct + "%";
    return;
  }
  if(bigCard.style.opacity > 0){
    bigCard.style.opacity -= 0.1;
    return;
  }
  clearInterval(tickInterval);
}

function selectGoal(id){
  for(let i=0; i<3; i++){
    if(id == i){
      document.getElementById("goal"+i).style.opacity = 1;
    } else {
      document.getElementById("goal"+i).style.opacity = .2;
    }
  }
}

socket.on('login', (newTeam, newName) => {
  if(newTeam >= 0){
    document.getElementById("loginContainer").style.visibility = 'hidden';
    document.getElementById("loginfeedback").style.visibility = 'hidden';
    team = newTeam;
    myName = newName;
    document.getElementById("myName").innerHTML = newName;
    console.log("My name is "+myName +" and I am on team "+team)
    document.getElementById("goal0").addEventListener('click', function(){ selectGoal(0)});
    document.getElementById("goal1").addEventListener('click', function(){ selectGoal(1)});
    document.getElementById("goal2").addEventListener('click', function(){ selectGoal(2)});

    document.getElementById("answer0").addEventListener('click', function(){ sendAnswer(0)});
    document.getElementById("answer1").addEventListener('click', function(){ sendAnswer(1)});
    document.getElementById("answer2").addEventListener('click', function(){ sendAnswer(2)});
    document.getElementById("answer3").addEventListener('click', function(){ sendAnswer(3)});

    var now = new Date();
    now.setTime(now.getTime() + 12 * 60 * 60 * 1000);
    document.cookie = email+"; expires=" + now.toUTCString() + ";path=/";

  } else {
    document.cookie = "";
    switch(newTeam){
      case -1:
        document.getElementById("loginfeedback").innerHTML = "Error: Email not registered";
      break;
      case -2:
        document.getElementById("loginfeedback").innerHTML = "Error: Logged in somewhere else";
        email = "";
        document.cookie = "logged out";
      break;
    }
    document.getElementById("loginContainer").style.visibility = 'visible';
    document.getElementById("loginfeedback").style.visibility = 'visible';
  }
})

function sendAnswer(answerID){
  socket.emit('sendAnswer', email, questionID, answerID);
  console.log("answering question: "+answerID);
  document.getElementById("questionContainer").style.visibility = 'hidden';
}

socket.on('askQuestion', (QID, question, answers) => {
  console.log("New question: "+question);
  quesitonID = QID;

  document.getElementById("question").innerHTML = question;

  document.getElementById("answer0").innerText = answers[0];
  document.getElementById("answer1").innerText = answers[1];
  document.getElementById("answer2").innerText = answers[2];
  document.getElementById("answer3").innerText = answers[3];

  document.getElementById("questionContainer").style.visibility = 'visible';
})

socket.on('updateTeams', (updateEmail, realName, updateTeam, updateteam = 0) => {
  if(updateEmail == email){
    team = updateTeam;
    document.getElementById("teamName").innerHTML = updateteam;
  }
})

socket.on('updateGoals', (goals) => {
  myGoals = goals;
  for(var i=0; i<3; i++){
    let goal=myGoals[i];
    if(goal == undefined){
      document.getElementById("goal"+i).style.visibility = "hidden";
      break;
    }
    document.getElementById("goalReward"+i).innerHTML = goal.reward;
    document.getElementById("goalDescription"+i).innerHTML = goal.description;
    if(goal.reward > 0){
      document.getElementById("goal"+i).style.visibility = "visible";
    } else {
      document.getElementById("goal"+i).style.visibility = "hidden";
    }
  }
})

socket.on('updatecard', (green, yellow, red) => {
  document.getElementById("greenCards").innerHTML = green;
  document.getElementById("yellowCards").innerHTML = yellow;
  document.getElementById("redCards").innerHTML = red;
});

socket.on('cardAlert', (color, teamID, teamName, realName = "") => {
  if(team != teamID){
    return;
  }
  if(realName == ""){
    realName = teamName;
  }
  let bigCard = document.getElementById("bigCard");
  bigCard.style.opacity = 6;
  clearInterval(tickInterval);
  tickInterval = setInterval(tick, 40);
  switch(color){
    case "green":
      bigCard.style.backgroundColor = 'rgb(133, 255, 96)';
      bigCard.innerHTML = "<p><h1>" + realName + "</h1></p><p>" + " got a <b>green</b> card!</p>";
    break;
    case "yellow":
      bigCard.style.backgroundColor = 'rgb(245, 225, 53)';
      bigCard.innerHTML = "<p><h1>" + realName + "</h1></p><p>" + " got a <b>yellow</b> card</p>";
    break;
    case "red":
      bigCard.style.backgroundColor = 'rgb(254, 61, 27)';
      bigCard.innerHTML = "<p><h1>" + realName + "</h1></p><p>" + " got a <b>red</b> card...</p>";
    break;
  }
});

socket.on('updatexp', (updateTeam, setXP) => {
  updateXP(updateTeam, setXP);
});

function updateXP(updateTeam, setXP){  
  if(updateTeam == team){
    console.log("My team got xp! "+team, myXP);
    clearInterval(tickInterval);
    tickInterval = setInterval(tick, 40);
    myXP = setXP;
    let level = Math.floor(myXP/100);
    switch(level){
        case 0:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(185, 248, 225)';
            document.getElementById("teamChar").src = "images/0.png";
        break;
        case 1:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(119, 226, 234)';
            document.getElementById("teamChar").src = "images/1.png";
        break;
        case 2:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(77, 141, 253)';
            document.getElementById("teamChar").src = "images/1.png";
        break;
        case 3:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(74, 228, 255)';
            document.getElementById("teamChar").src = "images/2.png";
        break;
        case 4:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(111, 255, 155)';
            document.getElementById("teamChar").src = "images/2.png";
        break;
        case 5:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(171, 255, 81)';
            document.getElementById("teamChar").src = "images/3.png";
        break;
        case 6:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(229, 255, 60)';
            document.getElementById("teamChar").src = "images/3.png";
        break;
        case 7:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(255, 115, 253)';
            document.getElementById("teamChar").src = "images/4.png";
        break;
        case 8:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(194, 73, 255)';
            document.getElementById("teamChar").src = "images/4.png";
        break;
        default:
            document.getElementById("MyteamLevel").style.backgroundColor = 'rgb(255, 42, 120)';
            document.getElementById("teamChar").src = "images/4.png";
        break;
    }
    document.getElementById("MyteamLevel").innerHTML = level;
  }
}
