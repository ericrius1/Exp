var RIGHT = 1;
var LASER_WIDTH = 3;
var LASER_COLOR = {red: 50, green: 150, blue: 200 };
var LASER_LENGTH_FACTOR = 500;


function Controller(side){
  print("SIDE "+ side)
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;
  this.bumper = 6 * side + 5;

  this.oldPalmPosition = Controller.getSpatialControlPosition(this.palm);
  this.palmPosition = this.oldPalmPosition;

  this.oldTipPosition = Controller.getSpatialControlPosition(this.tip);
  this.tipPosition = this.oldTipPosition;

  this.oldUp = Controller.getSpatialControlNormal(this.palm);
  this.up = this.oldUp;

  this.laser = Overlays.addOverlay("line3d", {
    start: {x: 0, y: 0, z: 0},
    end: {x: 0, y: 0, z: 0},
    color: LASER_COLOR,
    alpha: 1,
    visible: true,
    lineWidth: LASER_WIDTH,
    anchor: "MyAvatar"
  });

  this.update  = function(){
    this.moveLaser();

  }

  this.moveLaser = function(){
    this.inverseRotation = Quat.inverse(MyAvatar.orientation);
    this.startPosition = Vec3.multiplyQbyV(this.inverseRotation, Vec3.subtract(this.palmPosition, MyAvatar.position));
    this.startPosition = Vec3.multiply(this.startPosition, 1/ MyAvatar.scale);
    this.direction = Vec3.multiplyQbyV(this.inverseRotation, Vec3.subtract(this.tipPosition, this.palmPosition));
    this.direction = Vec3.multiply(direction, LASER_LENGTH_FACTOR / (Vec3.length(direction) * MyAvatar.scale));
    this.endPosition = Vec3.sum(this.startPosition, this.direction);

    Overlays.editOverlay(this.laser, {
      start: this.startPosition,
      end: this.endPosition
    })
  }
}

function update(){
  rightController.update();
}


var rightController = new Controller(RIGHT)
Script.update.connect(update);