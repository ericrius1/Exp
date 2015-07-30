Script.include("tween.js", function() {
	print("tween loading complete")
	init();
})

function init() {

	var stepLeftAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_left_inPlace.fbx";
	var stepRightAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_right_inPlace.fbx";
	var walkAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_walk.fbx";
	var idleAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/idle.fbx";

	var MOVE_THRESHOLD = 0.001;
	var previousPosition = MyAvatar.position;
	var dPosition;

	var currentAnimation = idleAnimation;
	avatarState = "idling";
	MyAvatar.startAnimation(currentAnimation, 24, 1, true, false);
	var numFrames = 24;

	var direction;

	var sideStepProps = {
		numFrames: 31,
		frameIncrementFactor: 2
	}

	var walkProps = {
		numFrames: 36,
		frameIncrementFactor: 1
	}
	var currentFrame = 0;
	var nextFrame;
	var frameIncrement;


	// MyAvatar.startAnimation(walkAnimation, 24, 1, true, false);

	Script.setInterval(slowUpdate, 40);


	function update() {
		TWEEN.update();
	}

	function finishQuickly(callback) {
		var frameIndex = MyAvatar.getAnimationDetails(currentAnimation).frameIndex;
		print("frame index "  + JSON.stringify(frameIndex))
		var finishTween = new TWEEN.Tween({frameIndex : nextFrame}).
		to({frameIndex: nextFrame > 16 ? 36 : 0}, 500).
		onUpdate(function() {
			// print(this.function() {};rameIndex)
			MyAvatar.startAnimation(currentAnimation, 24, 1, false, false, this.frameIndex, this.frameIndex + .1)
		}).start()

		finishTween.onComplete(function() {
			callback();
		});

	}


	function slowUpdate() {
		dPosition = Vec3.subtract(MyAvatar.position, previousPosition);
		//convert to localFrame
		dPosition = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), dPosition);

		previousPosition = MyAvatar.position;
		if (Vec3.length(dPosition) < MOVE_THRESHOLD) {
			//If we're barely moving just idle and return;
			if (avatarState !== "idling") {
				  avatarState = "idling";
				//We're in another animation, so finish this animation quickly and then start idle animation on complete
				finishQuickly(function(){
				  MyAvatar.stopAnimation(currentAnimation);
				  MyAvatar.startAnimation(idleAnimation, 24, 1, true, false);
				  currentAnimation = idleAnimation;
				  currentFrame = 0;
				});
			} 
			return;
		}

		if (Math.abs(dPosition.x) > Math.abs(dPosition.z)) {
			// if we're moving more side to side then forward, sidestep
			avatarState = "sideStepping"
			sideStep();
		} else {
			avatarState = "walking"
			walk();
		}
	}

	function walk() {
		MyAvatar.startAnimation(walkAnimation, 24, 1, false, false, currentFrame, nextFrame);
		currentAnimation = walkAnimation;


		direction = dPosition.z > 0 ? -1 : 1
		frameIncrement = direction * walkProps.frameIncrementFactor;
		currentFrame = currentFrame + frameIncrement
		nextFrame = currentFrame + frameIncrement;
		if (currentFrame > walkProps.numFrames) {
			currentFrame = 0;
			nextFrame = frameIncrement;
		}


	}

	function sideStep() {
		currentAnimation = stepRightAnimation;
		MyAvatar.startAnimation(stepRightAnimation, 24, 1, false, false, currentFrame, nextFrame);

		direction = dPosition.x > 0 ? 1 : -1;
		frameIncrement = direction * sideStepProps.frameIncrementFactor;
		currentFrame = currentFrame + frameIncrement;
		nextFrame = currentFrame + frameIncrement;
		if (currentFrame > sideStepProps.numFrames) {
			currentFrame = 0;
			nextFrame = frameIncrement;
		}
		if (currentFrame < 0) {
			currentFrame = sideStepProps.numFrames;
			sideStepProps.numFrames - frameIncrement;
		}


	}

	function cleanup() {
		if (currentAnimation) {
			MyAvatar.stopAnimation(currentAnimation)
		}
	}


	Script.scriptEnding.connect(cleanup);
	Script.update.connect(update);
}