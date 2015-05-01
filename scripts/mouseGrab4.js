var isGrabbing = false;
var grabbedEntity = null;
var prevMouse = {};
var deltaMouse = {
  z: 0
}
var entityProps;
var box, box2, ground;
var avatarEntityDistance;
var camYaw, dPosition, dVelocity, newVelocity;
var targetPosition;
var moveUpDown = false;
var MAX_VELOCITY = 10;
var sigmoidPositionFactor, dPositionLength;
var mouseMoving = false;
var distanceMultiplier;

var grabSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/CloseClamp.wav");
var releaseSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/ReleaseClamp.wav");


var DROP_DISTANCE = 5.0;
var DROP_COLOR = {
  red: 200,
  green: 200,
  blue: 200
};
var DROP_WIDTH = 4;


var dropLine = Overlays.addOverlay("line3d", {
  start: {
    x: 0,
    y: 0,
    z: 0
  },
  end: {
    x: 0,
    y: 0,
    z: 0
  },
  color: DROP_COLOR,
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
    targetPosition = props.position
    Overlays.editOverlay(dropLine, {
      visible: true,
      start: props.position,
      end: Vec3.sum(props.position, {
        x: 0,
        y: -DROP_DISTANCE,
        z: 0
      })
    });

    Audio.playSound(grabSound, {
      position: props.position,
      volume: 1
    });
  }
}


function mouseReleaseEvent() {
  if (isGrabbing) {
    isGrabbing = false;
    Overlays.editOverlay(dropLine, {
      visible: false
    });
    targetPosition = null;
    Audio.playSound(grabSound, {
      position: entityProps.position,
      volume: 1
    });

  }
}

function mouseMoveEvent(event) {
  if (isGrabbing) {
    deltaMouse.x = event.x - prevMouse.x;
    if (!moveUpDown) {
      deltaMouse.z = event.y - prevMouse.y;
    } else {
      deltaMouse.y = (event.y - prevMouse.y) * -1;
    }
    Overlays.editOverlay(dropLine, {
      start: targetPosition,
      end: Vec3.sum(targetPosition, {
        x: 0,
        y: -DROP_DISTANCE,
        z: 0
      })
    });
    mouseMoving = true;
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

function update() {
  if (isGrabbing) {
    if (!mouseMoving) {
      deltaMouse = Vec3.multiply(0, deltaMouse);
    }
    entityProps = Entities.getEntityProperties(grabbedEntity);
    camYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
    dPosition = Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(0, camYaw, 0), deltaMouse);
    dPositionLength = Vec3.length(dPosition);
    if (dPositionLength > 0) {
      avatarEntityDistance = Vec3.distance(MyAvatar.position, entityProps.position);
      sigmoidPositionFactor = dPositionLength / (Math.sqrt(1 + Math.pow(dPositionLength, 2)));
      targetPosition = Vec3.sum(entityProps.position, dPosition);
      newVelocity = Vec3.subtract(targetPosition, entityProps.position);
      newVelocity = Vec3.multiply(Vec3.normalize(newVelocity), MAX_VELOCITY);
      newVelocity = Vec3.multiply(sigmoidPositionFactor, newVelocity);
      distanceMultiplier = map(avatarEntityDistance, 0, 40 ,0.5, 3);
      distanceMultiplier = Math.pow(distanceMultiplier, 1.5);
      newVelocity = Vec3.multiply(distanceMultiplier, newVelocity);
    } else {
      newVelocity = {
        x: 0,
        y: 0,
        z: 0
      };
    }
    Entities.editEntity(grabbedEntity, {
      velocity: newVelocity
    })
  }
  mouseMoving = false;

}

Controller.mouseMoveEvent.connect(mouseMoveEvent);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Controller.keyPressEvent.connect(keyPressEvent);
Controller.keyReleaseEvent.connect(keyReleaseEvent);
Script.update.connect(update);

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}