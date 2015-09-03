var walkAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_walk.fbx";
var jumpAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_jump.fbx";
var idleAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_idle.fbx"

var currentAnimation = null;;
var avatarVelocity,
  var velocityLength;
var avatarForward;

var jumpStartFrame = 15;
var jumpEndFrame = 70;


var WALKING_VELOCITY_THRESHOLD = .1;

var avatarState = "idle";
MyAvatar.startAnimation(idleAnimation, 30, 1, true, true);


var animationDetails;
var alreadyChecked = false;

function update() {
  animationDetails = MyAvatar.getAnimationDetails(currentAnimation);
  avatarVelocity = MyAvatar.getVelocity();
  velocityLength = Vec3.length(avatarVelocity);
  if (velocityLength > WALKING_VELOCITY_THRESHOLD) {
    var yawOrientation = Quat.safeEulerAngles(MyAvatar.orientation);
    yawOrientation.x = 0;
    yawOrientation.z = 0;
    var sanitizedAvatarRotation = Quat.fromVec3Degrees(yawOrientation);
    avatarForward = Quat.getFront(sanitizedAvatarRotation);

    avatarOrientationVelocityDotProduct = Vec3.dot(Vec3.normalize(avatarVelocity), avatarForward);
    // print("dot product" + avatarOrientationVelocityDotProduct)
    if (avatarOrientationVelocityDotProduct > 0.95 && (avatarState !== "walking" && avatarState !== "jumping")) {
      avatarState = "walking";
      MyAvatar.stopAnimation(currentAnimation);
      MyAvatar.startAnimation(walkAnimation, 30, 1, true, false, 0, 60);
      currentAnimation = walkAnimation;
    }
  } else if (avatarState === "walking") {
    //don't check for a bit to make sure we're not at apex of jump
    avatarState = "idle";
    MyAvatar.stopAnimation(currentAnimation);
    MyAvatar.startAnimation(idleAnimation, 30, 1, true, false);
    currentAnimation = "idle";

  }

  if ((avatarState === "jumping" && animationDetails.frameIndex > jumpEndFrame - 1)) {
    avatarState = "idle";
    MyAvatar.stopAnimation(currentAnimation);
    MyAvatar.startAnimation(idleAnimation);
    currentAnimation = "idle";
  }

}

function jump() {
  if (avatarState !== "jumping") {

    avatarState = "jumping";
    MyAvatar.stopAnimation(currentAnimation);
    MyAvatar.startAnimation(jumpAnimation, 25, 1, false, false, jumpStartFrame, jumpEndFrame);
    currentAnimation = jumpAnimation;
  }
}


function keyPressEvent(event) {
  if (event.text === "e") {
    jump();
  }

}


function cleanup() {
  MyAvatar.stopAnimation(currentAnimation)
}


Controller.keyPressEvent.connect(keyPressEvent);
Script.scriptEnding.connect(cleanup);
Script.update.connect(update);