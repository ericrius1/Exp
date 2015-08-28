//sticking with right hand for now for simplicity
print("YAAAH")
var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var rightTriggerAction = RIGHT_HAND_CLICK;

var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}
var LINE_LENGTH = 500;

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
var SHOW_LINE_THRESHOLD = 0.2;
var GRAB_THRESHOLD = 0.6;

var RIGHT = 1;
var rightController = new controller(RIGHT, rightTriggerAction)


function controller(side, triggerAction) {
    this.triggerAction = triggerAction;
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
        visible: false
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
        this.grabbedEntity = intersection.entityID;
        return true
    }
    return false;
}

controller.prototype.attemptMove = function() {
    if(this.grabbedEntity) {
        print('move')
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
    if(this.grabbedEntity) {
        this.grabbedEntity = null;
    }
}

controller.prototype.update = function() {
    this.triggerValue = Controller.getActionValue(this.triggerAction);
    if (this.triggerValue > SHOW_LINE_THRESHOLD && this.prevTriggerValue < SHOW_LINE_THRESHOLD) {
        this.showPointer();
        this.shouldDisplayLine = true;
    } else if (this.triggerValue < SHOW_LINE_THRESHOLD && this.prevTriggerValue > SHOW_LINE_THRESHOLD) {
        this.hidePointer();
        this.letGo();
        this.shouldDisplayLine = false;
    }

    if (this.triggerValue > GRAB_THRESHOLD) {
        this.attemptMove();
    }

    if (this.shouldDisplayLine) {
        this.updateLine();
    }

    this.prevTriggerValue = this.triggerValue;
}

controller.prototype.cleanup = function() {
    Entities.deleteEntity(this.pointer);
}

function update() {
    rightController.update();
}


function cleanup() {
    rightController.cleanup();
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update)