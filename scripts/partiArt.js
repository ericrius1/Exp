var song = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/songs/Made%20In%20Heights%20-%20Forgiveness.wav")

var baseRadius = .04;
var isHolding = false;

var EMITTER_DISTANCE = 3;

var RIGHT_TRIGGER = 1;
var prevRightTriggerValue = 0;
var TRIGGER_THRESHOLD = 0.2;
var triggerHeld = false;

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

var EMITTER_SPEED = 2;

var particleRadius = 0.01;

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
var LOUDNESS_DAMPING = 5;

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
	Entities.editEntity(emitter, {color: colorPalette[currentColorIndex++]});
    if(currentColorIndex === colorPalette.length) {
    	currentColorIndex = 0;
    }
}, 1400);

var currentColorIndex = 0;
var emitter;
createEmitter();

var UP_AXIS = {
	x: 0,
	y: 1,
	z: 0
};

var stopSetting = JSON.stringify({
	running: false
});
var startSetting = JSON.stringify({
	running: true
});


function update() {
	updateControllerState();

	// Entities.editEntity(emitter, {
	// 	particleRadius: audioStats.loudness / LOUDNESS_DAMPING
	// });
	if (triggerHeld) {
		var forward = Controller.getSpatialControlNormal(rightTip);
		Entities.editEntity(emitter, {
			emitAcceleration: Vec3.multiply(forward, -.1),
			position: Controller.getSpatialControlPosition(rightTip),
			emitVelocity: Vec3.multiply(forward	, EMITTER_SPEED)
		});
	}


}



function updateControllerState() {
	rightTriggerValue = Controller.getTriggerValue(RIGHT_TRIGGER);
	if (rightTriggerValue > TRIGGER_THRESHOLD && !triggerHeld) {
		triggerHeld = true;
		startEmitter()
	} else if (rightTriggerValue < TRIGGER_THRESHOLD && prevRightTriggerValue > TRIGGER_THRESHOLD && triggerHeld) {
		triggerHeld = false;
		stopEmitter();
	}

	prevRightTriggerValue = rightTriggerValue;
}

function startEmitter() {
	Entities.editEntity(emitter, {
		animationSettings: startSetting
	});
}

function stopEmitter() {
	Entities.editEntity(emitter, {
		animationSettings: stopSetting
	});
}

function cleanup() {
	Entities.deleteEntity(emitter);
}

function createEmitter(position) {

	var animationSettings = JSON.stringify({
		fps: 30,
		running: true,
		loop: true,
		firstFrame: 1,
		lastFrame: 10
	});
	emitter = Entities.addEntity({
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

}


Script.update.connect(update);
Script.scriptEnding.connect(cleanup);