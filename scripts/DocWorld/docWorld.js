Script.include('frictionExample.js')
Script.include('restitutionExample.js');
Script.include('gravityExample.js');

//particles
Script.include('particleExamples/emitStrengthExample.js');
Script.include('particleExamples/emitDirectionExample.js');

Script.include('lineExamples/dynamicLineExample.js');

MyAvatar.position = {
	x: 1000,
	y: 1000,
	z: 1000
};
MyAvatar.orientation = Quat.fromPitchYawRollRadians(0, 0, 0);

var basePosition, avatarRot;
var floorLength = 100

var entityList = [];

var interExampleZSpace = 10;
var panelZSPace = 1;

var examples = [];


var groundWidth = 8;
var halfWidth = groundWidth / 2;

basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(5, Quat.getFront(MyAvatar.orientation)));
basePosition.y -= 2


var ground = Entities.addEntity({
	position: Vec3.sum(basePosition, {x: 0, y: 0, z: -floorLength/2 + 20}),
	type: "Model",
	modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/floor.fbx?v11",
	dimensions: {
		x: groundWidth,
		y: 1,
		z: floorLength
	},
	shapeType: 'box',

	restitution: 1
});
entityList.push(ground);



//FRICTION
var entityPosition = Vec3.sum(basePosition, {
	x: -groundWidth / 2,
	y: 1.5,
	z: -(interExampleZSpace * examples.length)
});

var panelPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length + panelZSPace)
});

var frictionExample = new FrictionExample(entityPosition, panelPosition);
frictionExample.play();
examples.push(frictionExample);


//RESTITUION

entityPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length)
});

panelPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length + panelZSPace)
});
var restitutionExample = new RestitutionExample(entityPosition, panelPosition);
restitutionExample.play();
MyAvatar.position = Vec3.sum(MyAvatar.position, {x: 0, y: 0, z: -interExampleZSpace});
examples.push(restitutionExample);


//GRAVITY

entityPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length)
});

panelPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length + panelZSPace)
});
var gravityExample = new GravityExample(entityPosition, panelPosition);
gravityExample.play();

MyAvatar.position = Vec3.sum(MyAvatar.position, {x: 0, y: 0, z: -interExampleZSpace});	
examples.push(gravityExample);

//PARTICLES

//emitStrength
entityPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 1,
	z: -(interExampleZSpace * examples.length)
});

panelPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length + panelZSPace)
});
var particleEmitStrengthExample = new ParticleEmitStrengthExample(entityPosition, panelPosition);
particleEmitStrengthExample.play();

MyAvatar.position = Vec3.sum(MyAvatar.position, {x: 0, y: 0, z: -interExampleZSpace});	
examples.push(particleEmitStrengthExample);

//emitDirection
entityPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 1,
	z: -(interExampleZSpace * examples.length)
});

panelPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length + panelZSPace)
});
var particleDirectionExample = new ParticleDirectionExample(entityPosition, panelPosition);
particleDirectionExample.play();

MyAvatar.position = Vec3.sum(MyAvatar.position, {x: 0, y: 0, z: -interExampleZSpace});	
examples.push(particleDirectionExample);





//LINES

// entityPosition = Vec3.sum(basePosition, {
// 	x: 0,
// 	y: 1,
// 	z: -(interExampleZSpace * examples.length)
// });

// panelPosition = Vec3.sum(basePosition, {
// 	x: 0,
// 	y: 2,
// 	z: -(interExampleZSpace * examples.length + panelZSPace)
// });
// var lineDynamicExample = new LineDynamicExample(entityPosition, panelPosition);
// lineDynamicExample.play();

// MyAvatar.position = Vec3.sum(MyAvatar.position, {x: 0, y: 0, z: -interExampleZSpace});	
// examples.push(lineDynamicExample);




function cleanup() {
	entityList.forEach(function(entity) {
		Entities.deleteEntity(entity);
	});

	examples.forEach(function(example){
		example.cleanup();
	});
}

Script.scriptEnding.connect(cleanup);