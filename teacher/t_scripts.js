var socket = io();

var messages = document.getElementById('messages');

document.getElementById("b_set_q").addEventListener("click", function(){ setQuestion(-1); });

document.getElementById("c_0").addEventListener("click", function(){ setQuestion(0); });
document.getElementById("c_1").addEventListener("click", function(){ setQuestion(1); });
document.getElementById("c_2").addEventListener("click", function(){ setQuestion(2); });
document.getElementById("c_3").addEventListener("click", function(){ setQuestion(3); });

document.getElementById("shiftleft").addEventListener("click", function(){ switchTeams(-1); });
document.getElementById("shiftright").addEventListener("click", function(){ switchTeams(1); });

let userID = prompt("What's your name?", "teacher");
socket.emit('join', "teacher", userID);

var currentQuestion = {
  question: "",
  correctAnswer: -1,
  answer0:{
    answer: "",
    IDs: []
  },
  answer1:{
    answer: "",
    IDs: []
  },
  answer2:{
    answer: "",
    IDs: []
  },
  answer3:{
    answer: "",
    IDs: []
  }
}

function setQuestion(correct) {
    currentQuestion.correctAnswer = correct;
    currentQuestion.question = document.getElementById('input_question').value;
    for(var i=0; i<4; i++){
      var ans = document.getElementById("input_a"+i).value;
      if(ans.length > 0){
        currentQuestion["answer"+i].answer = ans;
      } else {
        currentQuestion["answer"+i].answer = "";
      }
    }
    socket.emit('question', currentQuestion);
}

socket.on('answer', (question) => {
    currentQuestion = question;
    for(var i=0; i<4; i++){
      document.getElementById("response_a"+i).innerHTML = currentQuestion["answer"+i].IDs.length;
    }
})

socket.on('join', (id) => {
  var teamlist = document.getElementById("teamlist0");
  var option = document.createElement("option");
  option.text = id;
  teamlist.add(option);
})

function sendAnswer(button_id) {
    var button = document.getElementById("b_"+button_id);
    console.log("Sending correct answer: "+button.textContent);
    socket.emit('answer', button.textContent, true);
}

function switchTeams(direction){
  var teamlist = document.getElementById("teamlist0");
  teamlist.remove(document.getElementById("teamlist0").value);
  console.log(document.activeElement);
}