Script.include('physicsExamples/frictionExample.js')
Script.include('physicsExamples/restitutionExample.js');
Script.include('physicsExamples/gravityExample.js');

//particles
Script.include('particleExamples/emitStrengthExample.js');
Script.include('particleExamples/emitDirectionExample.js');

//LINES
Script.include('lineExamples/staticLineExample.js');
Script.include('lineExamples/dynamicLineExample.js');

//MODELS
Script.include('modelExamples/animationFPSExample.js');

//LIGHT
Script.include('lightExamples/lightIntensityExample.js');

MyAvatar.position = {
	x: 1000,
	y: 1000,
	z: 1000
};
MyAvatar.orientation = Quat.fromPitchYawRollRadians(0, 0, 0);

var basePosition, avatarRot;
var floorLength = 1000

var entityList = [];

var interExampleZSpace = 10;
var panelZSPace = 1;

var examples = [];


var groundWidth = 8;
var halfWidth = groundWidth / 2;

basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(5, Quat.getFront(MyAvatar.orientation)));
basePosition.y -= 2


var ground = Entities.addEntity({
	position: Vec3.sum(basePosition, {
		x: 0,
		y: 0,
		z: -floorLength / 2 + 20
	}),
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
MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
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

MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
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

MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
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

MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
examples.push(particleDirectionExample);


//LINES

//static line

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
var lineStaticExample = new LineStaticExample(entityPosition, panelPosition);
lineStaticExample.play();

MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
examples.push(lineStaticExample);

//dynamic line


entityPosition = Vec3.sum(basePosition, {
	x: -0.5,
	y: 2,
	z: -(interExampleZSpace * examples.length)
});

panelPosition = Vec3.sum(basePosition, {
	x: 0,
	y: 2,
	z: -(interExampleZSpace * examples.length + panelZSPace)
});
var lineDynamicExample = new LineDynamicExample(entityPosition, panelPosition);
lineDynamicExample.play();

MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
examples.push(lineDynamicExample);

//MODELS

//animationFPS

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
var modelAnimationExample = new ModelAnimationExample(entityPosition, panelPosition);
modelAnimationExample.play();

MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
examples.push(modelAnimationExample);

//LIGHTS

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
var lightIntensityExample = new LightIntensityExample(entityPosition, panelPosition);
lightIntensityExample.play();

MyAvatar.position = Vec3.sum(MyAvatar.position, {
	x: 0,
	y: 0,
	z: -interExampleZSpace
});
examples.push(lightIntensityExample);


function cleanup() {
	entityList.forEach(function(entity) {
		Entities.deleteEntity(entity);
	});

	examples.forEach(function(example) {
		example.cleanup();
	});
}

Script.scriptEnding.connect(cleanup);