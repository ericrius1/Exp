var baseRadius = .04;
var isHolding = false;

var EMITTER_DISTANCE = 3;

var RIGHT_TRIGGER = 1;
var prevRightTriggerValue = 0;
var TRIGGER_THRESHOLD = 0.2;
var triggerHeld = false;
var rightControllerId = 3;
var leftControllerId = 4;

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


function computeWorldPoint(pickRay) {
	var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), EMITTER_DISTANCE);
	return Vec3.sum(pickRay.origin, addVector);
}

function update() {
	updateControllerState();
	if (triggerHeld) {
		Entities.editEntity(emitter, {position: Controller.getSpatialControlPosition(rightControllerId)});
	}
}

function updateControllerState() {
	rightTriggerValue = Controller.getTriggerValue(RIGHT_TRIGGER);
	if (rightTriggerValue > TRIGGER_THRESHOLD && !triggerHeld) {
		triggerHeld = true;
	} else if (rightTriggerValue < TRIGGER_THRESHOLD && prevRightTriggerValue > TRIGGER_THRESHOLD && triggerHeld) {
		triggerHeld = false;
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
		textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
		emitRate: 100,
		emitVelocity: {
			x: 0,
			y: 1,
			z: 0
		},
		velocitySpread: {
			x: 1,
			y: 0.5,
			z: 1
		},
		emitAcceleration: {
			x: 0,
			y: -1,
			z: 1
		},
		color: colorPalette[0],
		lifespan: 100,
	});

	emitters.push(emitter);
}


Script.update.connect(update);
Script.scriptEnding.connect(cleanup);