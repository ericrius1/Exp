Script.include("tween.js", function() {
	print("tween loading complete")
	init();
})

function init() {


	var MOVE_THRESHOLD = 0.01;
	var Z_MOVEMENT_THRESHOLD = 0.01;
	var X_MOVEMENT_THRESHOLD = 0.01;
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

	//How many frames to wait before we are at idle. 
	//This prevents changing state when we're quickly changing direction in a walk, sidestep, etc
	var STILL_FRAMES_THRESHOLD = 5;
	var stillFramesCounter = 0;

	var WALK_FRAMES_THRESHOLD = 3;
	var walkFramesCounter = 0;


	var sideStepAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_right_inPlace.fbx",
		numFrames: 31,
		frameIncrementFactor: 2
	};

	var walkAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_walk.fbx",
		numFrames: 36,
		frameIncrementFactor: 1
	};

	var rightTurnAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/right_turn_noHipRotation.fbx",
		numFrames: 31,
		frameIncrementFactor: 1
	};

	var leftTurnAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/left_turn_noHipRotation.fbx",
		numFrames: 29,
		frameIncrementFactor: 1
	};
	var idleAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/idle.fbx"
	};
	var jumpAnimation = {
		url: "https://hifi-public.s3.amazonaws.com/ozan/animations/sniperBasicMotion/sniper_jump.fbx",
		startFrame: 15,
		endFrame: 70
	};
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

		if(avatarState === "jumping") {
			return;
		}
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
			else if ( (avatarState !== "idling" && avatarState !== "finishing") && stillFramesCounter >= STILL_FRAMES_THRESHOLD) {
				avatarState = "finishing";
				//We're in another animation, so finish this animation quickly and then start idle animation on complete
				// finishQuickly(idle);
				idle();
			}
		} else {
			stillFramesCounter = 0;
			//We only want to sidestep if theres no z movement at all!
			if (Math.abs(dPosition.z) > Z_MOVEMENT_THRESHOLD) {
				avatarState = "walking"
				walk();
				walkFramesCounter = 0;
			} else if(Math.abs(dPosition.x) > X_MOVEMENT_THRESHOLD) {
				walkFramesCounter++;
				if(walkFramesCounter > WALK_FRAMES_THRESHOLD) {
				  avatarState = "sideStepping"
				  sideStep();
				}
			}
		}
		previousOrientation = MyAvatar.orientation;

	}

	function idle() {
		avatarState = "idling";
		MyAvatar.stopAnimation(currentAnimation.url);
		MyAvatar.startAnimation(idleAnimation.url, 24, 1, true, false);
		currentAnimation = idleAnimation;
		currentFrame = 0;
		print("IDLE")

	}

	function turn() {
		currentAnimation = rightTurnAnimation;
		direction = dYaw > 0 ? 1 : -1;
		frameIncrement = direction * currentAnimation.frameIncrementFactor;
		currentFrame = currentFrame + frameIncrement;
		nextFrame = currentFrame + frameIncrement;

		MyAvatar.startAnimation(currentAnimation.url, 24, 1, false, false, currentFrame, nextFrame);

		if (currentFrame > currentAnimation.numFrames) {
			currentFrame = 0;
			nextFrame = frameIncrement;
		} else if ( currentFrame < 0) {
			currentFrame = currentAnimation.numFrames;
			nextFrame = currentAnimation.numFrames + frameIncrement;
		}

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
		} else if (currentFrame < 0) {
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
		print("FRAME INDEX: " + frameIndex);

		var curProps = {
			frameIndex: frameIndex
		};

		var endProps = {
			frameIndex: direction === 1 ?  currentAnimation.numFrames: 0
		};
		var finishTween = new TWEEN.Tween(curProps).
		to(endProps, 500).
		onUpdate(function() {
			print(curProps.frameIndex);
			MyAvatar.startAnimation(currentAnimation.url, 24, 1, false, false, curProps.frameIndex, curProps.frameIndex + (.1 * direction));
		}).start()

		finishTween.onComplete(function() {
			callback();
		});

	}

	function jump() {
		avatarState = "jumping";
		currentAnimation = jumpAnimation;
		MyAvatar.startAnimation(jumpAnimation.url, 24, 1, false, false, jumpAnimation.startFrame, jumpAnimation.endFrame);
		var timeoutTime = (jumpAnimation.endFrame - jumpAnimation.startFrame)/24 * 1000;
		print("timeout time: " + timeoutTime)
		Script.setTimeout(idle, timeoutTime);
	}


	function cleanup() {
		if (currentAnimation) {
			MyAvatar.stopAnimation(currentAnimation)
		}
	}

	function keyPressEvent(event) {
		if(event.text === "e") {
			jump();
		}
	}


	Script.scriptEnding.connect(cleanup);
	Script.update.connect(update);
	Controller.keyPressEvent.connect(keyPressEvent);
}