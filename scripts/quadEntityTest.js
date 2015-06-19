var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var quadEntity = Entities.addEntity( {
	type: 'Box',
	position: center,
	rotation: Quat.fromPitchYawRollDegrees(45, 0, 0),
	color: {red: 200, green: 20, blue: 200}
});

