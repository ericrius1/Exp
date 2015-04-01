var pos;
var items = [];
var generateInterval;
var rowIndex = 0;
//We want boxes to lines up evenly

var GRAVITY = -3.5;
var numRocks = 100;


function keyPressed(event) {
  if (event.text === 'g') {
    spawnRocks()
  }
}


function spawnRocks() {
  for (var i = 0; i < numRocks; i++) {
    items.push(Entities.addEntity({
      type: "Model",
      modelURL: "https://hifi-public.s3.amazonaws.com/ozan/Rocks/Crystal1.fbx",
      shapeType: "box",
      collisionsWillMove: true,
      gravity: {
        x: 0,
        y: GRAVITY,
        z: 0
      },
      velocity: {
        x: 0,
        y: 0.1,
        z: 0
      },
      dimensions: {
        x: 1,
        y: 1,
        z: 1
      },
      position: {
        x: MyAvatar.position.x,
        y: MyAvatar.position.y,
        z: MyAvatar.position.z
      },
    }));

  }

}



function destroy() {
  items.forEach(function(item) {
    Entities.deleteEntity(item);
  });
  items = [];
}

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

Script.scriptEnding.connect(destroy);
Controller.keyPressEvent.connect(keyPressed)