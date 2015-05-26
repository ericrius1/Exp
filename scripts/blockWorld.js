var floorTiles = [];
var blocks = [];


var boxHeight = 10;
var xWidth = 1600
var zWidth = 1600;

var rowIndex = 0;
var rowCount = xWidth / boxSize;

var boxSize = 32
var GENERATE_INTERVAL = 50;

var floorPos = Vec3.sum(MyAvatar.position, {
  x: 0,
  y: -6,
  z: 0
});
var x = floorPos.x;

var NUM_ROWS = 2;
var NUM_COLUMNS = 2;
var currentRowIndex = 0;
var currentColumnIndex = 0;

var DROP_HEIGHT = floorPos.y + 5;
var BLOCK_GRAVITY = {x: 0, y: -1, z: 0};
var BLOCK_SIZE = {x: 0.2, y: 0.1, z: 0.8};


function generateFloor() {
  for (var z = floorPos.z; currentColumnIndex < NUM_COLUMNS; z += boxSize, currentColumnIndex++) {
    floorTiles.push(Entities.addEntity({
      type: 'Box',
      position: {
        x: x,
        y: floorPos.y,
        z: z
      },
      dimensions: {
        x: boxSize,
        y: boxHeight,
        z: boxSize
      },
      color: {
        red: randFloat(70, 80),
        green: randFloat(70, 71),
        blue: randFloat(70, 80)
      }
    }));
  }

  if (currentRowIndex < NUM_ROWS) {
    currentRowIndex++;
    currentColumnIndex = 0;
    x += boxSize;
    Script.setTimeout(generateFloor, GENERATE_INTERVAL);
  } else {
    //Once we're done generating floor, drop planky blocks at random points on floor
    dropBlocks();
  }
}

function dropBlocks(){
  var dropPos = floorPos;
  dropPos.y = DROP_HEIGHT;
  dropBlock(dropPos);

}

function dropBlock(position){
  print("DROP")
  blocks.push(Entities.addEntity({
    type: "Model",
    modelURL: 'http://s3.amazonaws.com/hifi-public/marketplace/hificontent/Games/blocks/block.fbx',
    position: position,
    dimensions: BLOCK_SIZE,
    gravity: BLOCK_GRAVITY,
    velocity: {x: 0, y: .1, z: 0}
  }));
}

generateFloor();

function destroy() {
  for (var i = 0; i < floorTiles.length; i++) {
    Entities.deleteEntity(floorTiles[i]);
  }
   for (var i = 0; i < blocks.length; i++) {
    Entities.deleteEntity(blocks[i]);
  }
}

Script.scriptEnding.connect(destroy);

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}