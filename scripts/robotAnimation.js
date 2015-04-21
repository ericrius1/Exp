Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js");

var debug = false;
var wheelJoint = "LeftToeBase"
var pivotJoint = "LeftUpLeg";
var lineLength = 10;
var wheelStartRotation = MyAvatar.getJointRotation(wheelJoint);
var pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var pivotSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/robotTurn.wav?version=3");
var eulerPivotStartRotation = Quat.safeEulerAngles(pivotStartRotation);
eulerPivotStartRotation.y = 0;
MyAvatar.setJointData(pivotJoint, Quat.fromVec3Degrees(eulerPivotStartRotation));
pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var forward, velocity, normalizedVelocity, targetRotation, rotation, targetLine, startLine, dotP, dir;
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
var PIVOT_ANGLE_THRESHOLD = 3;
var NEW_PIVOT_CHECK__POLL_TIME = 100;
var MIN_SOUND_INTERVAL = NEW_PIVOT_CHECK__POLL_TIME * 2;
var canPlaySound = true;
var isTurned = false;
if (debug) {
  setUpDebugLines();
}
Script.setInterval(setNewTargetPivot, NEW_PIVOT_CHECK__POLL_TIME);



function update(deltaTime) {
  if (debug) {
    updateDebugLines();
  }
  TWEEN.update();
  velocity = MyAvatar.getVelocity();
  //We don't need to show the wheel moving if robot is barely moving
  if (Vec3.length(velocity) > .2) {
    forward = Quat.getFront(MyAvatar.orientation);
    dot = Vec3.dot(Vec3.normalize(velocity), forward);
    dot > 0 ? dir = -1 : dir = 1;
    rotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(wheelJoint));
    rotation.x += Vec3.length(velocity) * dir;
    MyAvatar.setJointData(wheelJoint, Quat.fromVec3Degrees(rotation));
  }
}

function cleanup() {
  if(debug){
    Overlays.deleteOverlay(startLine);
    Overlays.deleteOverlay(targetLine);
  }
  MyAvatar.setJointData(wheelJoint, wheelStartRotation);
  MyAvatar.setJointData(pivotJoint, pivotStartRotation);
  MyAvatar.clearJoinData(wheelJoint);
  MyAvatar.clearJointData(pivotJoint);
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
  if(debug){
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
  // print("ANGLE OFFSET " + angleOffset);
  var currentYaw = Quat.safeEulerAngles(MyAvatar.getJointRotation(pivotJoint)).y;
  if(Math.abs(angleOffset) > PIVOT_ANGLE_THRESHOLD && !isTurned){
    initPivotTween(currentYaw, eulerPivotStartRotation.y + PIVOT_ANGLE_OFFSET * angleDirection);
    isTurned = true;
  } else if( Math.abs(angleOffset) < PIVOT_ANGLE_THRESHOLD && isTurned){
    initPivotTween(currentYaw, eulerPivotStartRotation.y);
    isTurned = false;
  }

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

  if(canPlaySound){
    Audio.playSound(pivotSound, {position: MyAvatar.position, volume: 0.6});
    canPlaySound = false;
  }
  Script.setTimeout(function(){
    canPlaySound = true;
  }, MIN_SOUND_INTERVAL);
  print("PLAY SOUND  " + Math.random())
}


function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);