//  handGrab.js
//  examples
//
//  Created by Sam Gondelman on 8/3/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Allow avatar to grab the closest object to each hand and throw them
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
Script.include("http://s3.amazonaws.com/hifi-public/scripts/libraries/toolBars.js");

HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}
var nullActionID = "00000000-0000-0000-0000-000000000000";
var controllerID;
var controllerActive;
var leftHandObjectID = null;
var rightHandObjectID = null;
var leftHandActionID = nullActionID;
var rightHandActionID = nullActionID;

var TRIGGER_THRESHOLD = 0.5;
var GRAB_RADIUS = 0.2;

var LEFT_HAND_CLICK = Controller.findAction("LEFT_HAND_CLICK");
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");

var activeHand = null;

var rightHandGrabAction = RIGHT_HAND_CLICK;
var leftHandGrabAction = LEFT_HAND_CLICK;

var rightHandGrabValue = 0;
var leftHandGrabValue = 0;
var prevRightHandGrabValue = 0
var prevLeftHandGrabValue = 0;


var RIGHT = 1;
var RIGHT_TIP = 2 * RIGHT + 1;

var LEFT = 1;
var LEFT_TIP = 2 * LEFT + 1;

var grabColor = {
    red: 0,
    green: 255,
    blue: 0
};
var releaseColor = {
    red: 0,
    green: 0,
    blue: 255
};


var overlays = false;
var leftHandOverlay;
var rightHandOverlay;
if (overlays) {
    leftHandOverlay = Overlays.addOverlay("sphere", {
        position: MyAvatar.getLeftPalmPosition(),
        size: GRAB_RADIUS,
        color: releaseColor,
        alpha: 0.5,
        solid: false
    });
    rightHandOverlay = Overlays.addOverlay("sphere", {
        position: MyAvatar.getRightPalmPosition(),
        size: GRAB_RADIUS,
        color: releaseColor,
        alpha: 0.5,
        solid: false
    });
}

var LEFT = 0;
var RIGHT = 1;

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


function letGo(hand) {
    var actionIDToRemove = (hand == LEFT) ? leftHandActionID : rightHandActionID;
    var entityIDToEdit = (hand == LEFT) ? leftHandObjectID : rightHandObjectID;
    var handVelocity = (hand == LEFT) ? MyAvatar.getLeftPalmVelocity() : MyAvatar.getRightPalmVelocity();
    var handAngularVelocity = (hand == LEFT) ? MyAvatar.getLeftPalmAngularVelocity() :
        MyAvatar.getRightPalmAngularVelocity();
    if (actionIDToRemove != nullActionID && entityIDToEdit != null) {
        Entities.deleteAction(entityIDToEdit, actionIDToRemove);
        // TODO: upon successful letGo, restore collision groups
        if (hand == LEFT) {
            leftHandObjectID = null;
            leftHandActionID = nullActionID;
        } else {
            rightHandObjectID = null;
            rightHandActionID = nullActionID;
        }
    }
}

function setGrabbedObject(hand) {
    var handPosition = (hand == LEFT) ? MyAvatar.getLeftPalmPosition() : MyAvatar.getRightPalmPosition();
    var entities = Entities.findEntities(handPosition, GRAB_RADIUS);
    var objectID = null;
    var minDistance = GRAB_RADIUS;
    for (var i = 0; i < entities.length; i++) {
        // Don't grab the object in your other hands
        if ((hand == LEFT && entities[i] == rightHandObjectID) ||
            (hand == RIGHT && entities[i] == leftHandObjectID)) {
            continue;
        } else {
            var distance = Vec3.distance(Entities.getEntityProperties(entities[i]).position, handPosition);
            if (distance <= minDistance) {
                objectID = entities[i];
                minDistance = distance;
            }
        }
    }
    if (objectID == null) {
        //We weren't in range of any object, so show laser instead
        showPointer(handPosition);
        return false;
    }
    if (hand == LEFT) {
        leftHandObjectID = objectID;
    } else {
        rightHandObjectID = objectID;
    }
    print("OBJECT ID " + objectID)
    return true;
}

function showPointer(origin) {
    Overlays.editOverlay(pointer, {
        visible: true
    })
}

function grab(hand) {
    if (!setGrabbedObject(hand)) {
        return;
    }
    var objectID = (hand == LEFT) ? leftHandObjectID : rightHandObjectID;
    var handRotation = (hand == LEFT) ? MyAvatar.getLeftPalmRotation() : MyAvatar.getRightPalmRotation();
    var handPosition = (hand == LEFT) ? MyAvatar.getLeftPalmPosition() : MyAvatar.getRightPalmPosition();


    var objectRotation = Entities.getEntityProperties(objectID).rotation;
    var offsetRotation = Quat.multiply(Quat.inverse(handRotation), objectRotation);

    var objectPosition = Entities.getEntityProperties(objectID).position;
    var offset = Vec3.subtract(objectPosition, handPosition);
    var offsetPosition = Vec3.multiplyQbyV(Quat.inverse(Quat.multiply(handRotation, offsetRotation)), offset);
    // print(JSON.stringify(offsetPosition));
    var actionID = Entities.addAction("hold", objectID, {
        relativePosition: offsetPosition,
        relativeRotation: offsetRotation,
        hand: (hand == LEFT) ? "left" : "right",
        timeScale: 0.05
    });
    if (actionID == nullActionID) {
        if (hand == LEFT) {
            leftHandObjectID = null;
        } else {
            rightHandObjectID = null;
        }
    } else {
        if (hand == LEFT) {
            leftHandActionID = actionID;
        } else {
            rightHandActionID = actionID;
        }
    }
}

function updatePointer() {
    // var handPosition = Controller.getSpatialControlPosition(2 * activeHand)
    var handPosition = MyAvatar.getRightPalmPosition();
    var direction = Controller.getSpatialControlNormal(2 * activeHand + 1);
    Overlays.editOverlay(pointer, {
        start: handPosition,
        end: Vec3.sum(handPosition, direction)
    });

    var pickRay = {
        origin: handPosition,
        direction: direction
    };
    var intersection = Entities.findRayIntersection(pickRay, true);
    if (intersection.intersects) {
        print('intersect')
        Overlays.editOverlay(pointer, {
            color: INTERSECT_COLOR
        });
    } else {
        Overlays.editOverlay(pointer, {
            color: NO_INTERSECT_COLOR
        });
    }

}

function hidePointer() {
    Overlays.editOverlay(pointer, {
        visible: false,
    });
}

function update(deltaTime) {
    if (overlays) {
        Overlays.editOverlay(leftHandOverlay, {
            position: MyAvatar.getLeftPalmPosition()
        });
        Overlays.editOverlay(rightHandOverlay, {
            position: MyAvatar.getRightPalmPosition()
        });
    }


    rightHandGrabValue = Controller.getActionValue(rightHandGrabAction);
    leftHandGrabValue = Controller.getActionValue(leftHandGrabAction);

    if (rightHandGrabValue > TRIGGER_THRESHOLD &&
        prevRightHandGrabValue < TRIGGER_THRESHOLD) {
        if (overlays) {
            Overlays.editOverlay(rightHandOverlay, {
                color: grabColor
            });
        }
        grab(RIGHT);
        activeHand = RIGHT;
    } else if (rightHandGrabValue < TRIGGER_THRESHOLD &&
        prevRightHandGrabValue > TRIGGER_THRESHOLD) {
        if (overlays) {
            Overlays.editOverlay(rightHandOverlay, {
                color: releaseColor
            });
        }
        letGo(RIGHT);
        activeHand = null;
        hidePointer();
    }

    if (leftHandGrabValue > TRIGGER_THRESHOLD &&
        prevLeftHandGrabValue < TRIGGER_THRESHOLD) {
        if (overlays) {
            Overlays.editOverlay(leftHandOverlay, {
                color: grabColor
            });
        }
        grab(LEFT);
        activeHand = LEFT;
    } else if (leftHandGrabValue < TRIGGER_THRESHOLD &&
        prevLeftHandGrabValue > TRIGGER_THRESHOLD) {
        if (overlays) {
            Overlays.editOverlay(leftHandOverlay, {
                color: releaseColor
            });
        }
        letGo(LEFT);
        activeHand = null;
        hidePointer();
    }

    if (activeHand !== null) {
        updatePointer();
    }

    prevRightHandGrabValue = rightHandGrabValue;
    prevLeftHandGrabValue = leftHandGrabValue;
}

function cleanUp() {
    letGo(RIGHT);
    letGo(LEFT);
    if (overlays) {
        Overlays.deleteOverlay(leftHandOverlay);
        Overlays.deleteOverlay(rightHandOverlay);
    }
    Overlays.deleteOverlay(pointer);
    Entities.deleteEntity(testObj);
}


randFloat = function(low, high) {
    return low + Math.random() * (high - low);
}

randInt = function(low, high) {
    return Math.floor(randFloat(low, high));
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



Script.scriptEnding.connect(cleanUp);
Script.update.connect(update);