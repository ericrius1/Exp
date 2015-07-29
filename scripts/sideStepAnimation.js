Script.include("tween.js", function() {
	print("tween loading complete")
	init();
})

function init() {

	var localVelocity;

	var LEAN_THRESHOLD = 10.5

	var spineJoint = "Spine";
	var hipJoint = "Hips";
	var leftLegJoint = "LeftUpLeg";
	var rightLegJoint = "RightUpLeg";

	var hipRotation = MyAvatar.getJointRotation(hipJoint);
	var spineRotation = MyAvatar.getJointRotation(spineJoint);

	var startingLeftLegRotation = MyAvatar.getJointRotation(leftLegJoint);
	var leftLegRotation = startingLeftLegRotation;

	var startingRightLegRotation = MyAvatar.getJointRotation(rightLegJoint);
	var rightLegRotation = startingRightLegRotation;

	var interpolatedLeftLegRotation, interpolatedRightLegRotation;

	var animating = false;

	var VEC_ZERO = {x: 0, y: 0, z: 0};


	var Z_AXIS = {
		x: 0,
		y: 0,
		z: -1
	};

	var startingPosition = MyAvatar.position;
	var previousPosition = startingPosition;
	//frame by frame change in position
	var dPosition;
	//meta change in position from initial avatar position
	var mDPosition = VEC_ZERO;


	function update() {
		TWEEN.update();
		if(animating) {
			return;
		}
		dPosition = Vec3.multiply(Vec3.subtract(MyAvatar.position, previousPosition), 10);
		//convert to localFrame
		dPosition = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), dPosition);
		mDPosition = Vec3.sum(mDPosition, dPosition);
		leftLegRotation = Quat.multiply(leftLegRotation, Quat.angleAxis(-dPosition.x, Z_AXIS));
		rightLegRotation = Quat.multiply(rightLegRotation, Quat.angleAxis(-dPosition.x, Z_AXIS));
		MyAvatar.setJointData(rightLegJoint, rightLegRotation);
		MyAvatar.setJointData(leftLegJoint, leftLegRotation);
		previousPosition = MyAvatar.position;

		if( Math.abs(mDPosition.x) > LEAN_THRESHOLD) {
			animateSidestep();
		}


	}

	function animateSidestep() {
		if(animating){
			return;
		}
		print("LEAN")
		animating = true;

		//capture current leg rotations 
		var finalLeftLegRotation = MyAvatar.getJointRotation(leftLegJoint);
		var finalRightLegRotation = MyAvatar.getJointRotation(rightLegJoint);

		var stepTween = new TWEEN.Tween({t: 0}).
		  to({t: 1}, 2000).
		  onUpdate(function() {
		  	interpolatedLeftLegRotation = Quat.slerp(finalLeftLegRotation, startingLeftLegRotation, this.t);
		  	interpolatedRightLegRotation =  Quat.slerp(finalRightLegRotation, startingRightLegRotation, this.t);
		  	MyAvatar.setJointData(leftLegJoint, interpolatedLeftLegRotation);
		  	MyAvatar.setJointData(rightLegJoint, interpolatedRightLegRotation);
		  }).start();
		  stepTween.onComplete(function() {
		  	mDPosition = VEC_ZERO;
		  	leftLegRotation = MyAvatar.getJointRotation(leftLegJoint);
		  	rightLegRotation = MyAvatar.getJointRotation(rightLegJoint);
		  	// MyAvatar.setJointData(leftLegJoint, leftLegRotation);
		  	// MyAvatar.setJointData(rightLegJoint, interpolatedRightLegRotation);
		  	animating = false;
		  	previousPosition = MyAvatar.position;
		  });


	}

	function cleanup() {
		MyAvatar.setJointData(rightLegJoint, Quat.fromVec3Degrees({
			x: 0,
			y: 0,
			z: 0
		}));
		MyAvatar.setJointData(leftLegJoint, Quat.fromVec3Degrees({
			x: 0,
			y: 0,
			z: 0
		}));
	
	}


	Script.update.connect(update);
	Script.scriptEnding.connect(cleanup);
	
}