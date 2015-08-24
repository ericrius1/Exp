

var ZERO_VEC =  {x: 0, y: 0, z: 0};
var SPEED_THRESHOLD = 1;
var slowUpdateTime = 50;
var animationSettings = JSON.stringify({
	fps: 30,
	running: false,
	loop: true,
	firstFrame: 1,
	lastFrame: 10
});

var active = false;
var stopSetting = JSON.stringify({
	running: false
});
var startSetting = JSON.stringify({
	running: true
});

var emitter = Entities.addEntity({
	type: "ParticleEffect",
	animationSettings: animationSettings,
	emitAcceleration: ZERO_VEC,
	velocitySpread: {x: .05, y: .05, z: .05},
	accelerationSpread: {x: 0.05, y: 0.05, z: 0.05},
	emitVelocity: ZERO_VEC,
	emitRate: 100,
	particleRadius: .07,
	color: {red: 220, green: 180, blue: 220},
	dimensions: {x: 2, y: 2, z: 2},
	textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
});

function slowUpdate() {
	var length = Vec3.length(MyAvatar.getVelocity());
	var emitterVelocity = Vec3.multiply(Vec3.normalize(MyAvatar.getVelocity()), -1);
	if( Vec3.length(MyAvatar.getVelocity()) >= SPEED_THRESHOLD ) {
		if(!active){
			Entities.editEntity(emitter, {
				animationSettings: startSetting
			});
			active = true;			
		}
		var position = Vec3.sum(MyAvatar.position, {x: 0, y: 0.3, z: 0});
		Entities.editEntity(emitter, {
			position: position,
			emitVelocity: emitterVelocity,
		});
	}
	else if (Vec3.length(MyAvatar.getVelocity()) < SPEED_THRESHOLD && active === true) {
		active = false;
		print("AHAH")
		Entities.editEntity(emitter, {
			animationSettings: stopSetting
		});
	}
	
}



function cleanup() {
	Entities.deleteEntity(emitter);
}

Script.setInterval(slowUpdate, slowUpdateTime);
Script.scriptEnding.connect(cleanup);