var pos;
var items = [];
var generating = false;
var generateInterval;
var rowIndex = 0;
var boxSize = 400;
//We want boxes to lines up evenly
var numCols = 10;
var interval = 200;
var numRows = 10;
var colWidth = numCols * boxSize;
var rowWidth = numRows * boxSize;
var floorHeight;
var GRAVITY = -3.5;


function keyPressed(event) {
  if(event.text === 'f'){
    //FLOOR
    if(!generating){
      pos = MyAvatar.position;
      floorHeight = pos.y - boxSize;
      generateFloor();
      generateInterval = Script.setInterval(generateFloor, interval);
    } else{
      Script.clearInterval(generateInterval);
      reset();
      destroy();
    }
    generating = !generating;
  }

  if(event.text === 'g'){
    //ROCKS
    sitems.push(Entities.addEntity({
      type: "Model",
      modelURL: "https://hifi-public.s3.amazonaws.com/ozan/Rocks/Crystal1.fbx",
      shapeType: "box",
      collisionsWillMove: true,
      gravity: {x: 0, y: GRAVITY, z: 0},
      velocity: {x: 0, y: 0.1, z: 0},
      dimensions: {x: 1, y: 1, z:1},
      position: {x: xPos, y: floorHeight + 10, z: zPos},
    }))

  }
}


function generateFloor(){
   var zPos = map(rowIndex, 0, numRows, pos.z, pos.z - rowWidth);
   for(var i = 0; i < numCols; i++){
    var xPos = map(i, 0, numCols, pos.x-colWidth/2, pos.x + colWidth/2);
    // print("XPOS" + xPos)
    items.push(Entities.addEntity({
      type: 'Box',
      position: {x: xPos, y: floorHeight, z: zPos},
      dimensions: {x:boxSize, y:10, z:boxSize},
      color: {red: randFloat(100, 200), green: randFloat(5, 50), blue: randFloat(100, 200)}
    }));



  }

  rowIndex++;

  if(rowIndex === numRows){
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