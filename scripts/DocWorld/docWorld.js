Script.include('friction.js?v1')
Script.include('restitution.js?v1')


MyAvatar.position = {x: 1000, y: 1000, z: 1000};
MyAvatar.orientation = Quat.fromPitchYawRollRadians(0, 0, 0);

var basePosition, avatarRot;
var worldSize = 100

var entityList = [];

var interExampleZSpace = 10;


var groundWidth = 8;
var halfWidth = groundWidth/2;

basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(5, Quat.getFront(MyAvatar.orientation)));
basePosition.y -= 2


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



//FRICTION
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


//RESTITUION

entityPosition = Vec3.sum(entityPosition, {x: 0, y: 0, z: -interExampleZSpace});
panelPosition = Vec3.sum(panelPosition, {x: 0, y: 0, z: -interExampleZSpace})
var restitutionExample = new RestitutionExample(entityPosition, panelPosition);
restitutionExample.play();



function cleanup() {
	entityList.forEach(function(entity) {
		Entities.deleteEntity(entity);
	});
	frictionExample.cleanup();
	restitutionExample.cleanup();
}

Script.scriptEnding.connect(cleanup);