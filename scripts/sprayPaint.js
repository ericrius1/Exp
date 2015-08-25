var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var DISTANCE_IN_FRONT = 0.4
var holdActionId;
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var currentStroke;
var strokeBasePosition;
var strokes = [];
var strokePoints = [];
var strokeNormals = [];
var strokeWidths = [];
var STROKE_WIDTH = 0.05;

var MIN_POINT_DISTANCE = 0.01;

var MAX_POINTS_PER_LINE = 40;

var ZERO_VEC = {
	x: 0,
	y: 0,
	z: 0
};

var holdingTrigger = false;
var painting = false;

var RIGHT = 1;
var RIGHT_TIP = 2 * RIGHT + 1;

var TRIGGER_THRESHOLD = 0.2;
var rightHandGrabAction = RIGHT_HAND_CLICK;
var rightHandGrabValue = 0;
var prevRightHandGrabValue = 0;


// var paintGun = Entities.addEntity({
// 	type: "Model",
// 	modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/sprayGun.fbx?=v2",
// 	position: center,
// 	dimensions: {
// 		x: 0.15,
// 		y: 0.34,
// 		z: 0.03
// 	},
// 	collisionsWillMove: true,
// 	shapeType: 'box'
// });

var whiteboard = Entities.addEntity({
	type: "Box",
	position: center,
	dimensions: {
		x: 2,
		y: 1.5,
		z: .01
	},
	rotation: orientationOf(Vec3.subtract(MyAvatar.position, center)),
	color: {
		red: 250,
		green: 250,
		blue: 250
	},
});


var animationSettings = JSON.stringify({
	fps: 30,
	running: false,
	loop: true,
	firstFrame: 1,
	lastFrame: 10000
});

var paintStream = Entities.addEntity({
	type: "ParticleEffect",
	animationSettings: animationSettings,
	position: center,
	textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
	emitVelocity: ZERO_VEC,
	velocitySpread: {
		x: .05,
		y: .05,
		z: .05
	},
	emitAcceleration: ZERO_VEC,
	emitRate: 1000,
	color: {
		red: 170,
		green: 20,
		blue: 150
	},
	lifespan: 10,
	dimensions: {
		x: .1,
		y: .1,
		z: .1
	}
});



function update() {
	updateControllerState();

	if (!holdingTrigger) {
		return;
	}

	var origin = MyAvatar.getRightPalmPosition();
	var direction = Controller.getSpatialControlNormal(RIGHT_TIP);
	Entities.editEntity(paintStream, {
		position: origin,
		emitVelocity: Vec3.multiply(direction, 3)
	});
	//move origin of ray a bit away from hand so the ray doesnt hit emitter
	origin = Vec3.sum(origin, direction);
	var intersection = getEntityIntersection(origin, direction);
	if (intersection.intersects) {
		//get normal
		// print("PROPS	 " + JSON.stringify(intersection))
		paint(intersection.intersection);
	}
}

function paint(position) {
	if (!painting) {
		newStroke(position)
		painting = true;
	}

	if(strokePoints.length > MAX_POINTS_PER_LINE) {
		painting = false;
		return;
	}
	var localPoint = Vec3.subtract(position, strokeBasePosition);
	if ( strokePoints.length > 0 && Vec3.distance(localPoint, strokePoints[strokePoints.length - 1]) < MIN_POINT_DISTANCE) {
		//Need a minimum distance to avoid binormal NANs
		return;
	}
	print("LOCAL POINT: " + JSON.stringify(localPoint));
	strokePoints.push(localPoint);
	strokeNormals.push({
		x: 0,
		y: 0,
		z: -1
	});
	strokeWidths.push(.1);
	Entities.editEntity(currentStroke, {
		linePoints: strokePoints,
		normals: strokeNormals,
		strokeWidths: strokeWidths
	});
}

function newStroke(position) {
	print("STROKE POSITION:  " + JSON.stringify(position))
	strokeBasePosition = position;
	currentStroke = Entities.addEntity({
		position: position,
		type: "PolyLine",
		color: {
			red: randInt(1, 250),
			green: randInt(1,250),
			blue: randInt(1, 250)
		},
		dimensions: {
			x: 2,
			y: 2,
			z: 2
		},
		lifetime: 100
	});
	strokePoints = [];
	strokeNormals = [];
	strokeWidths = [];

}

function getEntityIntersection(origin, direction) {
	var pickRay = {
		origin: origin,
		direction: direction
	};
	return Entities.findRayIntersection(pickRay, true);
}

function updateControllerState() {
	rightHandGrabValue = Controller.getActionValue(rightHandGrabAction);
	if (rightHandGrabValue > TRIGGER_THRESHOLD && prevRightHandGrabValue < TRIGGER_THRESHOLD) {
		holdingTrigger = true;
	} else if (rightHandGrabValue < TRIGGER_THRESHOLD && prevRightHandGrabValue > TRIGGER_THRESHOLD) {
		holdingTrigger = false;
		painting = false;
	}
	prevRightHandGrabValue = rightHandGrabValue
}


function orientationOf(vector) {
	var Y_AXIS = {
		x: 0,
		y: 1,
		z: 0
	};
	var X_AXIS = {
		x: 1,
		y: 0,
		z: 0
	};

	var theta = 0.0;

	var RAD_TO_DEG = 180.0 / Math.PI;
	var direction, yaw, pitch;
	direction = Vec3.normalize(vector);
	yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
	pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
	return Quat.multiply(yaw, pitch);
}

function cleanup() {
	Entities.deleteEntity(whiteboard);
	Entities.deleteEntity(paintStream);
}

Script.scriptEnding.connect(cleanup);
Script.update.connect(update);

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}