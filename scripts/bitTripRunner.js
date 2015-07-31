var startingDistance = 5;
var objectPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), startingDistance));

var IDENTITY_QUAT = Quat.fromPitchYawRollDegrees(0, 0, 0);

var speed = 2;


var velocity = Vec3.subtract(MyAvatar.position, objectPosition);
velocity = Vec3.normalize(velocity);
velocity = Vec3.sum(velocity, speed);
velocity.y = 0;
var obstacle = Entities.addEntity({
	type: 'Box',
	position: objectPosition,
	dimensions: {
		x: 1,
		y: .2,
		z: .1
	},
	rotation: orientationOf(Vec3.subtract(MyAvatar.position, objectPosition)),
	color: {
		red: 100,
		green: 20,
		blue: 100
	},
	velocity: velocity,
	damping: 0

});

function update() {

}


function cleanup() {
	Entities.deleteEntity(obstacle);
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



randFloat = function(low, high) {
	return low + Math.random() * (high - low);
}

Script.scriptEnding.connect(cleanup);

Script.update.connect(update);