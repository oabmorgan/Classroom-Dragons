var socket = io();

var currentContent;

var mouseDownElement;
var mouseUpElement;

var userID;
var user = false;
var team = false;
var items = false;
var mode = 'main';

var pen = {
  "x":0,
  "y":0,
  "ink": 2500,
  "size": 20,
  "rate": 5,
  "down": false,
  "lock": false
};

window.onload = function() {
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      login_send();
      event.preventDefault()
    }

  });

  /*
    Set up canvas
  */

  window.addEventListener("pointerdown", function(e){mouseDown(e);});
  window.addEventListener("pointerup", function(e){mouseUp(e);});
  window.addEventListener("pointermove", function(e){mouseMove(e);});

  window.addEventListener('resize', function(){
    whiteboardReset();
  }); 

  document.getElementById('login_email').innerText = "2022003";
  login_send();

  switchMode("login");
  setInterval(animation_frame, 10);
}

function mouseDown(e){
  mouseDownElement = e.target;
  if(mouseDownElement == null){
    return;
  }
  switch(mouseDownElement.id){
    case 'whiteboard':
      penDown(e);
      break;
  }
}

function mouseMove(e){
  switch(mouseDownElement.id){
    case 'whiteboard':
      penMove(e);
      break;
  }
}

function mouseUp(e){
  mouseUpElement = e.target;
  penUp();
  //Click
  if(mouseUpElement == mouseDownElement){
    console.log("click:",mouseDownElement.id);
    switch(mouseDownElement.id){
      case "whiteboard_clear":
        if(!pen.lock){
          whiteboardReset();
        }
      break;
      case "whiteboard_send":
        if(!pen.lock){
          postWhiteboard();
        }
      break;
      case "login_submit":
        login_send();
      break;
    }
  }
}

function whiteboardReset(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  clearWhiteboard();
}

/*
  login
*/

function login_send(){
  userID = document.getElementById('login_email').innerText;
  socket.emit('login', userID);
}

socket.on('login', function(success){
  if(success){
    user = true;
    switchMode("main");
  }
});

/*
logout
*/

socket.on('logout', function(ID){
  if(ID == userID || ID == "all"){
    switchMode("login");
    document.getElementById('login_email').innerText = "";
    user = false;
    team = false;
    items = false;
  }
});

/*
Update User
Update Name, points & cards
*/

socket.on('updateUser', function(ID, userInfo){
  if(ID == userID){
    user = userInfo;
    if(user.team == -1){
      window.location.href = window.location + "teacher";
      return;
    }
    document.getElementById("name").innerText = user.name;
    document.getElementById("pointCount").innerText = user.points;
    document.getElementById("cardCount_green").innerText = user.cards["0"];
    document.getElementById("cardCount_yellow").innerText = user.cards["1"];
    document.getElementById("cardCount_red").innerText = user.cards["2"];

    let itemCosts = document.getElementsByClassName("item_cost");
    for(let i=0; i<itemCosts.length; i++){
      let cost = parseInt(itemCosts[i].innerText);
      if(cost <= user.points){
        itemCosts[i].style.color = "black";
        itemCosts[i].style.background = "rgb(255, 230, 107)";
        itemCosts[i].parentElement.style.opacity = "1";
      } else {
        console.log(cost, user.points);
        itemCosts[i].style.color = "rgb(109, 135, 151)";
        itemCosts[i].style.background = "rgb(159, 177, 188)";
        itemCosts[i].parentElement.style.opacity = "0.7";
      }
    }
  }
});

/*
  Update XP
  Update XP bar & level
*/

socket.on('updateXP', function(team, xp, level){
  if(!user || team != user.team){return};
  let xpFill = document.getElementById("xp_fill");
  let teamLevel = document.getElementById("team_level");
  teamLevel.innerText = level;
  //xpFill.style.height = xp%100 + "%";
  new_animation(xpFill, "height", xp%100, 0.3, "linearWrap");
  level.innerHTML = level;
  switch(level){
    case 0:
    case 1:
    case 2:
        teamLevel.style.background = "white";
    break;
    case 3:
    case 4:
        teamLevel.style.background = "rgb(51, 167, 255)";
        break;
    break;
    case 5:
    case 6:
    case 7:
    case 8:
        teamLevel.style.background = "rgb(106, 241, 119)";
        break;
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
        teamLevel.style.background = "rgb(255, 87, 98)";
        break;
    default:
        teamLevel.style.background = "rgb(255, 231, 77)"
}
});


/*
  Update background, dragon moon,  dragon name, dragon size, dragon image
*/
socket.on('updateTeam', function(teamID, teamInfo){
  if(!user || teamID != user.team){return};
  team = teamInfo;
  let dragon = document.getElementById("dragon");
  let background = document.getElementById("panel_mid");
  background.style.backgroundImage = "url(\"../images/background_"+team.background+".png\")";

  for(let i=0; i<5; i++){
      let moodIcon = document.getElementById("moodIcon"+i);
      if(team.dragon_mood <= i*20){
          moodIcon.src = "../images/heart_empty.png";
      } else if(team.dragon_mood <= i*20 + 10){
        moodIcon.src = "../images/heart_half.png";
    } else {
          moodIcon.src = "../images/heart.png";
      }
  }

  document.getElementById("dragon_name").innerHTML = team.dragon_name;

  //dragon.style.maxWidth = team.level*5 + team.dragon_size+"%";
  new_animation(dragon, "maxWidth", team.level*4 + team.dragon_size, 1, "linear");

  let newData = "../images/dragons/"+team.dragon_type+"/"+team.dragon_evol+".svg";
  if(dragon.getAttribute("data") != newData){
      dragon.setAttribute("data", newData);
      dragon.addEventListener('load', function(){
          updateColors(teamID);
      });
  } else{
    updateColors(teamID);
  }
});

/*
Update dragon colors (called after svg loads)
*/

function updateColors(teamID){
  let svg = document.getElementById("dragon").contentDocument;


  switch(team.primary){
    case "url(#silver)":
        document.getElementById("xp_fill").style.background = "linear-gradient(358deg, rgba(184,169,179,1) 4%, rgba(247,250,252,1) 31%, rgba(141,141,141,1) 87%)";
        document.getElementById("xp_fill").style.borderTopColor = "rgba(184,169,179,1)";
        break;
    case "url(#gold)":
        document.getElementById("xp_fill").style.background = "linear-gradient(2deg, rgba(222,183,103,1) 45%, rgba(252,246,186,1) 57%, rgba(193,135,32,1) 91%)";
        document.getElementById("xp_fill").style.borderTopColor = "rgba(222,183,103,1)";
        break;
    case "url(#rainbow)":
        document.getElementById("xp_fill").style.background = "linear-gradient(to top, rgb(255,0,0),rgb(255,255,0),rgb(0,192,255),rgb(192,0,255))";
        document.getElementById("xp_fill").style.borderTopColor = "white";
        break;
      default:
        document.getElementById("xp_fill").style.background = team.primary;
        document.getElementById("xp_fill").style.borderTopColor = team.secondary;
        break;
}

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
}

/*
  Items
*/

socket.on('updateItems', function(newItems){
  let itemlist = document.getElementById("content_itemlist");
  itemlist.innerHTML = "";
  items = newItems;
  let itemKeys = Object.keys(items);
	for (let i = 0; i < itemKeys.length; i++) {
    let item = itemKeys[i];
    addItem(item, items[item].cost, items[item].name);
  }
});

function addItem(itemID, cost, name){
  let itemlist = document.getElementById("content_itemlist");
  let newItem = document.createElement("div");
  let src = name.replace(/ /g,"_");
  newItem.classList.add("content_item");

  let newItemCost = document.createElement("div");
  newItemCost.classList.add("item_cost");
  newItemCost.innerText = cost;

  let newItemName = document.createElement("div");
  newItemName.classList.add("item_desc");
  newItemName.innerText = name;

  let newItemImg = document.createElement("img");
  newItemImg.classList.add("item_icon");
  newItemImg.setAttribute('src', "../images/items/"+src+".png");

  newItem.appendChild(newItemCost);
  newItem.appendChild(newItemName);
  newItem.appendChild(newItemImg);
  itemlist.appendChild(newItem);

  newItem.addEventListener('click', function(){
    socket.emit('item', userID, itemID);
  });
}

socket.on('itemRename', function(){
  let newName = "";
        do{
            newName = prompt("Enter a new name", team.dragon_name);
        }while(newName == null || newName == "" );
        newName = newName.substring(0,27)
        socket.emit('rename', user.team, newName);
})


/*
  Whiteboard
*/


socket.on('mode', (newMode) =>{
  switchMode(newMode);
})

function switchMode(newMode){
  if(user){
    mode = newMode;
  } else {mode='login'}
  console.log("Mode: "+mode);
  switch(mode){
    case "main":
      document.getElementById("content_login").style.display = "none";
      document.getElementById("content_draw").style.display = "none";
      document.getElementById("content").style.display = "flex";
    break;
    case "login":
      document.getElementById("content_login").style.display = "block";
      document.getElementById("content_draw").style.display = "none";
      document.getElementById("content").style.display = "none";
    break;
    case "draw":
      document.getElementById("content_login").style.display = "none";
      document.getElementById("content_draw").style.display = "block";
      document.getElementById("content").style.display = "none";
      whiteboardReset();
    break;
    case "quiz":
      document.getElementById("content_login").style.display = "none";
      document.getElementById("content_draw").style.display = "none";
      document.getElementById("content").style.display = "none";
    break;
  }
}

var canvas = document.getElementsByClassName('whiteboard')[0];
var context = canvas.getContext('2d');

function drawLine(e, dot = false){
  if(pen.ink <= 0 || !pen.down || pen.lock){
    return;
  }
  context.beginPath();
  context.moveTo(pen.x, pen.y);
  context.lineCap  = "round";

  let x = e.clientX||e.touches[0].clientX;
  let y = e.clientY||e.touches[0].clientY;

  let distance = Math.sqrt( Math.pow(pen.x - x, 2) + Math.pow(pen.y - y, 2));
  
  if(distance < pen.rate && !dot){
    return;
  }
  pen.x = x;
  pen.y = y;

  pen.ink -= distance;
  
  context.lineTo(pen.x, pen.y);
  context.lineWidth = pen.size;
  context.stroke();
  context.closePath();

  document.getElementById("whiteboard_ink").style.opacity = pen.ink/2500;
}

function penDown(e){
  pen.x = e.clientX||e.touches[0].clientX;
  pen.y = e.clientY||e.touches[0].clientY;
  pen.down = true;
  drawLine(e, true);
}

function penUp(e){
  pen.down = false;
}

function penMove(e){  
  drawLine(e);
}

function clearWhiteboard(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  pen.ink = 5000;
  pen.down = false;
  pen.lock = false;
  document.getElementById("whiteboard").style.background = "white";

}

function postWhiteboard(){
  pen.lock = true;
  document.getElementById("whiteboard").style.background = "grey";
  socket.emit('postWhiteboard', userID, canvas.toDataURL());
}


socket.on('toggleShop', function(open){
  if(!open){
    document.getElementById("panel_left").style.display = 'none';
  } else{
    document.getElementById("panel_left").style.display = 'flex';
  }
});

/*
  Login
*/

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

function myCallback(response){
  console.log("logged in");
  const responsePayload = parseJwt(response.credential);
  console.log("Name: " + responsePayload.name);
  socket.emit('login', responsePayload.email.split('@')[0]);
} 