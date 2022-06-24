var socket = io();

document.getElementById("b_0").addEventListener("click", function(){ sendAnswer(0);});
document.getElementById("b_1").addEventListener("click", function(){ sendAnswer(1);});
document.getElementById("b_2").addEventListener("click", function(){ sendAnswer(2);});
document.getElementById("b_3").addEventListener("click", function(){ sendAnswer(3);});

let userID = prompt("Please enter your name", "student");
socket.emit('join', "student", userID);

function sendAnswer(button_id) {
  socket.emit('answer', {ID:userID, ansNumber:button_id});
  console.log("Answer is "+button_id);
  document.getElementById("b_"+button_id).style.backgroundColor = '#ffdd57';
  for(var i=0; i<4; i++){
    document.getElementById("b_"+i).disabled = true;
  }
}

socket.on('question', (question) => {
  console.log("recieved question information");
  currentQuestion = question;
  document.getElementById("questionDiv").innerHTML = question.question;
  for(var i=0; i<4; i++){
    if(question.correctAnswer < 0){
      document.getElementById("b_"+i).style.backgroundColor = '#e3ecfa';
    }
    var ans = question["answer"+i].answer;
    if(ans.length > 0){
      document.getElementById("b_"+i).textContent = ans;
      document.getElementById("b_"+i).disabled = false;
      if(question.correctAnswer == i){
        document.getElementById("b_"+i).style.backgroundColor = '#4CAF50';
      }
    } else {
      document.getElementById("b_"+i).disabled = true;
    }
  }
})