var socket = io();
var currentContent = "login";

var userID;
var user = false;
var team = false;
var items = false;

var pen = {
  "x":0,
  "y":0,
  "ink_max": 5000,
  "ink": 2500,
  "size": 20,
  "rate": 3,
  "art": false,
  "down": false,
  "color": "black"
};

window.onload = function() {
  showContent(currentContent);
  savedID = document.cookie;
  console.log(savedID);
  document.getElementById('login_email').innerText = document.cookie;
  if(savedID != undefined){
    userID = savedID;
    socket.emit('login', savedID);
  } 
  
  document.getElementById('login_submit').addEventListener('click', function(){
    userID = document.getElementById('login_email').innerText;
    socket.emit('login', userID);
  }); 

  document.getElementById('whiteboard_send').addEventListener('click', function(){
    postWhiteboard();
    pen.ink = 0;
    document.getElementById("content_buttons").style.visibility = "hidden";
  }); 

  document.getElementById('whiteboard_clear').addEventListener('click', function(){
    resetWhiteboard();
  }); 

  document.getElementById('whiteboard_ink').addEventListener('click', function(){
    console.log("change ink",pen.color);
    if(pen.color == team.primary){
      pen.color = team.secondary;
    } else {
      pen.color = team.primary;
    }
    document.getElementById("whiteboard_ink").style.background = pen.color;
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && currentContent == "login") {
      userID = document.getElementById('login_email').innerText;
      socket.emit('login', userID);
      event.preventDefault()
    }
  });


  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight; 
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', onMouseMove, false);
  
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', onMouseMove, false);

  window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetWhiteboard();
  }); 
}

/*
  login
*/
//console.log('login', userID, true);
socket.on('login', function(success){
  if(success){
    console.log("login OK");
    document.cookie = userID+'; max-age='+60*60*24*360+'; path=/';
    showContent("main");
  } else {
    console.log("login failed");
    document.cookie = userID+'; max-age='+0+'; path=/';
    showContent("login");
  }
});

socket.on('logout', function(ID){
  if(ID == userID || ID == "all"){
    showContent("login");
    document.cookie = userID+'; max-age='+0+'; path=/';
    document.getElementById('login_email').innerText = "";
    user = false;
    team = false;
    items = false;
  }
});

socket.on('updateUser', function(ID, userInfo){
  if(ID == userID){
    user = userInfo;
    if(user.team == -1){
      window.location.href = window.location + "teacher";
      return;
    }
    document.getElementById("name").innerText = user.name;
    document.getElementById("pointCount").innerText = user.points;

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

function showContent(newContent){
  currentContent = newContent;
  switch(newContent){
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
      resetWhiteboard();
    break;
    case "quiz":
      document.getElementById("content_login").style.display = "none";
      document.getElementById("content_draw").style.display = "none";
      document.getElementById("content").style.display = "none";
    break;
  }
}


/*
  Update XP
*/

socket.on('updateXP', function(team, xp){
  if(!user || team != user.team){return};
  let xpFill = document.getElementById("xp_fill");
  let level = document.getElementById("team_level");
  xpFill.style.height = xp%100 + "%";
  level.innerHTML = Math.ceil(xp/100);
});

socket.on('updateTeam', function(teamID, teamInfo){
  if(!user || teamID != user.team){return};
  team = teamInfo;
  let dragon = document.getElementById("dragon");
//background-image: ;
  let background = document.getElementById("background");
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

  dragon.style.maxWidth = team.level*5 + team.dragon_size+"%";

  let newData = "../images/dragons/"+team.dragon_type+"/"+team.dragon_evol+".svg";
  if(dragon.getAttribute("data") != newData){
      dragon.setAttribute("data", newData);
      dragon.addEventListener('load', function(){
          updateColors(teamID);
      });
  }
  updateColors(teamID);
});

function updateColors(teamID){
  let svg = document.getElementById("dragon").contentDocument;

    if(team.primary == "url(#rainbow)"){
      document.getElementById("xp_fill").style.background = "linear-gradient(to top, rgb(255,0,0),rgb(255,255,0),rgb(0,192,255),rgb(192,0,255))";
      document.getElementById("xp_fill" ).style.borderTopColor = "white";
    } else{
      document.getElementById("xp_fill").style.background = team.primary;
      document.getElementById("xp_fill" ).style.borderTopColor = team.secondary;
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

socket.on('openWhiteboard', function(){
  if(user == false){
    return;
  }
  showContent("draw");
})

socket.on('closeWhiteboard', function(){
  if(user == false){
    return;
  }
  showContent("main");
  resetWhiteboard();
})

var canvas = document.getElementsByClassName('whiteboard')[0];
var context = canvas.getContext('2d');

function drawLine(e, dot = false){
  if(pen.ink <= 0 || !pen.down){
    return;
  }
  context.beginPath();
  context.moveTo(pen.x, pen.y);
  context.lineCap  = "round";
  context.strokeStyle = pen.color;

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
  context.lineWidth = pen.size * Math.min(pen.ink*30/pen.ink_max, 1);
  context.stroke();
  context.closePath();

  let ink = document.getElementById("whiteboard_ink");
  ink.style.opacity = pen.ink/pen.ink_max;
}

function onMouseDown(e){
  pen.x = e.clientX||e.touches[0].clientX;
  pen.y = e.clientY||e.touches[0].clientY;
  pen.down = true;
  drawLine(e, true);
}

function onMouseUp(e){
  pen.art = canvas.toDataURL();
  pen.down = false;
}

function onMouseMove(e){  
  drawLine(e);
}

function resetWhiteboard(){
  pen.color = team.primary
  pen.ink = pen.ink_max;
  pen.art = false;
  pen.down = false;

  document.getElementById("content_buttons").style.visibility = "visible";
  document.getElementById("whiteboard_ink").style.background = pen.color;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function postWhiteboard(){
  if(!pen.art){return};
  socket.emit('postWhiteboard', userID, pen.art);
}


socket.on('toggleShop', function(open){
  if(!open){
    document.getElementById("content_itemlist").style.opacity = 0.2;
  } else{
    document.getElementById("content_itemlist").style.opacity = 1;
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
  console.log("Email: " + responsePayload.email);
  socket.emit('login', responsePayload.email.split('@')[0]);
}