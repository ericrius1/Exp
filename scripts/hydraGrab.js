var entityProps, currentPosition, currentVelocity, currentRotation, distanceToTarget, velocityTowardTarget, desiredVelocity;
var addedVelocity, newVelocity, angularVelocity, dT, cameraEntityDistance;
var RIGHT = 1;
var LASER_WIDTH = 3;
var LASER_COLOR = {
  red: 50,
  green: 150,
  blue: 200
};
var LASER_LENGTH_FACTOR = 500;
var CLOSE_ENOUGH = 0.001;
var SPRING_RATE = 1.5;
var DAMPING_RATE = 0.8;
var SCREEN_TO_METERS = 0.001;

function getRayIntersection(pickRay){
  var intersection = Entities.findRayIntersection(pickRay);
  return intersection;
}


function controller(side) {
  this.triggerHeld = false;
  this.triggerThreshold = 0.9;
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;

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

  this.update = function(deltaTime) {
    this.updateControllerState();
    this.moveLaser();
    this.checkTrigger();
    if(this.grabbing){
      this.updateEntity()
    }

    this.oldPalmPosition = this.palmPosition;
    this.oldTipPosition = this.tipPosition;
  }

  this.updateEntity = function(){
    this.dControllerPosition = Vec3.subtract(this.palmPosition, this.oldPalmPosition);
    this.cameraEntityDistance = Vec3.distance(Camera.getPosition(), this.currentPosition);
    this.targetPosition = Vec3.sum(this.targetPosition, Vec3.multiply(this.dControllerPosition, this.cameraEntityDistance));
    Entities.editEntity(this.grabbedEntity, {position: this.targetPosition});


    this.entityProps = Entities.getEntityProperties(this.grabbedEntity);
  }


  this.updateControllerState = function() {
    this.palmPosition = Controller.getSpatialControlPosition(this.palm);
    this.tipPosition = Controller.getSpatialControlPosition(this.tip);
    this.triggerValue = Controller.getTriggerValue(this.trigger);
  }

  this.checkTrigger = function() {
    if (this.triggerValue > this.triggerThreshold && !this.triggerHeld) {
      this.triggerHeld = true;
      this.checkEntityIntersection();
    } else if (this.triggerValue < this.triggerThreshold && this.triggerHeld) {
      this.triggerHeld = false;
      this.release();
    }
  }

  this.checkEntityIntersection = function() {

    var pickRay = {
      origin: this.palmPosition,
      direction: Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition))
    };
    var intersection = getRayIntersection(pickRay);
    if(intersection.intersects && intersection.properties.collisionsWillMove){
      this.grab(intersection.entityID);
    }
  }

  this.grab = function(entityId){
    print("GRAB")
    this.grabbing = true;
    this.grabbedEntity = entityId;
    this.entityProps = Entities.getEntityProperties(this.grabbedEntity);
    this.targetPosition = this.entityProps.position;
    this.currentPosition = this.targetPosition;
    this.oldPalmPosition = this.palmPosition;
  }

  this.release = function(){
    this.grabbing = false;
    this.grabbedEntity = null;
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



function update(deltaTime) {
  rightController.update(deltaTime);
}

function scriptEnding() {
  rightController.cleanup();
}

var rightController = new controller(RIGHT);


Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);