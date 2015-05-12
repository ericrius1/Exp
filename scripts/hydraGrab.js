var RIGHT = 1;
var LASER_WIDTH = 3;
var LASER_COLOR = {
  red: 50,
  green: 150,
  blue: 200
};
var LASER_LENGTH_FACTOR = 500;




function controller(side) {
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;
  this.bumper = 6 * side + 5;

  this.laser = Overlays.addOverlay("line3d", {
    start: {
      x: 0,
      y: 0,
      z: 0
    },
    end: {
      x: 0,
      y: 0,
      z: 0
    },
    color: LASER_COLOR,
    alpha: 1,
    lineWidth: LASER_WIDTH,
    anchor: "MyAvatar"
  });

  this.update = function() {
    this.updateState();
    this.moveLaser();

  }

  this.updateState = function() {
    this.oldPalmPosition = Controller.getSpatialControlPosition(this.palm);
    this.palmPosition = this.oldPalmPosition;

    this.oldTipPosition = Controller.getSpatialControlPosition(this.tip);
    this.tipPosition = this.oldTipPosition;

    this.oldUp = Controller.getSpatialControlNormal(this.palm);
    this.up = this.oldUp;

    this.oldFront = Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition));
    this.front = this.oldFront;

    this.oldRight = Vec3.cross(this.front, this.up);
    this.right = this.oldRight;

    this.oldRotation = Quat.multiply(MyAvatar.orientation, Controller.getSpatialControlRawRotation(this.palm));
    this.rotation = this.oldRotation;

    this.triggerValue = Controller.getTriggerValue(this.trigger);
    this.bumperValue = Controller.isButtonPressed(this.bumper);


  }

  this.moveLaser = function() {
    var inverseRotation = Quat.inverse(MyAvatar.orientation);
    var startPosition = Vec3.multiplyQbyV(inverseRotation, Vec3.subtract(this.palmPosition, MyAvatar.position));
    // startPosition = Vec3.multiply(startPosition, 1 / MyAvatar.scale);
    var direction = Vec3.multiplyQbyV(inverseRotation, Vec3.subtract(this.tipPosition, this.palmPosition));
    direction = Vec3.multiply(direction, LASER_LENGTH_FACTOR / (Vec3.length(direction) * MyAvatar.scale));
    var endPosition = Vec3.sum(startPosition, direction);

    Overlays.editOverlay(this.laser, {
      start: startPosition,
      end: endPosition
    });

  }

  this.cleanup = function() {
    Overlays.deleteOverlay(this.laser);
  }
}

function update() {
  rightController.update();
}

function scriptEnding() {
  rightController.cleanup();
}

var rightController = new controller(RIGHT);


Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);