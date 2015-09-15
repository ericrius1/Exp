// get rotation of each hand
// get velocity
// if trigger held, increase velocty (to max)
// add vectors of both hands to get velocity to move avatar


// virtual glm::vec3 getSpatialControlPosition(int controlIndex) const = 0;
//    virtual glm::vec3 getSpatialControlVelocity(int controlIndex) const = 0;
//    virtual glm::vec3 getSpatialControlNormal(int controlIndex) const = 0;
//    virtual glm::quat getSpatialControlRawRotation(int controlIndex) const = 0;


var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var rightTriggerAction = RIGHT_HAND_CLICK;

var LEFT_HAND_CLICK = Controller.findAction("LEFT_HAND_CLICK");
var leftTriggerAction = LEFT_HAND_CLICK;


var MAX_VELOCITY = 100;

var LEFT = 0;
var RIGHT = 1;

function HandThrusters() {

}

HandThrusters.prototype = {
	leftThruster: {
		strength: 0,
	},
	rightThruster: {
		strength: 0,
	},
	thrustVector: null,
	getTriggerActionValues: function() {
		return [Controller.getActionValue(LEFT_HAND_CLICK), Controller.getActionValue(RIGHT_HAND_CLICK)]

	},
	getControllerRotations: function() {
		return [Controller.getSpatialControlRawRotation(LEFT), Controller.getSpatialControlRawRotation(RIGHT)];

	},
	addToVelocity: function() {
		var triggerValues = this.getTriggerActionValues();
		if (triggerValues[0]) {
			this.leftThruster.strength += triggerValues[0];
		}
	},
	transformThrustQuaternions: function() {
		var rotations = this.getControllerRotations();
		var resultQuaternion = Quat.multiply(rotations[0], rotations[1]);
		var inverseResult = Quat.inverse(resultQuaternion);
		return inverseResult
	},
	reportControllerInfo: function() {
		var left_normal = Controller.getSpatialControlNormal(0);
		var right_normal = Controller.getSpatialControlNormal(1);
		var left_rotation = Controller.getSpatialControlRawRotation(0);
		var right_rotation = Controller.getSpatialControlRawRotation(1);


		print('CTRL NORM L ::' + JSON.stringify(left_normal));
		print('CTRL NORM R ::' + JSON.stringify(right_normal));
		print('CTRL ROTATION L ::' + JSON.stringify(left_rotation));
		print('CTRL ROTATION R ::' + JSON.stringify(right_rotation));

	},
	internalUpdate: function() {
		var _t=this;
		var transformed = ironMan.transformThrustQuaternions();
		print('TRANSFORMED ::' + JSON.stringify(transformed))
	},
	addPointer:function(){
		 this.pointer = Entities.addEntity({
        type: "Line",
        name: "pointer",
        color: NO_INTERSECT_COLOR,
        dimensions: {
            x: 1000,
            y: 1000,
            z: 1000
        },
        visible: true,
        lifetime: 100
    });
	}
}

var ironMan = new HandThrusters;
Script.update.connect(ironMan.reportControllerInfo)
Script.update.connect(ironMan.internalUpdate)

function cleanup() {
	Script.update.disconnect(ironMan.reportControllerInfo)
		Script.update.disconnect(ironMan.internalUpdate)
}


Script.scriptEnding.connect(cleanup);
//multiply quaternions
//invert quaternions