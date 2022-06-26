var socket = io();

socket.emit('join', "teacher", "teacher");

socket.emit('xp', "omorgan@seto-solan.ed.jp", 10);

socket.on('updateTeams', (email, realName, team) => {
    var select = document.getElementById("selectGroup"+team);
    for (i = 0; i < select.options.length; ++i){
        console.log(document.getElementById("selectGroup"+team).options[i]);
        if (document.getElementById("selectGroup"+team).options[i].value == email){
            console.log("already exist");
            return;
        }
    }
    var option = document.createElement("option");
    option.text = realName;
    option.value = email;
    select.add(option);
})