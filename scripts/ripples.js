HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
// Script.include(HIFI_PUBLIC_BUCKET + 'scripts/utilities.js')
Script.include('utilities.js');

var NUM_ROWS = 10;
var BOX_SIZE = 1;
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(BOX_SIZE * 10, Quat.getFront(Camera.getOrientation())));

var grid = [];
var entities = [];

for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
  for(var columnIndex = 0; columnIndex < NUM_ROWS; columnIndex++) {
    if(!grid[rowIndex]) {
      grid[rowIndex] = [];
    }
    var entity = Entities.addEntity({
      type: 'Box',
      position: Vec3.sum(center, {x: rowIndex * BOX_SIZE, y: -2, z: columnIndex * BOX_SIZE}),
      dimensions: {x: BOX_SIZE, y: BOX_SIZE, z: BOX_SIZE},
      color: hslToRgb({hue: 0.6, sat: 0.5, light: randFloat(0.5, 0.6)})
    });
    grid[rowIndex].push(Entities.addEntitiy({
      type: 'Box',

    }))
  }
}


function update(deleteTime) {}

function cleanup() {
  cubes.forEach(function(cube) {
    Entities.deleteEntity(cube);
  })
}

Script.update.connect(update);
Script.scriptEnding.connect(cleanup)