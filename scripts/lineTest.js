var time = 0;

var omega = 2 * Math.PI / 8;
var range = 10;


var points = [];
var lines = [];
var currentLine;

var MAX_POINTS_PER_LINE = 20;
newLine();

function newLine(point) {
  points = [];
  points.push(point);
  var line = Entities.addEntity({
    type: "Line",
    position: point,
    linePoints: points,
    color: {
      red: 200,
      green: 50,
      blue: 100
    },
    dimensions: {
      x: 1,
      y: 1,
      z: 1
    },
    lineWidth: 7
  });
  lines.push(line);

}

var basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(5, Quat.getFront(Camera.getOrientation())));
var ball = Entities.addEntity({
  type: 'Sphere',
  position: basePosition,
  color: {
    red: 200,
    green: 20,
    blue: 20
  }
})

function cleanup() {
  lines.forEach(function(line) {
    Entities.deleteEntity(line);
  })
  Entities.deleteEntity(ball);

}

function update(deltaTime) {

  time += deltaTime;
  var newPosition = {
      x: basePosition.x + Math.sin(time * omega) / 2.0 * range,
      y: basePosition.y,
      z: basePosition.z + Math.cos(time * omega) / 2.0 * range
  }


  Entities.editEntity(ball, {
    position: newPosition
  });
  points.push(newPosition);
  Entities.editEntity(lines[lines.length - 1], {
    linePoints: points
  })

  if (points.length === MAX_POINTS_PER_LINE) {
    newLine(newPosition);
  }


}


Script.update.connect(update);
Script.scriptEnding.connect(cleanup)