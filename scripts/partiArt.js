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

var EMITTER_SPEED = 0.5;

var particleRadius = 0.01;

var HIDDEN_POSITION = {x: -100, y: -100, z: -100};

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

var emitters = [];
var currentEmitter;

var emitterCreated = false;
var emitter;
createEmitter();


function update() {
	updateControllerState();
	if (triggerHeld) {
		Entities.editEntity(emitter, {
			position: Controller.getSpatialControlPosition(rightTip),
			emitVelocity: Vec3.multiply(Controller.getSpatialControlNormal(rightTip), EMITTER_SPEED),
			particleRadius: particleRadius
		});
	}
}

function updateControllerState() {
	rightTriggerValue = Controller.getTriggerValue(RIGHT_TRIGGER);
	if (rightTriggerValue > TRIGGER_THRESHOLD && !triggerHeld) {
		triggerHeld = true;
	} else if (rightTriggerValue < TRIGGER_THRESHOLD && prevRightTriggerValue > TRIGGER_THRESHOLD && triggerHeld) {
		triggerHeld = false;
		// Entities.editEntity(emitter, {position: HIDDEN_POSITION});
	}

	prevRightTriggerValue = rightTriggerValue;
}

function cleanup() {
	emitters.forEach(function(emitter) {
		Entities.deleteEntity(emitter);
	})
}

function createEmitter(position) {

	var animationSettings = JSON.stringify({
		fps: 30,
		running: true,
		loop: true,
		firstFrame: 1,
		lastFrame: 1000

	});
	emitter = Entities.addEntity({
		type: "ParticleEffect",
		animationSettings: animationSettings,
		position: HIDDEN_POSITION,
		textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
		emitRate: 100,
		velocitySpread: {x: .2, y: .1, z: .2},
		accelerationSpread: {x: .1, y: .2, z: .1},
		//color: colorPalette[0],
		color: {red: 250, green: 250, blue: 250},
		lifespan: 10,
	});

	emitters.push(emitter);
}


Script.update.connect(update);
Script.scriptEnding.connect(cleanup);