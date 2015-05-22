var SPAWN_RANGE = 10;
var basePosition, avatarRot;

avatarRot = Quat.fromPitchYawRollDegrees(0, MyAvatar.bodyYaw, 0.0);
basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(SPAWN_RANGE * 3, Quat.getFront(avatarRot)));

basePosition.y -= SPAWN_RANGE;

var ground = Entities.addEntity({
  type: "Model",
  modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/woodFloor.fbx",
  dimensions: {
    x: 100,
    y: 2,
    z: 100
  },
  position: basePosition,
  shapeType: 'box'
});



function cleanup() {
  Entities.deleteEntity(ground);
}

Script.scriptEnding.connect(cleanup);