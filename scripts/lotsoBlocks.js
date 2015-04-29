var NUM_BLOCKS = 200;
var size;
var SPAWN_RANGE = 10;
var boxes = [];

var ground = Entities.addEntity({
  type: "Model",
  modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/woodFloor.fbx",
  dimensions: {
    x: 1000,
    y: 2,
    z: 1000
  },
  position: Vec3.subtract(MyAvatar.position, {
    x: 0,
    y: SPAWN_RANGE,
    z: 0
  })
});

var avatarRot = Quat.fromPitchYawRollDegrees(0, MyAvatar.bodyYaw, 0.0);
var basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(SPAWN_RANGE * 3, Quat.getFront(avatarRot)));
basePosition.y += 2;
for (var i = 0; i < NUM_BLOCKS; i++) {
  size = randFloat(0.5, 2);
  boxes.push(Entities.addEntity({
    type: 'Box',
    dimensions: {
      x: size,
      y: size,
      z: size
    },
    position: {
      x: basePosition.x + randFloat(-SPAWN_RANGE, SPAWN_RANGE),
      y: basePosition.y - randFloat(-SPAWN_RANGE, SPAWN_RANGE),
      z: basePosition.z + randFloat(-SPAWN_RANGE, SPAWN_RANGE)
    },
    color: {red: Math.random() * 255, green: Math.random() * 255, blue: Math.random() * 255},
    collisionsWillMove: true
  }));
}



function cleanup() {
  Entities.deleteEntity(ground);
  boxes.forEach(function(box){
    Entities.deleteEntity(box);
  });
}

Script.scriptEnding.connect(cleanup);

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}