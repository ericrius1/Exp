var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var DISTANCE_IN_FRONT = 0.3
var holdActionId;
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
		// relativeRotation: offsetRotation,
		hand: "right",
		timeScale: 0.05
	});
}, 1000)

function cleanup() {
	Entities.deleteEntity(paintGun);
}

Script.scriptEnding.connect(cleanup);