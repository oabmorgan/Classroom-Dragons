var socket = io();
var tickInterval;

var timerInterval;
var timerStart;
var timerEnd;

var teamXP = [0,0,0,0];
var currentQuestion = "";

socket.emit('join', "screen", "screen");

for(let i=0; i<4; i++){
  document.getElementById("team"+i+"xpFill").style.height = 0+"%";
}

function tick(){
  let bigCard = document.getElementById("bigCard");
  for(let i=0; i<4; i++){
    let xpFill = document.getElementById("team"+i+"xpFill");
    let xpFillPct = parseInt(xpFill.style.height);
    let xpTargetPct = teamXP[i]%100;
    let xpDifference = xpTargetPct - xpFillPct;
    if (Math.abs(xpTargetPct - xpFillPct) > 3){
      let newPct = xpFillPct + Math.ceil(xpDifference*0.3);
      if(newPct >= 100){
        newPct -= 100;
      }
      xpFill.style.height = newPct + "%";      
      return;
    }
  }  
  if(bigCard.style.opacity > 0){
    bigCard.style.opacity -= 0.1;
    return;
  }
  clearInterval(tickInterval);
}

socket.on('updateQuestion', (questionText, answers, startTime, duration) => {
  console.log(startTime, duration);
  timerStart = startTime;
  timerEnd = startTime + (duration*1000);

  clearInterval(timerInterval);
  timerInterval = setInterval(questionTimer, 10);

  console.log("Asking a question: "+questionText);
  let quizQuestion = document.getElementById("quizQuestion");
  quizQuestion.innerHTML = questionText;
  let responses = 0;
  for(let i=0; i<4; i++){
    if(answers[i] != undefined){
      responses+= answers[i].count;
    }
  }
  for(let i=0; i<4; i++){
    let quizAnswer = document.getElementById("quizAnswer"+i);
    let quizAnswerText = document.getElementById("quizAnswerText"+i);
    let quizAnswerBarFill = document.getElementById("quizAnswerBarFill"+i);
    quizAnswerBarFill.style.width = '3px';
    if(answers[i] != undefined){
      quizAnswer.style.visibility = 'inherit';
      quizAnswerText.innerHTML = answers[i].answer;
      quizAnswerBarFill.style.width = (answers[i].count/responses)*100+"%";
    } else {
      quizAnswer.style.visibility = 'hidden';
    }
  }
})


function questionTimer(){
  let duration = timerEnd - timerStart;
  let remaining = timerEnd - Date.now();
  let timerPct = (remaining/duration)*100;
  let quizTimerFill = document.getElementById("quizTimerFill");
  let quiz = document.getElementById("quizContainer");
  quiz.style.visibility = 'visible';
  quizTimerFill.style.width = timerPct+"%";
  if(remaining <= 0){
    quiz.style.visibility = 'hidden';
    clearInterval(timerInterval);
    console.log("Timer Ended");
  }
}

socket.on('cardAlert', (color, teamID, teamname, realName = "") => {
    let bigCard = document.getElementById("bigCard");
    bigCard.style.opacity = 6;
    clearInterval(tickInterval);
    tickInterval = setInterval(tick, 50);
    switch(teamID){
      case 0:
        bigCard.style.marginRight = '60%';
        break;
      case 1:
        bigCard.style.marginRight = '20%';
        break;
      case 2:
        bigCard.style.marginRight = '-20%';
        break;
      case 3:
        bigCard.style.marginRight = '-60%';
        break;
    }
    //bigCard.style.marginLeft = 60+'%';
    switch(color){
      case "green":
        bigCard.style.background = 'rgb(133, 255, 96)';
        bigCard.innerHTML = "<p><h3>"+teamname+"</h3></p><p><h1>" + realName + "</h1></p><p>" + " got a <b>green</b> card!</p>";
      break;
      case "yellow":
        bigCard.style.background = 'rgb(245, 225, 53)';
        bigCard.innerHTML = "<p><h3>"+teamname+"</h3></p><p><h1>" + realName + "</h1></p><p>" + " got a <b>yellow</b> card</p>";
      break;
      case "red":
        bigCard.style.background = 'rgb(254, 61, 27)';
        bigCard.innerHTML = "<p><h3>"+teamname+"</h3></p><p><h1>" + realName + "</h1></p><p>" + " got a <b>red</b> card...</p>";
      break;
    }
  });

socket.on('qr', (ip) => {
    console.log("showing qr for "+ip);
    document.getElementById("qr").src = "https://chart.googleapis.com/chart?chs=190x190&cht=qr&chl=http://"+ip;
});

socket.on('updatexp', (team, xp) => {
    console.log("updating xp for team "+team);
    teamXP[team] = xp;
    clearInterval(tickInterval);
    tickInterval = setInterval(tick, 50);
    let level = Math.floor(xp/100);
    switch(level){
        case 0:
            document.getElementById("team"+team+"Level").style.background = 'rgb(185, 248, 225)'; 
        break;
        case 1:
            document.getElementById("team"+team+"Level").style.background = 'rgb(119, 226, 234)';
        break;
        case 2:
            document.getElementById("team"+team+"Level").style.background = 'rgb(77, 141, 253)';
        break;
        case 3:
            document.getElementById("team"+team+"Level").style.background = 'rgb(74, 228, 255)';
        break;
        case 4:
            document.getElementById("team"+team+"Level").style.background = 'rgb(111, 255, 155)';
        break;
        case 5:
            document.getElementById("team"+team+"Level").style.background = 'rgb(171, 255, 81)';
        break;
        case 6:
            document.getElementById("team"+team+"Level").style.background = 'rgb(229, 255, 60)';
        break;
        case 7:
            document.getElementById("team"+team+"Level").style.background = 'rgb(255, 115, 253)';
        break;
        case 8:
            document.getElementById("team"+team+"Level").style.background = 'rgb(194, 73, 255)';
        break;
        default:
            document.getElementById("team"+team+"Level").style.background = 'rgb(255, 42, 120)';
        break;
    }
    document.getElementById("team"+team+"Level").innerHTML = level;
});