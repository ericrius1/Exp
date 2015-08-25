var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var DISTANCE_IN_FRONT = 0.4
var holdActionId;
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");

var ZERO_VEC = {x: 0, y: 0 , z: 0};

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
	dimensions: {x: 2, y: 1.5, z: .1},
	rotation: orientationOf(Vec3.subtract(MyAvatar.position, center)),
	color: {red: 250, green: 250, blue: 250},
});	


var animationSettings = JSON.stringify({
	fps: 30,
	running: true,
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
	color: {red: 170, green: 20, blue: 150},
	lifespan: 10,
	dimensions: {x: .1, y: .1, z:.1}
});



function update() {
    updateControllerState();

    if(!painting){
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
    if (intersection.intersects){
    	print(JSON.stringify(intersection.entityID))
    }
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
		painting = true;
	} else if (rightHandGrabValue < TRIGGER_THRESHOLD && prevRightHandGrabValue > TRIGGER_THRESHOLD) {
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