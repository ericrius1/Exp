var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var DISTANCE_IN_FRONT = 0.4
var holdActionId;
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");

var painting = false;

var TRIGGER_THRESHOLD = 0.2;
var rightHandGrabAction = RIGHT_HAND_CLICK;
var rightHandGrabValue = 0;
var prevRightHandGrabValue = 0;


var paintGun = Entities.addEntity({
	type: "Model",
	modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/sprayGun.fbx?=v2",
	position: center,
	dimensions: {
		x: 0.15,
		y: 0.34,
		z: 0.03
	},
	collisionsWillMove: true,
	shapeType: 'box'
});

var whiteboard = Entities.addEntity({
	type: "Box",
	position: center, 
	dimensions: {x: 2, y: 1.5, z: .1},
	rotation: orientationOf(Vec3.subtract(MyAvatar.position, center)),
	color: {red: 250, green: 250, blue: 250}
});	


var gunRotation = Entities.getEntityProperties(paintGun);
var handRotation = MyAvatar.getRightPalmRotation();
var offsetRotation = Quat.multiply(Quat.inverse(handRotation), gunRotation);

var baseHandRotation = Quat.fromVec3Degrees({
	x: -31,
	y: 0,
	z: 81
});
var offsetPosition = Vec3.multiply(DISTANCE_IN_FRONT, Quat.getRight(baseHandRotation));



print(JSON.stringify(paintGun));

//Need set timeout in beginning 
Script.setTimeout(function() {
	holdActionId = Entities.addAction("hold", paintGun, {
		relativePosition: offsetPosition,
		hand: "right",
		timeScale: 0.05
	});
}, 1000)

function update() {
    updateControllerState();
}

function updateControllerState() {
	rightHandGrabValue = Controller.getActionValue(rightHandGrabAction);
	if (rightHandGrabValue > TRIGGER_THRESHOLD && prevRightHandGrabValue < TRIGGER_THRESHOLD) {
		painting = true;
	} else if (rightHandGrabValue < TRIGGER_THRESHOLD && prevRightHandGrabValue > TRIGGER_THRESHOLD) {
		painting = false;
		print("no longer painting")
	}
	prevRightHandGrabValue = rightHandGrabValue
}

function cleanup() {
	Entities.deleteEntity(paintGun);
	Entities.deleteEntity(whiteboard);
}

function orientationOf(vector) {
	var Y_AXIS = {
		x: 0,
		y: 1,
		z: 0
	};
	var X_AXIS = {
		x: 1,
		y: 0,
		z: 0
	};

	var theta = 0.0;

	var RAD_TO_DEG = 180.0 / Math.PI;
	var direction, yaw, pitch;
	direction = Vec3.normalize(vector);
	yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
	pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
	return Quat.multiply(yaw, pitch);
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);