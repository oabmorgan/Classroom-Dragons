var socket = io();

var giveCard = 0;
let pink = "rgb(255, 204, 213)";

var mouseDownElement;
var mouseUpElement;

let teams = {
    0:{
        name: "Team 1",
        primary: 'rgb(230, 55, 70)',
        secondary: 'rgb(255, 224, 102)'
    },
    1:{
        name: "Team 2",
        primary: 'rgb(5, 214, 158)',
        secondary: 'hsl(195, 83%, 38%)'
    },
    2:{
        name: "Team 3",
        primary: 'hsl(264, 25%, 63%)',
        secondary: 'hsl(331, 71%, 80%)'
    },
    3:{
        name: "Team 4",
        primary: 'hsl(89, 30%, 60%)',
        secondary: 'hsl(61, 90%, 77%)'
    },
};

window.onload = function() {    

    window.addEventListener("pointerdown", function(e){mouseDown(e);});
    window.addEventListener("pointerup", function(e){mouseUp(e);});

    //history.pushState(null, "", "/");

    socket.emit('login', "", true);
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
                    document.body.style.backgroundColor = "rgb(129, 199, 132)";
                break;
                case 1:
                    document.body.style.backgroundColor = "rgb(255, 241, 118)";
                break;
                case 2:
                    document.body.style.backgroundColor = "rgb(229, 57, 53)";
                break;
            }
        } else {
            content_members.style.visibility = "hidden";
        }
    }    
}

function mouseDown(e){
    e.target.releasePointerCapture(e.pointerId);
    mouseDownElement = e.target || e.srcElement;
    if(mouseDownElement.classList[0] == 'member'){
        mouseDownElement.style.outline = '5px solid white';
    }
}

function mouseUp(e){
    mouseUpElement = e.target || e.srcElement;
    let teamID =  parseInt(mouseUpElement.id.charAt(mouseUpElement.id.length-1));
    if(isNaN(teamID)){ return };
    if(mouseDownElement == mouseUpElement){
        switch(mouseUpElement.classList[0]){
            case 'content_dragon':
            case 'spacing_dragon':
            case 'dragon_name':
            case 'panel':
                toggleMembers(teamID);
            break;         
            case 'member':
                selectMember(mouseUpElement.name, mouseUpElement.id);
            break;   
        }
    } else if(mouseDownElement.classList[0] == 'member' && mouseUpElement.classList[0] == 'dragon_name'){
        mouseDownElement.style.outline = '1px solid black';
        socket.emit('changeTeam', mouseDownElement.id, teamID);
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
    document.body.style.backgroundColor = "rgb(179, 229, 252)";  
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
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=190x190&cht=qr&chl=http://"+ip;
});

function addMember(team, id, name, color){
    let content_members = document.getElementById("members"+team);
    let newMember = document.createElement("div");
    newMember.classList.add("member");
    if(color != undefined){
        newMember.style.backgroundColor = color;
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
  
    document.getElementById("dragon_name"+teamID).innerHTML = team.dragon_name;
  
    dragon.setAttribute("data", "../images/dragons/"+team.dragon_type+".svg");
  
    dragon.addEventListener('load', function(){
      let svg = dragon.contentDocument;
      document.getElementById("xp_fill"+teamID).style.backgroundColor = teams[teamID].primary;
      document.getElementById("xp_fill"+teamID).style.borderTopColor = teams[teamID].secondary;
      dragon.style.maxWidth = teams[teamID].dragon_size+"%";
  
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
    });
  });
  