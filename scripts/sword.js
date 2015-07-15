//  stick.js
//  examples
//
//  Created by Seth Alves on 2015-6-10
//  Copyright 2015 High Fidelity, Inc.
//
//  Allow avatar to hold a stick
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
"use strict";
/*jslint vars: true*/
var Script, Entities, MyAvatar, Window, Overlays, Controller, Vec3, Quat, print, ToolBar, Settings; // Referenced globals provided by High Fidelity.
Script.include("http://s3.amazonaws.com/hifi-public/scripts/libraries/toolBars.js");

var ZOMBIE_URL = "https://hifi-public.s3.amazonaws.com/eric/models/zombie.fbx";
ZOMBIE_SPAWN_RADIUS = 10;


var zombieClips = [SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombie_cry.wav?v1"), SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/zombie_cry2.wav")];
var NUM_ZOMBIES = 10;
var ZOMBIE_HEIGHT = .4;
var ZOMBIE_SOUND_MIN_INTERVAL = 3000;
var ZOMBIE_SOUND_MAX_INTERVAL = 15000;
var floor;
var zombies = [];

var nullActionID = "00000000-0000-0000-0000-000000000000";
var controllerID;
var controllerActive;
var stickID = null;
var actionID = nullActionID;
var targetIDs = [];
var dimensions = {
    x: 0.3,
    y: 0.15,
    z: 2.0
};
var BUTTON_SIZE = 32;

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

function orientationOf(vector) {
    var direction, yaw, pitch;
    direction = Vec3.normalize(vector);
    yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
    pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
    return Quat.multiply(yaw, pitch);
}


var stickModel = "https://hifi-public.s3.amazonaws.com/eric/models/stick.fbx";
var swordModel = "https://hifi-public.s3.amazonaws.com/ozan/props/sword/sword.fbx";
var swordCollisionShape = "https://hifi-public.s3.amazonaws.com/ozan/props/sword/sword.obj";
var swordCollisionSoundURL = "http://public.highfidelity.io/sounds/Collisions-hitsandslaps/swordStrike1.wav";
var avatarCollisionSoundURL = "https://s3.amazonaws.com/hifi-public/sounds/Collisions-hitsandslaps/airhockey_hit1.wav";
var whichModel = "sword";
var originalAvatarCollisionSound;

var toolBar = new ToolBar(0, 0, ToolBar.vertical, "highfidelity.sword.toolbar", function() {
    return {
        x: 100,
        y: 380
    };
});

var SWORD_IMAGE = "https://hifi-public.s3.amazonaws.com/images/sword/sword.svg"; // Toggle between brandishing/sheathing sword (creating if necessary)
var TARGET_IMAGE = "https://hifi-public.s3.amazonaws.com/images/sword/dummy2.svg"; // Create a target dummy
var CLEANUP_IMAGE = "http://s3.amazonaws.com/hifi-public/images/delete.png"; // Remove sword and all target dummies.f
var swordButton = toolBar.addOverlay("image", {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    imageURL: SWORD_IMAGE,
    alpha: 1
});
var targetButton = toolBar.addOverlay("image", {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    imageURL: TARGET_IMAGE,
    alpha: 1
});

var cleanupButton = toolBar.addOverlay("image", {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    imageURL: CLEANUP_IMAGE,
    alpha: 1
});

var flasher;

var leftTriggerButton = 0;
var leftTriggerValue = 0;
var prevLeftTriggerValue = 0;


var LEFT = 0;
var RIGHT = 1;

var leftPalm = 2 * LEFT;
var rightPalm = 2 * RIGHT;
var rightTriggerButton = 1;
var prevRightTriggerValue = 0;
var rightTriggerValue = 0;
var TRIGGER_THRESHOLD = 0.2;

var swordHeld = false;

function clearFlash() {
    if (!flasher) {
        return;
    }
    Script.clearTimeout(flasher.timer);
    Overlays.deleteOverlay(flasher.overlay);
    flasher = null;
}

function flash(color) {
    return;
    clearFlash();
    flasher = {};
    flasher.overlay = Overlays.addOverlay("text", {
        backgroundColor: color,
        backgroundAlpha: 0.7,
        width: Window.innerWidth,
        height: Window.innerHeight
    });
    flasher.timer = Script.setTimeout(clearFlash, 500);
}

var health = 100;
var display2d, display3d;

function trackAvatarWithText() {
    Entities.editEntity(display3d, {
        position: Vec3.sum(MyAvatar.position, {
            x: 0,
            y: 1.5,
            z: 0
        }),
        rotation: Quat.multiply(MyAvatar.orientation, Quat.fromPitchYawRollDegrees(0, 180, 0))
    });
}

function updateDisplay() {
    var text = health.toString();
    if (!display2d) {
        health = 100;
        display2d = Overlays.addOverlay("text", {
            text: text,
            font: {
                size: 20
            },
            color: {
                red: 0,
                green: 255,
                blue: 0
            },
            backgroundColor: {
                red: 100,
                green: 100,
                blue: 100
            }, // Why doesn't this and the next work?
            backgroundAlpha: 0.9,
            x: toolBar.x - 5, // I'd like to add the score to the toolBar and have it drag with it, but toolBar doesn't support text (just buttons).
            y: toolBar.y - 30 // So next best thing is to position it each time as if it were on top.
        });
        display3d = Entities.addEntity({
            name: MyAvatar.displayName + " score",
            textColor: {
                red: 255,
                green: 255,
                blue: 255
            },
            type: "Text",
            text: text,
            lineHeight: 0.14,
            backgroundColor: {
                red: 64,
                green: 64,
                blue: 64
            },
            dimensions: {
                x: 0.3,
                y: 0.2,
                z: 0.01
            },
        });
        Script.update.connect(trackAvatarWithText);
    } else {
        Overlays.editOverlay(display2d, {
            text: text
        });
        Entities.editEntity(display3d, {
            text: text
        });
    }
}

function removeDisplay() {
    if (display2d) {
        Overlays.deleteOverlay(display2d);
        display2d = null;
        Script.update.disconnect(trackAvatarWithText);
        Entities.deleteEntity(display3d);
        display3d = null;
    }
}

function computeEnergy(collision, entityID) {
    var id = entityID || collision.idA || collision.idB;
    var entity = id && Entities.getEntityProperties(id);
    var mass = entity ? (entity.density * entity.dimensions.x * entity.dimensions.y * entity.dimensions.z) : 1;
    var linearVelocityChange = Vec3.length(collision.velocityChange);
    var energy = 0.5 * mass * linearVelocityChange * linearVelocityChange;
    return Math.min(Math.max(1.0, Math.round(energy)), 20);
}

function gotHit(collision) {
    var energy = computeEnergy(collision);
    health -= energy;
    flash({
        red: 255,
        green: 0,
        blue: 0
    });
    updateDisplay();
}

function scoreHit(idA, idB, collision) {
    var energy = computeEnergy(collision, idA);
    var entityProps = Entities.getEntityProperties(idB);
    if(entityProps.name === "zombie") {
        Script.setTimeout(function() {
            Entities.deleteEntity(idB);
            print("LOOG")
            zombies.splice(zombies.indexOf(idB, 1));
        }, 2000);   
    }
    health += energy;

    flash({
        red: 0,
        green: 255,
        blue: 0
    });
    updateDisplay();
}

function isFighting() {
    return stickID && (actionID !== nullActionID);
}


var inHand = false;


function isControllerActive() {
    // I don't think the hydra API provides any reliable way to know whether a particular controller is active. Ask for both.
    controllerActive = (Vec3.length(Controller.getSpatialControlPosition(3)) > 0) || Vec3.length(Controller.getSpatialControlPosition(4)) > 0;
    return controllerActive;
}


function removeSword() {
    if (stickID) {
        print('deleting action ' + actionID + ' and entity ' + stickID);
        Entities.deleteAction(stickID, actionID);
        Entities.deleteEntity(stickID);
        stickID = null;
        actionID = nullActionID;
        MyAvatar.collisionWithEntity.disconnect(gotHit);
        // removeEventhHandler happens automatically when the entity is deleted.
    }
    inHand = false;
    if (originalAvatarCollisionSound !== undefined) {
        MyAvatar.collisionSoundURL = originalAvatarCollisionSound;
    }
    removeDisplay();
    swordHeld = false;
}

function cleanUp(leaveButtons) {
    removeSword();
    Entities.deleteEntity(floor);
    targetIDs.forEach(function(id) {
        Entities.deleteAction(id.entity, id.action);
        Entities.deleteEntity(id.entity);
    });
    targetIDs = [];
    if (!leaveButtons) {
        toolBar.cleanup();
    }

    zombies.forEach(function(zombie) {
        Entities.deleteEntity(zombie);
    });
    zombies = [];
}

function makeSword() {
    var swordPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(5, Quat.getFront(MyAvatar.orientation)));
    var orientationAdjustment = Quat.fromPitchYawRollDegrees(90, 0, 0);

    stickID = Entities.addEntity({
        type: "Model",
        modelURL: swordModel,
        compoundShapeURL: swordCollisionShape,
        dimensions: dimensions,
        position: swordPosition,
        rotation: Quat.fromPitchYawRollDegrees(90, 0, 0),
        damping: 0.1,
        collisionSoundURL: swordCollisionSoundURL,
        restitution: 0.01,
        collisionsWillMove: true
    });

    if (originalAvatarCollisionSound === undefined) {
        originalAvatarCollisionSound = MyAvatar.collisionSoundURL; // We won't get MyAvatar.collisionWithEntity unless there's a sound URL. (Bug.)
        SoundCache.getSound(avatarCollisionSoundURL); // Interface does not currently "preload" this? (Bug?)
    }
    MyAvatar.collisionSoundURL = avatarCollisionSoundURL;
    MyAvatar.collisionWithEntity.connect(gotHit);
    Script.addEventHandler(stickID, 'collisionWithEntity', scoreHit);
    updateDisplay();
}

function onClick(event) {
    switch (Overlays.getOverlayAtPoint(event)) {
        case swordButton:
            if (!stickID) {
                makeSword();
            } else {
                removeSword();
            }
            break;
        case targetButton:
            initiateZombieApocalypse()
            break;
        case cleanupButton:
            cleanUp('leaveButtons');
            break;
    }
}

function initiateZombieApocalypse() {

    floor = Entities.addEntity({
        type: "Box",
        position: Vec3.sum(MyAvatar.position, {
            x: 0,
            y: -.5,
            z: 0
        }),
        dimensions: {
            x: 100,
            y: 1,
            z: 100
        },
        color: {
            red: 160,
            green: 5,
            blue: 30
        },
        // ignoreForCollisions: true
    });

    for (var i = 0; i < NUM_ZOMBIES; i++) {
        var spawnPosition = Vec3.sum(MyAvatar.position, {
            x: randFloat(-ZOMBIE_SPAWN_RADIUS, ZOMBIE_SPAWN_RADIUS),
            y: ZOMBIE_HEIGHT,
            z: randFloat(-ZOMBIE_SPAWN_RADIUS, ZOMBIE_SPAWN_RADIUS)
        });
        spawnZombie(spawnPosition);
    }
}

function spawnZombie(position) {
    var zombie = Entities.addEntity({
        type: "Model",
        name: "zombie",
        position: position,
        rotation: orientationOf(Vec3.subtract(MyAvatar.position, position)),
        dimensions: {
            x: 0.3,
            y: 0.7,
            z: 0.3
        },
        modelURL: ZOMBIE_URL,
        shapeType: "box",
        gravity: {x: 0.0, y: -3.0, z: 0.0},
        damping: 0.2,
        collisionsWillMove: true
    });

    var pointToOffsetFrom = Vec3.sum(position, {
        x: 0.0,
        y: 2.0,
        z: 0.0
    });
    var action = Entities.addAction("offset", zombie, {
        pointToOffsetFrom: pointToOffsetFrom,
        linearDistance: 2,
        // linearTimeScale: 0.005
        linearTimeScale: 0.1
    });
    targetIDs.push({
        entity: zombie,
        action: action
    });

    zombies.push(zombie);

    Script.setTimeout(function() {
        zombieCry(zombie);
    }, randFloat(ZOMBIE_SOUND_MIN_INTERVAL, ZOMBIE_SOUND_MAX_INTERVAL));
}

function zombieCry(zombie) {
    var position = Entities.getEntityProperties(zombie).position;
    var clip = zombieClips[randInt(0, zombieClips.length)];
    Audio.playSound(clip, {
        position: position,
        volume: 0.2
    });

    Script.setTimeout(function() {
        zombieCry(zombie);
    }, randFloat(ZOMBIE_SOUND_MIN_INTERVAL, ZOMBIE_SOUND_MAX_INTERVAL));
}

function grabSword(hand) {
    var handRotation;
    if (hand === "right") {
        handRotation = MyAvatar.getRightPalmRotation();

    } else if (hand === "left") {
        handRotation = MyAvatar.getLeftPalmRotation();
    }
    var swordRotation = Entities.getEntityProperties(stickID).rotation;
    print('sword rotation ' + JSON.stringify(swordRotation));
    var offsetRotation = Quat.multiply(Quat.inverse(handRotation), swordRotation);
    actionID = Entities.addAction("hold", stickID, {
        relativePosition: {
            x: 0.0,
            y: 0.0,
            z: -dimensions.z * 0.5
        },
        relativeRotation:offsetRotation,
        hand: hand,
        timeScale: 0.05
    });
    if (actionID === nullActionID) {
        print('*** FAILED TO MAKE SWORD ACTION ***');
        cleanUp();
    } else {
        swordHeld = true;
    }
}

function releaseSword() {
    Entities.deleteAction(stickID, actionID);
    actionID = nullActionID;
    Entities.editEntity(stickID, {
        velocity: {
            x: 0,
            y: 0,
            z: 0
        },
        angularVelocity: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    swordHeld = false;
}

function update() {
    updateControllerState();

}

function updateControllerState() {
    rightTriggerValue = Controller.getTriggerValue(rightTriggerButton);
    leftTriggerValue = Controller.getTriggerValue(leftTriggerButton);

    if (rightTriggerValue > TRIGGER_THRESHOLD && !swordHeld) {
        grabSword("right")
    } else if (rightTriggerValue < TRIGGER_THRESHOLD && prevRightTriggerValue > TRIGGER_THRESHOLD && swordHeld) {
        releaseSword();
    }

    if (leftTriggerValue > TRIGGER_THRESHOLD && !swordHeld) {
        grabSword("left")
    } else if (leftTriggerValue < TRIGGER_THRESHOLD && prevLeftTriggerValue > TRIGGER_THRESHOLD && swordHeld) {
        releaseSword();
    }

    prevRightTriggerValue = rightTriggerValue;
    prevLeftTriggerValue = leftTriggerValue;
}

randFloat = function(low, high) {
    return low + Math.random() * (high - low);
}


randInt = function(low, high) {
    return Math.floor(randFloat(low, high));
}


Script.scriptEnding.connect(cleanUp);
Script.update.connect(update);
Controller.mousePressEvent.connect(onClick);