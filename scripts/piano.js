var keys = [];

var basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
for (var i = 0; i < 5; i++) {
  var key = Entities.addEntity({
    type: 'Box',
    dimensions: {
      x: 1,
      y: 1,
      z: 1
    },
    position: {
      x: basePosition.x + (i),
      y: basePosition.y,
      z: basePosition.z
    },
    color: {
      red: 250,
      green: 250,
      blue: 200
    }
  })
  keys.push(key);
}

Script.setTimeout(function(){
  keys.forEach(function(key){
    var props = Entities.getEntityProperties(key)
    print('info ' + props.id);
  });
}, 1000);
function cleanup() {
  keys.forEach(function(key) {
    Entities.deleteEntity(key);
  });
}

function mousePressEvent(event) {
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay);
  if (intersection.intersects) {
    clickedEntity = intersection.entityID;
    print("entity Id " + JSON.stringify(clickedEntity));
  }
}

Script.scriptEnding.connect(cleanup);

Controller.mousePressEvent.connect(mousePressEvent);