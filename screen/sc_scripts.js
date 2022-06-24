var socket = io();

var messages = document.getElementById('messages');

socket.emit('join', "screen", "screen");

socket.on('question', (question, answers) => {
    document.getElementById("display").innerHTML += question + " ("+answers+")";
    console.log(question);
})
socket.on('answer', (answer) => {
    console.log("Got a answer: "+answer);
    document.getElementById("display").innerHTML += answer;
});