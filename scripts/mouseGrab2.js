var isGrabbing = false;
var grabbedEntity = null;
var prevMouse = {};
var deltaMouse = {
  z: 0
}
var entityProps;
var box, box2, ground;
var baseMoveFactor = .001;
var finalMoveMultiplier;
var avatarEntityDistance;
var camYaw, dv;
var prevPosition;
var newPosition;
var flingVelocity;
var flingMultiplier = 10;
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
    collisionsWillMove: true,
    gravity: {x: 0, y: -1, z: 0}
  });

   box2 = Entities.addEntity({
    type: 'Box',
    position: Vec3.sum(MyAvatar.position, Vec3.multiply(distance + 1, Quat.getFront(Camera.getOrientation()))),
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
    collisionsWillMove: true,
    gravity: {x: 0, y: -1, z: 0}
  });

   ground = Entities.addEntity({
    type: 'Box',
    position: {x: MyAvatar.position.x, y: MyAvatar.position.y - 5, z: MyAvatar.position.z},
    dimensions: {x: 100, y: 2, z: 100},
    color: {red: 20, green: 200, blue: 50}
   })
}


function mousePressEvent(event) {
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay);
  if (intersection.intersects && intersection.properties.collisionsWillMove) {
    grabbedEntity = intersection.entityID;
    var props = prevPosition = Entities.getEntityProperties(grabbedEntity)
    //hacky way to not grab floor for testing...
    prevPosition = props.position;
    isGrabbing = true;
  }

}


function mouseReleaseEvent() {
  if(isGrabbing){
    flingObject();
  }
  isGrabbing = false;
}

function flingObject(){
  //calculate velocity to give object base on current and previous position
  entityProps = Entities.getEntityProperties(grabbedEntity);

  flingVelocity = Vec3.subtract(entityProps.position, prevPosition);
  flingVelocity = Vec3.multiply(flingMultiplier, flingVelocity);
  flingVelocity.y = 0;
  Entities.editEntity(grabbedEntity, {velocity: flingVelocity});
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
  Entities.deleteEntity(box2);
  Entities.deleteEntity(ground);
}

Controller.mouseMoveEvent.connect(mouseMoveEvent);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Script.scriptEnding.connect(cleanup);