var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}

var FIRE_COLOR = {
    red: 255,
    green: 255,
    blue: 255
};

var animationSettings = JSON.stringify({
    fps: 30,
    running: true,
    loop: true,
    firstFrame: 1,
    lastFrame: 10000
});

var ground = Entities.addEntity({
    type: "Box",
    color: {
        red: 50,
        green: 0,
        blue: 5
    },
    position: center,
    dimensions: {
        x: 1,
        y: .01,
        z: 1
    }
})

var fire = Entities.addEntity({
    type: "ParticleEffect",
    animationSettings: animationSettings,
    textures: "https://hifi-public.s3.amazonaws.com/ryan/fire2.png",
    position: center,
    emitRate: 5,
    color: FIRE_COLOR,
    emitVelocity: {
        x: .0,
        y: .0,
        z: 0
    },
    particleRadius: .50,
    velocitySpread: {
        x: .1,
        y: .1,
        z: .1
    },
    emitAcceleration: {
        x: 0.1,
        y: -.0,
        z: .0
    },
    accelerationSpread: {
        x: .1,
        y: .1,
        z: .1
    },
    lifespan: .5
});



function cleanup() {
   Entities.deleteEntity(fire);
   Entities.deleteEntity(ground);
}
Script.scriptEnding.connect(cleanup);

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}