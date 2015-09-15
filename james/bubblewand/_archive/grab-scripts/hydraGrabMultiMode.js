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

var console = {};
console.log = function(p) {
        if (arguments.length > 1) {

            for (var i = 1; i < arguments.length; i++) {
                print(arguments[i])
            }

        } else {
            print(p)
        }

    }
    //

print("started loading...");



Script.include("http://s3.amazonaws.com/hifi-public/scripts/libraries/toolBars.js");

HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";

var nullActionID = "00000000-0000-0000-0000-000000000000";
var controllerID;
var controllerActive;
var leftHandObjectID = null;
var rightHandObjectID = null;
var leftHandActionID = nullActionID;
var rightHandActionID = nullActionID;

var TRIGGER_THRESHOLD = 0.2;
var GRAB_RADIUS = 0.5;

var LEFT_HAND_CLICK = Controller.findAction("LEFT_HAND_CLICK");
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var ACTION1 = Controller.findAction("ACTION1");
var ACTION2 = Controller.findAction("ACTION2");

var rightHandGrabAction = RIGHT_HAND_CLICK;
var leftHandGrabAction = LEFT_HAND_CLICK;

var rightHandGrabValue = 0;
var leftHandGrabValue = 0;
var prevRightHandGrabValue = 0
var prevLeftHandGrabValue = 0;

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

var toolBar = new ToolBar(0, 0, ToolBar.vertical, "highfidelity.toybox.toolbar", function() {
    return {
        x: 100,
        y: 380
    };
});

var overlays = true;
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


var wand;

function spawnWand() {
    console.log('spawning wand')
    wand = Entities.addEntity({
        type: 'Box',
        shapeType: "box",
        position: MyAvatar.position,
        dimensions: {
            x: 0.5,
            y: 0.5,
            z: 0.5
        },

        gravity: {
            x: 0,
            y: 0,
            z: 0
        },
        damping: 0.1,
        restitution: 0.01,
        density: 0.5,
        collisionsWillMove: true,
        color: {
            red: randInt(0, 255),
            green: randInt(0, 255),
            blue: randInt(0, 255)
        },
        script: 'http://hifi-public.s3.amazonaws.com/james/scripts/bubbleEntity.js?1223'
    });
}

function letGo(hand) {
    var actionIDToRemove = (hand === LEFT) ? leftHandActionID : rightHandActionID;
    var entityIDToEdit = (hand === LEFT) ? leftHandObjectID : rightHandObjectID;
    var handVelocity = (hand === LEFT) ? MyAvatar.getLeftPalmVelocity() : MyAvatar.getRightPalmVelocity();
    var handAngularVelocity = (hand === LEFT) ? MyAvatar.getLeftPalmAngularVelocity() :
        MyAvatar.getRightPalmAngularVelocity();
    if (actionIDToRemove != nullActionID && entityIDToEdit != null) {
        Entities.deleteAction(entityIDToEdit, actionIDToRemove);
        var avatarID = JSON.stringify(MyAvatar.sessionUUID);
        var UUID = Entities.getEntityProperties(wand).name;
        if (UUID === avatarID) {
            console.log('I ALREADY AM HOLDING, RELEASE IT!')

            Entities.editEntity(wand, {
                name: "",

            })
        }
        // TODO: upon successful letGo, restore collision groups
        if (hand === LEFT) {
            leftHandObjectID = null;
            leftHandActionID = nullActionID;
        } else {
            rightHandObjectID = null;
            rightHandActionID = nullActionID;
        }
    }
}

function setGrabbedObject(hand) {
    var handPosition = (hand === LEFT) ? MyAvatar.getLeftPalmPosition() : MyAvatar.getRightPalmPosition();
    var entities = Entities.findEntities(handPosition, GRAB_RADIUS);
    var objectID = null;
    var minDistance = GRAB_RADIUS;
    for (var i = 0; i < entities.length; i++) {
        // Don't grab the object in your other hands
        if ((hand === LEFT && entities[i] === rightHandObjectID) ||
            (hand === RIGHT && entities[i] === leftHandObjectID)) {
            continue;
        } else {
            var distance = Vec3.distance(Entities.getEntityProperties(entities[i]).position, handPosition);
            if (distance <= minDistance) {
                objectID = entities[i];
                minDistance = distance;
            }
        }
    }
    if (objectID === null) {
        return false;
    }
    if (hand === LEFT) {
        leftHandObjectID = objectID;
    } else {
        rightHandObjectID = objectID;
    }
    return true;
}

function grab(hand) {
    console.log('attempting grab')
    if (!setGrabbedObject(hand)) {
        console.log('DIDNT GRAB');
        return;
    }

    var objectID = (hand === LEFT) ? leftHandObjectID : rightHandObjectID;
    print("OBJECTID " + objectID);
    var handRotation = (hand === LEFT) ? MyAvatar.getLeftPalmRotation() : MyAvatar.getRightPalmRotation();
    var handPosition = (hand === LEFT) ? MyAvatar.getLeftPalmPosition() : MyAvatar.getRightPalmPosition();

    var objectRotation = Entities.getEntityProperties(objectID).rotation;
    var offsetRotation = Quat.multiply(Quat.inverse(handRotation), objectRotation);

    var objectPosition = Entities.getEntityProperties(objectID).position;
    var offset = Vec3.subtract(objectPosition, handPosition);
    var offsetPosition = Vec3.multiplyQbyV(Quat.inverse(Quat.multiply(handRotation, offsetRotation)), offset);
    // print(JSON.stringify(offsetPosition));
    var actionID = Entities.addAction("hold", objectID, {
        relativePosition: offsetPosition,
        relativeRotation: offsetRotation,
        hand: (hand === LEFT) ? "left" : "right",
        timeScale: 0.05
    });
    var avatarID = JSON.stringify(MyAvatar.sessionUUID);
    var UUID = Entities.getEntityProperties(wand).name;
    if (UUID === "") {
        console.log('PICK IT UP AND ASSIGN IT TO ME')

        Entities.editEntity(wand, {
            name: avatarID,

        })
        Entities.editEntity(wand, {
            color: {
                red: randInt(1, 255),
                blue: randInt(1, 255),
                green: randInt(1, 255)
            },


        })
    } else if (UUID !== avatarID) {
        console.log('CANT GRAB ITS NOT MINE')
    }


    if (actionID === nullActionID) {
        if (hand === LEFT) {
            leftHandObjectID = null;
        } else {
            rightHandObjectID = null;
        }
    } else {
        // TODO: upon successful grab, add to collision group so object doesn't collide with immovable entities
        if (hand === LEFT) {
            leftHandActionID = actionID;
        } else {
            rightHandActionID = actionID;
        }
    }
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
    } else if (rightHandGrabValue < TRIGGER_THRESHOLD &&
        prevRightHandGrabValue > TRIGGER_THRESHOLD) {
        if (overlays) {
            Overlays.editOverlay(rightHandOverlay, {
                color: releaseColor
            });
        }
        letGo(RIGHT);
    }

    if (leftHandGrabValue > TRIGGER_THRESHOLD &&
        prevLeftHandGrabValue < TRIGGER_THRESHOLD) {
        if (overlays) {
            Overlays.editOverlay(leftHandOverlay, {
                color: grabColor
            });
        }
        grab(LEFT);
    } else if (leftHandGrabValue < TRIGGER_THRESHOLD &&
        prevLeftHandGrabValue > TRIGGER_THRESHOLD) {
        if (overlays) {
            Overlays.editOverlay(leftHandOverlay, {
                color: releaseColor
            });
        }
        letGo(LEFT);
    }

    prevRightHandGrabValue = rightHandGrabValue;
    prevLeftHandGrabValue = leftHandGrabValue;
}

function cleanUp() {
    Entities.deleteEntity(wand);
    letGo(RIGHT);
    letGo(LEFT);
    if (overlays) {
        Overlays.deleteOverlay(leftHandOverlay);
        Overlays.deleteOverlay(rightHandOverlay);
    }
    removeTable();
    toolBar.cleanup();
}


randFloat = function(low, high) {
    return low + Math.random() * (high - low);
}

randInt = function(low, high) {
    return Math.floor(randFloat(low, high));
}



Script.scriptEnding.connect(cleanUp);
Script.update.connect(update);
spawnWand();