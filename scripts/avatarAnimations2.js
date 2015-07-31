Script.include("tween.js", function() {
	print("tween loading complete")
	init();
})

function init() {


	var MOVE_THRESHOLD = 0.001;
	var previousPosition = MyAvatar.position;
	var dPosition;

	var currentAnimation = idleAnimation;
	avatarState = "idling";
	MyAvatar.startAnimation(currentAnimation, 24, 1, true, false);
	var numFrames = 24;

	var D_YAW_THRESHOLD = 0.02;
	var dYaw, dQ;
	var previousOrientation = MyAvatar.orientation;

	var direction;

	var stillFramesCounter = 0;
	//How many frames to wait before we are at idle. 
	//This prevents changing state when we're quickly changing direction in a walk, sidestep, etc
	var STILL_FRAMES_THRESHOLD = 10;

	var sideStepAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_right_inPlace.fbx",
		numFrames: 31,
		frameIncrementFactor: 2
	}

	var walkAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_walk.fbx",
		numFrames: 36,
		frameIncrementFactor: 1
	}

	var rightTurnAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/right_turn_noHipRotation.fbx"
	}

	var leftTurnAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/left_turn_noHipRotation.fbx"
	}


	var idleAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/idle.fbx"
	}
	var currentFrame = 0;
	var nextFrame;
	var frameIncrement;

	Script.setInterval(slowUpdate, 40); //Avoid bug where dPosition is 0 with fast update loop even when avatar is moving

	function update() {
		TWEEN.update();
	}

	function slowUpdate() {
		dPosition = Vec3.subtract(MyAvatar.position, previousPosition);
		//convert to localFrame
		dPosition = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), dPosition);

		previousPosition = MyAvatar.position;
		if (Vec3.length(dPosition) < MOVE_THRESHOLD) {
			stillFramesCounter++;

			//Only turn if we're not moving!
			dQ = Quat.multiply(MyAvatar.orientation, Quat.inverse(previousOrientation));
			dYaw = Math.asin(-2 * (dQ.x * dQ.z - dQ.w * dQ.y));
			if (Math.abs(dYaw) > D_YAW_THRESHOLD) {
				avatarState = "turning";
				turn();
			}


			//If we're barely moving just idle and return;
			else if (avatarState !== "idling" && stillFramesCounter >= STILL_FRAMES_THRESHOLD) {
				avatarState = "idling";
				//We're in another animation, so finish this animation quickly and then start idle animation on complete
				// finishQuickly(function() {
				// 	//must stop current animation for frameIndex is fucked
				// 	MyAvatar.stopAnimation(currentAnimation.url);
				// 	MyAvatar.startAnimation(idleAnimation.url, 24, 1, true, false);
				// 	currentAnimation = idleAnimation;
				// 	currentFrame = 0;

				// });
			}
		} else {
			stillFramesCounter = 0;
			if (Math.abs(dPosition.x) > Math.abs(dPosition.z) * 5) {
				// if we're moving more than double side to side then forward, sidestep
				avatarState = "sideStepping"
				sideStep();
			} else {
				avatarState = "walking"
				walk();
			}


		}
		previousOrientation = MyAvatar.orientation;

	}

	function turn() {
		currentAnimation = rightTurnAnimation;
		MyAvatar.startAnimation(currentAnimation.url, 24, 1, false, false)

	}

	function walk() {
		currentAnimation = walkAnimation;
		MyAvatar.startAnimation(currentAnimation.url, 24, 1, false, false, currentFrame, nextFrame);

		direction = dPosition.z < 0 ? 1 : -1
		frameIncrement = direction * walkAnimation.frameIncrementFactor;
		currentFrame = currentFrame + frameIncrement
		nextFrame = currentFrame + frameIncrement;
		if (currentFrame > walkAnimation.numFrames) {
			currentFrame = 0;
			nextFrame = frameIncrement;
		}
		if (currentFrame < 0) {
			currentFrame = walkAnimation.numFrames;
			nextFrame = walkAnimation.numFrames + frameIncrement;
		}
	}


	function sideStep() {
		currentAnimation = sideStepAnimation;
		MyAvatar.startAnimation(currentAnimation.url, 24, 1, false, false, currentFrame, nextFrame);

		direction = dPosition.x > 0 ? 1 : -1;
		frameIncrement = direction * sideStepAnimation.frameIncrementFactor;
		currentFrame = currentFrame + frameIncrement;
		nextFrame = currentFrame + frameIncrement;
		if (currentFrame > sideStepAnimation.numFrames) {
			currentFrame = 0;
			nextFrame = frameIncrement;
		}
		if (currentFrame < 0) {
			currentFrame = sideStepAnimation.numFrames;
			nextFrame = sideStepAnimation.numFrames + frameIncrement;
		}
	}

	function finishQuickly(callback) {
		var frameIndex = MyAvatar.getAnimationDetails(currentAnimation.url).frameIndex;
		var finishTween = new TWEEN.Tween({
			frameIndex: nextFrame
		}).
		to({
			frameIndex: nextFrame > currentAnimation.numFrames / 2 ? currentAnimation.numFrames : 0
		}, 500).
		onUpdate(function() {
			MyAvatar.startAnimation(currentAnimation.url, 24, 1, false, false, this.frameIndex, this.frameIndex + .1);
		}).start()

		finishTween.onComplete(function() {
			callback();
		});

	}


	function cleanup() {
		if (currentAnimation) {
			MyAvatar.stopAnimation(currentAnimation)
		}
	}


	Script.scriptEnding.connect(cleanup);
	Script.update.connect(update);
}