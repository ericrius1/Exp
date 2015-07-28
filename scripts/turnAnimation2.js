Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js", function() {
	init();
})

function init() {
	print("files loaded")
	var leftTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/left_turn_noHipRotation.fbx";
	var rightTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/right_turn_noHipRotation.fbx";
	var hipJoint = "Hips";
	var neckJoint = "Neck";
	var hipJointRotation, neckJointRotation;

	var phi;

	var startingCamYaw, currentCamYaw;
	var startingNeckJointYaw, startingHipJointYaw;



	var yawIncrement = 1;
	var checkIntervalTime = 100;
	var cameraRotating = false
	var bodyTurning = false;
	var minDeltaYawForTurn = 20;


	var currentAnimation;

	var checkTimeout;

	// MyAvatar.startAnimation(leftTurnAnimation, 7, 1, false, false)

	function keyPressEvent(event) {
		if (event.text === "a") {
			turn(leftTurnAnimation, yawIncrement)
		} else if (event.text === "d") {
			turn(rightTurnAnimation, -yawIncrement);
		}

	}

	function turn(turnAnimation, yawIncrement) {
		currentCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
		if (!cameraRotating) {
		    startingCamYaw = currentCamYaw;
		    startingNeckJointYaw = currentCamYaw
		    startingHipJointYaw = -currentCamYaw;
			cameraRotating = true;
			checkTimeout = Script.setTimeout(function() {
				// checkForTurn(turnAnimation);
			}, checkIntervalTime)
		}

		hipJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(hipJoint));
		var phi= startingCamYaw - currentCamYaw;
		print("delta yaw " + phi)
		hipJointRotation.y = -phi

		neckJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(neckJoint));
		neckJointRotation.y = phi

		MyAvatar.setJointData(hipJoint, Quat.fromVec3Degrees(hipJointRotation));
		MyAvatar.setJointData(neckJoint, Quat.fromVec3Degrees(neckJointRotation));
		// if (!bodyTurning) {
		// MyAvatar.headYaw += yawIncrement;
		// }
	}



	function cleanup() {
		MyAvatar.headYaw = 0;
		Script.clearInterval(checkTimeout);
		MyAvatar.stopAnimation(currentAnimation);

		MyAvatar.setJointData(hipJoint, Quat.fromVec3Degrees({
			x: 0,
			y: 0,
			z: 0
		}));
		MyAvatar.setJointData(neckJoint, Quat.fromVec3Degrees({
			x: 0,
			y: 0,
			z: 0
		}));
	}

	function update(deltaTime) {
		TWEEN.update();
	}


	function checkForTurn(turnAnimation) {
		// currentCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
		var deltaYaw = currentCamYaw - startingCamYaw;
		if (Math.abs(deltaYaw) > minDeltaYawForTurn) {
			animateTurn(turnAnimation);
		}
		cameraRotating = false
	}

	function animateTurn(turnAnimation) {
		print('turn');
		// MyAvatar.startAnimation(turnAnimation, 30, 1, false, false);
		currentAnimation = turnAnimation;
		var neckJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(neckJoint));
		var hipJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(hipJoint));
		var curProps = {
			hipYaw: hipJointRotation.y,
			neckYaw: neckJointRotation.y
		};
		var endProps = {
			hipYaw: startingHipJointYaw,
			neckYaw: startingNeckJointYaw
		}
		print("TURN")
		var turnTween = new TWEEN.Tween(curProps).
		  to(endProps, 1000).
		  onUpdate(function() {
		  	// MyAvatar.setJointData(neckJoint, Quat.fromVec3Degrees({x: neckJointRotation.x, y: curProps.neckYaw, z: neckJointRotation.z}));
		  	MyAvatar.setJointData(hipJoint, Quat.fromVec3Degrees({x: hipJointRotation.x, y: curProps.hipYaw, z: hipJointRotation.z}));
		  }).start();
	}


	Controller.keyPressEvent.connect(keyPressEvent);
	Script.scriptEnding.connect(cleanup);
	Script.update.connect(update);
}