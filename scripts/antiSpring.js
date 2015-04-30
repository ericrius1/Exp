//This script spawns a block in front of avatar and allows him to move it with hydra
var BOX_SIZE = 0.1;
var controllerVelocity, holdPosition, testVelocity;
var testVelocity = {x: 0, y: 0, z: 0};
var totalTime = 0;

//controller init

var contorllerID = 3; //right hand
var palmPosition = Controller.getSpatialControlPosition(contorllerID);
controllerActive = (Vec3.length(palmPosition) > 0);

var box = Entities.addEntity({
  type: 'Box',
  position: Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(Quat.fromPitchYawRollDegrees(0, MyAvatar.bodyYaw, 0)))),
  dimensions: {x: BOX_SIZE, y: BOX_SIZE, z: BOX_SIZE},
  color: {red: 120, green: 20, blue: 111},
  velocity: {x: 0, y: 1, z: 0},
  damping: 0
});

function update(deltaTime){
  if(!controllerActive){
    return;
  }
   totalTime += deltaTime;
 // holdPosition = MyAvatar.getRightPalmPosition();
 controllerVelocity = Controller.getSpatialControlVelocity(contorllerID);
 // Entities.editEntity(box, {velocity: {x: controllerVelocity.x, y: 0, z: 0}});
 Entities.editEntity(box, {velocity: Vec3.multiply(1, controllerVelocity)});
 // Entities.editEntity(box, {position: holdPosition});
    // testVelocity.y = Math.sin(totalTime * .5);
    print("TEST VELOCITY : " + testVelocity.y);
    // Entities.editEntity(box, {velocity: testVelocity});
}


function cleanup(){
  // Entities.deleteEntity(box);
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);