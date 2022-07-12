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

    socket.emit('login', "000");
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
        addMember(i, 0, teams[i].name, teams[i].primary);
    }
});

socket.on('addMember', function(team, id, name, color){
    addMember(team, id, name, color);
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

socket.on('updateXP', function(team, xp){
    let xpFill = document.getElementById("xp_fill"+team);
    let level = document.getElementById("team_level"+team);
    xpFill.style.height = xp%100 + "%";
    level.innerHTML = Math.ceil(xp/100);
});

socket.on('updateDragon', function(team, name, type, size, primaryColor, secondayColor){
    let dragon = document.getElementById("dragon"+team);
    let svg = dragon.contentDocument;
    
    if(primaryColor != undefined){
        let primary = svg.getElementsByClassName("primaryColor");
        for(let i=0; i<primary.length; i++){
            primary[i].style.fill = primaryColor;
        }
        document.getElementById("xp_fill"+team).style.backgroundColor = primaryColor;
    }
    if(secondayColor != undefined){
        let secondary = svg.getElementsByClassName("secondaryColor");
        for(let i=0; i<secondary.length; i++){
            secondary[i].style.fill = secondayColor;
        }
    }
    document.getElementById("xp_fill"+team).style.borderTopColor = secondayColor;
    dragon.style.maxWidth = size+"%";
    document.getElementById("dragon_name"+team).innerHTML = name;
});