//Dimensions property for lines is the offset of the position

var lineEntityID = null;
var lineIsRezzed = false;
var altHeld = false;
var lineCreated = false;
var position, positionOffset, prevPosition;
var nearLinePosition;


var center = Vec3.sum(MyAvatar.position, Vec3.multiply(15.0, Quat.getFront(Camera.getOrientation())));
var whiteBoard = Entities.addEntity({
  type: "Box",
  position: center,
  dimensions: {x: 10, y: 5, z: .001},
  color: {red: 255, green: 255, blue: 255}
});

function calculateNearLinePosition(targetPosition) {
  var handPosition = MyAvatar.getRightPalmPosition();
  var along = Vec3.subtract(targetPosition, handPosition);
  along = Vec3.normalize(along);
  along = Vec3.multiply(along, 0.4);
  return Vec3.sum(handPosition, along);
}


function removeLine() {
  if (lineIsRezzed) {
    Entities.deleteEntity(lineEntityID);
    lineEntityID = null;
    lineIsRezzed = false;
  }
}


function createOrUpdateLine(event) {
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay, true); // accurate picking
  var props = Entities.getEntityProperties(intersection.entityID);

  if (intersection.intersects) {
    startPosition = intersection.intersection;
    nearLinePosition = calculateNearLinePosition(intersection.intersection);
    positionOffset= Vec3.subtract(startPosition, nearLinePosition);
    if (lineIsRezzed) {
      Entities.editEntity(lineEntityID, {
        position: nearLinePosition,
        dimensions: positionOffset,
        lifetime: 15 + props.lifespan // renew lifetime
      });
      draw();
    } else {
      lineIsRezzed = true;
      prevPosition = intersection.intersection;
      lineEntityID = Entities.addEntity({
        type: "Line",
        position: nearLinePosition,
        dimensions: positionOffset,
        color: {
          red: 255,
          green: 255,
          blue: 255
        },
        lifetime: 15 // if someone crashes while pointing, don't leave the line there forever.
      });
    }
  } else {
    removeLine();
  }
}

function draw(){
  var offset = Vec3.subtract(prevPosition, startPosition)
  Entities.addEntity({
    type: "Line",
    position: prevPosition,
    dimensions: offset,
    color: {red: 200, green: 40, blue: 200}
  })

  prevPosition = startPosition;

}

function mousePressEvent(event) {
  if (!event.isLeftButton || altHeld) {
    return;
  }
  Controller.mouseMoveEvent.connect(mouseMoveEvent);
  createOrUpdateLine(event);
  lineCreated = true;
}


function mouseMoveEvent(event) {
  createOrUpdateLine(event);
}



function mouseReleaseEvent(event) {
  if (!lineCreated) {
    return;
  }
  Controller.mouseMoveEvent.disconnect(mouseMoveEvent);
  removeLine();
  lineCreated = false;
}

function keyPressEvent(event) {
  if (event.text == "ALT") {
    altHeld = true;
  }
}

function keyReleaseEvent(event) {
  if (event.text == "ALT") {
    altHeld = false;
  }

}

function cleanup(){
  Entities.deleteEntity(whiteBoard);
}


Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);

Controller.keyPressEvent.connect(keyPressEvent);
Controller.keyReleaseEvent.connect(keyReleaseEvent);