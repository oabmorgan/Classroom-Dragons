var socket = io();
var email;
var xp;

document.getElementById("loginForm").addEventListener('submit', functSubmit);

function functSubmit(event) {
  email = document.getElementById("email").value+"@seto-solan.ed.jp";
  socket.emit('join', email);
}

socket.on('login', (success) => {
  if(success){
    document.getElementById("logincontainer").style.visibility = 'hidden';
    document.getElementById("loginfeedback").style.visibility = 'hidden';
    socket.emit('xp', email, 10);
  } else {
    document.getElementById("loginfeedback").style.visibility = 'visible';
  }
})

socket.on('xp', (gain, total) => {
  console.log("Yay I got xp! "+gain);
  xp = total; 
  console.log("Now I have "+total);
})
