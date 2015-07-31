var startingDistance = 5;
var objectPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), startingDistance));

var IDENTITY_QUAT = Quat.fromPitchYawRollDegrees(0, 0, 0);


var obstacle = Entities.addEntity({
	type: 'Box',
	position: objectPosition,
	dimensions: {x: 1, y:.2, z: .1},
	rotation: Quat.multiply(IDENTITY_QUAT, Quat.inverse(MyAvatar.orientation)),
	color: {red: 100, green: 20, blue: 100}
})


function cleanup() {
	Entities.deleteEntity(obstacle);
}




randFloat = function(low, high) {
  return low + Math.random() * (high - low);
}

Script.scriptEnding.connect(cleanup);

Script.update.connect(update);
