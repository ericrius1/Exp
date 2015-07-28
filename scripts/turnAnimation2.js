Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js", function() {
	print("tween loading complete")
	init();
})

function init() {
	var leftTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/left_turn_noHipRotation.fbx";
	var rightTurnAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/right_turn_noHipRotation.fbx";
	var hipJoint = "Hips";
	var neckJoint = "Neck";
	var spineJoint = "Spine";
	var hipJointRotation, neckJointRotation, spineJointRotation;

	var turnAnimation;

	var phi;

	var currentCamYaw;
	var startingCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;


	var animating = false;

	var checkIntervalTime = 500;
	var bodyTurning = false;
	var minDeltaYawForTurn = 45;


	var currentAnimation;


	function cleanup() {

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
		MyAvatar.setJointData(spineJoint, Quat.fromVec3Degrees({
			x: 0,
			y: 0,
			z: 0
		}));
	}

	function keyPressEvent(event) {
		if (event.text === 'a') {
			turnAnimation = leftTurnAnimation;
		} else if (event.text === 'd') {
			turnAnimation = rightTurnAnimation;
		}
	}

	function update(deltaTime) {
		TWEEN.update();
		if (animating) {
			return;
		}
		currentCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
		phi = startingCamYaw - currentCamYaw;
		checkForTurn();

		hipJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(hipJoint));
		hipJointRotation.y = phi;

		neckJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(neckJoint));
		neckJointRotation.y = -phi / 2

		spineJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(spineJoint));
		spineJointRotation.y = -phi / 2;

		MyAvatar.setJointData(hipJoint, Quat.fromVec3Degrees(hipJointRotation));
		MyAvatar.setJointData(neckJoint, Quat.fromVec3Degrees(neckJointRotation));
		MyAvatar.setJointData(spineJoint, Quat.fromVec3Degrees(spineJointRotation));


	}


	function checkForTurn() {
		if (Math.abs(phi) > minDeltaYawForTurn) {
			animateTurn();
		}
	}

	function animateTurn() {
		if (animating) {
			return;
		}
		animating = true;
		print("turn animation " + turnAnimation)
		MyAvatar.startAnimation(turnAnimation, 30, 1, false, false);
		currentAnimation = turnAnimation;
		var neckJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(neckJoint));
		var hipJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(hipJoint));
		var spineJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(spineJoint));
		var curProps = {
			hipYaw: hipJointRotation.y,
			neckYaw: neckJointRotation.y,
			spineYaw: neckJointRotation.y,
		};
		var endProps = {
			hipYaw: 0.0,
			neckYaw: 0.0,
			spineYaw: 0.0
		}
		var turnTween = new TWEEN.Tween(curProps).
		to(endProps, 1000).
		easing(TWEEN.Easing.Cubic.InOut).
		onUpdate(function() {
			MyAvatar.setJointData(neckJoint, Quat.fromVec3Degrees({
				x: neckJointRotation.x,
				y: curProps.neckYaw,
				z: neckJointRotation.z
			}));
			MyAvatar.setJointData(hipJoint, Quat.fromVec3Degrees({
				x: hipJointRotation.x,
				y: curProps.hipYaw,
				z: hipJointRotation.z
			}));
			MyAvatar.setJointData(spineJoint, Quat.fromVec3Degrees({
				x: spineJointRotation.x,
				y: curProps.spineYaw,
				z: spineJointRotation.z
			}));
		}).start();

		turnTween.onComplete(function() {
			startingCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
			animating = false;
		});
	}

	Controller.keyPressEvent.connect(keyPressEvent);
	Script.scriptEnding.connect(cleanup);
	Script.update.connect(update);
}