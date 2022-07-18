var socket = io();

var mouseDownElement;
var mouseUpElement;

var currentContent;

var giveCard = 0;
var teams = {};

var shop = true;

window.onload = function() {    

    window.addEventListener("pointerdown", function(e){mouseDown(e);});
    window.addEventListener("pointerup", function(e){mouseUp(e);});

    history.pushState(null, "", "/");

    socket.emit('login', "", true);

    showContent("main");
    updateShop();
}

function toggleMembers(team){
    for(let i=0; i<4; i++){
        let content_members = document.getElementById("members"+i);
        if(i == team){
            if(content_members.style.visibility != "visible"){
                content_members.style.visibility = "visible";
                giveCard = 0;
            } else {
                giveCard ++;
                if(giveCard > 2){
                    deselect();
                }
            }            
            switch(giveCard){
                case 0:
                    document.body.style.background = "rgb(129, 199, 132)";
                break;
                case 1:
                    document.body.style.background = "rgb(255, 241, 118)";
                break;
                case 2:
                    document.body.style.background = "rgb(229, 57, 53)";
                break;
            }
        } else {
            content_members.style.visibility = "hidden";
        }
    }
}

function mouseDown(e){
    e.target.releasePointerCapture(e.pointerId);
    mouseDownElement = e.target;
}

function mouseUp(e){
    mouseUpElement = e.target;
    let teamID =  parseInt(mouseUpElement.id.charAt(mouseUpElement.id.length-1));
    if(mouseDownElement == mouseUpElement){
        switch(mouseUpElement.classList[0]){
            case 'content_dragon':
            case 'spacing_dragon':
            case 'dragon_name':
            case 'panel':
                toggleMembers(teamID);
            break;
            case 'roundButton':
                switch(mouseUpElement.id){
                    case "draw_button":
                        if(currentContent != "draw"){
                            showContent("draw");
                            socket.emit('openWhiteboard');
                        } else {
                            showContent("main");
                            socket.emit('closeWhiteboard');
                            document.getElementById("content_gallery").innerHTML = "";
                        }
                        break;
                    case "shop_button":
                        shop = !shop;
                        updateShop();
                        break;
                    case "remove_button":
                        console.log("undo");
                        socket.emit('undo');
                        break;
                };
                break;
            case 'member':
                selectMember(mouseUpElement.name, mouseUpElement.id);
            break;   
        }
    } else if(mouseDownElement.classList[0] == 'dragon_name' && mouseUpElement.classList[0] == 'content_dragon'){
        let newName = "";
        do{
            newName = prompt("Enter a new name", teams[teamID].dragon_name);
        }while(newName == null || newName == "" );
        socket.emit('rename', teamID, newName);
        deselect();
    } else if(mouseDownElement.classList[0] == 'member' && mouseUpElement.classList[0] == 'dragon_name'){
        socket.emit('changeTeam', mouseDownElement.id, teamID);
        deselect();
    } else if(mouseDownElement.classList[0] == 'member' && mouseUpElement.id == 'remove_button'){
        socket.emit('logout', mouseDownElement.id);
        deselect();
    }
}

function selectMember(team, member){
    console.log(team, member);
    socket.emit('card', team, member, giveCard);
    let content_members = document.getElementById("members"+team);
    deselect();
}

function deselect(){
    for(let i=0; i<4; i++){
        let content_members = document.getElementById("members"+i);
        content_members.style.visibility = "hidden";
    }
    document.body.style.background = "rgb(179, 229, 252)";  
}

socket.on('clearMembers', function(){
    for(let i=0; i<4; i++){
        let content_members = document.getElementById("members"+i);
        var child = content_members.lastElementChild; 
        while (child) {
            content_members.removeChild(child);
            child = content_members.lastElementChild;
        }
        addMember(i, 0, "Team "+i, teams[i].primary);
    }
});

socket.on('addMember', function(team, id, name, color){
    addMember(team, id, name, color);
});

socket.on('qr', function(ip){
    console.log("showing qr for "+ip);
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=250x250&chld=L|0&cht=qr&chl=http://"+ip;
});

function addMember(team, id, name, color){
    let content_members = document.getElementById("members"+team);
    let newMember = document.createElement("div");
    newMember.classList.add("member");
    if(color != undefined){
        newMember.style.background = color;
    }
    newMember.innerHTML = name;
    newMember.name = team;
    newMember.id = id;
    content_members.appendChild(newMember);
};

socket.on('updateXP', function(team, xp, level){
    let xpFill = document.getElementById("xp_fill"+team);
    let teamLevel = document.getElementById("team_level"+team);
    xpFill.style.height = xp%100 + "%";
    teamLevel.innerText = level;
});

socket.on('updateTeam', function(teamID, teamInfo){
    teams[teamID] = teamInfo;
    team = teams[teamID];
    let dragon = document.getElementById("dragon"+teamID);

    let background = document.getElementById("background"+teamID);
    background.style.backgroundImage = "url(\"../images/background_"+team.background+".png\")";
    //background.style.backgroundSize = 'cover';
    //background.style.backgroundAttachment = 'fixed';

    for(let i=0; i<5; i++){
        let moodIcon = document.getElementById("moodIcon"+teamID+i);
        if(team.dragon_mood <= i*20){
            moodIcon.src = "../images/heart_empty.png";
        } else if(team.dragon_mood <= i*20 + 10){
          moodIcon.src = "../images/heart_half.png";
      } else {
            moodIcon.src = "../images/heart.png";
        }
    }
  
    document.getElementById("dragon_name"+teamID).innerHTML = team.dragon_name;
  
    dragon.style.maxWidth = team.level*5 + teams[teamID].dragon_size+"%";

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
    let svg = document.getElementById("dragon"+teamID).contentDocument;
    if(team.primary == "url(#rainbow)"){
        document.getElementById("xp_fill"+teamID).style.background = "linear-gradient(to top, rgb(255,0,0),rgb(255,255,0),rgb(0,192,255),rgb(192,0,255))";
        document.getElementById("xp_fill"+teamID).style.borderTopColor = "white";
      } else{
        document.getElementById("xp_fill"+teamID).style.background = team.primary;
        document.getElementById("xp_fill"+teamID).style.borderTopColor = team.secondary;
      }
  
      var paths = svg.getElementsByTagName("path");
      for(let i=0; i<paths.length; i++){
        switch(paths[i].getAttribute("class")){
          case "primaryColor":
            paths[i].style.fill = teams[teamID].primary;
          break;
          case "secondaryColor":
            paths[i].style.fill = teams[teamID].secondary;
          break;        
        }
      }
}

//socket.to("teacher").emit('updateArt', userID, art);
socket.on('updateArt', function(userID, name, team, art){
    addArt(userID, name, team, art);
});

function addArt(userID, name, team, art){
    console.log("New Art from",name);
    let content_gallery = document.getElementById("content_gallery");

    let newFrame = document.createElement("div");
    newFrame.classList.add("galleryFrame");
    newFrame.style.background = teams[team].primary;
    content_gallery.appendChild(newFrame);

    let newArt = document.createElement("img");
    newArt.src = art;
    newArt.style.borderColor = teams[team].secondary;
    newArt.classList.add("galleryArt");
    newFrame.appendChild(newArt);

    newArt.addEventListener('click', function(e){
        if(e.target.style.background != "rgb(129, 199, 132)"){
            e.target.style.background = "rgb(129, 199, 132)";
            socket.emit('card', team, userID, 0);
        }
    });

    let newName = document.createElement("div");
    newName.innerHTML = name;
    newName.classList.add("galleryName");
    newFrame.appendChild(newName);
};

function showContent(newContent){
    currentContent = newContent;
    switch(newContent){
      case "main":
        document.getElementById("content_gallery").style.display = "none";
        document.getElementById("content_main").style.display = "flex";
      break;
      case "draw":
        document.getElementById("content_gallery").style.display = "block";
        document.getElementById("content_main").style.display = "none";
      break;
    }
  }

function updateShop(){
    if(shop){
        document.getElementById("shop_button").src = "../images/close.png";
    } else {
        document.getElementById("shop_button").src = "../images/open.png";
    }
    socket.emit('toggleShop', shop);
}