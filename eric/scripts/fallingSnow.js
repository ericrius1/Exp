
var animationSettings = JSON.stringify({
	fps: 30,
	running: true,
	loop: true,
	firstFrame: 1,
	lastFrame: 10000
});

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(1, Quat.getFront(Camera.getOrientation())));
center.y += 3

var emitter = Entities.addEntity({
	type: "ParticleEffect",
	animationSettings: animationSettings,
	position: center,
	textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
	emitRate: 100,
	emitVelocity: {
		x: 0,
		y: 0,
		z: .1
	},
	velocitySpread: {
		x: 0.5,
		y: 0.5,
		z: 1
	},
	emitAcceleration: {
		x: 0,
		y: -0.5,
		z: 0
	},
	accelerationSpread: {
		x: .1,
		y: .2,
		z: .1
	},
	color: {
		red: 250,
		green: 250,
		blue: 250
	},
	lifespan: 100,
	dimensions: {x: 10, y: 10, z: 10}
});



function cleanup() {
	Entities.deleteEntity(emitter);
}



Script.scriptEnding.connect(cleanup);