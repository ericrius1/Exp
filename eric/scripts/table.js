
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

var ground = Entities.addEntity({
  type: "Model",
  modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/woodFloor.fbx",
  dimensions: {
    x: 2,
    y: .1,
    z: 2
  },
  position: center,
  shapeType: 'box'
});



function cleanup() {
    // Entities.deleteEntity(ground);
}

Script.scriptEnding.connect(cleanup);


