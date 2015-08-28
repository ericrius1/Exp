var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}
var totalTime = 0;
var FIRE_COLOR = {
    red: 255,
    green: 255,
    blue: 255
};
var minLightIntensity = 3;
var maxLightIntensity = 11;

var minTimeFactor = .1;
var maxTimeFactor = 1;

var LIGHT_COLOR = {
    red: 255,
    green: 100,
    blue: 28
}

var animationSettings = JSON.stringify({
    fps: 30,
    running: true,
    loop: true,
    firstFrame: 1,
    lastFrame: 10000
});


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

var light = Entities.addEntity({
    type: "Light",
    position: center,
    // isSpotlight: true,
    dimensions: {x: 10, y: 10, z: 10},
    color: LIGHT_COLOR
});


function update(deltaTime) {
    totalTime += deltaTime
    var intensity = (minLightIntensity + (maxLightIntensity/4 +  (Math.sin(totalTime) * maxLightIntensity/4)));
    intensity += randFloat(-.3, 0.3);
    print(intensity)
    Entities.editEntity(light, {
        intensity: intensity
    })
}

function cleanup() {
   Entities.deleteEntity(fire);
   Entities.deleteEntity(light);
}
Script.scriptEnding.connect(cleanup);
Script.update.connect(update);

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}