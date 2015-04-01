var range = {x: 100, y: 100, z: 100};
var pos = MyAvatar.position;
var numBoxes = 20;
var items = [];
var generating = false;
var spawnCount = 0;
var maxCount = 10;
var generateInterval;


function keyPressed(event) {
  if(event.text === 'f'){
    if(!generating){
      generate();
      generateInterval = Script.setInterval(generate, 100);
    } else{
      Script.clearInterval(generateInterval);
      destroy();
    }
    generating = !generating;
  }
}


function generate(){
   spawnCount++;
   for(var i = 0; i < numBoxes; i++){
    items.push(Entities.addEntity({
      type: 'Box',
      // position: {x: pos.x + randFloat(-range.x/2, range.x/2), y: pos.y + randFloat(-rang.y/2, range.y/2), z: randFloat(-range.z/2, range.z/2)},
      position: {x: pos.x + randFloat(-range.x/2, range.x/2), y: pos.y + randFloat(-range.y/2, range.y/2), z: pos.z + randFloat(-range.z/2, range.z/2)},
      dimensions: {x: 1, y:1, z: 1},
      color: {red: randFloat(50, 200), green: randFloat(5, 100), blue: randFloat(50, 200)}
    }));
  }

  if(spawnCount >= maxCount){
    generating = false;
    Script.clearInterval(generateInterval);
  }


}

function destroy(){
  items.forEach(function(item){
    Entities.deleteEntity(item);
  });
  items = [];
}

function randFloat ( low, high ) {
  return Math.floor(low + Math.random() * ( high - low ));
}

Script.scriptEnding.connect(destroy);
Controller.keyPressEvent.connect(keyPressed)