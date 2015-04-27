//get rid of cape
var SPEED = 100;
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
//take current position to be theta 0 of circle

function update(deltaTime) {
  totalTime += deltaTime;
  // if (totalTime < circleTime) {
    theta = map(totalTime/circleTime, 0, 1, 0, Math.PI * 2);
    xVel = Math.cos(theta);
    zVel = Math.sin(theta);
  // }
  vel = {x: xVel, y: 0, z: zVel};
  vel = Vec3.multiply(vel, SPEED);
  MyAvatar.addThrust(vel);

  velRotation = Quat.fromPitchYawRollRadians(0, -theta - Math.PI/2, 0);
  newOrientation= Quat.mix(MyAvatar.orientation, velRotation, 1);
  MyAvatar.orientation = newOrientation;

}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

Script.update.connect(update);







