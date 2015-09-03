var SIZE = 200;

var floor = Entities.addEntity({
  type: "Model",
  modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/ground.fbx?v1",
  position: {x: MyAvatar.position.x, y: MyAvatar.position.y-3, z: MyAvatar.position.z},
  dimensions: {x: SIZE, y: 2, z: SIZE},
  shapeType: "Box"
})

// var floorCollidable = Entities.addEntity({
//   type: "Box",
//   position: {x: MyAvatar.position.x, y: MyAvatar.position.y-3, z: MyAvatar.position.z},
//   dimensions: {x: SIZE, y: 2, z: SIZE},
//   ignoreCollisions: false,
//   collisionsWillMove: false,
//   visible: false
// })

Script.scriptEnding.connect(function(){
  Entities.deleteEntity(floor);
  Entities.deleteEntity(floorCollidable);
});