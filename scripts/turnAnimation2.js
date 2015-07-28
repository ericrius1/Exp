Script.include("tween.js", function() {
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

	var currentCamYaw;
	var startingCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;


    var animating = false;

	var checkIntervalTime = 500;
	var bodyTurning = false;
	var minDeltaYawForTurn = 45;


	var currentAnimation;


	function cleanup() {

		// MyAvatar.setJointData(hipJoint, Quat.fromVec3Degrees({
		// 	x: 0,
		// 	y: 0,
		// 	z: 0
		// }));
		// MyAvatar.setJointData(neckJoint, Quat.fromVec3Degrees({
		// 	x: 0,
		// 	y: 0,
		// 	z: 0
		// }));
	}

	function update(deltaTime) {
		currentCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
		phi = startingCamYaw - currentCamYaw;
		checkForTurn();

		hipJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(hipJoint));
		hipJointRotation.y = -phi;

		neckJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(neckJoint));
		neckJointRotation.y = phi

		MyAvatar.setJointData(hipJoint, Quat.fromVec3Degrees(hipJointRotation));
		MyAvatar.setJointData(neckJoint, Quat.fromVec3Degrees(neckJointRotation));
		

		TWEEN.update();
	}


	function checkForTurn(turnAnimation) {
		print('turn ' + phi)
		if (Math.abs(phi) > minDeltaYawForTurn) {
			animateTurn(turnAnimation);
		}
	}

	function animateTurn(turnAnimation) {
		if(animating) {
			return;
		}
		animating = true;
		currentAnimation = turnAnimation;
		currentCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;
		var neckJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(neckJoint));
		var hipJointRotation = Quat.safeEulerAngles(MyAvatar.getJointRotation(hipJoint));
		var curProps = {
			hipYaw: hipJointRotation.y,
			neckYaw: neckJointRotation.y
		};
		var endProps = {
			hipYaw: 0.01,
			neckYaw: 0.01
		}
		var turnTween = new TWEEN.Tween(curProps).
		to(endProps, 700).
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
		}).start();

		turnTween.onComplete(function() {
			startingCamYaw = Quat.safeEulerAngles(Camera.getOrientation()).y;	
			animating = false;
		});
	}


	Script.scriptEnding.connect(cleanup);
	Script.update.connect(update);
}