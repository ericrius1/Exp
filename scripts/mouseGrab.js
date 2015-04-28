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
    }
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
    raise();
  }

}

function raise() {
  entityProps = Entities.getEntityProperties(grabbedEntity);
  var curProps = {
    y: entityProps.position.y
  }
  var endProps = {
    y: entityProps.position.y + raiseAmount
  }
  var raiseTween = new TWEEN.Tween(curProps).
    to(endProps, 500).
    easing(TWEEN.Easing.Cubic.InOut).
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
    y: entityProps.position.y - raiseAmount
  }
  var lowerTween = new TWEEN.Tween(curProps).
    to(endProps, 500).
    easing(TWEEN.Easing.Cubic.InOut).
    onUpdate(function() {
      entityProps = Entities.getEntityProperties(grabbedEntity);
      entityProps.position.y = curProps.y;
      Entities.editEntity(grabbedEntity, {
        position: entityProps.position
      });
    }).start()

  lowerTween.onComplete(function() {
    grabbedEntity = null;
  })

}

function mouseReleaseEntity() {
  isGrabbing = false;
  lower();
}

function mouseMoveEvent(event) {
  if (isGrabbing) {
    entityProps = Entities.getEntityProperties(grabbedEntity);
    avatarEntityDistance = Vec3.distance(MyAvatar.position, entityProps.position);
    finalMoveMultiplier = baseMoveFactor * Math.pow(avatarEntityDistance, 1.5);
    deltaMouse.x = event.x - prevMouse.x;
    deltaMouse.z = event.y - prevMouse.y;
    finalMoveMultiplier = baseMoveFactor * Math.pow(avatarEntityDistance, 1.5);
    deltaMouse = Vec3.multiply(deltaMouse, finalMoveMultiplier);
    camYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
    dv = Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(0, camYaw, 0), deltaMouse);
    Entities.editEntity(grabbedEntity, {
      position: Vec3.sum(entityProps.position, dv)
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
Controller.mouseReleaseEvent.connect(mouseReleaseEntity);
Script.update.connect(update);
Script.scriptEnding.connect(cleanup);