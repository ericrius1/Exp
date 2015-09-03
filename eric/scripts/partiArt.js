var song = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/songs/Made%20In%20Heights%20-%20Forgiveness.wav")

var baseRadius = .04;
var isHolding = false;

var EMITTER_DISTANCE = 3;

var LEFT_HAND_CLICK = Controller.findAction("LEFT_HAND_CLICK");
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var rightHandGrabValue = 0;
var leftHandGrabValue = 0;


var TRIGGER_THRESHOLD = 0.2;

var rightHandGrabAction = RIGHT_HAND_CLICK;
var leftHandGrabAction = LEFT_HAND_CLICK;

var rightTriggerHeld = false;
var leftTriggerHeld = false;

var animationSettings = JSON.stringify({
	fps: 30,
	running: true,
	loop: true,
	firstFrame: 1,
	lastFrame: 10000
});

var ZERO_VEC = {
	x: 0,
	y: 0,
	z: 0
};

var RIGHT = 1;
var LEFT = 0;

var rightPalm = 2 * RIGHT;
var rightTip = 2 * RIGHT + 1;
var leftPalm = 2 * LEFT;
var leftTip = 2 * LEFT + 1;


var RIGHT_CAST_BUTTON = 15
var LEFT_CAST_BUTTON = 14;

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
	for (var i = 0; i < staticEmitters.length; i++) {
		Entities.editEntity(staticEmitters[i], {
			particleRadius: audioStats.loudness / LEFT_LOUDNESS_DAMPING + 0.01,
		});
	}
	if (leftTriggerHeld) {
		var forward = Vec3.multiply(3, Controller.getSpatialControlNormal(leftTip));
		Entities.editEntity(wandEmitter, {
			emitAcceleration: Vec3.multiply(forward, -.1),
			position: Controller.getSpatialControlPosition(leftTip),
			emitVelocity: Vec3.multiply(forward, EMITTER_SPEED)
		});
	}
	if (rightTriggerHeld) {
		var forward = Quat.getFront(MyAvatar.orientation, 2)
		Entities.editEntity(stickEmitter, {
			position: Vec3.sum(Controller.getSpatialControlPosition(rightTip), forward)
		})
	}

}



function updateControllerState() {
	rightHandGrabValue = Controller.getActionValue(rightHandGrabAction);
	leftHandGrabValue = Controller.getActionValue(leftHandGrabAction);

	// RIGHT HAND
	if (rightHandGrabValue > TRIGGER_THRESHOLD && !rightTriggerHeld) {
		rightTriggerHeld = true
		setStickEmitter();
	} 
	else if (rightHandGrabValue < TRIGGER_THRESHOLD && rightTriggerHeld) {
		rightTriggerHeld = false;
		stopStickEmitter();
	}

	// LEFT HAND
	if (leftHandGrabValue > TRIGGER_THRESHOLD && !leftTriggerHeld) {
		startWandEmitter();
		leftTriggerHeld = true;

	} 
	else if (leftHandGrabValue < TRIGGER_THRESHOLD && leftTriggerHeld) {
		stopWandEmitter();
		leftTriggerHeld = false;

	}

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
		position: Controller.getSpatialControlPosition(rightTip)
	});
}

function stopStickEmitter() {
	Entities.editEntity(stickEmitter, {
		animationSettings: stopSetting
	})
}

function cleanup() {
	Entities.deleteEntity(wandEmitter);
	Entities.deleteEntity(stickEmitter);
	staticEmitters.forEach(function(emitter) {
		Entities.deleteEntity(emitter);
	});
}

function createEmitters() {

	wandEmitter = Entities.addEntity({
		type: "ParticleEffect",
		animationSettings: animationSettings,
		position: HIDDEN_POSITION,
		textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
		emitRate: 100,
		emitVelocity: ZERO_VEC,
		emitAcceleration: ZERO_VEC,
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
		emitVelocity: ZERO_VEC,
		emitAcceleration: ZERO_VEC,
		velocitySpread: {
			x: .02,
			y: .02,
			z: .02
		},
		color: {
			red: 19,
			green: 224,
			blue: 232
		},
		lifespan: 50000,
	});
	var bodyYaw = Quat.safeEulerAngles(MyAvatar.orientation).y
	var forward = Quat.getFront(Quat.fromPitchYawRollDegrees(0, bodyYaw, 0));
	var right = Vec3.cross(forward, UP_AXIS);
	var position = Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), 2));
	position = Vec3.sum(position, right);

}



Script.update.connect(update);
Script.scriptEnding.connect(cleanup);


function randFloat(min, max) {
	return Math.random() * (max - min) + min;
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}