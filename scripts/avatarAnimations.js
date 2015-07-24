var walkAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_walking.fbx";
var turnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_right_turn_90.fbx"
var jumpAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_jump.fbx";
var idelAnimation = " https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_idle.fbx"

var currentAnimation = null;;
var avatarVelocity, 
var velocityLength;
var avatarForward;


var VELOCITY_THRESHOLD = .5;

var avatarState = "idle";


var animationDetails;

function updateAnimations() {
  animationDetails = MyAvatar.getAnimationDetails(currentAnimation);
  // print(animationDetails.frameIndex)
  // avatarVelocity = MyAvatar.getVelocity();
  // velocityLength = Vec3.length(avatarVelocity);
  // if(velocityLength > VELOCITY_THRESHOLD && avatarState !== "walking") {
  //   MyAvatar.stopAnimation(currentAnimation);
  //   currentAnimation = walkAnimation;
  //   MyAvatar.startAnimation(currentAnimation, 30, 1.0, true, false, 0, 30);
  //   avatarState = "walking";
  // } else if (velocityLength < VELOCITY_THRESHOLD && avatarState === "walking" && animationDetails.frameIndex < 1) {
  //   avatarState = "idle";
  //   MyAvatar.stopAnimation(currentAnimation)
  //   currentAnimation = idelAnimation;
  //   MyAvatar.startAnimation(idelAnimation, 30, 1, true);
  // }

}



function update() {
   avatarVelocity = MyAvatar.getVelocity();
  velocityLength = Vec3.length(avatarVelocity);
  if(velocityLength > VELOCITY_THRESHOLD) {
    var yawOrientation = Quat.ge
    var yawOrientation = Quat.safeEulerAngles(MyAvatar.orientation);
    yawOrientation.x = 0;
    yawOrientation.z = 0;
    avatarForward = Quat.getFront(yawOrientation);

    avatarOrientationVelocityDotProduct = Vec3.dot(Vec3.normalize(avatarVelocity), avatarForward);
    print(avatarOrientationVelocityDotProduct)
    if(avatarOrientationVelocityDotProduct < Math.abs(.9) && avatarOrientationVelocityDotProduct > .1) {
      //turning
      if(avatarState !== "turning") {
        avatarState = "turning";
        MyAvatar.stopAnimation(currentAnimation);
        MyAvatar.startAnimation(turnAnimation, 30, 1, true, false, 0, 30);
        currentAnimation = turnAnimation;
      }
    }
    else if(avatarState !== "walking") {
      print('walking')
      avatarState = "walking";
      MyAvatar.stopAnimation(currentAnimation);
      MyAvatar.startAnimation(walkAnimation, 30, 1, true, false, 0, 30);
      currentAnimation = walkAnimation;
    }

  } else if(avatarState !== "idle") {
    avatarState = "idle";
    MyAvatar.stopAnimation(currentAnimation);
    MyAvatar.startAnimation(idelAnimation);
    currentAnimation = idelAnimation;
  }


  updateAnimations();


}


function cleanup() {
  MyAvatar.stopAnimation(currentAnimation)
}

Script.scriptEnding.connect(cleanup);
Script.update.connect(update);