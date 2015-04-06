var items = [];


var boxSizeRange = {
  min: 0.5,
  max: 5
};
var startPosition = {
  x: 1000,
  y: 1000,
  z: 1000
};
var range = 100;

var currentNumBoxes = 0;
var maxBoxes = 10000;
var interval = 1000;
var numBoxesPerInterval = 100;





function generateFloor() {
  print("YAAAAAA")

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
    Entities.addEntity({
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
    });
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


Script.update.connect(update);

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}