var center = Vec3.sum(MyAvatar.position, Vec3.multiply(2.0, Quat.getFront(Camera.getOrientation())));

var launcher = Entities.addEntity({
  type: 'Box',
  position: center,
  dimensions: {x: 1, y: 2, z: 1},
  color: {red: 200, green: 10, blue: 200}
});





function cleanup(){
  Entities.deleteEntity(launcher);
}


Script.scriptEnding.connect(cleanup);

