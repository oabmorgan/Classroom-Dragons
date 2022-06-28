var socket = io();

socket.emit('join', "screen", "screen");

socket.on('qr', (ip) => {
    console.log("showing qr for "+ip);
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=190x190&cht=qr&chl=http://"+ip;
});

socket.on('updatexp', (team, xp) => {
    console.log("updating xp for team "+team);
    document.getElementById("team"+team+"xpFill").style.height = xp%100+"%";
    let level = Math.floor(xp/100);
    switch(level){
        case 0:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(185, 248, 225)'; 
        break;
        case 1:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(119, 226, 234)';
        break;
        case 2:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(77, 141, 253)';
        break;
        case 3:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(74, 228, 255)';
        break;
        case 4:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(111, 255, 155)';
        break;
        case 5:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(171, 255, 81)';
        break;
        case 6:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(229, 255, 60)';
        break;
        case 7:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(255, 115, 253)';
        break;
        case 8:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(194, 73, 255)';
        break;
        default:
            document.getElementById("team"+team+"Level").style.backgroundColor = 'rgb(255, 42, 120)';
        break;
    }
    document.getElementById("team"+team+"Level").innerHTML = level;
});