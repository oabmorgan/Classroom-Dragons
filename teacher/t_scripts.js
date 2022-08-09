var socket = io();

//Colors
const blue = "rgb(179, 229, 252)";
const greencard = "rgba(123,231,36,255)";
const yellowcard = "rgba(231,196,35,255)";
const redcard = "rgba(231,69,37,255)";

//For clicks
var mouseDownElement;
var mouseUpElement;

//save team info
var teams = {};

//which card is selected
var selectedCard = 0;
//Which users are selected
var selected = [];

//is the shop open
var shop = true;

//lenght of timer
var timer_length = 0;

var address;


window.onload = function() {
    //click listeners
    window.addEventListener("pointerdown", function(e) {
        mouseDown(e);
    });
    window.addEventListener("pointerup", function(e) {
        mouseUp(e);
    });
    //qr code
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=250x250&chld=L|0&cht=qr&chl="+address;

    //hide title
    history.pushState(null, "", "/");

    socket.emit('login', "", true);
    
    updateShop();
    setInterval(animation_frame, 10);

    for (let i = 0; i < 4; i++) {
        let dragon = document.getElementById("dragon" + i);
        dragon.addEventListener('load', function() {
            updateColors(i);
            new_animation(dragon, "opacity", 255, 0.5, "linear");
        });
    }
    setMode("main");
}

function mouseDown(e) {
    mouseDownElement = e.target;
    e.target.releasePointerCapture(e.pointerId);
}

function mouseUp(e) {
    mouseUpElement = e.target;
    let teamID = parseInt(mouseUpElement.id.charAt(mouseUpElement.id.length - 1));
    //Click
    if (mouseUpElement == mouseDownElement) {
        switch (mouseDownElement.id) {
            case "timer_button":
                timer_start();
                break;
            case "shop_button":
                console.log("shop");
                shop = !shop;
                updateShop()
                break;
            case "draw_button":
                setMode("draw");
                break;
            case "green_button":
                selectedCard = 0;
                document.body.style.background = greencard;
                setMode("teams");
                break;
            case "yellow_button":
                selectedCard = 1;
                document.body.style.background = yellowcard;
                setMode("teams");
                break;
            case "red_button":
                selectedCard = 2;
                document.body.style.background = redcard;
                setMode("teams");
                break;
            case "main_button":
                timer_end();
                break;
            case "random_button":
                document.getElementById("popup").style.visibility = "visible";
                socket.emit('random');
                break;
            case "qr":
                window.open("https://chart.googleapis.com/chart?chs=500x500&chld=H|2&cht=qr&chl="+address, '_blank');
                break;
            case "goal_button":
                break;
        }
        switch (mouseDownElement.classList[0]) {
            case "spacing_dragon":
            case "content_dragon":
                socket.emit('card', teamID, 0, 0);
                break;
            case "member":
                teamID = parseInt(mouseUpElement.parentElement.id.charAt(mouseUpElement.parentElement.id.length - 1));
                select(mouseUpElement.id, teamID);
                break;
        }
    } else {
        console.log(mouseDownElement.classList[0], mouseUpElement.id);
        if (mouseDownElement.classList[0] == "member" && mouseUpElement.classList[0] == "content_members") {
            newTeamID = parseInt(mouseUpElement.parentElement.id.charAt(mouseUpElement.parentElement.id.length - 1));
            console.log("change teams =>", mouseDownElement.id, newTeamID);
            socket.emit('changeTeam', mouseDownElement.id, newTeamID);
            selected = [];
        }
        if(mouseDownElement.classList[0] == "member" && mouseUpElement.id=="qr"){
            socket.emit('logout', mouseDownElement.id);
        }
        if(mouseDownElement.id == "goal_button" && mouseUpElement.id=="qr"){
            eraseCookie("userID");
            location.reload();
        }
    }
}

socket.on('qr', function(newAddress){
    address = newAddress;
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=250x250&chld=L|0&cht=qr&chl="+address;
});


/*
    Spinner
*/

socket.on('random', function(name) {
    document.getElementById("popupText").style["opacity"] = "0%";
    new_animation(document.getElementById("popupText"), "opacity", 100, 2 + Math.random(), "easeOut", 2, true, spin_end, spin_tick);
    document.getElementById("popupText").innerHTML = name;
});

function spin_tick(_, v) {
    if(v >= 0){
        let offset = document.getElementById("popupText").innerHTML.charCodeAt(0);
        document.getElementById("popupImg").style.transform = "rotate(" + (offset * 70 + (v * v) * 0.0005) + "deg)";
    }
}

function spin_end() {
    document.getElementById("popup").style.visibility = "hidden";
}


/*
    Timer
*/

function timer_tick(pct, dur) {
    document.getElementById("timer_disp").innerHTML = Math.max(Math.ceil(dur / 1000), 0);
}

function timer_end() {
    document.getElementById("content_timer").style.display = "none";
    setMode("main");
    timer_length = 0;
}

function timer_start() {
    timer_length += 5;
    document.getElementById("timer_disp").innerHTML = "";
    let timer_fill = document.getElementById("timer_fill");
    document.getElementById("content_timer").style.display = "flex";
    timer_fill.style.width = "100%";
    new_animation(timer_fill, "width", 0, timer_length, "linear", 1.2, true, timer_end, timer_tick);
}

function select(userID, teamID) {
    let selectedIndex = selected.findIndex(s => s.userID === userID);
    if (selectedIndex >= 0) {
        document.getElementById(selected[selectedIndex].userID).style.background = document.getElementById(selected[selectedIndex].userID).style.borderColor;
        if (selected[selectedIndex].card == selectedCard) {
            selected.splice(selectedIndex, 1);
        } else {
            selected[selectedIndex].card = selectedCard;
        }
    } else {
        selected.push({
            "userID": userID,
            "teamID": teamID,
            "card": selectedCard
        });
    }
    console.log("team:", teamID);
    selected.forEach(s => {
        switch (s.card) {
            case 0:
                document.getElementById(s.userID).style.background = greencard;
                break;
            case 1:
                document.getElementById(s.userID).style.background = yellowcard;
                break;
            case 2:
                document.getElementById(s.userID).style.background = redcard;
                break;
        }
    });
}


socket.on('clearMembers', function() {
    for (let i = 0; i < 4; i++) {
        let content_members = document.getElementById("members" + i);
        var child = content_members.lastElementChild;
        while (child) {
            content_members.removeChild(child);
            child = content_members.lastElementChild;
        }
    }
});

function item(userName, name, team){
    let newName = document.createElement("div");
    newName.innerHTML = userName;
    newName.classList.add("itemName");
    newName.style.left = (screen.width/100)*((team*25) + 10 + 5 - (Math.random()*5))-(60/2) + "px";
    newName.style.top = "5%";

    let newItem = document.createElement("img");
    let src = name.replace(/ /g,"_")
    newItem.src = "../images/items/"+src+".png";
    newItem.classList.add("item");

    newName.appendChild(newItem);
    document.body.appendChild(newName);
    new_animation(newName, "top", 65, 5, "easeOut", 1, false, removeItem, spinItem);
}

function removeItem(){
    const items = document.getElementsByClassName("itemName");
    for(let i=0; i<items.length; i++){
        let item = items[i];
        if(parseInt(item.style.top) > 60){
            item.remove();
            socket.emit("forceTeamUpdate");
            i--;
        }
    }
}

function spinItem(){
    const items = document.getElementsByClassName("itemName");
    for(let i=0; i<items.length; i++){
        let item = items[i];
        item.style.transform = "rotate(" + ((parseInt(item.style.top)-5)*15)  + "deg)";
    }
}

socket.on('item', function(userName, itemName, team){
    item(userName, itemName, team);
});

socket.on('addMember', function(team, id, name, color) {
    addMember(team, id, name, color);
});

function addMember(team, id, name, color) {
    let content_members = document.getElementById("members" + team);
    let newMember = document.createElement("div");
    newMember.classList.add("member");
    newMember.style.background = color;
    newMember.style.borderColor = color;
    newMember.innerHTML = name;
    newMember.name = team;
    newMember.id = id;
    content_members.appendChild(newMember);
};

socket.on('updateXP', function(team, xp, level) {
    let xpFill = document.getElementById("xp_fill" + team);
    let teamLevel = document.getElementById("team_level" + team);
    new_animation(xpFill, "height", xp % 100, .1, "linear", 1, false);
    teamLevel.innerText = level;
    switch (level) {
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

socket.on('updateTeam', function(teamID, teamInfo) {
    teams[teamID] = teamInfo;

    let team = teams[teamID];
    let dragon = document.getElementById("dragon" + teamID);
    let background = document.getElementById("background" + teamID);
    let newData = "../images/dragons/" + team.dragon_type + "/" + team.dragon_evol + ".svg";

    document.getElementById("dragon_name" + teamID).innerHTML = team.dragon_name;
    new_animation(dragon, "maxWidth", team.level * 4 + teams[teamID].dragon_size, 1, "linear");
    background.style.backgroundImage = "url(\"../images/background_" + team.background + ".png\")";
    updateColors(teamID);

    //Set mood
    for (let i = 0; i < 5; i++) {
        let moodIcon = document.getElementById("moodIcon" + teamID + i);
        if (team.dragon_mood <= i * 20) {
            moodIcon.src = "../images/heart_empty.png";
        } else if (team.dragon_mood <= i * 20 + 10) {
            moodIcon.src = "../images/heart_half.png";
        } else {
            moodIcon.src = "../images/heart.png";
        }
    }

    //model change
    if (dragon.getAttribute("data") != newData) {
        dragon.setAttribute("data", newData);
    }
});

function updateColors(teamID) {
    let team = teams[teamID];
    let svg = document.getElementById("dragon" + teamID).contentDocument;

    switch (team.primary) {
        case "url(#silver)":
            document.getElementById("xp_fill" + teamID).style.background = "linear-gradient(358deg, rgba(184,169,179,1) 4%, rgba(247,250,252,1) 31%, rgba(141,141,141,1) 87%)";
            document.getElementById("xp_fill" + teamID).style.borderTopColor = "rgba(184,169,179,1)";
            break;
        case "url(#gold)":
            document.getElementById("xp_fill" + teamID).style.background = "linear-gradient(2deg, rgba(222,183,103,1) 45%, rgba(252,246,186,1) 57%, rgba(193,135,32,1) 91%)";
            document.getElementById("xp_fill" + teamID).style.borderTopColor = "rgba(222,183,103,1)";
            break;
        case "url(#rainbow)":
            document.getElementById("xp_fill" + teamID).style.background = "linear-gradient(to top, rgb(255,0,0),rgb(255,255,0),rgb(0,192,255),rgb(192,0,255))";
            document.getElementById("xp_fill" + teamID).style.borderTopColor = "white";
            break;
        default:
            document.getElementById("xp_fill" + teamID).style.background = team.primary;
            document.getElementById("xp_fill" + teamID).style.borderTopColor = team.secondary;
            break;
    }

    let paths = svg.getElementsByTagName("path");
    for (let i = 0; i < paths.length; i++) {
        switch (paths[i].getAttribute("class")) {
            case "primaryColor":
                paths[i].style.fill = team.primary;
                break;
            case "secondaryColor":
                paths[i].style.fill = team.secondary;
                break;
        }
    }
}

socket.on('updateArt', function(userID, name, team, art) {
    console.log("got some art", name);
    addArt(userID, name, team, art);
});

function addArt(userID, name, team, art) {
    console.log("New Art from", name);
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

    newArt.addEventListener('click', function(e) {
        if (e.target.style.background != "rgb(129, 199, 132)") {
            e.target.style.background = "rgb(129, 199, 132)";
            socket.emit('card', team, userID, 0);
        }
    });

    let newName = document.createElement("div");
    newName.innerHTML = name;
    newName.classList.add("galleryName");
    newFrame.appendChild(newName);
};

function setMode(newMode) {
    //give cards to anyone selected
    selected.forEach(s => {
        console.log(s.userID, s.teamID, s.card);
        socket.emit('card', s.teamID, s.userID, s.card);
        document.getElementById(s.userID).style.background = document.getElementById(s.userID).style.borderColor;
    });
    selected = [];

    switch (newMode) {
        case "main":
            document.body.style.background = blue;
            socket.emit('mode', 'main');
            document.getElementById("popup").style.visibility = "hidden";
            document.getElementById("content_gallery").style.display = "none";
            document.getElementById("content_main").style.display = "flex";
            document.getElementById("content_teams").style.display = "none";
            break;
        case "draw":
            socket.emit('mode', 'draw');
            document.getElementById("content_gallery").innerHTML = "";
            document.getElementById("content_gallery").style.display = "block";
            document.getElementById("content_main").style.display = "none";
            document.getElementById("content_teams").style.display = "none";
            document.getElementById("content_gallery").style.opacity = "100%";
            break;
        case "teams":
            document.getElementById("content_gallery").style.display = "none";
            document.getElementById("content_main").style.display = "none";
            document.getElementById("content_teams").style.display = "flex";
            break;
    }
}

function updateShop() {
    if (shop) {
        document.getElementById("shop_button").src = "../images/open.png";
        document.getElementById("shop_button").style.borderColor = greencard;
    } else {
        document.getElementById("shop_button").src = "../images/close.png";
        document.getElementById("shop_button").style.borderColor = redcard;
    }
    socket.emit('toggleShop', shop);
}