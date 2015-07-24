var walkAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_walking.fbx";
// var turnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_right_turn_90.fbx"
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
    var sanitizedAvatarRotation = Quat.fromVec3Degrees(yawOrientation);
    avatarForward = Quat.getFront(sanitizedAvatarRotation);

    avatarOrientationVelocityDotProduct = Vec3.dot(Vec3.normalize(avatarVelocity), avatarForward);
    print("dot product" + avatarOrientationVelocityDotProduct)
    if(avatarOrientationVelocityDotProduct > 0.95 &&  avatarState !== "walking") {
      avatarState = "walking";
      MyAvatar.stopAnimation(currentAnimation);
      MyAvatar.startAnimation(walkAnimation, 30, 1, true, false, 0, 30);
      currentAnimation = walkAnimation;
    }
    else if(avatarOrientationVelocityDotProduct < 0.05 && avatarState!=="jumping") {
      avatarState = "jumping";
      MyAvatar.stopAnimation(currentAnimation);
      MyAvatar.startAnimation(jumpAnimation, 10, 1, false, false);
      currentAnimation = jumpAnimation;
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