Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js");

var tireAnim = "https://hifi-public.s3.amazonaws.com/eric/models/tireAnim.fbx?v1";
var tireFPS = 30;
var wheelJoint = "LeftToeBase"
var pivotJoint = "LeftUpLeg";
var wheelStartRotation = MyAvatar.getJointRotation(wheelJoint);
var pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var pivotSounds = [
  SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/robotTurn.wav"),
  SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/robotTurn2.wav"),
];
var eulerPivotStartRotation = Quat.safeEulerAngles(pivotStartRotation);
eulerPivotStartRotation.y = 0;
MyAvatar.setJointData(pivotJoint, Quat.fromVec3Degrees(eulerPivotStartRotation));
pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var velocity, velocityLength, previousVelocityLength, normalizedVelocity, targetRotation, rotation, targetLine, startLine, dotP, dir;
var angleOffset = 0;
var angleDirection;
var avatarYaw = MyAvatar.bodyYaw;
var previousAvatarYaw = avatarYaw;
var previousAvatarOrientation = MyAvatar.orientation;
var avatarForward, previousAvatarForward, avatarUp;
var PIVOT_TIME = 1100;
var TIRE_ROT_FACTOR = 1.5;
var PIVOT_ANGLE_OFFSET = 30;
var STRAFING_PIVOT_OFFSET = 90;
var PIVOT_ANGLE_THRESHOLD = .05;
var SLOW_UPDATE_TIME = 100;
var MIN_SOUND_INTERVAL = 1000;
var VELOCITY_THRESHOLD = .1;
var targetAngle;
var isStrafing = false
var canPlaySound = true;
var isTurned = false;
var avatarOrientationVelocityDotProduct, normalizedVelocity;
var prevCurOrientationCrossDot, orientationVelCrossDot;
var strafingDir, previousStrafingDir;
Script.setInterval(slowUpdate, SLOW_UPDATE_TIME);



//************WHEEL STUFF****************************
var wheelAnimating = false;

//************CAPE STUFF*****************************************
var autoCapeOpen = true;
var capeFPS = 30;
var capeFlappingAnim = "https://hifi-public.s3.amazonaws.com/eric/models/coatTailAnim_v2.fbx";
var capeAnimDetails;
//cape states: still, flowingUp, flowingDow, fluttering
//map states to which animation frames to display
var capeStates = {
  "still": null,
  "fluttering": {
    start: 32,
    end: 63
  },
  "flowingUp": {
    start: 0,
    end: 31
  },
  "flowingDown": {
    start: 64,
    end: 90
  }
}
var startCapeRot;
capeStates.current = "still";

if(autoCapeOpen){
  startCapeRot = Quat.safeEulerAngles(MyAvatar.getJointRotation('RightLeg'));
  startCapeRot.x -= 200;

  MyAvatar.setJointData("RightLeg", Quat.fromVec3Degrees(startCapeRot));
}

function updateCape() {
  capeAnimDetails = MyAvatar.getAnimationDetails(capeFlappingAnim);
  if (capeStates.current === "flowingUp" && capeStates.previous === "still") {
    MyAvatar.startAnimation(capeFlappingAnim, capeFPS, 1.0, false, false, capeAnimDetails.frameIndex, capeStates["flowingUp"].end);
  } else if (capeStates.current === "flowingUp" && capeAnimDetails.frameIndex === capeAnimDetails.lastFrame) {
    MyAvatar.stopAnimation(capeFlappingAnim);
    capeStates.current = "fluttering";
    MyAvatar.startAnimation(capeFlappingAnim, capeFPS, 1.0, true, false, capeAnimDetails.frameIndex, capeStates["fluttering"].end);
  }
  if (capeStates.current === "flowingDown" && capeStates.previous !== "flowingDown") {
    MyAvatar.stopAnimation(capeFlappingAnim);
    MyAvatar.startAnimation(capeFlappingAnim, capeFPS, 1.0, false, false, capeAnimDetails.frameIndex, capeStates["flowingDown"].end);
  }
  if (capeStates.current === "flowingDown" && capeAnimDetails.frameIndex === capeAnimDetails.lastFrame) {
    capeStates.current = "still";
    MyAvatar.stopAnimation(capeFlappingAnim);
  }
  capeStates.previous = capeStates.current;
}


function update(deltaTime) {
  TWEEN.update();
  velocity = MyAvatar.getVelocity();
  velocityLength = Vec3.length(velocity);
  //We don't need to show the wheel moving if robot is barely moving
  if (velocityLength > VELOCITY_THRESHOLD) {
    avatarForward = Quat.getFront(MyAvatar.orientation);
    avatarOrientationVelocityDotProduct = Vec3.dot(Vec3.normalize(velocity), avatarForward);
    if (isStrafing) {
      dir = -1;
    } else {
      if (avatarOrientationVelocityDotProduct > Math.abs(0.001)) {
        if (capeStates.current === "still") {
          capeStates.current = "flowingUp";
          if(!wheelAnimating){
            print("ANIMATE")
            MyAvatar.startAnimation(tireAnim, tireFPS, 1.0, true, false);
            wheelAnimating = true
          }
        }
        dir = -1;
      } else {
        dir = 1;
      }
    }
    previousVelocityLength = velocityLength;
  } else {
    if (capeStates.current !== "still") {
      capeStates.current = "flowingDown";
    }
  }
  if(!autoCapeOpen){
    updateCape();
  } 

}

function cleanup() {
  MyAvatar.setJointData(pivotJoint, pivotStartRotation);
  startCapeRot.x+=200;
  MyAvatar.setJointData("RightLeg", Quat.fromVec3Degrees(startCapeRot))
  MyAvatar.stopAnimation(capeFlappingAnim);
  MyAvatar.stopAnimation(tireAnim);
  // MyAvatar.clearJoinData(wheelJoint);
  // MyAvatar.clearJointData(pivotJoint);
}


function setNewTargetPivot() {
  avatarYaw = MyAvatar.bodyYaw;
  avatarUp = Quat.getUp(MyAvatar.orientation);
  avatarForward = Quat.getFront(MyAvatar.orientation);
  previousAvatarForward = Quat.getFront(previousAvatarOrientation);
  prevCurOrientationCrossDot = Vec3.dot(Vec3.cross(previousAvatarForward, avatarForward), avatarUp);
  //Turning left
  angleDirection = prevCurOrientationCrossDot < 0 ? 1 : -1;
  previousAvatarOrientation = MyAvatar.orientation;
  targetAngle = eulerPivotStartRotation.y + PIVOT_ANGLE_OFFSET * angleDirection;

  if (velocityLength > VELOCITY_THRESHOLD) {
    normalizedVelocity = Vec3.normalize(velocity);
    //we need to take dot product of cross product in order to account for arbitrary avatar pitch in future
    if (Math.abs(avatarOrientationVelocityDotProduct) < 0.01) {
      orientationVelCrossDot = Vec3.dot(Vec3.cross(avatarForward, normalizedVelocity), avatarUp);
      isStrafing = true;
      strafingDir = orientationVelCrossDot > 0 ? -1 : 1
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
    //turn wheel left or right 
    initPivotTween(currentYaw, targetAngle);
    isTurned = true;
  } else if (Math.abs(prevCurOrientationCrossDot) < PIVOT_ANGLE_THRESHOLD && !isStrafing && isTurned) {
    //Turn wheel back to default position
    initPivotTween(currentYaw, eulerPivotStartRotation.y);
    isTurned = false;
  }

  // if ((isStrafing) && !isTurned) {
  //   //turn wheel left or right 
  //   initPivotTween(currentYaw, targetAngle);
  //   isTurned = true;
  // } else if (!isStrafing && isTurned) {
  //   //Turn wheel back to default position
  //   initPivotTween(currentYaw, eulerPivotStartRotation.y);
  //   isTurned = false;
  // }

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
    Audio.playSound(pivotSounds[randInt(0, pivotSounds.length - 1)], {
      position: MyAvatar.position,
      volume: 0.2
    });
    Script.setTimeout(function() {
      canPlaySound = true;
    }, MIN_SOUND_INTERVAL);
    canPlaySound = false;
  }
}


function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

function randInt(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);