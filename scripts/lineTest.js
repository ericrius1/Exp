var center = Vec3.sum(MyAvatar.position, Vec3.multiply(1, Quat.getFront(Camera.getOrientation())));
var p1 = center;
var p2 = Vec3.sum(center, {
  x: 1,
  y: 0,
  z: 0
});
var p3 = Vec3.sum(center, {
  x: 1,
  y: 1,
  z: 0
});
var lineColor = {
  red: 200,
  green: 70,
  blue: 200
};
//Lets modify line entity so we hardcode 10 points and make line from that

var lines = [];
var points = [];

function mousePressEvent() {
  var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
  points.push(center);
  // if(points.length < 2){
  //   return;
  // }
  lines.push(Entities.addEntity({
    type: 'Line',
    position: center,
    linePoints: points,
    rotation: {x: Math.random() * 100, y: 0, z: Math.random() * 100},
    dimensions: { x: .1, y: .1, z: .1},
    color: lineColor,
    dimensions: {
      x: 10,
      y: 10,
      z: 10
    },
    lineWidth: 10
  })); 
}



// Script.setInterval(changeColor, 1000);

function changeColor() {
  Entities.editEntity(line, {
    color: {
      red: Math.random() * 100,
      green: 10,
      blue: 100
    },
    lineWidth: Math.random() * 20
  });
}


function update() {
  var pos = Entities.getEntityProperties(line).position;
  Entities.editEntity(line, {
    position: Vec3.sum(pos, {
      x: .01,
      y: 0,
      z: 0
    })
  });
}


function cleanup() {
  Entities.deleteEntity(line);
}

Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
// Script.update.connect(update);