var baseRadius = .04;
var isHolding = false;

var EMITTER_DISTANCE = 3;

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

function createEmitter(position) {

	var animationSettings = JSON.stringify({
		fps: 30,
		running: true,
		loop: true,
		firstFrame: 1,
		lastFrame: 1000

	});
	var emitter = Entities.addEntity({
		type: "ParticleEffect",
		animationSettings: animationSettings,
		position: position,
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
	currentEmitter = emitter;
}



function mousePressEvent(event) {
	if (!event.isLeftButton) {
		isHolding = false;
		return;
	}
	if(!emitterCreated) {
	  var pickRay = Camera.computePickRay(event.x, event.y);
	  var worldPoint = computeWorldPoint(pickRay);
	  createEmitter(worldPoint);	
	  emitterCreated = true;
	}
	isHolding = true;
}

function mouseReleaseEvent() {
	isHolding = false;
}

function mouseMoveEvent(event) {
	if (!isHolding) {
		return;
	}

	var pickRay = Camera.computePickRay(event.x, event.y);
	var worldPoint = computeWorldPoint(pickRay);
	Entities.editEntity(currentEmitter, {position: worldPoint})


}

function computeWorldPoint(pickRay) {
	var addVector = Vec3.multiply(Vec3.normalize(pickRay.direction), EMITTER_DISTANCE);
	return Vec3.sum(pickRay.origin, addVector);
}



function cleanup() {
	emitters.forEach(function(emitter) {
		Entities.deleteEntity(emitter);
	})
}



Script.scriptEnding.connect(cleanup);

Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);
Controller.mouseMoveEvent.connect(mouseMoveEvent);