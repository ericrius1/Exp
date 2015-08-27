var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var rightHandGrabAction = RIGHT_HAND_CLICK;

var rightHandGrabValue = 0;
var prevRightHandGrabValue = 0

var RIGHT = 1;
var RIGHT_TIP = 2 * RIGHT + 1;

var TRIGGER_THRESHOLD = 0.5;

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

var pointer = Overlays.addOverlay("line3d", {
    start: MyAvatar.position,
    end: Vec3.sum(MyAvatar.position, {
        x: 1,
        y: 1,
        z: 1
    }),
    color: NO_INTERSECT_COLOR,
    alpha: 1,
    lineWidth: 1,
    anchor: "MyAvatar",
    visible: false
});

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var testObj = Entities.addEntity({
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

function showPointer(origin) {
    Overlays.editOverlay(pointer, {
        visible: true
    })
}

function update() {

    rightHandGrabValue = Controller.getActionValue(rightHandGrabAction);
    if (rightHandGrabValue > TRIGGER_THRESHOLD &&
        prevRightHandGrabValue < TRIGGER_THRESHOLD) {
        print("TRIGGER")
    } else if (rightHandGrabValue < TRIGGER_THRESHOLD && prevRightHandGrabValue > TRIGGER_THRESHOLD) {
        print("DETRIGGER")
    }

    prevRightHandGrabValue = rightHandGrabValue;


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



Script.update.connect(update)