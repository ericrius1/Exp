//sticking with right hand for now for simplicity

var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var rightHandGrabAction = RIGHT_HAND_CLICK;

var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}

var rightHandGrabValue = 0;
var prevRightHandGrabValue = 0

var RIGHT = 1;
var RIGHT_TIP = 2 * RIGHT + 1;

var LINE_LENGTH = 500;

var SHOW_LINE_THRESHOLD = 0.2;

var NO_INTERSECT_COLOR = {
    red: 10,
    green: 10,
    blue: 255
};
var INTERSECT_COLOR = {
    red: 250,
    green: 10,
    blue: 10
};

var holding = true;

var pointer = Entities.addEntity({
    type: "Line",
    color: NO_INTERSECT_COLOR,
    dimensions: {
        x: 1000,
        y: 1000,
        z: 1000
    },
    visible: false
});

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var testObj = Entities.addEntity({
    type: "Box",
    position: center,
    dimensions: {
        x: 1,
        y: 0.5,
        z: .01
    },
    rotation: orientationOf(Vec3.subtract(MyAvatar.position, center)),
    color: {
        red: 250,
        green: 250,
        blue: 250
    },
});

function castRay() {
    var handPosition = MyAvatar.getRightPalmPosition();
    var direction = Controller.getSpatialControlNormal(RIGHT_TIP);
    //move origin a bit away from hand so nothing gets in way
    var rayOrigin = Vec3.sum(handPosition, direction);
    var pickRay = {
        origin: rayOrigin,
        direction: direction
    };

    Entities.editEntity(pointer, {
        position: handPosition,
        linePoints: [
            ZERO_VEC,
            Vec3.multiply(direction, LINE_LENGTH)
        ]
    });

    var intersection = Entities.findRayIntersection(pickRay, true);

    if (intersection.intersects) {
        var length = Vec3.length(Vec3.subtract(intersection.intersection, handPosition));
        Entities.editEntity(pointer, {
            color: INTERSECT_COLOR,
            linePoints: [
                ZERO_VEC,
                Vec3.multiply(direction, length)
            ]
        });
    } else {
        Entities.editEntity(pointer, {
            color: NO_INTERSECT_COLOR
        });
    }

}


function showPointer(origin) {
    Entities.editEntity(pointer, {
        visible: true
    })
}

function update() {

    rightHandGrabValue = Controller.getActionValue(rightHandGrabAction);
    if (rightHandGrabValue > SHOW_LINE_THRESHOLD &&
        prevRightHandGrabValue < SHOW_LINE_THRESHOLD) {
        holding = true
        showPointer();
    } else if (rightHandGrabValue < SHOW_LINE_THRESHOLD && prevRightHandGrabValue > SHOW_LINE_THRESHOLD) {
        holding = false;
        hidePointer();
    }

    if (holding) {
        castRay();
    }
    prevRightHandGrabValue = rightHandGrabValue;


}

function showPointer() {
    Entities.editEntity(pointer, {
        visible: true
    });
}

function hidePointer() {
    Entities.editEntity(pointer, {
        visible: false
    });
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
    Entities.editEntity(pointer);
    Entities.deleteEntity(testObj);
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update)