var giveCard = 0;
let pink = "rgb(255, 204, 213)";

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

    for(let i=0; i<4; i++){
        let team = teams[i];

        //addMember(team, id, name, color){
        addMember(i, 0, team.name, team.primary);
        //updateDragon(team, name, type, size, primaryColor, secondayColor){
        updateDragon(i, team.name, 1, 45, team.primary, team.secondary);

        document.getElementById("panel_team"+i).addEventListener("click", function(){toggleMembers(i);});
    }

    addMember(0,202203,"Ema", pink);
    addMember(1,202204,"Umeka", pink);
    addMember(1,202212,"Toma");
    addMember(1,202205,"Andy");
    addMember(1,202212,"Wako", pink);
    addMember(1,202206,"Ruriju", pink);
    addMember(2,202209,"Yutaro");
    addMember(3,202275,"Yuito");
    addMember(2,202246,"Mio", pink);
    addMember(3,202273,"Kippei");
    addMember(3,202202,"Ichiro");
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

function clearTeams(){
    let members = document.getElementsByClassName("member");
    for(let i=0; i<members.length; i++){
        members[i].remove();
        i--;
    }
}

function selectMember(team, member){
    console.log(team, member);
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

function addMember(team, id, name, color){
    let content_members = document.getElementById("members"+team);
    let newMember = document.createElement("div");
    newMember.classList.add("member");
    if(color != undefined){
        newMember.style.backgroundColor = color;
    }
    newMember.innerHTML = name;
    newMember.id = id;
    newMember.addEventListener("click", function(e){selectMember(team, this.id);e.stopPropagation();});
    content_members.appendChild(newMember);
}

function updateXP(team, xp){
    let xpFill = document.getElementById("xp_fill"+team);
    let level = document.getElementById("team_level"+team);
    xpFill.style.height = xp%100 + "%";
    level.innerHTML = Math.ceil(xp/100);
}

function updateDragon(team, name, type, size, primaryColor, secondayColor){
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
    dragon.style.width = size+"%";

    document.getElementById("dragon_name"+team).innerHTML = name;
}