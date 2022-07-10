var currentContent = "main";

window.onload = function() {
  showContent(currentContent);
  document.getElementById('login_submit').addEventListener('click', login);
  document.getElementById('draw_clear').addEventListener('click', login);
}

function login(){
  showContent("main");
}

function showContent(newContent){
  currentContent = newContent;
  switch(newContent){
    case "main":
      document.getElementById("content_login").style.zIndex = -1;
      document.getElementById("content_quiz").style.zIndex = -1;
      document.getElementById("content_draw").style.zIndex = -1;
    break;
    case "login":
      document.getElementById("content_login").style.zIndex = 10;
      document.getElementById("content_quiz").style.zIndex = -1;
      document.getElementById("content_draw").style.zIndex = -1;
    break;
    case "draw":
      document.getElementById("content_login").style.zIndex = -1;
      document.getElementById("content_quiz").style.zIndex = -1;
      document.getElementById("content_draw").style.zIndex = 10;
    break;
    case "quiz":
      document.getElementById("content_login").style.zIndex = -1;
      document.getElementById("content_quiz").style.zIndex = 10;
      document.getElementById("content_draw").style.zIndex = -1;
    break;
  }
}