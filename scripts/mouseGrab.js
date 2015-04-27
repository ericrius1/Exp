
var isGrabbing = false;
var grabbedEntity = null;
var prevMouse = {};
var deltaMouse = {}
var curProps;
var box;
var baseMoveFactor = .01;


var autoBox = true;
if(autoBox){
  var distance = 4;
  box = Entities.addEntity({
    type: 'Box',
    position: Vec3.sum(MyAvatar.position, Vec3.multiply(distance, Quat.getFront(Camera.getOrientation()))),
    dimensions: {x: .5, y: .5, z: .5},
    color: {red: 200, green: 50, blue: 192}
  });
}

function mousePressEvent(event){
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay);
  if(intersection.intersects){
    isGrabbing = true;
    // print("intersection props " + JSON.stringify(intersection))
    grabbedEntity = intersection.entityID;
  }

}

function mouseReleaseEntity(){
  isGrabbing = false;
  grabbedEntity = null;
}

function mouseMoveEvent(event){
  if(isGrabbing){
    curProps = Entities.getEntityProperties(grabbedEntity);
    deltaMouse.x = event.x - prevMouse.x;
    deltaMouse.y = event.y - prevMouse.y;
    print("DELTA MOUSE " + JSON.stringify(deltaMouse))
    Entities.editEntity(grabbedEntity, {position: {x: curProps.position.x + deltaMouse.x * baseMoveFactor, y: curProps.position.y, z: curProps.position.z + deltaMouse.y * baseMoveFactor }});
  }
  prevMouse.x = event.x;
  prevMouse.y = event.y;
}

function cleanup(){
  Entities.deleteEntity(box);
}

Controller.mouseMoveEvent.connect(mouseMoveEvent);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEntity);
// Script.update.connect(update);
Script.scriptEnding.connect(cleanup);