var lineEntityID = null;
var lineIsRezzed = false;
var altHeld = false;
var lineCreated = false;


var animationSettings = JSON.stringify({
  firstFrame: 0,
  fps: 30, 
  loop: true,
  running: true
});
var tipEmitter = Entities.addEntity({
  type: "ParticleEffect",
  animationSettings: animationSettings,
  position: MyAvatar.position,
  textures: "https://s3.amazonaws.com/hifi-public/cozza13/particle/orb_blue_glow.png",
  emitRate: 1000,
  emitStrength: 30,
  visible: true,
  color: {red: 200, green: 10, blue: 200}
});



function nearLinePoint(targetPosition) {
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
    var dim = Vec3.subtract(intersection.intersection, nearLinePoint(intersection.intersection));
    if (lineIsRezzed) {
      Entities.editEntity(lineEntityID, {
        position: nearLinePoint(intersection.intersection),
        dimensions: dim,
        lifetime: 15 + props.lifespan // renew lifetime
      });
    } else {
      lineIsRezzed = true;
      lineEntityID = Entities.addEntity({
        type: "Line",
        position: nearLinePoint(intersection.intersection),
        dimensions: dim,
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


Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);

Controller.keyPressEvent.connect(keyPressEvent);
Controller.keyReleaseEvent.connect(keyReleaseEvent);