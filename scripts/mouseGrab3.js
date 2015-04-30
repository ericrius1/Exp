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
var camYaw, dPosition;
var prevPosition;
var newPosition;
var moveUpDown = false;
var savedGravity;

var grabSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/sounds/Switches%20and%20sliders/lamp_switch_3.wav");

var DROP_DISTANCE = 5.0;
var DROP_COLOR = {
  red: 200,
  green: 200,
  blue: 200
};
var DROP_WIDTH = 4;


var autoBox = false;
if (autoBox) {
  setUpTestObjects();
}

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
    prevPosition = props.position;
    isGrabbing = true;
    savedGravity = props.gravity;
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
    Entities.editEntity(grabbedEntity, {
      gravity: savedGravity
    });
  }
  isGrabbing = false;
  Overlays.editOverlay(dropLine, {
    visible: false
  });
}


function mouseMoveEvent(event) {
  if (isGrabbing) {
    entityProps = Entities.getEntityProperties(grabbedEntity);
    avatarEntityDistance = Vec3.distance(MyAvatar.position, entityProps.position);
    finalMoveMultiplier = baseMoveFactor * Math.pow(avatarEntityDistance, 1.5);
    deltaMouse.x = event.x - prevMouse.x;
    if (!moveUpDown) {
      deltaMouse.z = event.y - prevMouse.y;
    } else {
      deltaMouse.y = (event.y - prevMouse.y) * -1;
    }
    finalMoveMultiplier = baseMoveFactor * Math.pow(avatarEntityDistance, 1.5);
    deltaMouse = Vec3.multiply(deltaMouse, finalMoveMultiplier);
    camYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
    dPosition = Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(0, camYaw, 0), deltaMouse);
    newPosition = Vec3.sum(entityProps.position, dPosition);
    Overlays.editOverlay(dropLine, {
      start: newPosition,
      end: Vec3.sum(newPosition, {
        x: 0,
        y: -DROP_DISTANCE,
        z: 0
      })
    });


    prevPosition = entityProps.position;
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

function cleanup() {
  Entities.deleteEntity(box);
  Entities.deleteEntity(box2);
  Entities.deleteEntity(ground);
}

function setUpTestObjects() {
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
    gravity: {
      x: 0,
      y: -1,
      z: 0
    }
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
    gravity: {
      x: 0,
      y: -1,
      z: 0
    }
  });

  ground = Entities.addEntity({
    type: 'Box',
    position: {
      x: MyAvatar.position.x,
      y: MyAvatar.position.y - 5,
      z: MyAvatar.position.z
    },
    dimensions: {
      x: 100,
      y: 2,
      z: 100
    },
    color: {
      red: 20,
      green: 200,
      blue: 50
    }
  });
}

Controller.mouseMoveEvent.connect(mouseMoveEvent);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Controller.keyPressEvent.connect(keyPressEvent);
Controller.keyReleaseEvent.connect(keyReleaseEvent);
Script.scriptEnding.connect(cleanup);