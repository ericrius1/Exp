var range = {x: 100, y: 100, z: 100};
var pos;
var items = [];
var generating = false;
var generateInterval;
var rowIndex = 0;
var numRows = 10;
var boxSize = 1;
//We want boxes to lines up evenly
var numCols = 20;
var floorWidth = numCols * boxSize;
var floorHeight;


function keyPressed(event) {
  if(event.text === 'f'){
    if(!generating){
      pos = MyAvatar.position;
      floorHeight = pos.y - 2;
      generate();
      generateInterval = Script.setInterval(generate, 500);
    } else{
      Script.clearInterval(generateInterval);
      reset();
      destroy();
    }
    generating = !generating;
  }
}


function generate(){
   var zPos = map(rowIndex, 0, numRows, pos.z, pos.z - floorWidth);
   print("ZPOS" + zPos)
   for(var i = 0; i < numCols; i++){
    var xPos = map(i, 0, numCols, pos.x-floorWidth/2, pos.x + floorWidth/2);
    print("XPOS" + xPos)
    items.push(Entities.addEntity({
      type: 'Box',
      position: {x: xPos, y: floorHeight, z: zPos},
      dimensions: {x:boxSize, y:.1, z:boxSize},
      color: {red: randFloat(100, 200), green: randFloat(5, 50), blue: randFloat(100, 200)}
    }));
  }
  rowIndex++;

  if(rowIndex >= numRows){
    reset();
  }



}

function reset(){
  Script.clearInterval(generateInterval);
  rowIndex = 0;
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

function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

Script.scriptEnding.connect(destroy);
Controller.keyPressEvent.connect(keyPressed)