var socket = io();

document.getElementById("b_0").addEventListener("click", function(){ sendAnswer(1); });
document.getElementById("b_1").addEventListener("click", function(){ sendAnswer(2); });
document.getElementById("b_2").addEventListener("click", function(){ sendAnswer(3); });
document.getElementById("b_3").addEventListener("click", function(){ sendAnswer(4); });

let userID = prompt("Please enter your name", "student");
socket.emit('join', "student", userID);

function sendAnswer(button_id) {
    var button = document.getElementById("b_"+button_id);
    console.log("Sending answer: "+button.textContent);
    socket.emit('answer', button.textContent);
    for(var i=0; i<4; i++){
        document.getElementById("b_"+i).style.visibility = 'hidden';
      }
}

socket.on('question', (question, answers) => {
    console.log(question);
    document.getElementById("questionDiv").innerHTML = question;
    for(var i=0; i<answers.length; i++){
      console.log(answers[i]);
      document.getElementById("b_"+i).textContent = answers[i];
      document.getElementById("b_"+i).style.visibility = 'visible';
    }
})