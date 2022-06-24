var clock = 0.0;
var timerDuration;

this.window.setInterval(update, 100);

function startTimer(duration){
    timerDuration = duration+1;
    update();
}

function update(){
    clock = Math.round((clock+0.1) * 10) / 10;
    if(clock == Math.ceil(clock)){
        if(timerDuration > 0){
            timerDuration -= 1;
            var timerDiv = this.document.getElementById("timer");
            timerDiv.innerHTML = timerDuration;
        }
    }
}