var song = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/songs/alan%20watts.wav?v2");

MyAvatar.orientation = Quat.fromPitchYawRollRadians(0, 0, 0);
MyAvatar.position = {
	x: 8000,
	y: 8000,
	z: 8000
};

var ZERO_VEC = {
	x: 0,
	y: 0,
	z: 0
};

var animationSettings = JSON.stringify({
	fps: 30,
	frameIndex: 0,
	running: true,
	firstFrame: 0,
	lastFrame: 30,
	loop: true
});

var audioOptions = {
	volume: 0.9,
	position: MyAvatar.position
};
var audioStats = Audio.playSound(song, audioOptions);

var emitters = [];
createEmitters()

function createEmitters() {
	var segments = 10;
	var radius = 1.1;
	var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(MyAvatar.orientation)));
	for (var i = 0; i < segments; i++) {
		var radians = i / segments * (Math.PI * 2);
		var x = center.x + Math.cos(radians) * radius;
		var y = center.y + Math.sin(radians) * radius;

		createEmitter({
			x: x,
			y: y,
			z: center.z
		});
	}

	//create emitters in circle around avatar
}

function createEmitter(position) {
	var emitter = Entities.addEntity({
		type: "ParticleEffect",
		animationSettings: animationSettings,
		position: position,
		emitRate: 50,
		color: {
			red: randInt(150, 250),
			green: 10,
			blue: randInt(10, 100)
		},
		emitVelocity: {
			x: 0,
			y: 0,
			z: 1
		},
		emitAcceleration: ZERO_VEC,
		velocitySpread: {
			x: .3,
			y: .1,
			z: .3
		},
		textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
		dimensions: {
			x: 2,
			y: 2,
			z: 2
		},
		lifespan: 5
	});
	emitters.push(emitter);
}

function update() {
	for(var i = 0; i < emitters.length; i++) {
		Entities.editEntity(emitters[i], {
			particleRadius: audioStats.loudness/15.0 + .01
		});
	}
}


function cleanup() {
	emitters.forEach(function(emitter) {
		Entities.deleteEntity(emitter);
	});
}


function randFloat(min, max) {
	return Math.random() * (max - min) + min;
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

Script.update.connect(update)
Script.scriptEnding.connect(cleanup)