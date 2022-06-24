var socket = io();

var messages = document.getElementById('messages');

document.getElementById("b_set_q").addEventListener("click", function(){ setQuestion(); });

let userID = prompt("What's your name?", "teacher");
socket.emit('join', "teacher", userID);

var currentQuestion = {
  question: "test q?",
  answer0:{
    answer: "test a0",
    selected: false,
    correct: false
  },
  answer1:{
    answer: "test a1",
    selected: false,
    correct: false
  },
  answer2:{
    answer: "test a2",
    selected: false,
    correct: false
  },
  answer3:{
    answer: "test a3",
    selected: false,
    correct: false
  }
}

function setQuestion() {
    console.log("Setting a question");
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

socket.on('question', (question, answers) => {
    console.log(question);
    for(var i=0; i<answers.length; i++){
      console.log(answers[i]);
    }
})

function sendAnswer(button_id) {
    var button = document.getElementById("b_"+button_id);
    console.log("Sending correct answer: "+button.textContent);
    socket.emit('answer', button.textContent, true);
}