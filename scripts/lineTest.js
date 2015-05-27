
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var lineColor = {red: 200, green: 70, blue: 150};

//Lets modify line entity so we hardcode 10 points and make line from that
var line = Entities.addEntity({
  type: 'Line',
  position: center,
  color: lineColor,
  lineWidth: 10
});



function cleanup(){
  Entities.deleteEntity(line);
}

Script.scriptEnding.connect(cleanup);