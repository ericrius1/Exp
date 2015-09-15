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


var LEFT_HAND_CLICK = Controller.findAction("LEFT_HAND_CLICK");
var leftHandGrabValue = 0;
var prevLeftHandGrabValue = 0;
var TRIGGER_THRESHOLD = 0.2;
var GRAB_RADIUS = 0.5;
var leftHandGrabAction = LEFT_HAND_CLICK;
var nullActionID = '000';
var leftHandObjectID = null;
var leftHandActionID = nullActionID;

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



function grab(hand) {



	var handRotation = MyAvatar.getLeftPalmRotation();
	var handPosition = MyAvatar.getLeftPalmPosition();
	var objectRotation = Entities.getEntityProperties(objectID).rotation;
	var offsetRotation = Quat.multiply(Quat.inverse(handRotation), objectRotation);
	var objectPosition = Entities.getEntityProperties(objectID).position;
	var offset = Vec3.subtract(objectPosition, handPosition);
	var offsetPosition = Vec3.multiplyQbyV(Quat.inverse(Quat.multiply(handRotation, offsetRotation)), offset);

	console.log('attempting grab'+ JSON.stringify(handPosition))
	var entities = Entities.findEntities(handPosition, GRAB_RADIUS);
	console.log('entities:::' +entities)
	var objectID = null;
	var minDistance = GRAB_RADIUS;
	for (var i = 0; i < entities.length; i++) {
		var distance = Vec3.distance(Entities.getEntityProperties(entities[i]).position, handPosition);
		if (distance <= minDistance) {
			objectID = entities[i];
			minDistance = distance;
		}

	}
	if (objectID == null) {
		return false;
	}
	console.log('hit item' + objectID)


	var actionID = Entities.addAction("hold", objectID, {
		relativePosition: {x:0,y:0,z:0},
		relativeRotation: offsetRotation,
		hand: "left",
		timeScale: 0.05
	});


	if (actionID === nullActionID) {

		leftHandObjectID = null;

	} else {

		leftHandActionID = actionID;

	}

}
var overlays = false;
var leftHandOverlay;
if (overlays) {
	leftHandOverlay = Overlays.addOverlay("sphere", {
		position: MyAvatar.getLeftPalmPosition(),
		size: GRAB_RADIUS,
		color: releaseColor,
		alpha: 0.5,
		solid: false
	});


}

function letGo(hand) {
	var actionIDToRemove = leftHandActionID;
	var entityIDToEdit = leftHandObjectID;
	var handVelocity = MyAvatar.getLeftPalmVelocity();
	var handAngularVelocity = MyAvatar.getLeftPalmAngularVelocity();

	if (actionIDToRemove != nullActionID && entityIDToEdit != null) {
		Entities.deleteAction(leftHandObjectID, leftHandActionID);

		leftHandObjectID = null;
		leftHandActionID = nullActionID;

	}
}



function update() {
	//console.log('update loop')
	if (overlays) {
		Overlays.editOverlay(leftHandOverlay, {
			position: MyAvatar.getLeftPalmPosition()
		});

	}


	leftHandGrabValue = Controller.getActionValue(leftHandGrabAction);
	//console.log('LGV: ' + leftHandGrabValue)
	if (leftHandGrabValue > TRIGGER_THRESHOLD &&
		prevLeftHandGrabValue < TRIGGER_THRESHOLD) {
		if (overlays) {
			Overlays.editOverlay(leftHandOverlay, {
				color: grabColor
			});
		}
		grab();
	} else if (leftHandGrabValue < TRIGGER_THRESHOLD &&
		prevLeftHandGrabValue > TRIGGER_THRESHOLD) {
		if (overlays) {
			Overlays.editOverlay(leftHandOverlay, {
				color: releaseColor
			});
		}
		//letGo();
	}

	prevLeftHandGrabValue = leftHandGrabValue;

}

function cleanUp() {
	letGo();
	if (overlays) {
		Overlays.deleteOverlay(leftHandOverlay);
	}
	Entities.deleteEntity(box)

}


var box;

function spawnBox() {
    console.log('spawning box')
    box = Entities.addEntity({
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
        // damping: 0.1,
        // restitution: 0.01,
        // density: 0.5,
        collisionsWillMove: true,
        color: {
            red: randInt(0, 255),
            green: randInt(0, 255),
            blue: randInt(0, 255)
        },
        //script: 'http://hifi-public.s3.amazonaws.com/james/scripts/bubbleEntity.js?1223'
    });
}


randFloat = function(low, high) {
    return low + Math.random() * (high - low);
}

randInt = function(low, high) {
    return Math.floor(randFloat(low, high));
}



Script.update.connect(update);

Script.scriptEnding.connect(cleanUp);

spawnBox();