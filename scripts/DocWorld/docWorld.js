Script.include('friction.js')

var basePosition, avatarRot;

var worldSize = 100

var entityList = [];

var basePosition = {
	x: 8000,
	y: 8000,
	z: 8000
};

basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(MyAvatar.orientation)));
basePosition.y -= 2


var ground = Entities.addEntity({
	position: basePosition,
	type: "Model",
	modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/floor.fbx?v11",
	dimensions: {
		x: worldSize,
		y: 1,
		z: worldSize
	},
	shapeType: 'box',
});
entityList.push(ground);

var zone = Entities.addEntity({
	type: 'Zone',
	position: basePosition,
	dimensions: {x: worldSize, y: worldSize, z: worldSize},
	backgroundMode: "skybox",
	skybox: {
		url: "https://hifi-public.s3.amazonaws.com/images/SkyboxTextures/TropicalSunnyDay1024Compressed2.jpg"
	}
});

entityList.push(zone);

var frictionExamplePosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: 0
});
var frictionExample = new FrictionExample(frictionExamplePosition);



function cleanup() {
	entityList.forEach(function(entity) {
		Entities.deleteEntity(entity);
	});
	frictionExample.cleanup();
}

Script.scriptEnding.connect(cleanup);