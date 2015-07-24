
var basePosition = MyAvatar.position;
var points = [];
var totalPoints = 80;
var currentPoint = 0;
var theta;
var RADIUS = 0.11;
var HEIGHT_OFFSET = 0.7;
var time = 0;

var redRange = 20;
var startRed = 220;
var startWidth = 5;
var widthRange = 3;

Script.include("https://hifi-public.s3.amazonaws.com/eric/scripts/tween.js")

var color = {
    red: 206,
    green: 200,
    blue: 35
  }

var line = Entities.addEntity({
  type: "Line",
  position: MyAvatar.position,
  dimensions: {
    x: 1,
    y: 1,
    z: 1
  },
  linePoints: points,
  color: color,
  lineWidth: 5
});



function cleanup() {
  Entities.deleteEntity(line);
}

function update(deltaTime) {
  time += deltaTime;
  points = [];
  for (var i = 0; i < currentPoint; i++) {
    //Go through and update all points to maintain relative position of avatar
    theta = i / totalPoints * (Math.PI * 2);
    var x = Math.cos(theta) * RADIUS + MyAvatar.position.x;
    var z = Math.sin(theta) * RADIUS + MyAvatar.position.z;
    points.push({
      x: x,
      y: MyAvatar.position.y + HEIGHT_OFFSET,
      z: z
    });
  }
  var red = Math.floor(startRed + Math.sin(time) * redRange)
  var lineWidth = Math.floor(startWidth + Math.sin(time )* widthRange);
  color.red = red;
  Entities.editEntity(line, {
    position: MyAvatar.position,
    linePoints: points,
    color: color,
    lineWidth: lineWidth
  });

  if(currentPoint <= totalPoints){
    currentPoint++;
  }


}

Script.update.connect(update);
Script.scriptEnding.connect(cleanup);