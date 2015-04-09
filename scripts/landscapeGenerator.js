

var boxSizeRange = {
  min: 0.5,
  max: 5
};
var startPosition = MyAvatar.position;
var range = 200;

var currentNumBoxes = 0;
var maxBoxes = 1000;
var interval = 100;
var numBoxesPerInterval = 100;
var boxes = [];




function generateFloor() {

  if (currentNumBoxes > maxBoxes) {
    return;
  }

  for (var i = 0; i < numBoxesPerInterval; i++) {
    var size = randFloat(boxSizeRange.min, boxSizeRange.max);
    var dimensions = {
      x: size,
      y: size,
      z: size
    };
    boxes.push(Entities.addEntity({
      type: "Box",
      position: {
        x: startPosition.x + randFloat(-range / 2, range / 2),
        y: startPosition.y + randFloat(-range / 2, range / 2),
        z: startPosition.z + randFloat(-range / 2, range / 2)
      },
      dimensions: dimensions,
      color: {
        red: randFloat(100, 200),
        green: randFloat(5, 50),
        blue: randFloat(100, 200)
      }
    }));
  }
  currentNumBoxes += numBoxesPerInterval;

  Script.setTimeout(generateFloor, interval);

}

var count = 300;
function update() {
  if (count > 0) {
    count--;
    return;
  } else {
    generateFloor();
    Script.update.disconnect(update);
  }

}


function cleanup() {
  for (var i = 0; i < boxes.length; i++) {
    Entities.deleteEntity(boxes[i]);
  }
}

Script.update.connect(update);
Script.scriptEnding.connect(cleanup);

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}