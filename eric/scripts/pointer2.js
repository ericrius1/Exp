var lines = [];
var pointerActivated = false;

var POINTER_DISTANCE = 5;
var line;
newLine();
function newLine(){
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
    lineWidth: 2
  });
  lines.push(line);
}


function mouseMoveEvent(event) {
  if (!pointerActivated) {
    return;
  }

  var pickRay = Camera.computePickRay(event.x, event.y);
  var startPosition = MyAvatar.getRightPalmPosition();
  var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), POINTER_DISTANCE);
  var endPosition = Vec3.sum(startPosition, addVector);
  Entities.editEntity(line, {
    linePoints: [startPosition, endPosition]
  });
}

function mousePressEvent() {
  pointerActivated = true;
  Entities.editEntity(line, {visible: true})
}

function mouseReleaseEvent() {
  pointerActivated = false;
  Entities.editEntity(line, {visible: false})
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