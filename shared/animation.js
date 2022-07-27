var animation = [];

function animation_frame(){
    for(let i=0; i<animation.length; i++){
        let anim = animation[i];
        let duration = anim.end - anim.start;
        let remainingDuration = anim.end - Date.now();
        let progressPct = 1 - (remainingDuration/duration);
        let range = anim.to - anim.from;
        
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
        }

        if(progressPct >= 1){
            animation.splice(i,1);
            //console.log("animation finished");
        }
    };
}

function new_animation(element, attribute, to, duration, type){
    let index = animation.findIndex(anim => anim.element === element && anim.attribute === attribute);
    if(index >= 0){
        if(animation[index].to == to){
        } else {
            animation[index].to = to;
            animation[index].end += duration*1000;
        }
        return;
    }
    let from = parseInt(element.style[attribute]);
    if(isNaN(from)){
        from = 0;
    }
    if(to - from == 0){
        return;
    }
    animation.push({
        "element":element,
        "attribute":attribute,
        "from":from,
        "to":to,
        "start":Date.now(),
        "end":Date.now() + duration*1000,
        "type":type
    })
    console.log("New Animation",element.id,attribute,"("+from+">"+to+")");
}