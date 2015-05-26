
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var lineColor = {red: 200, green: 70, blue: 150};
var rightLine = Entities.addEntity({
  type: 'Line',
  position: center,
  dimensions: {x: 0, y: 1, z: 0},
  color: lineColor
});

var bottomLine = Entities.addEntity({
  type: 'Line',
  position: center,
  dimensions: {x: -1, y: 0, z: 0},
  color: lineColor
});


center.x -=1;
var leftLine = Entities.addEntity({
  type: 'Line',
  position: center,
  dimensions: {x: 0, y: 1, z: 0},
  color: lineColor
});

center.x+= 1;
center.y+=1;
var topLine = Entities.addEntity({
  type: 'Line',
  position: center,
  dimensions: {x: -1, y: 0, z: 0},
  color: lineColor
});


function cleanup(){
  Entities.deleteEntity(rightLine);
  Entities.deleteEntity(bottomLine);
  Entities.deleteEntity(leftLine);
  Entities.deleteEntity(topLine);
}

Script.scriptEnding.connect(cleanup);