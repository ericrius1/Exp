var rightTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/right_turn.fbx"
var leftTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/left_turn.fbx"
var idleAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_idle.fbx"

var animationDetails;
var prevBodyYaw = MyAvatar.bodyYaw;

var currentAnimation = idleAnimation;
var avatarState = "idle";

var maxDeltaYaw = 200;

var turnStartFrame = 1;
var turnEndFrame = 28;
var curFrame = 0,
	endFrame;
var numAdditionalFrames;

var maxDeltaYawPerPoll = 50;
var maxFramesPerPoll = 7;

var slowUpdateInterval = 50;


function slowUpdate() {
	// print("slowUpdate")
	animationDetails = MyAvatar.getAnimationDetails(currentAnimation);
	var deltaYaw = MyAvatar.bodyYaw - prevBodyYaw;
	if (deltaYaw > 0 && Math.abs(deltaYaw) < maxDeltaYaw) {
		turn(leftTurnAnimation, deltaYaw)
	} else if (deltaYaw < 0 && Math.abs(deltaYaw) < maxDeltaYaw){
		turn(rightTurnAnimation, deltaYaw);
	}
	prevBodyYaw = MyAvatar.bodyYaw;
}

function turn(turnAnimation, deltaYaw) {
	print("deltaYaw " + deltaYaw);
	numAdditionalFrames = map(Math.abs(deltaYaw), 0, maxDeltaYawPerPoll, 0, maxFramesPerPoll);
	// left turn
	endFrame = curFrame + numAdditionalFrames;
	MyAvatar.stopAnimation(turnAnimation);
	MyAvatar.startAnimation(turnAnimation, 30, 1, false, false, curFrame, endFrame);
	curFrame = endFrame;
	currentAnimation = turnAnimation;

}

Script.setInterval(slowUpdate, slowUpdateInterval)


function cleanup() {
	MyAvatar.stopAnimation(currentAnimation)
}

// Script.update.connect(update);
Script.scriptEnding.connect(cleanup);



map = function(value, min1, max1, min2, max2) {
	return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}