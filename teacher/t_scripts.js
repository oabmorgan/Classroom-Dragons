var socket = io();
var selectedUser = "";
var currentPage = "main";

window.onload = function(){
    socket.emit('join', "teacher", "teacher");

    document.getElementById("greenCard").onclick = function(){giveCard("green")};
    document.getElementById("yellowCard").onclick = function(){giveCard("yellow")};
    document.getElementById("redCard").onclick = function(){giveCard("red")};

    
    document.getElementById("setGoalButton").onclick = function(){setGoal()};

    document.getElementById("cancelGoal0").onclick = function(){cancelGoal(0)};
    document.getElementById("cancelGoal1").onclick = function(){cancelGoal(1)};
    document.getElementById("cancelGoal2").onclick = function(){cancelGoal(2)};

    //document.getElementById("completeGoal0").onclick = function(){completeGoal(0)};
    //document.getElementById("completeGoal1").onclick = function(){completeGoal(1)};
    //document.getElementById("completeGoal2").onclick = function(){completeGoal(2)};

    document.getElementById("teamSelect").onchange = function(){changeTeam()};

    document.getElementById("correctSelect").onchange = function(){setCorrect()};

    document.getElementById("setQuestionButton").onclick = function(){setQuestion()};
    
    document.getElementById("pageSelectMain").onclick = function(){changePage("main", true)};
    document.getElementById("pageSelectTeam").onclick = function(){changePage("team", true)};
    document.getElementById("pageSelectGoal").onclick = function(){changePage("goal", false)};
    document.getElementById("pageSelectQuiz").onclick = function(){changePage("quiz", false)};
    document.getElementById("pageSelectTimer").onclick = function(){changePage("timer", false)};
};

socket.on('updateTeams', (email, realName, team, teamName) => {
    if(email == "clear"){
        for(let i=0; i<4; i++){
            let currentTeam = document.getElementById("TeamContainer"+i);
            while (currentTeam.firstChild) {
                currentTeam.removeChild(currentTeam.firstChild);
            }
            createStudentButton(i+1, i, i);
        }
        return;
    }
    createStudentButton(email, realName, team);
})

socket.on('setConnectionState', (email, isConnected) => {
    if(isConnected){
        document.getElementById("selectStudentButton"+email).style.borderRight = '20px solid lightgreen';
    } else {
        document.getElementById("selectStudentButton"+email).style.borderRight = '20px solid silver';
    }
})

function changePage(page, showStudents){
    console.log("Switching to page: "+page);
    document.getElementById("page"+currentPage).style.visibility = "hidden";
    currentPage = page;
    document.getElementById("page"+currentPage).style.visibility = "visible ";
    if(showStudents){
        document.getElementById("selectTeamContainer").style.height = "auto";
    } else {
        document.getElementById("selectTeamContainer").style.height = "0px";
    }
}

function changeTeam(){
    let newTeam = document.getElementById("teamSelect").value;
    if(selectedUser != "" && newTeam > 0){
        socket.emit('setTeam', selectedUser, newTeam-1);
        document.getElementById("teamSelect").value = 0;
        selectUser("","");
        document.getElementById('selectedUser').innerHTML += " moved to team "+newTeam  ;
    }
}

function setQuestion(){
    let question = document.getElementById('setQuestion').value;
    let answers = [document.getElementById('setAnswer0').value,
                    document.getElementById('setAnswer1').value,
                    document.getElementById('setAnswer2').value,
                    document.getElementById('setAnswer3').value];
    for(let i=0; i<4; i++){
        if(answers[i] == ""){
            answers[i] = i;
        }
    }
    document.getElementById("correctSelect").options[1].innerText = answers[0];
    document.getElementById("correctSelect").options[2].innerText = answers[1];
    document.getElementById("correctSelect").options[3].innerText = answers[2];
    document.getElementById("correctSelect").options[4].innerText = answers[3];
    socket.emit('setQuestion', question, answers);
}

function setCorrect(){
    console.log("Sending correct answer: "+document.getElementById("correctSelect").value);
    socket.emit('setCorrect', document.getElementById("correctSelect").value);
    document.getElementById("correctSelect").value = -1;
}

function createStudentButton(email, realName, team){
    let currentTeam = document.getElementById("TeamContainer"+team);
    var newButton = document.createElement("button");
    newButton.onclick = function(){
        selectUser(email, realName);
      };
    if(email < 5){
        newButton.style.fontWeight = 'bold';
        newButton.style.borderBottom = '4px solid silver';
    }
    newButton.className = "selectStudentButton";
    newButton.id = "selectStudentButton"+email;
    newButton.innerText = realName;
	currentTeam.appendChild(newButton);
}

function setGoal(){
    let reward = document.getElementById("setGoalReward").value;
    let description = document.getElementById("setGoalDescription").value;
    if(reward > 0 && description != ""){
        socket.emit('setGoal', reward, description);
        console.log("Sending new goal");
        document.getElementById("setGoal").reset();
    }
}

function cancelGoal(id){
    if(myGoals[id] != undefined){
        socket.emit('cancelGoal', myGoals[id].qid);
    }
}

function completeGoal(id){
    if(selectedUser != "" && document.getElementById("goalReward"+id).innerHTML > 0){
        socket.emit('completeGoal', selectedUser, myGoals[id].qid);
    }
}

var myGoals;
socket.on('updateGoals', (goals) => {
    myGoals = goals;
    for(var i=0; i<3; i++){
        if(i>= myGoals.length){
            document.getElementById("goal"+i).style.opacity = "0";
        } else{
      let goal=myGoals[i];
      if(goal == undefined){
        document.getElementById("goal"+i).style.opacity = "0";
      } else 
        document.getElementById("goalReward"+i).innerHTML = goal.reward;
        document.getElementById("goalDescription"+i).innerHTML = goal.description;
        if(goal.reward > 0){
            document.getElementById("goal"+i).style.opacity = "1";
        } else {
            document.getElementById("goal"+i).style.opacity = "0";
        }
        }
    }
  })

function selectUser(email, realName){
    if(realName != ""){
        console.log("select: ", realName);
        document.getElementById('selectedUser').innerHTML = realName;
    }
    selectedUser = email;
}

function giveCard(color){
    if(selectedUser != ""){
        console.log("Giving "+selectedUser+" a "+color+" card");
        socket.emit('giveCard', selectedUser, color);
        document.getElementById('selectedUser').innerHTML += " got a "+color + " card!";
        selectUser("", "");
    } else {
        document.getElementById('selectedUser').innerHTML = "Select a student";
    }
}