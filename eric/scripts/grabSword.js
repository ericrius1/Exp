var isGrabbing = false;
var grabbedEntity = null;
var prevMouse = {};
var deltaMouse = {
  z: 0
}
var entityProps;
var targetPosition;
var moveUpDown = false;

var currentPosition, currentVelocity, dragVelocity; 

var grabSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/CloseClamp.wav");
var releaseSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/ReleaseClamp.wav");

var DROP_DISTANCE = 5.0;
var DROP_COLOR = {
  red: 200,
  green: 200,
  blue: 200
};
var VELOCITY_COLOR = {
  red: 0,
  green: 255,
  blue: 255
};

var DROP_WIDTH = 2;

var dropLine = Overlays.addOverlay("line3d", {
  color: DROP_COLOR,
  alpha: 1,
  visible: false,
  lineWidth: DROP_WIDTH
});

var velocityLine = Overlays.addOverlay("line3d", {
  color: VELOCITY_COLOR,
  alpha: 1,
  visible: false,
  lineWidth: DROP_WIDTH
});


function mousePressEvent(event) {
  if (!event.isLeftButton) {
    return;
  }
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay);
  if (intersection.intersects && intersection.properties.collisionsWillMove) {
    grabbedEntity = intersection.entityID;
    var props = Entities.getEntityProperties(grabbedEntity)
    isGrabbing = true;
    targetPosition = props.position;
    currentPosition = props.position; 
    currentVelocity = props.velocity; 
    dragVelocity = { x: 0, y: 0, z: 0 };
    updateDropLine(targetPosition, dragVelocity);
    Audio.playSound(grabSound, {
      position: props.position,
      volume: 0.4
    });
  }
}

function updateDropLine(position, velocity) { 
      Overlays.editOverlay(dropLine, {
      visible: true,
      start: { x: position.x, y: position.y + DROP_DISTANCE, z: position.z },
      end: Vec3.sum(position, {
        x: 0,
        y: -DROP_DISTANCE,
        z: 0
      })
    })
    Overlays.editOverlay(velocityLine, {
      visible: true,
      start: position,
      end: Vec3.sum(position, velocity)
    })
}


function mouseReleaseEvent() {
  if (isGrabbing) {
    isGrabbing = false;
    Overlays.editOverlay(dropLine, {
      visible: false
    });
    Overlays.editOverlay(velocityLine, {
      visible: false
    });
    targetPosition = null;
    Audio.playSound(grabSound, {
      position: entityProps.position,
      volume: 0.25
    });

  }
}

function mouseMoveEvent(event) {
  if (isGrabbing) {
    deltaMouse.x = event.x - prevMouse.x;
    if (!moveUpDown) {
      deltaMouse.z = event.y - prevMouse.y;
      deltaMouse.y = 0;
    } else {
      deltaMouse.y = (event.y - prevMouse.y) * -1;
      deltaMouse.z = 0;
    }
    //  Update the target position by the amount the mouse moved
    var camYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
    var dPosition = Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(0, camYaw, 0), deltaMouse);
    //  Adjust target position for the object by the mouse move 
    var avatarEntityDistance = Vec3.distance(Camera.getPosition(), currentPosition);
      //  Scale distance we want to move by the distance from the camera to the grabbed object 
      //  TODO:  Correct SCREEN_TO_METERS to be correct for the actual FOV, resolution
    var SCREEN_TO_METERS = 0.001;
    targetPosition = Vec3.sum(targetPosition, Vec3.multiply(dPosition, avatarEntityDistance * SCREEN_TO_METERS));
  }
  prevMouse.x = event.x;
  prevMouse.y = event.y;

}


function keyReleaseEvent(event) {
  if (event.text === "SHIFT") {
    moveUpDown = false;
  }
}

function keyPressEvent(event) {
  if (event.text === "SHIFT") {
    moveUpDown = true;
  }
}

function update(deltaTime) {
  if (isGrabbing) {

    entityProps = Entities.getEntityProperties(grabbedEntity);
    currentPosition = entityProps.position; 
    currentVelocity = entityProps.velocity; 

    var dPosition = Vec3.subtract(targetPosition, currentPosition);
    var CLOSE_ENOUGH = 0.001;
    var FULL_STRENGTH = 0.025;
    var distanceToTarget = Vec3.length(dPosition);
    if (distanceToTarget > CLOSE_ENOUGH) {
      //  compute current velocity in the direction we want to move 
      var velocityTowardTarget = Vec3.dot(currentVelocity, Vec3.normalize(dPosition));
      //  compute the speed we would like to be going toward the target position 
      var SPRING_RATE = 1.5;
      var DAMPING_RATE = 0.70;
      var desiredVelocity = Vec3.multiply(dPosition, (1.0 / deltaTime) * SPRING_RATE);
      //  compute how much we want to add to the existing velocity
      var addedVelocity = Vec3.subtract(desiredVelocity, velocityTowardTarget);
      //  If target is too far, roll off the force as inverse square of distance
      if (distanceToTarget > FULL_STRENGTH) {
        addedVelocity = Vec3.multiply(addedVelocity, Math.pow(FULL_STRENGTH / distanceToTarget, 2.0));
      }
      var newVelocity = Vec3.sum(currentVelocity, addedVelocity); 
      //  Add Damping 
      newVelocity = Vec3.subtract(newVelocity, Vec3.multiply(newVelocity, DAMPING_RATE));
      //  Update entity
      Entities.editEntity(grabbedEntity, {
      velocity: newVelocity
      })
    } 
    updateDropLine(targetPosition, dragVelocity);
  }
}

Controller.mouseMoveEvent.connect(mouseMoveEvent);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Controller.keyPressEvent.connect(keyPressEvent);
Controller.keyReleaseEvent.connect(keyReleaseEvent);
Script.update.connect(update);

