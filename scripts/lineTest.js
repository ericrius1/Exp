var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
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
var line = Entities.addEntity({
  type: 'Line',
  position: center,
  linePoints: [p1, p2, p3],
  color: lineColor,
  dimensions: {
    x: 10,
    y: 10,
    z: 10
  },
  lineWidth: 10
});


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
// Script.update.connect(update);