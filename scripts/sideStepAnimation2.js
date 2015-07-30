var stepLeftAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_left_inPlace.fbx";
var stepRightAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_right_inPlace.fbx";
var walkAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_walk.fbx";

var HORIZONTAL_DMOVE_THRESHOLD = .01;
var MOVE_THRESHOLD = 0.01;
var previousPosition = MyAvatar.position;
var dPosition;

var currentAnimation = stepRightAnimation;
var currentFrame = 0;
var nextFrame = 1;
var numFrames = 24;

var direction;


var walkProps = {
	numFrames: 28,
	frameIncrementFactor: 0.5
}

// MyAvatar.startAnimation(walkAnimation, 24, 1, true, false);


function update() {
    dPosition = Vec3.subtract(MyAvatar.position, previousPosition);
	//convert to localFrame
	dPosition = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), dPosition);


	if( Vec3.length(dPosition) < MOVE_THRESHOLD) {
		//If we're barely moving just return;
		return;
	}

	if (Math.abs(dPosition.x) > Math.abs(dPosition.z)) {
		// if we're moving more side to side then forward, sidestep
		sideStep();
	} else {
		walk();
	}

	previousPosition = MyAvatar.position;



}

function walk() {
	direction = dPosition.z > 0 ? -1 : 1
	currentFrame = currentFrame + (direction * walkProps.frameIncrementFactor);
	nextFrame = nextFrame + (direction * walkProps.frameIncrementFactor);
	if(currentFrame >= walkProps.numFrames) {
		currentFrame = 1;
	}
	if(nextFrame === walkProps.numFrames) {
		nextFrame  >= 1;
	}
	print(currentFrame);
	MyAvatar.startAnimation(walkAnimation, 6, 1, false, false, currentFrame, nextFrame);
	currentAnimation = walkAnimation;


}

function sideStep() {
	currentAnimation = stepRightAnimation;
	direction = dPosition.x > 0 ? 1 : -1;
	currentFrame = currentFrame + direction;
	if(currentFrame > 24) {
		currentFrame = 0;
	}

	// print("current frame: " + currentFrame);
	MyAvatar.startAnimation(currentAnimation, 12, 1, false, false, currentFrame, currentFrame+direction);


}

function cleanup() {
	if(currentAnimation){
	  MyAvatar.stopAnimation(currentAnimation)	
	}
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);