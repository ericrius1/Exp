Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js");

var debug = false;
var wheelJoint = "LeftToeBase"
var pivotJoint = "LeftUpLeg";
var capeJoint = "RightToeBase";
var lineLength = 10;
var wheelStartRotation = MyAvatar.getJointRotation(wheelJoint);
var pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var pivotSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/robotTurn.wav?verison=1");
var eulerPivotStartRotation = Quat.safeEulerAngles(pivotStartRotation);
eulerPivotStartRotation.y = 0;
MyAvatar.setJointData(pivotJoint, Quat.fromVec3Degrees(eulerPivotStartRotation));
pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var forward, velocity, velocityLength, previousVelocityLength, normalizedVelocity, targetRotation, rotation, targetLine, startLine, dotP, dir;
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
var PIVOT_ANGLE_THRESHOLD = .1;
var SLOW_UPDATE_TIME = 100;
var MIN_SOUND_INTERVAL = 1000;
var VELOCITY_THRESHOLD = 1;
var targetAngle;
var isStrafing = false
var canPlaySound = true;
var isTurned = false;
var audioTimeout;
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
var autoCapeOpen = true;
var capeFlapping = false;

if(autoCapeOpen){
  flapCape()
}

function flapCape() {
  // var joint = capeJoints[0];
  var rotFactor = 100;
  for(var i = 0 ; i < capeJoints.length; i++){
    var joint = capeJoints[i];
    var maxRotation = joint.startingRotation.x - rotFactor;
    var capeRotationX = Math.max(map(velocityLength, VELOCITY_THRESHOLD, capeTerminalVelocity, joint.startingRotation.x, maxRotation), maxRotation);
    if(velocityLength > capeTerminalVelocity){
      //the robot's moving fast, so flap cape with some noise to simulate fluttering in wind
      capeRotationX += Math.random();
    }
    if(autoCapeOpen){
      capeRotationX = 100;
    }
    joint.currentRotation.x = capeRotationX;
    MyAvatar.setJointData(joint.name, Quat.fromVec3Degrees(joint.currentRotation));
    rotFactor *= .5;
  }

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
      if(avatarOrientationVelocityDotProduct > 0){
        dir = -1;
        //we only want to flap cape if we're moving forward
        flapCape();
        capeFlapping = true;
      } else{
        dir = 1;
      }
      //or if we're slowing down and our cape is up
      if(previousVelocityLength > velocityLength && capeFlapping){
        flapCape();
      }
    }
    previousVelocityLength = velocityLength;
    rotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(wheelJoint));
    rotation.x += Vec3.length(velocity) * dir;
    MyAvatar.setJointData(wheelJoint, Quat.fromVec3Degrees(rotation));
  } else {
    capeFlapping = false
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
  var avatarUp = Quat.getUp(MyAvatar.orientation);
  avatarForward = Quat.getFront(MyAvatar.orientation);
  previousAvatarForward = Quat.getFront(previousAvatarOrientation);
  var prevCurOrientationCrossDot = Vec3.dot(Vec3.cross(previousAvatarForward, avatarForward), avatarUp);
  //Turning left
  print(prevCurOrientationCrossDot)
  angleDirection = prevCurOrientationCrossDot < 0 ? 1: -1;
  previousAvatarOrientation = MyAvatar.orientation;
  targetAngle = eulerPivotStartRotation.y + PIVOT_ANGLE_OFFSET * angleDirection;

  if (velocityLength > VELOCITY_THRESHOLD) {
    normalizedVelocity = Vec3.normalize(velocity);
    //we need to take dot product of cross product in order to account for arbitrary avatar pitch in future
    if (Math.abs(avatarOrientationVelocityDotProduct) < 0.01) {
      var orientationVelCrossDot = Vec3.dot(Vec3.cross(avatarForward, normalizedVelocity), avatarUp);
      isStrafing = true;
      //LEFT STRAFING
      if (orientationVelCrossDot > 0) {
        strafingDir = -1;
      } else {
        //RIGHT STRAFING
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
  if ((Math.abs(prevCurOrientationCrossDot) > PIVOT_ANGLE_THRESHOLD || isStrafing) && !isTurned) {
    // print("TURN")
    //turn wheel left or right 
    initPivotTween(currentYaw, targetAngle);
    isTurned = true;
  } else if (Math.abs(prevCurOrientationCrossDot) < PIVOT_ANGLE_THRESHOLD && !isStrafing && isTurned) {
    //Turn wheel back to default position
    // print("RETURN")
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

  Audio.playSound(pivotSound, {position: MyAvatar.position, volume: 0.6});
  // print("PLAY SOUND "  + Math.random());
}


function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);