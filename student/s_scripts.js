
var socket = io();

var currentContent = "login";

var userID;
var user;
var team;

window.onload = function() {
  showContent(currentContent);
  document.getElementById('login_submit').addEventListener('click', function(){
    userID = document.getElementById('login_email').innerText;
    socket.emit('login', userID);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && currentContent == "login") {
      userID = document.getElementById('login_email').innerText;
      socket.emit('login', userID);
      event.preventDefault()
    }
  })
}

/*
  login
*/
//console.log('login', userID, true);
socket.on('login', function(success){
  if(success){
    console.log("login OK");
    showContent("main");
  } else {
    console.log("login failed");
    showContent("login");
  }
});

socket.on('updateUser', function(ID, userInfo){
  if(ID == userID){
    user = userInfo;
    document.getElementById("name").innerText = user.name;
    document.getElementById("cardCount_green").innerText = user.green;
    document.getElementById("pointCount").innerText = user.points;
    document.getElementById("cardCount_yellow").innerText = user.yellow;
    document.getElementById("cardCount_red").innerText = user.red;
  }
});

function showContent(newContent){
  currentContent = newContent;
  switch(newContent){
    case "main":
      document.getElementById("content_login").style.display = "none";
      document.getElementById("content").style.display = "flex";
      //document.getElementById("content_quiz").style.zIndex = -1;
      //document.getElementById("content_draw").style.zIndex = -1;
    break;
    case "login":
      document.getElementById("content_login").style.display = "block";
      document.getElementById("content").style.display = "none";
      //document.getElementById("content_draw").style.zIndex = -1;
    break;
    case "draw":
      document.getElementById("content_login").style.visibility = "hidden";
      document.getElementById("content").style.visibility = "hidden";
      //document.getElementById("content_draw").style.zIndex = 10;
    break;
    case "quiz":
      document.getElementById("content_login").style.visibility = "hidden";
      document.getElementById("content").style.visibility = "hidden";
      //.getElementById("content_draw").style.zIndex = -1;
    break;
  }
}


/*
  Update XP
*/

socket.on('updateXP', function(team, xp){
  if(team != user.team){return};
  let xpFill = document.getElementById("xp_fill");
  let level = document.getElementById("team_level");
  xpFill.style.height = xp%100 + "%";
  level.innerHTML = Math.ceil(xp/100);
});

socket.on('updateTeam', function(teamID, teamInfo){
  if(teamID != user.team){return};
  team = teamInfo;
  let dragon = document.getElementById("dragon");

  document.getElementById("dragon_name").innerHTML = team.dragon_name;

  dragon.setAttribute("data", "../images/dragons/"+team.dragon_type+".svg");

  dragon.addEventListener('load', function(){
    let svg = dragon.contentDocument;
    document.getElementById("xp_fill").style.backgroundColor = team.primary;
    document.getElementById("xp_fill").style.borderTopColor = team.secondary;
    dragon.style.maxWidth = team.dragon_size+"%";

    var paths = svg.getElementsByTagName("path");
    for(let i=0; i<paths.length; i++){
      switch(paths[i].getAttribute("class")){
        case "primaryColor":
          paths[i].style.fill = team.primary;
        break;
        case "secondaryColor":
          paths[i].style.fill = team.secondary;
        break;        
      }
    }
    dragon.removeEventListener('dragon', this);
  });
});
