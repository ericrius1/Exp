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

  this.update = function() {
    this.updateState();
    this.moveLaser();
    if(this.grabbing){
      this.entityProperties = Entities.getEntityProperties(this.grabbedEntity);
    }
    this.checkTrigger();
  }

  this.updateState = function() {
    this.palmPosition = Controller.getSpatialControlPosition(this.palm);
    if(this.grabbing){
      this.calculateTargetPosition();
    }
    this.oldPalmPosition = this.palmPosition;


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


  }

  this.calculateTargetPosition = function(){
    var dControllerPosition= Vec3.subtract(this.palmPosition, this.oldPalmPosition);
    cameraEntityDistance = Vec3.distance(Camera.getPosition(), this.currentPosition
    this.targetPosition = Vec3.sum(this.targetPosition, Vec3.multiply(dControllerPosition))

  }
  this.checkTrigger = function() {
    if (this.triggerValue > this.triggerThreshold && !this.triggerHeld) {
      this.triggerHeld = true;
      this.checkEntityIntersection();
    } else if (this.triggerValue < this.triggerThreshold && this.triggerHeld) {
      this.triggerHeld = false;
    }
  }

  this.checkEntityIntersection = function() {

    var pickRay = {
      origin: this.palmPosition,
      direction: Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition))
    };
    var intersection = getRayIntersection(pickRay);
    if(intersection.intersects && intersection.properties.collisionsWillMove){
      this.grab(intersection.entityId);
    }
  }

  this.grab = function(entityId){
    print("GRAB")
    this.grabbing = true;
    this.grabbedEntity = entityId;
    this.entityProperties = Entities.getEntityProperties(this.grabbedEntity);
    this.targetPosition = this.entityProperties.position;
    this.currentPosition = this.targetPosition;
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

function moveEntity(deltaTime){
  if(rightController.grabbing){
    entityProps = Entities.getEntityProperties(rightController.grabbedEntity);
    currentPosition = entityProps.position;
    currentVelocity = entityProps.velocity;
    currentRotation = entityProps.rotation;
    var dPosition = Vec3.subtract(rightController.targetPosition, currentPosition);
    distanceToTarget = Vec3.length(dPosition);
    if(distanceToTarget > CLOSE_ENOUGH){
      //compute current velocity in direction we want to move
      velocityTowardTarget = Vec3.dot(currentVelocity, Vec3.normalize(dPosition), velocityTowardTarget);
      velocityTowardTarget = Vec3.multiply(Vec3.normalize(dPosition), velocityTowardTarget);

      //compute the speed we would like to be going towards target position
      desiredVelocity = Vec3.multiply(dPosition, (1.0/deltaTime) * SPRING_RATE);
      addedVelocity = Vec3.subtract(desiredVelocity, velocityTowardTarget);
      //TODO - If target is to far..

      newVelocity = Vec3.sum(currentVelocity, addedVelocity);
      newVelocity = Vec3.subtract(newVelocity, Vec3.multiply(newVelocity, DAMPING_RATE));

      Entities.editEntity(rightController.grabbedEntity ,{
        velocity: newVelocity
      });
    }
  }
}

function update(deltaTime) {
  rightController.update();
  moveEntity(deltaTime);
}

function scriptEnding() {
  rightController.cleanup();
}

var rightController = new controller(RIGHT);


Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);