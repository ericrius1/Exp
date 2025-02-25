var lines = [];
var isDrawing = false;

var DRAWING_DISTANCE = 5;
var MAX_POINTS_PER_LINE = 80;
var line;
var points = [];

function newLine(point){
  line = Entities.addEntity({
    position: MyAvatar.position,
    type: "Line",
    color: {
      red: randInt(0, 200),
      green: randInt(0, 200),
      blue: randInt(0, 200)
    },
    dimensions: {
      x: 10,
      y: 10,
      z: 10
    },
    lineWidth: 5
  });
  points = [];
  if(point){
    points.push(point);
  }
  lines.push(line);
}


function mouseMoveEvent(event) {
  if (!isDrawing) {
    return;
  }
  print('waaaah')
  var pickRay = Camera.computePickRay(event.x, event.y);
  var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), DRAWING_DISTANCE);
  var point = Vec3.sum(Camera.getPosition(), addVector);
  points.push(point);
  Entities.editEntity(line, {
    linePoints: points
  });

  if(points.length === MAX_POINTS_PER_LINE){
    //We need to start a new line!
    newLine(point);
  }
}

function mousePressEvent() {
  newLine();
  isDrawing = true;

}

function mouseReleaseEvent() {
  isDrawing = false;
  print('final points!! ' + points.length)
}


function cleanup() {
  lines.forEach(function(line) {
    Entities.deleteEntity(line);
  })

}


Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Controller.mouseMoveEvent.connect(mouseMoveEvent);
Script.scriptEnding.connect(cleanup);

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}


function randInt(low, high) {
  return Math.floor(randFloat(low, high));
}