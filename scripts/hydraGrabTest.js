//sticking with right hand for now for simplicity
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var rightTriggerAction = RIGHT_HAND_CLICK;

var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}
var LINE_LENGTH = 500;
var THICK_LINE_WIDTH = 7;
var THIN_LINE_WIDTH = 2;

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

var GRAB_COLOR = {
    red: 250,
    green: 10,
    blue: 250
};
var SHOW_LINE_THRESHOLD = 0.2;
var DISTANCE_HOLD_THRESHOLD = 0.8;

var right4Action= 18;
var left4Action = 17;

var RIGHT = 1;
var rightController = new controller(RIGHT, rightTriggerAction, right4Action)



function controller(side, triggerAction, pullAction) {
    this.triggerAction = triggerAction;
    this.pullAction = pullAction;
    this.actionID = null;
    this.tractorBeamActive = false;
    this.distanceHolding = false;
    this.triggerValue = 0;
    this.prevTriggerValue = 0;
    this.palm = 2 * side;
    this.tip = 2 * side + 1;
    this.pointer = Entities.addEntity({
        type: "Line",
        color: NO_INTERSECT_COLOR,
        dimensions: {
            x: 1000,
            y: 1000,
            z: 1000
        },
        visible: false,
    });
}


controller.prototype.updateLine = function() {
    var handPosition = Controller.getSpatialControlPosition(this.palm);
    var direction = Controller.getSpatialControlNormal(this.tip);

    Entities.editEntity(this.pointer, {
        position: handPosition,
        linePoints: [
            ZERO_VEC,
            Vec3.multiply(direction, LINE_LENGTH)
        ]
    });

    //only check if we havent already grabbed an object
    if (this.distanceHolding) {
        return;
    }

    //move origin a bit away from hand so nothing gets in way
    var origin = Vec3.sum(handPosition, direction);
    if (this.checkForIntersections(origin, direction)) {
        Entities.editEntity(this.pointer, {
            color: INTERSECT_COLOR,
        });
    } else {
        Entities.editEntity(this.pointer, {
            color: NO_INTERSECT_COLOR,
        });
    }
}



controller.prototype.checkForIntersections = function(origin, direction) {
    var pickRay = {
        origin: origin,
        direction: direction
    };

    var intersection = Entities.findRayIntersection(pickRay, true);

    if (intersection.intersects) {
        this.distanceToEntity = Vec3.distance(origin, intersection.properties.position);
        Entities.editEntity(this.pointer, {
            linePoints: [
                ZERO_VEC,
                Vec3.multiply(direction, this.distanceToEntity)
            ]
        });
        this.intersectedEntity = intersection.entityID;
        return true;
    }
    return false;
}

controller.prototype.attemptMove = function() {
    if(this.tractorBeamActive) {
        return;
    }
    if (this.intersectedEntity || this.distanceHolding) {
        if (this.actionID === null) {
            this.inititialDistanceToHeldEntity = this.distanceToEntity
        }
        var handPosition = Controller.getSpatialControlPosition(this.palm);
        var direction = Controller.getSpatialControlNormal(this.tip);
        var newPosition = Vec3.sum(handPosition, Vec3.multiply(direction, this.inititialDistanceToHeldEntity))
        this.distanceHolding = true;
        //TO DO : USE SPRING ACTION UPDATE FOR MOVING
        if (this.actionID === null) {
            this.actionID = Entities.addAction("spring", this.intersectedEntity, {
                targetPosition: newPosition,
                linearTimeScale: 0.1
            });
        } else {
            Entities.updateAction(this.intersectedEntity, this.actionID, {
                targetPosition: newPosition
            });
        }
    }

}

controller.prototype.showPointer = function() {
    Entities.editEntity(this.pointer, {
        visible: true
    });

}

controller.prototype.hidePointer = function() {
    Entities.editEntity(this.pointer, {
        visible: false
    });
}


controller.prototype.letGo = function() {
    this.intersectedEntity = null;
    this.actionID = null;
    Entities.deleteAction(this.intersectedEntity, this.actionID);
    this.distanceHolding = false;
}

controller.prototype.update = function() {
    this.triggerValue = Controller.getActionValue(this.triggerAction);
    if (this.triggerValue > SHOW_LINE_THRESHOLD && this.prevTriggerValue < SHOW_LINE_THRESHOLD) {
        this.showPointer();
        this.shouldDisplayLine = true;
    } else if (this.triggerValue < SHOW_LINE_THRESHOLD && this.prevTriggerValue > SHOW_LINE_THRESHOLD) {
        this.hidePointer();
        if(this.distanceHolding){
          this.letGo();  
        }
        this.shouldDisplayLine = false;
    }

    if (this.shouldDisplayLine) {
        this.updateLine();
    }
    if (this.triggerValue > DISTANCE_HOLD_THRESHOLD) {
        this.attemptMove();
    }


    this.prevTriggerValue = this.triggerValue;
}


controller.prototype.onActionEvent = function(action, state) {
    if(this.pullAction === action && state === 1) {
        if (this.actionID !== null) {
            var handPosition = Controller.getSpatialControlPosition(this.palm);
            this.tractorBeamActive = true;
            Entities.updateAction(this.intersectedEntity, this.actionID, {
                targetPosition: handPosition
                // linearTimeScale: 0.0001
            });
            var self = this;
            this.inter
            //hack for lack of onComplete callback
            Script.setTimeout(function() {
                self.letGo();
                print("NOW YOU CAN GRAB AAGAIN")
                self.tractorBeamActive = false;
            }, 3000);
        }
    }

}

controller.prototype.cleanup = function() {
    Entities.deleteEntity(this.pointer);
    Entities.deleteAction(this.intersectedEntity, this.actionID);
}

function update() {
    rightController.update();
}

function onActionEvent(action, state) {
    rightController.onActionEvent(action, state);

}


function cleanup() {
    rightController.cleanup();
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update)
Controller.actionEvent.connect(onActionEvent);