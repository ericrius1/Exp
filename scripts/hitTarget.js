var controllerID, controllerActive, holdPosition;
var originalTargetPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(1.2, Quat.getFront(Camera.getOrientation())));
originalTargetPosition.y = MyAvatar.position.y;
var dPosition;
var stickProperties, spring, springLength, targetVelocity;
var HOLD_POSITION_OFFSET = {x: 0, y: 0, z: -0.5};
var originalStickPosition = {x: originalTargetPosition.x + 0.5, y: originalTargetPosition.y, z: originalTargetPosition.z};
var STICK_ORIENTATION = Quat.fromPitchYawRollDegrees(0, 0, 0);
var SPRING_FORCE = 15.0;


var target = Entities.addEntity({
  type: "Box",
  position: originalTargetPosition,
  dimensions: {x: .1, y: 0.1, z: 0.1},
  color: {red: 200, green: 20, blue: 200},
  rotation: MyAvatar.orientation,
  ignoreCollisions: false,
  collisionsWillMove: true,
  damping: 0.0
});

print("STICK_ORIENTATION  ****************  " + JSON.stringify(STICK_ORIENTATION));
var stickWorldOrientation;
var stick = Entities.addEntity({
  type: "Box",
  position: originalStickPosition,
  dimensions: {x: .2, y:.2, z: 0.5},
  rotation: MyAvatar.orientation,
  color: {red: 200, blue: 10, green: 10},
  ignoreCollisions: false,
  collisionsWillMove: true,
  damping: 0
})

initControls();

function initControls(){
  controllerID = 3; //right handed
  var palmPosition = Controller.getSpatialControlPosition(controllerID);
  controllerActive = (Vec3.length(palmPosition) > 0);
  
}

Script.setTimeout(function(){
  target = Entities.identifyEntity(target);
  stick = Entities.identifyEntity(stick);  
}, 500);

function cleanUp(){
  Entities.deleteEntity(target);
  Entities.deleteEntity(stick);
}


function onCollision(entity1, entity2, collision){
  print('collision');
}

function onKeyPress(event){
  if(event.text === 'f'){
    Entities.editEntity(target, {position: originalTargetPosition, rotation: MyAvatar.orientation, velocity: {x: 0, y: 0, z: 0}, angularVelocity: {x: 0, y: 0, z:0}});
    Entities.editEntity(stick, {position: originalStickPosition, rotation: MyAvatar.orientation, velocity: {x: 0, y:0, z: 0}, angularVelocity: {x: 0, y: 0, z: 0}});
  }
}

function update(delta){
  if(!controllerActive){
    return;
  }
  var holdPosition = Vec3.sum(MyAvatar.getRightPalmPosition(), Vec3.multiplyQbyV(MyAvatar.orientation, HOLD_POSITION_OFFSET));
  stickProperties = Entities.getEntityProperties(stick);
  stickWorldOrientation = Quat.multiply(Quat.multiply(MyAvatar.orientation, Controller.getSpatialControlRawRotation(controllerID)), STICK_ORIENTATION);
  Entities.editEntity(stick, {position: holdPosition, rotation: stickWorldOrientation });
}

Controller.keyPressEvent.connect(onKeyPress);

// Entities.entityCollisionWithEntity.connect(onCollision);

Script.scriptEnding.connect(cleanUp);
Script.update.connect(update);