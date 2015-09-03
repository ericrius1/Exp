var flashTime = 20;
var pauseTime = 500;
var sanitizedOrientation = Quat.fromPitchYawRollDegrees(0,  MyAvatar.bodyYaw, 0);
var entityPos = Vec3.sum(MyAvatar.position, Vec3.multiply(1.5, Quat.getFront(sanitizedOrientation)));
var count = 0;
var begun = false;
var moveInterval;

var testBox = Entities.addEntity({
  type: 'Box',
  position: entityPos,
  dimensions: {x: 0.5, y: 0.5, z: 0.5},
  color: {red: 170, green: 60, blue: 111}
});

var screenOverlay = Overlays.addOverlay("text", {
  font: {size: 14},
  text: "STARTING ENTITY MOVEMENT",
  x: 0,
  y: 0,
  width: Window.innerWidth,
  height: Window.innerHeight,
  backgroundColor: {red: 10, green: 200, blue: 20},
  backgroundAlpha: 0.7,
  visible: false
});

function moveEntity(deltaX){
  var props = Entities.getEntityProperties(testBox);
  var newPos  = props.position;
  newPos.x += deltaX;
  Entities.editEntity(testBox, {position: newPos});
}

function flashScreen(){
  Overlays.editOverlay(screenOverlay, {visible: true});
  Script.setTimeout(function(){
    Overlays.editOverlay(screenOverlay, {visible: false});
  }, flashTime);
}

function begin(){
  if(begun){
    return;
  }
  begun = true;
  moveInterval = Script.setInterval(function(){
    if(count % 2 === 0){
      moveEntity(0.5);
    } else {
      moveEntity(-0.5);
    }
    flashScreen();
    count++;
  }, pauseTime);
}

function end(){
  Entities.editEntity(testBox, {position: entityPos});
  Script.clearInterval(moveInterval);
  begun = false;
  count = 0;
}

function onKeyPress(event){
  if(event.text === "SPACE"){
    if(!begun){
      begin();
    } else {
      end();
    }
  }
}


function cleanup(){
  Entities.deleteEntity(testBox);
  Overlays.deleteOverlay(screenOverlay);
}

Script.scriptEnding.connect(cleanup);
Controller.keyPressEvent.connect(onKeyPress);