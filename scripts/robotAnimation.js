
var debug = true
var wheelJoint = "LeftToeBase"
var pivotJoint = "LeftUpLeg";
var lineLength = 10;
var wheelStartRotation = MyAvatar.getJointRotation(wheelJoint);
var pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
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
var previousPivotRotation = pivotStartRotation;
var targetPivotRotation = pivotStartRotation;
if (debug) {
  setUpDebugLines();
}
Script.setInterval(setNewTargetPivot, 500);



function update(deltaTime) {
  if (debug) {
    updateDebugLines();
  }
  velocity = MyAvatar.getVelocity();
  if(Vec3.length(velocity) < .2 ) {
    return;
  }
  forward = Quat.getFront(MyAvatar.orientation);
  dot = Vec3.dot(Vec3.normalize(velocity), forward );
  dot > 0 ? dir = -1 : dir = 1;
  rotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(wheelJoint));
  rotation.x += Vec3.length(velocity) * dir;
  MyAvatar.setJointData(wheelJoint, Quat.fromVec3Degrees(rotation));

  //slerp based on dot product - closer dot product is to 0, the closer to default joint we set

  //constantly slerp towards target orientation 
  //keep pivot at same rotation


}

function cleanup() {
  Overlays.deleteOverlay(startLine);
  Overlays.deleteOverlay(targetLine);
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
  // Overlays.editOverlay(startLine, {start: MyAvatar.position, end: Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(MyAvatar.orientation)))});
}


function setNewTargetPivot(){
  avatarYaw = MyAvatar.bodyYaw;
  var avatarForward = Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(MyAvatar.orientation)));
  var previousAvatarForward = Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(previousAvatarOrientation)));
  Overlays.editOverlay(targetLine, {start: MyAvatar.position, end: avatarForward});
  Overlays.editOverlay(startLine, {start: MyAvatar.position, end: previousAvatarForward});
  avatarForward = Vec3.normalize(avatarForward);
  previousAvatarForward = Vec3.normalize(previousAvatarForward);
  angleDirection = Math.atan2(avatarForward.y, avatarForward.z) - Math.atan2(previousAvatarForward.y, previousAvatarForward.z);
  angleOffset = Math.acos(Math.min(1, Vec3.dot(Quat.getFront(MyAvatar.orientation), Quat.getFront(previousAvatarOrientation))));
  angleDirection > 0 ? angleOffset *=-1 : angleOffset *= 1;

  //we need to account for angle changes between the poles and un-reverse direction
  if(avatarYaw > 0 && avatarYaw < 180){
    print("OFFSET CHAE")
    angleOffset *= -1;
  }
  angleOffset *=57;
  // print("AVATAR YAW" + Quat.safeEulerAngles(MyAvatar.orientation).y);
  print("ANGLE " + angleOffset);
  previousAvatarOrientation = MyAvatar.orientation;
  previousAvatarYaw = avatarYaw;
  //rotate yaw of pivot by angle offset
  var safeAngle = {x: eulerPivotStartRotation.x, y: eulerPivotStartRotation.y, z: eulerPivotStartRotation.z};
  // print(eulerPivotStartRotation.y);
  safeAngle.y += angleOffset;
  MyAvatar.setJointData(pivotJoint, Quat.fromVec3Degrees(safeAngle));
}

function map(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);