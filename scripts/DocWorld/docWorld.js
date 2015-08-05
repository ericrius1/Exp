Script.include('friction.js?v1')

MyAvatar.orientation = Quat.fromPitchYawRollRadians(0, 0, 0);

var basePosition, avatarRot;

var worldSize = 100

var entityList = [];

var basePosition = {
	x: 8000,
	y: 8000,
	z: 8000
};

var groundWidth = 7;
var halfWidth = groundWidth/2;

basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(5, Quat.getFront(MyAvatar.orientation)));
basePosition.y -= 2
basePosition.x += halfWidth/2;


var ground = Entities.addEntity({
	position: basePosition,
	type: "Model",
	modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/floor.fbx?v11",
	dimensions: {
		x: groundWidth,
		y: 1,
		z: worldSize
	},
	shapeType: 'box',
});
entityList.push(ground);


var entityPosition = Vec3.sum(basePosition, {
	x: -groundWidth/2,
	y: 1.5,
	z: 0
});

var panelPosition =  Vec3.sum(basePosition, {
	x: 0, y: 2, z: -1
});

var frictionExample = new FrictionExample(entityPosition, panelPosition);
frictionExample.play();



function cleanup() {
	entityList.forEach(function(entity) {
		Entities.deleteEntity(entity);
	});
	frictionExample.cleanup();
}

Script.scriptEnding.connect(cleanup);