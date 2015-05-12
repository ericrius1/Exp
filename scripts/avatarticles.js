
var animationSettings = JSON.stringify({
  fps: 30,
  frameIndex: 0,
  running: true,
  firstFrame: 0,
  lastFrame: 1000,
  loop: true
});

var avatarEmitter = Entities.addEntity({
  type: 'ParticleEffect',
  animationSettings: animationSettings,
  position: MyAvatar.position,
  color: {
    red: 200,
    green: 80,
    blue: 190
  },
  emitRate: 100,
  emitStrength: 10,
  // emitDirection: {x: 0, y: -1, z: 0},
  localGravity: 0

});

var testBox = Entities.addEntity({
  type: "Box",
  dimensions: {
    x: 1,
    y: 1,
    z: 1
  },
  color: {
    red: 200,
    blue: 10,
    green: 200
  },
  position: MyAvatar.position
})


function update() {
  print('vel ' + JSON.stringify(MyAvatar.getVelocity()));
  var direction = Vec3.multiply(-1, Quat.getFront(MyAvatar.orientation));
  Entities.editEntity(avatarEmitter, {
    position: MyAvatar.position,
    emitDirection: direction,
    // emitStrength: Vec3.length(MyAvatar.getVelocity())
  })
  Entities.editEntity(testBox, {
    position: MyAvatar.position
  })
}


function cleanup() {
  Entities.deleteEntity(avatarEmitter);
  // Entities.deleteEntity(testBox);
}


Script.update.connect(update);

Script.scriptEnding.connect(cleanup);