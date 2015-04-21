Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js");

var debug = false;
var wheelJoint = "LeftToeBase"
var pivotJoint = "LeftUpLeg";
var capeJoint = "RightToeBase";
var lineLength = 10;
var wheelStartRotation = MyAvatar.getJointRotation(wheelJoint);
var pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var pivotSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/robotTurn.wav?version=3");
var eulerPivotStartRotation = Quat.safeEulerAngles(pivotStartRotation);
eulerPivotStartRotation.y = 0;
MyAvatar.setJointData(pivotJoint, Quat.fromVec3Degrees(eulerPivotStartRotation));
pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var forward, velocity, velocityLength, normalizedVelocity, targetRotation, rotation, targetLine, startLine, dotP, dir;
var angleOffset = 0;
var angleDirection;
var test = 0;
var avatarYaw = MyAvatar.bodyYaw;
var previousAvatarYaw = avatarYaw;
var previousAvatarOrientation = MyAvatar.orientation;
var avatarForward, previousAvatarForward;
var previousPivotRotation = pivotStartRotation;
var targetPivotRotation = pivotStartRotation;
var RADIAN_TO_ANGLE_CONVERSION_FACTOR = 57;
var PIVOT_TIME = 1100;
var PIVOT_ANGLE_OFFSET = 50;
var STRAFING_PIVOT_OFFSET = 90;
var PIVOT_ANGLE_THRESHOLD = 3;
var SLOW_UPDATE_TIME = 100;
var MIN_SOUND_INTERVAL = SLOW_UPDATE_TIME * 2;
var VELOCITY_THRESHOLD = 1;
var targetAngle;
var isStrafing = false
var canPlaySound = true;
var isTurned = false;
var avatarOrientationVelocityDotProduct, velocityOrientationDirection, normalizedVelocity;
var strafingDir, previousStrafingDir;
if (debug) {
  setUpDebugLines();
}
Script.setInterval(slowUpdate, SLOW_UPDATE_TIME);


//an array of cape joints to get more fluid cape waving
var capeJoints = [{
  name: "RightUpLeg"
}, {
  name: "RightLeg"
}, {
  name: "RightFoot"
}, {
  name: "RightToeBase"
}, {
  name: "RightToe_End"
}];
capeJoints.forEach(function(joint) {
  joint.startingRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(joint.name));
  joint.currentRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(joint.name));

});

var capeJointIndex = 0;
var capeRotation = 100;
var capeTweenTime = 700;
var capeTerminalVelocity = 10;
var autoCapeOpen = false;

if(autoCapeOpen){
  flapCape()
}

function flapCape() {
  var joint = capeJoints[0];
  var maxRotation = joint.startingRotation.x - 100;
  var capeRotationX = Math.max(map(velocityLength, 0, capeTerminalVelocity, joint.startingRotation.x, maxRotation), maxRotation);
  if(velocityLength > capeTerminalVelocity){
    //the robot's moving fast, so flap cape with perlin noise (eventually)
    capeRotationX += Math.random();
  }
  if(autoCapeOpen){
    capeRotationX = 100;
  }
  joint.currentRotation.x = capeRotationX;
  MyAvatar.setJointData(joint.name, Quat.fromVec3Degrees(joint.currentRotation));

}


function update(deltaTime) {
  if (debug) {
    updateDebugLines();
  }
  TWEEN.update();
  velocity = MyAvatar.getVelocity();
  velocityLength = Vec3.length(velocity);
  //We don't need to show the wheel moving if robot is barely moving
  if (velocityLength > VELOCITY_THRESHOLD) {
    forward = Quat.getFront(MyAvatar.orientation);
    avatarOrientationVelocityDotProduct = Vec3.dot(Vec3.normalize(velocity), forward);
    if (isStrafing) {
      dir = -1;
    } else {
      avatarOrientationVelocityDotProduct > 0 ? dir = -1 : dir = 1;
    }
    rotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(wheelJoint));
    rotation.x += Vec3.length(velocity) * dir;
    MyAvatar.setJointData(wheelJoint, Quat.fromVec3Degrees(rotation));
    flapCape();

  }
}

function cleanup() {
  if (debug) {
    Overlays.deleteOverlay(startLine);
    Overlays.deleteOverlay(targetLine);
  }
  MyAvatar.setJointData(wheelJoint, wheelStartRotation);
  MyAvatar.setJointData(pivotJoint, pivotStartRotation);
  // MyAvatar.clearJoinData(wheelJoint);
  // MyAvatar.clearJointData(pivotJoint);
  capeJoints.forEach(function(joint) {
    MyAvatar.setJointData(joint.name, Quat.fromVec3Degrees(joint.startingRotation));
    // MyAvatar.clearJointData(joint.jointName);
  })
}

function setUpDebugLines() {
  var end = Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(MyAvatar.orientation)));
  startLine = Overlays.addOverlay("line3d", {
    start: MyAvatar.position,
    end: end,
    color: {
      red: 200,
      green: 0,
      blue: 0
    },
    lineWidth: 5
  });

  targetLine = Overlays.addOverlay("line3d", {
    start: MyAvatar.position,
    end: end,
    color: {
      red: 0,
      green: 200,
      blue: 0
    },
    lineWidth: 5
  });
}
function updateDebugLines() {
  Overlays.editOverlay(targetLine, {
    start: MyAvatar.position,
    end: avatarForward
  });
  Overlays.editOverlay(startLine, {
    start: MyAvatar.position,
    end: previousAvatarForward
  });
}

function setNewTargetPivot() {
  avatarYaw = MyAvatar.bodyYaw;
  avatarForward = Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(MyAvatar.orientation)));
  previousAvatarForward = Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(previousAvatarOrientation)));
  if (debug) {
    updateDebugLines();
  }
  avatarForward = Vec3.normalize(avatarForward);
  previousAvatarForward = Vec3.normalize(previousAvatarForward);
  angleDirection = Math.atan2(avatarForward.y, avatarForward.z) - Math.atan2(previousAvatarForward.y, previousAvatarForward.z);
  angleOffset = Math.acos(Math.min(1, Vec3.dot(Quat.getFront(MyAvatar.orientation), Quat.getFront(previousAvatarOrientation))));
  angleDirection > 0 ? angleOffset *= -1 : angleOffset *= 1;

  //we need to account for angle changes when changing from negative to positive (or vica versa) and un-reverse direction
  if (avatarYaw > 0 && avatarYaw < 180) {
    angleDirection *= -1;
  }
  angleDirection = angleDirection < 0 ? 1 : -1;
  angleOffset *= RADIAN_TO_ANGLE_CONVERSION_FACTOR;
  previousAvatarOrientation = MyAvatar.orientation;
  previousAvatarYaw = avatarYaw;
  targetAngle = eulerPivotStartRotation.y + PIVOT_ANGLE_OFFSET * angleDirection;

  if (velocityLength > VELOCITY_THRESHOLD) {
    normalizedVelocity = Vec3.normalize(velocity);
    var velocityOrientationAngle = Math.acos(avatarOrientationVelocityDotProduct);
    if (Math.abs(avatarOrientationVelocityDotProduct - 0) < 0.01) {
      velocityOrientationDirection = Math.atan2(avatarForward.y, avatarForward.x) - Math.atan2(normalizedVelocity.y, normalizedVelocity.x);
      isStrafing = true;

      //LEFT STRAFING
      if (Math.abs(velocityOrientationDirection) > .1 && (avatarYaw > -90 && avatarYaw < 90)) {
        strafingDir = -1;
      } else if (Math.abs(velocityOrientationDirection) < .1 && (avatarYaw < -90 || avatarYaw > 90)) {
        strafingDir = -1;
      } else {
        strafingDir = 1;
      }

      targetAngle = (eulerPivotStartRotation.y + STRAFING_PIVOT_OFFSET) * strafingDir;
      if (previousStrafingDir !== strafingDir) {
        isTurned = false;
      }
      previousStrafingDir = strafingDir;
    }
  } else {
    isStrafing = false;
  }


  //We need to check to see if robot velocity is moving perpendicular to avatrs rotation(ie avatar is strafing)
  //If so we need to turn robot that way

  var currentYaw = Quat.safeEulerAngles(MyAvatar.getJointRotation(pivotJoint)).y;
  if ((Math.abs(angleOffset) > PIVOT_ANGLE_THRESHOLD || isStrafing) && !isTurned) {
    initPivotTween(currentYaw, targetAngle);
    isTurned = true;
  } else if (Math.abs(angleOffset) < PIVOT_ANGLE_THRESHOLD && !isStrafing && isTurned) {
    initPivotTween(currentYaw, eulerPivotStartRotation.y);
    isTurned = false;
  }

}


function slowUpdate() {
  setNewTargetPivot();
}
function initPivotTween(startYaw, endYaw) {
  var safeAngle = {
    x: eulerPivotStartRotation.x,
    y: eulerPivotStartRotation.y,
    z: eulerPivotStartRotation.z
  };
  var currentProps = {
    yRot: startYaw
  }
  var endProps = {
    yRot: endYaw
  }
  var pivotTween = new TWEEN.Tween(currentProps).
    to(endProps, PIVOT_TIME).
    easing(TWEEN.Easing.Back.InOut).
    onUpdate(function() {
      safeAngle.y = currentProps.yRot;
      MyAvatar.setJointData(pivotJoint, Quat.fromVec3Degrees(safeAngle));
    }).start();

  if (canPlaySound) {
    // Audio.playSound(pivotSound, {position: MyAvatar.position, volume: 0.6});
    canPlaySound = false;
  }
  Script.setTimeout(function() {
    canPlaySound = true;
  }, MIN_SOUND_INTERVAL);
}


function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);