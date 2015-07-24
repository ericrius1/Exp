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

var position = Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), 3));

var rotation =  orientationOf(Vec3.subtract(MyAvatar.position, position));

var plane = Entities.addEntity({
	type: "Box",
	position: position,
	dimensions: {
		x: 1,
		y: 1,
		z: .1
	},
	color: {
		red: 200,
		green: 30,
		blue: 180
	},
	rotation: orientationOf(Vec3.subtract(MyAvatar.position, position))
});


function cleanup() {
	Entities.deleteEntity(plane);

}
Script.scriptEnding.connect(cleanup);


function orientationOf(vector) {
	var direction, yaw, pitch;
	direction = Vec3.normalize(vector);
	print(JSON.stringify(direction))
	yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
	pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
	print(JSON.stringify(pitch));
	return Quat.multiply(yaw, pitch);
}