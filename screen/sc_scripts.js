var socket = io();

var messages = document.getElementById('messages');

socket.emit('join', "screen", "screen");

socket.on('question', (question) => {
    //document.getElementById("display").innerHTML += question + " ("+answers+")";
    console.log(question);
    setHeight(1, 50);
})

socket.on('answer', (answer) => {
    console.log("Got a answer: "+answer);
    document.getElementById("display").innerHTML += answer;
});

socket.on('qr', (ip) => {
    console.log("showing qr for "+ip);
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=190x190&cht=qr&chl=http://"+ip;
});

function setHeight(team, height){
    document.getElementById("team"+team).style.height = height+'vh';
    document.getElementById("team"+team).style.marginTop = (100-height)+'vh';
}