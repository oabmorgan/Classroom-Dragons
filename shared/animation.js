var animation = [];

function animation_frame(){
    for(let i=0; i<animation.length; i++){
        let anim = animation[i];
        let duration = anim.end - anim.start;
        let remainingDuration = anim.end - Date.now();
        let progressPct = 1 - (remainingDuration/duration);
        let range = anim.to - anim.from;
        
        if(progressPct >= 1){
            if(progressPct >= anim.endPct){
                animation.splice(i,1);
                if(anim.onComplete != null){
                    anim.onComplete();
                }
            }
            return;
        }
        
        if(anim.onFrame != null){
            //pct, remaining duration,
            anim.onFrame(anim.element.style[anim.attribute], remainingDuration);
        }
        
        switch(anim.type){
            case "linear":
                anim.element.style[anim.attribute] = anim.from + (range*(progressPct)) + "%";
                break;
            case "linearWrap":
                if(range < 0 && parseInt(anim.element.style[anim.attribute]) < 100){
                    let fakeRange = anim.to + 100 - anim.from;
                    anim.element.style[anim.attribute] = anim.from + (fakeRange*(progressPct)) + "%";
                    if(parseInt(anim.element.style[anim.attribute]) > 100){
                        anim.from = 0;
                        anim.end += 1000;
                        anim.element.style[anim.attribute] = "0%";
                    }
                } else {
                    anim.element.style[anim.attribute] = anim.from + (range*(progressPct)) + "%";
                }
                break;
            case "easeIn":
                anim.element.style[anim.attribute] = anim.from + (range*(Math.pow(progressPct,10))) + "%";
            break;
        }
    };
}

function new_animation(element, attribute, to, duration, type, endPct=1, overwrite=false, onComplete=null, onFrame=null){
    let index = animation.findIndex(anim => anim.element === element && anim.attribute === attribute);
    let from = parseInt(element.style[attribute]);
    if(isNaN(from)){
        from = 0;
    }
    if(to - from == 0){
        return;
    }
    if(index >= 0){
        let anim = animation[index];
        if(overwrite){
            console.log("overwrite");
            animation.splice(index,1);
            new_animation(element, attribute, to, duration, type, endPct, overwrite, onComplete, onFrame);
            return;
        } else {
            if(anim.to == to){
            } else {
                anim.to = to;
                anim.end += duration*1000;
            }
            return;
        }
    }
    animation.push({
        "element":element,
        "attribute":attribute,
        "from":from,
        "to":to,
        "start":Date.now(),
        "end":Date.now() + duration*1000,
        "type":type,
        "onComplete":onComplete,
        "endPct":endPct,
        "onFrame":onFrame
    })
    console.log("New Animation",element.id,attribute,"("+from+">"+to+")");
}