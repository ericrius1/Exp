
var debug = true
var wheelJoint = "LeftToeBase"
var pivotJoint = "LeftUpLeg";
var lineLength = 10;
var wheelStartRotation = MyAvatar.getJointRotation(wheelJoint);
var pivotStartRotation = MyAvatar.getJointRotation(pivotJoint);
var safeEulerPivotStartRotation = Quat.safeEulerAngles(pivotStartRotation);
var forward, angle, velocity, normalizedVelocity, targetRotation, rotation, targetLine, startLine, dotP, dir;
var test = 0;

var previousOrientation = MyAvatar.orientation;
if (debug) {
  setUpDebugLines();
}
Script.setInterval(setNewTargetPivot, 1000);



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


  // normalizedVelocity = Vec3.normalize(velocity);
  // print("normal vel " + JSON.stringify(velocity))
  // angle = Math.acos(Vec3.dot(forward, normalizedVelocity));
  // // print('angle ******* ' +  angle)
  // targetRotation = Quat.fromPitchYawRollDegrees(safeEulerPivotStartRotation.x, angle * 100, safeEulerPivotStartRotation.z);
  // MyAvatar.setJointData(pivotJoint, targetRotation);
  // // print("Y ROTATION ******* " +  angle)
  // test++;



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
  print("HEEEY")
  Overlays.editOverlay(targetLine, {start: MyAvatar.position, end: Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(MyAvatar.orientation)))});
  Overlays.editOverlay(startLine, {start: MyAvatar.position, end: Vec3.sum(MyAvatar.position, Vec3.multiply(lineLength, Quat.getFront(previousOrientation)))});
  previousOrientation = MyAvatar.orientation;
}

Script.scriptEnding.connect(cleanup);
Script.update.connect(update);