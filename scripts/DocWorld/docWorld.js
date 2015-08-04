var basePosition, avatarRot;

var floorSize = 100

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
		x: floorSize,
		y: 1,
		z: floorSize
	},
	shapeType: 'box',
});
entityList.push(ground);

var box = Entities.addEntity({
	type: 'Box',
	position: Vec3.sum(basePosition, {x: 0, y: 2, z: 0}),
	dimensions: {x: 1, y: 1, z: 1},
	color: {red: 200, green: 20, blue: 200},
	velocity: {x: 2, y: 0, z: 0},
	gravity: {x: 0, y: -2, z: 0},
	collisionsWillMove: true,
	friction: 0,
	resitution: 1
});
entityList.push(box);

function cleanup() {
	entityList.forEach(function(entity){
		Entities.deleteEntity(entity);
	});
}

Script.scriptEnding.connect(cleanup);