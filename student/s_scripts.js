var currentContent = "main";

var myTeam = {
  id:0,
  name: "Team 1",
  primary: 'rgb(230, 55, 70)',
  secondary: 'rgb(255, 224, 102)'
}

window.onload = function() {
  showContent(currentContent);
  document.getElementById('login_submit').addEventListener('click', login);
  //document.getElementById('draw_clear').addEventListener('click', login);8

  updateXP(0, 875);
  setTimeout(function() {
    updateDragon(0, myTeam.name, "", 30, myTeam.primary, myTeam.secondary)
  }, 100);
  //function updateDragon(team, name, type, size, primaryColor, secondayColor){
}

function login(){
  showContent("main");
}

function showContent(newContent){
  currentContent = newContent;
  switch(newContent){
    case "main":
      document.getElementById("content_login").style.zIndex = -1;
      //document.getElementById("content_quiz").style.zIndex = -1;
      //document.getElementById("content_draw").style.zIndex = -1;
    break;
    case "login":
      document.getElementById("content_login").style.zIndex = 10;
      document.getElementById("content_quiz").style.zIndex = -1;
      //document.getElementById("content_draw").style.zIndex = -1;
    break;
    case "draw":
      document.getElementById("content_login").style.zIndex = -1;
      document.getElementById("content_quiz").style.zIndex = -1;
      //document.getElementById("content_draw").style.zIndex = 10;
    break;
    case "quiz":
      document.getElementById("content_login").style.zIndex = -1;
      document.getElementById("content_quiz").style.zIndex = 10;
      //.getElementById("content_draw").style.zIndex = -1;
    break;
  }
}

function updateXP(team, xp){
  if(team != myTeam.id){return};
  let xpFill = document.getElementById("xp_fill");
  let level = document.getElementById("team_level");
  xpFill.style.height = xp%100 + "%";
  level.innerHTML = Math.ceil(xp/100);
}

function updateDragon(team, name, type, size, primaryColor, secondayColor){
  if(team != myTeam.id){return};
  let dragon = document.getElementById("dragon");
  let svg = dragon.contentDocument;
  
  if(primaryColor != undefined){
      let primary = svg.getElementsByClassName("primaryColor");
      for(let i=0; i<primary.length; i++){
          primary[i].style.fill = primaryColor;
      }
      document.getElementById("xp_fill").style.backgroundColor = primaryColor;
  }
  if(secondayColor != undefined){
      let secondary = svg.getElementsByClassName("secondaryColor");
      for(let i=0; i<secondary.length; i++){
          secondary[i].style.fill = secondayColor;
      }
  }
  document.getElementById("xp_fill").style.borderTopColor = secondayColor;
  dragon.style.width = size+"%";

  document.getElementById("dragon_name").innerHTML = name;
}
