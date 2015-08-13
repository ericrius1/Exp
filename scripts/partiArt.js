var song = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/songs/Made%20In%20Heights%20-%20Forgiveness.wav")

var baseRadius = .04;
var isHolding = false;

var EMITTER_DISTANCE = 3;

var RIGHT_TRIGGER = 1;
var prevRightTriggerValue = 0;
var TRIGGER_THRESHOLD = 0.2;
var rightTriggerHeld = false;

var LEFT_TRIGGER = 0;
var prevLeftTriggerValue = 0;
var TRIGGER_THRESHOLD = 0.2;
var leftTriggerHeld = false;

var RIGHT = 1;
var LEFT = 0;
var RIGHT_BUTTON_1 = 7
var RIGHT_BUTTON_2 = 8
var RIGHT_BUTTON_3 = 9;
var RIGHT_BUTTON_4 = 10
var LEFT_BUTTON_1 = 1;
var LEFT_BUTTON_2 = 2;
var LEFT_BUTTON_3 = 3;
var LEFT_BUTTON_4 = 4;
var rightPalm = 2 * RIGHT;
var rightTip = 2 * RIGHT + 1;
var leftPalm = 2 * LEFT;
var leftTip = 2 * LEFT + 1;

var EMITTER_SPEED = 0.5;

var particleRadius = 0.01;

var UP_AXIS = {
	x: 0,
	y: 1,
	z: 0
};

var HIDDEN_POSITION = {
	x: 7000,
	y: 7000,
	z: 7000
};


var audioOptions = {
	volume: 0.9,
	position: MyAvatar.position
};
var audioStats = Audio.playSound(song, audioOptions);
var RIGHT_LOUDNESS_DAMPING = 5;
var LEFT_LOUDNESS_DAMPING = 20;

var colorPalette = [{
	red: 0,
	green: 123,
	blue: 167
}, {
	red: 41,
	green: 82,
	blue: 190
}, {
	red: 110,
	green: 155,
	blue: 192
}];



Script.setInterval(function() {
	Entities.editEntity(wandEmitter, {
		color: colorPalette[currentColorIndex++]
	});
	if (currentColorIndex === colorPalette.length) {
		currentColorIndex = 0;
	}
}, 1400);

var currentColorIndex = 0;
var wandEmitter;
var stickEmitter;
var staticEmitters = [];

createEmitters();



var stopSetting = JSON.stringify({
	running: false
});
var startSetting = JSON.stringify({
	running: true
});


function update() {
	updateControllerState();

	Entities.editEntity(wandEmitter, {
		particleRadius: audioStats.loudness / RIGHT_LOUDNESS_DAMPING
	});
	Entities.editEntity(stickEmitter, {
		particleRadius: audioStats.loudness / LEFT_LOUDNESS_DAMPING + .01
	});
	Entities.editEntity(staticEmitters[0], {
		particleRadius: audioStats.loudness/LEFT_LOUDNESS_DAMPING + 0.01,
	})
	if (rightTriggerHeld) {
		var forward = Controller.getSpatialControlNormal(rightTip);
		Entities.editEntity(wandEmitter, {
			emitAcceleration: Vec3.multiply(forward, -.1),
			position: Controller.getSpatialControlPosition(rightTip),
			emitVelocity: Vec3.multiply(forward, EMITTER_SPEED)
		});
	}
	if (leftTriggerHeld) {


	}

}




function updateControllerState() {
	rightTriggerValue = Controller.getTriggerValue(RIGHT_TRIGGER);
	if (rightTriggerValue > TRIGGER_THRESHOLD && !rightTriggerHeld) {
		rightTriggerHeld = true;
		startWandEmitter()
	} else if (rightTriggerValue < TRIGGER_THRESHOLD && prevRightTriggerValue > TRIGGER_THRESHOLD && rightTriggerHeld) {
		rightTriggerHeld = false;
		stopWandEmitter();
	}

	prevRightTriggerValue = rightTriggerValue;

	leftTriggerValue = Controller.getTriggerValue(LEFT_TRIGGER);
	if (leftTriggerValue > TRIGGER_THRESHOLD && !leftTriggerHeld) {
		leftTriggerHeld = true;
		setStickEmitter();
	} else if (rightTriggerValue < TRIGGER_THRESHOLD && prevLeftTriggerValue > TRIGGER_THRESHOLD && leftTriggerHeld) {
		leftTriggerHeld = false;
	}

	prevLeftTriggerValue = leftTriggerValue;
}

function startWandEmitter() {
	Entities.editEntity(wandEmitter, {
		animationSettings: startSetting
	});
}

function stopWandEmitter() {
	Entities.editEntity(wandEmitter, {
		animationSettings: stopSetting
	});
}

function setStickEmitter() {
	
		Entities.editEntity(stickEmitter, {
			animationSettings: startSetting,
			position: Controller.getSpatialControlPosition(leftTip)
		});
}

function cleanup() {
	Entities.deleteEntity(wandEmitter);
	Entities.deleteEntity(stickEmitter);
	staticEmitters.forEach(function(emitter) {
		Entities.deleteEntity(emitter);
	});
}

function createEmitters() {

	var animationSettings = JSON.stringify({
		fps: 30,
		running: true,
		loop: true,
		firstFrame: 1,
		lastFrame: 10000
	});
	wandEmitter = Entities.addEntity({
		type: "ParticleEffect",
		animationSettings: animationSettings,
		position: HIDDEN_POSITION,
		textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
		emitRate: 100,
		velocitySpread: {
			x: .1,
			y: .1,
			z: .1
		},
		accelerationSpread: {
			x: 1,
			y: 1,
			z: 1
		},
		color: colorPalette[currentColorIndex],
		lifespan: 10,
	});

	stickEmitter = Entities.addEntity({
		type: "ParticleEffect",
		animationSettings: animationSettings,
		position: HIDDEN_POSITION,
		textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
		emitRate: 200,
		velocitySpread: {
			x: .02,
			y: .02,
			z: .02
		},
		color: {red: 19, green: 224, blue: 232},
		lifespan: 50000,
	});
	var bodyYaw = Quat.safeEulerAngles(MyAvatar.orientation).y
	var forward = Quat.getFront(Quat.fromPitchYawRollDegrees(0, bodyYaw, 0));
	print("forward " + JSON.stringify(forward))
	var right = Vec3.cross(UP_AXIS, forward);
	print("RIGHT " + JSON.stringify(right))
	var staticBasePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront( MyAvatar.orientation), 2));
	staticBasePosition.y -= 1;
	for(var i =0; i < 3; i++){
		print(JSON.stringify(staticBasePosition));
		var emitter= Entities.addEntity({
			type: "ParticleEffect",
			animationSettings: animationSettings,
			position: staticBasePosition,
			textures: "https://raw.githubusercontent.com/ericrius1/PlatosCave/gh-pages/assets/star.png",
			emitRate: 200,
			emitVelocity: {x: 0, y: 2, z: 0 },
			velocitySpread: {
				x: .1,
				y: .1,
				z: .1
			},
			emitAcceleration: {x: 0, y: -1, z: 0},
			color: {red: 19, green: 224, blue: 232},
			lifespan: 50000,
		});
		staticBasePosition = Vec3.sum(staticBasePosition, right);

		staticEmitters.push(emitter);
		
	}

}


Script.update.connect(update);
Script.scriptEnding.connect(cleanup);