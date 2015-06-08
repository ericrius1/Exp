HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
// Script.include(HIFI_PUBLIC_BUCKET + 'scripts/utilities.js')
Script.include('utilities.js');

var NUM_ROWS = 10;
var CUBE_SIZE = 2;
var cubes = [];
var cubesSettings = [];


var center = Vec3.sum(MyAvatar.position, Vec3.multiply(CUBE_SIZE * 10, Quat.getFront(Camera.getOrientation())));


for (var x = 0, rowIndex = 0; x < NUM_ROWS * CUBE_SIZE; x += CUBE_SIZE, rowIndex++) {
  for (var z = 0, columnIndex = 0; z < NUM_ROWS * CUBE_SIZE; z += CUBE_SIZE, columnIndex++) {

    var baseHeight = map(columnIndex + 1, 1, NUM_ROWS, -CUBE_SIZE * 2, -CUBE_SIZE);
    var relativePosition = {
      x: x,
      y: baseHeight,
      z: z
    };
    var position = Vec3.sum(center, relativePosition);
    cubes.push(Entities.addEntity({
      type: 'Box',
      position: position,
      dimensions: {
        x: CUBE_SIZE,
        y: CUBE_SIZE,
        z: CUBE_SIZE
      }
    }));
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