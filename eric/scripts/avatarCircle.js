//get rid of cape
var BASE_SPEED = 10;
var capeJoint = "RightLeg";
startCapeRot = Quat.safeEulerAngles(MyAvatar.getJointRotation('RightLeg'));
startCapeRot.x = -250;
MyAvatar.setJointData("RightLeg", Quat.fromVec3Degrees(startCapeRot));
var theta = 0;
var circleTime = 10;
var totalTime = 0;
var theta = 0;
var eulerOrientation = Quat.safeEulerAngles(MyAvatar.orientation);
var velRotation, newOrientation, vel, xVel, yVel;
var speed = BASE_SPEED;
var SPEED_OSCILLATION = 10;
//take current position to be theta 0 of circle


//********TIRE STUFF************************************************************
var keyFrameAnim = false;
if(keyFrameAnim){
  var tireAnim = "https://hifi-public.s3.amazonaws.com/eric/models/tireAnim.fbx?v1";
  var tireFPS = 30;
  MyAvatar.startAnimation(tireAnim, tireFPS, 1.0, true, false);
}

var wheelJoint = "LeftToeBase"
var tireRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(wheelJoint));
var tireRotSpeed = 3;

function update(deltaTime) {
  totalTime += deltaTime;
  theta = map(totalTime / circleTime, 0, 1, 0, Math.PI * 2);
  xVel = Math.cos(theta);
  zVel = Math.sin(theta);
  vel = {
    x: xVel,
    y: 0,
    z: zVel
  };
  vel = Vec3.multiply(vel, speed);
  MyAvatar.addThrust(vel);

  velRotation = Quat.fromPitchYawRollRadians(0, -theta - Math.PI / 2, 0);
  newOrientation = Quat.mix(MyAvatar.orientation, velRotation, 1);
  MyAvatar.orientation = newOrientation;

  if(!keyFrameAnim){
    tireRotation.x -= tireRotSpeed;
    MyAvatar.setJointData(wheelJoint, Quat.fromVec3Degrees(tireRotation));

  }

  //change speed as function of time
  // speed = BASE_SPEED + Math.sin(totalTime) * SPEED_OSCILLATION;
}

function cleanup(){

}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}


Script.update.connect(update);
Script.scriptEnding.connect(cleanup);






