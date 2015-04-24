var floor = Entities.addEntity({
  type: "Model",
  modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/ground.fbx?v1",
  position: {x: MyAvatar.position.x, y: MyAvatar.position.y-3, z: MyAvatar.position.z},
  dimensions: {x: 100, y: 2, z: 100},
})

var floorCollidable = Entities.addEntity({
  type: "Box",
  position: {x: MyAvatar.position.x, y: MyAvatar.position.y-3, z: MyAvatar.position.z},
  dimensions: {x: 100, y: 2, z: 100},
  ignoreCollisions: false,
  collisionsWillMove: true,
  visible: false
})

Script.scriptEnding.connect(function(){
  Entities.deleteEntity(floor);
  Entities.deleteEntity(floorCollidable);
});