var socket = io();
var selectedUser = "";

window.onload = function(){
    socket.emit('join', "teacher", "teacher");
    for(let i=0; i<4; i++){
        document.getElementById("selectGroup"+i).addEventListener("click", function() {
            let selectedGroup = document.getElementById("selectGroup"+i);
            selectUser(selectedGroup.value, selectedGroup.options[selectedGroup.selectedIndex].text);
        });
        document.getElementById("selectGroup"+i).addEventListener("change", function() {
            let selectedGroup = document.getElementById("selectGroup"+i);
            selectUser(selectedGroup.value, selectedGroup.options[selectedGroup.selectedIndex].text);
        });
    }

    document.getElementById("greenCard").onclick = function(){giveCard("green")};
    document.getElementById("yellowCard").onclick = function(){giveCard("yellow")};
    document.getElementById("redCard").onclick = function(){giveCard("red")};

    document.getElementById("setQuestButton").onclick = function(){setQuest()};

    document.getElementById("cancelQuest0").onclick = function(){cancelQuest(0)};
    document.getElementById("cancelQuest1").onclick = function(){cancelQuest(1)};
    document.getElementById("cancelQuest2").onclick = function(){cancelQuest(2)};

    document.getElementById("completeQuest0").onclick = function(){completeQuest(0)};
    document.getElementById("completeQuest1").onclick = function(){completeQuest(1)};
    document.getElementById("completeQuest2").onclick = function(){completeQuest(2)};
};

socket.on('updateTeams', (email, realName, team) => {
    for(let i=0; i<4; i++){
        var select = document.getElementById('selectGroup'+i);
        var options = select.options;
        for (let i = 0; i < options.length; i++) { 
            if(options[i].value == email){
                select.remove(options[i]);
            }
        }
        if(i == team){
            var opt = document.createElement('option');
            opt.value = email;
            opt.text = realName;
            select.appendChild(opt);
        }
    }
})

function setQuest(){
    let reward = document.getElementById("setQuestReward").value;
    let description = document.getElementById("setQuestDescription").value;
    if(reward > 0 && description != ""){
        socket.emit('setQuest', reward, description);
        console.log("Sending new quest");
        document.getElementById("setQuest").reset();
    }
}

function cancelQuest(id){
    if(myQuests[id] != undefined){
        socket.emit('cancelQuest', myQuests[id].qid);
    }
}

function completeQuest(id){
    if(selectedUser != "" && document.getElementById("questReward"+id).innerHTML > 0){
        socket.emit('completeQuest', selectedUser, myQuests[id].qid);
    }
}

var myQuests;
socket.on('updateQuests', (quests) => {
    myQuests = quests;
    for(var i=0; i<3; i++){
        if(i>= myQuests.length){
            document.getElementById("quest"+i).style.visibility = "hidden";
        } else{
      let quest=myQuests[i];
      if(quest == undefined){
        document.getElementById("quest"+i).style.visibility = "hidden";
      } else 
        document.getElementById("questReward"+i).innerHTML = quest.reward;
        document.getElementById("questDescription"+i).innerHTML = quest.description;
        if(quest.reward > 0){
            document.getElementById("quest"+i).style.visibility = "visible";
        } else {
            document.getElementById("quest"+i).style.visibility = "hidden";
        }
        }
    }
  })

function selectUser(email, realName){
    console.log(email, realName);
    if(realName != ""){
        document.getElementById('selectedUser').innerHTML = realName;
    }
    selectedUser = email;
}

function giveCard(color){
    if(selectedUser != ""){
        console.log("Giving "+selectedUser+" a "+color+" card");
        socket.emit('giveCard', selectedUser, color);
        document.getElementById('selectedUser').innerHTML += " got a "+color + " card.";
        selectUser("", "");
    } else {
        document.getElementById('selectedUser').innerHTML = "Select a student";
    }
}