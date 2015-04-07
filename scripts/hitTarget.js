var position = Vec3.sum(MyAvatar.position, Vec3.multiply(2, Quat.getFront(Camera.getOrientation())));

var target = Entities.addEntity({
	type: "Box",
  position: position,
  dimensions: {x: 1.5, y: 0.6, z: 0.2},
  color: {red: 200, green: 20, blue: 200},
  rotation: MyAvatar.orientation
});

function cleanUp(){
  Entities.deleteEntity(target);
}

function findClickedEntity(event){
  var pickRay = Camera.computePickRay(event.x, event.y);

  var entity = Entities.findRayIntersection(pickRay, true);
  if(entity.intersects){
    var velocity = {x: 0, y: 0, z: -1};
    Entities.editEntity(entity, {velocity: velocity});

  }
}

function onClick(event){
  findClickedEntity(event);
}

Controller.mousePressEvent.connect(onClick);


Script.scriptEnding.connect(cleanUp);