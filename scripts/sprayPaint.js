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
var STROKE_WIDTH = 0.02;

var DISTANCE_THRESHOLD = 20;

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
    loop: true,
    firstFrame: 1,
    lastFrame: 10000
});

var stopSetting = JSON.stringify({
    running: false
});
var startSetting = JSON.stringify({
    running: true
});


var paintStream = Entities.addEntity({
    type: "ParticleEffect",
    animationSettings: animationSettings,
    position: center,
    textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
    emitVelocity: ZERO_VEC,
    emitAcceleration: ZERO_VEC,
    velocitySpread: {x: .02, y:.02, z: 0.02},
    emitRate: 100,
    particleRadius: 0.01,
    color: {
        red: 170,
        green: 20,
        blue: 150
    },
    lifespan: 5,
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
        emitVelocity: Vec3.multiply(direction, 5)
    });
    //move origin of ray a bit away from hand so the ray doesnt hit emitter
    origin = Vec3.sum(origin, direction);
    var intersection = getEntityIntersection(origin, direction);
    if (intersection.intersects && intersection.distance < DISTANCE_THRESHOLD) {
        //get normal
        // print("PROPS	 " + JSON.stringify(intersection))
        //Add a little delay to let particles hit surface
        // var position = intersection.intersection;
        // var normal = Vec3.multiply(-1, Quat.getFront(intersection.properties.rotation));
        // paint(position, normal);
        (function() {
            var position = intersection.intersection;
            var normal = Vec3.multiply(-1, Quat.getFront(intersection.properties.rotation));
            Script.setTimeout(function() {
                if (!holdingTrigger) {
                    return;
                }
                paint(position, normal);
            }, 300)
        })();
    }
}


function paint(position, normal) {
    if (!painting) {
        // print("NEW LINE")
        newStroke(position)
        painting = true;
    }

    if (strokePoints.length > MAX_POINTS_PER_LINE) {
        painting = false;
        return;
    }
    var localPoint = Vec3.subtract(position, strokeBasePosition);
    //Move to stroke a bit forward along the normal so it doesnnt zfight with mesh its drawing on
    localPoint = Vec3.sum(localPoint, Vec3.multiply(normal, .1));
    if (strokePoints.length > 0 && Vec3.distance(localPoint, strokePoints[strokePoints.length - 1]) < MIN_POINT_DISTANCE) {
        //Need a minimum distance to avoid binormal NANs
        return;
    }
    strokePoints.push(localPoint);
    strokeNormals.push(normal);
    strokeWidths.push(STROKE_WIDTH);
    Entities.editEntity(currentStroke, {
        linePoints: strokePoints,
        normals: strokeNormals,
        strokeWidths: strokeWidths
    });
}

function newStroke(position) {
    strokeBasePosition = position;
    currentStroke = Entities.addEntity({
        position: position,
        type: "PolyLine",
        color: {
            red: randInt(160, 250),
            green: randInt(10, 20),
            blue: randInt(190, 250)
        },
        dimensions: {
            x: 5,
            y: 5,
            z: 5
        },
        lifetime: 100
    });
    strokePoints = [];
    strokeNormals = [];
    strokeWidths = [];

    strokes.push(currentStroke);

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
        Entities.editEntity(paintStream, {
            animationSettings: startSetting
        });
    } else if (rightHandGrabValue < TRIGGER_THRESHOLD && prevRightHandGrabValue > TRIGGER_THRESHOLD) {
        holdingTrigger = false;
        painting = false;
        Entities.editEntity(paintStream, {
            animationSettings: stopSetting
        })
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

    strokes.forEach(function(stroke) {
        Entities.deleteEntity(stroke);
    });
}

Script.scriptEnding.connect(cleanup);
Script.update.connect(update);

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}