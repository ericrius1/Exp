Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js")
var isGrabbing = false;
var grabbedEntity = null;
var prevMouse = {};
var deltaMouse = {
  z: 0
}
var entityProps;
var box;
var baseMoveFactor = .001;
var finalMoveMultiplier;
var avatarEntityDistance;
var camYaw, dv;
var raiseAmount = 1;
var prevPosition;
var newPosition;
var flingVelocity;
var flingMultiplier = .2;
var DAMPING = 0.95;
var startingHeight;


var autoBox = true;
if (autoBox) {
  var distance = 4;
  box = Entities.addEntity({
    type: 'Box',
    position: Vec3.sum(MyAvatar.position, Vec3.multiply(distance, Quat.getFront(Camera.getOrientation()))),
    dimensions: {
      x: .5,
      y: .5,
      z: .5
    },
    color: {
      red: 200,
      green: 50,
      blue: 192
    },
  });
}

function update() {
  TWEEN.update()
}

function mousePressEvent(event) {
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay);
  if (intersection.intersects) {
    isGrabbing = true;
    // print("intersection props " + JSON.stringify(intersection))
    grabbedEntity = intersection.entityID;
    prevPosition = Entities.getEntityProperties(grabbedEntity).position;
    raise();
  }

}

function raise() {
  entityProps = Entities.getEntityProperties(grabbedEntity);
  startingHeight = entityProps.position.y;
  var curProps = {
    y: startingHeight
  }
  var endProps = {
    y: entityProps.position.y + raiseAmount
  }
  var raiseTween = new TWEEN.Tween(curProps).
    to(endProps, 300).
    easing(TWEEN.Easing.Cubic.In).
    onUpdate(function() {
      entityProps = Entities.getEntityProperties(grabbedEntity);
      entityProps.position.y = curProps.y;
      Entities.editEntity(grabbedEntity, {
        position: entityProps.position
      });
    }).start()
}

function lower() {
  entityProps = Entities.getEntityProperties(grabbedEntity);
  var curProps = {
    y: entityProps.position.y
  }
  var endProps = {
    y: startingHeight
  }
  var lowerTween = new TWEEN.Tween(curProps).
    to(endProps, 1000).
    easing(TWEEN.Easing.Cubic.Out).
    onUpdate(function() {
      entityProps = Entities.getEntityProperties(grabbedEntity);
      entityProps.position.y = curProps.y;
      entityProps.position.x += flingVelocity.x;
      entityProps.position.z += flingVelocity.z;
      flingVelocity = Vec3.multiply(DAMPING, flingVelocity);
      Entities.editEntity(grabbedEntity, {
        position: entityProps.position
      });
    }).start()



}

function mouseReleaseEvent() {
  if(isGrabbing){
    lower();
    flingObject();
  }
  isGrabbing = false;
}

function flingObject(){
  //calculate velocity to give object base on current and previous position
  entityProps = Entities.getEntityProperties(grabbedEntity);

  flingVelocity = Vec3.subtract(entityProps.position, prevPosition);
  flingVelocity = Vec3.multiply(flingMultiplier, flingVelocity);
  // flingVelocity.y = -1;
  // Entities.editEntity(grabbedEntity, {velocity: flingVelocity});
  // Entities.editEntity(grabbedEntity, {velocity: {x: 1, y: 0, z: 0}});
}

function mouseMoveEvent(event) {
  if (isGrabbing) {
    entityProps = Entities.getEntityProperties(grabbedEntity);
    prevPosition = entityProps.position;
    avatarEntityDistance = Vec3.distance(MyAvatar.position, entityProps.position);
    finalMoveMultiplier = baseMoveFactor * Math.pow(avatarEntityDistance, 1.5);
    deltaMouse.x = event.x - prevMouse.x;
    deltaMouse.z = event.y - prevMouse.y;
    finalMoveMultiplier = baseMoveFactor * Math.pow(avatarEntityDistance, 1.5);
    deltaMouse = Vec3.multiply(deltaMouse, finalMoveMultiplier);
    camYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
    dv = Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(0, camYaw, 0), deltaMouse);
    newPosition = Vec3.sum(entityProps.position, dv);
    Entities.editEntity(grabbedEntity, {
      position: newPosition
    });
  }
  prevMouse.x = event.x;
  prevMouse.y = event.y;
}

function cleanup() {
  Entities.deleteEntity(box);
}

Controller.mouseMoveEvent.connect(mouseMoveEvent);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Script.update.connect(update);
Script.scriptEnding.connect(cleanup);