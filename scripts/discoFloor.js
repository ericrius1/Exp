var items = [];


var boxHeight = 100;
var xWidth = 16000
var zWidth = 16000;

var rowIndex = 0;
var rowCount = xWidth/boxSize;
var x = 0;

var boxSize = 100
var generateInterval = 500;

function generateFloor() {
    for (var z = 0; z <zWidth; z += boxSize) {
      items.push(Entities.addEntity({
        type: 'Box',
        position: {
          x: x,
          y: 100,
          z: z
        },
        dimensions: {
          x: boxSize,
          y: boxHeight,
          z: boxSize
        },
        color: {
          red: randFloat(100, 200),
          green: randFloat(5, 50),
          blue: randFloat(100, 200)
        }
      }));

    }

    if(x< xWidth){
      x+= boxSize;
      Script.setTimeout(generateFloor, generateInterval);

    }
}

var count = 300;
function update(){
  if(count > 0){
    count--;
    return;
  }else {
    generateFloor();
    Script.update.disconnect(update);
  }

}


Script.update.connect(update);

function destroy(){
  for(var i =0; i < items.length; i++){
    Entities.deleteEntity(items[i]);
  }
}

Script.scriptEnding.connect(destroy);

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}