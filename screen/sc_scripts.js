var socket = io();

socket.emit('join', "screen", "screen");

socket.on('qr', (ip) => {
    console.log("showing qr for "+ip);
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=190x190&cht=qr&chl=http://"+ip;
});

socket.on('updatexp', (team, pct) => {
    console.log("updating xp for team "+team);
    document.getElementById("team"+team+"xpFill").style.height = pct+"%";
});