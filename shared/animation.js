var animation = [];

function animation_frame(){
    for(let i=0; i<animation.length; i++){
        let anim = animation[i];
        let duration = anim.end - anim.start;
        let remainingDuration = anim.end - Date.now();
        let progressPct = 1 - (remainingDuration/duration);
        let range = anim.to - anim.from;

        document.title = progressPct;
        document.title = remainingDuration;
        document.title = "Dragons";
        
        //is animation finished?
        if(progressPct >= 1){
            //is overtime finished?
            if(progressPct >= anim.endPct){
                //remove animation
                animation.splice(i,1);
                if(anim.onComplete != null){
                    //do oncomplete function
                    anim.onComplete();
                }
            }
        }

            if(anim.onFrame != null){
                anim.onFrame(anim.element.style[anim.attribute], remainingDuration);
            }

            //anim type
            switch(anim.type){
                case "linear":
                    //straight from one to another
                    anim.element.style[anim.attribute] = anim.from + (range*(progressPct)) + "%";
                    break;
                    //wrap over 100%
                case "increase":
                    let value = parseInt(anim.element.style[anim.attribute]);
                    if(value >= 100){
                        value = 0;
                    }
                    anim.element.style[anim.attribute] = value + 1 + "%";
                    break;
                case "decrease":
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
                    //ease
                case "easeOut":
                    anim.element.style[anim.attribute] = anim.from + (range*(Math.pow(progressPct,5))) + "%";
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
            //console.log("overwrite");
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

    //console.log("New Animation",element.id,attribute,"("+from+">"+to+")");
}