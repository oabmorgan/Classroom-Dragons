var socket = io();
var email;
var team;
var xp;
var myName;
var myQuests;

window.onload = function(){
  document.getElementById("sumbitButton").addEventListener('click', function(){
    email = document.getElementById("email").value+"@seto-solan.ed.jp";
    socket.emit('join', email);
  });
}

function selectQuest(id){
  for(let i=0; i<3; i++){
    if(id == i){
      document.getElementById("quest"+i).style.opacity = 1;
    } else {
      document.getElementById("quest"+i).style.opacity = .2;
    }
  }
}

socket.on('login', (newTeam, newName) => {
  if(newTeam > 0){
    document.getElementById("logincontainer").style.visibility = 'hidden';
    document.getElementById("loginfeedback").style.visibility = 'hidden';
    team = newTeam;
    myName = newName;
    document.getElementById("myName").innerHTML = newName;
    console.log("My name is "+myName +" and I am on team "+team)
    document.getElementById("quest0").addEventListener('click', function(){ selectQuest(0)});
    document.getElementById("quest1").addEventListener('click', function(){ selectQuest(1)});
    document.getElementById("quest2").addEventListener('click', function(){ selectQuest(2)});
  } else {
    switch(newTeam){
      case -1:
        document.getElementById("loginfeedback").innerHTML = "Error: Email not registered";
      break;
      case -2:
        alert("Disconnected: Email logged in somewhere else");
        window.location.reload();
      break;
    }
    document.getElementById("logincontainer").style.visibility = 'visible';
    document.getElementById("loginfeedback").style.visibility = 'visible';
  }
})

socket.on('xp', (gain, total) => {
  console.log("Yay I got xp! "+gain);
  xp = total; 
  console.log("Now I have "+total);
})

socket.on('updateQuests', (quests) => {
  myQuests = quests;
  for(var i=0; i<3; i++){
    let quest=myQuests[i];
    if(quest == undefined){
      document.getElementById("quest"+i).style.visibility = "hidden";
      break;
    }
    document.getElementById("questReward"+i).innerHTML = quest.reward;
    document.getElementById("questDescription"+i).innerHTML = quest.description;
    if(quest.reward > 0){
      document.getElementById("quest"+i).style.visibility = "visible";
    } else {
      document.getElementById("quest"+i).style.visibility = "hidden";
    }
  }
})

socket.on('updatecard', (green, yellow, red) => {
  document.getElementById("greenCards").innerHTML = green;
  document.getElementById("yellowCards").innerHTML = yellow;
  document.getElementById("redCards").innerHTML = red;
});

socket.on('updatexp', (updateTeam, xp) => {
  if(updateTeam == team){
    console.log("My team got xp! "+team);
    document.getElementById("MyteamxpFill").style.height = xp%100+"%";
    let level = Math.floor(xp/100);
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
});
