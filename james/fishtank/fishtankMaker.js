Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");


var scriptURL = 'http://localhost:8080/fishtank.js?' + randInt(0, 10000)

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

var tank = Entities.addEntity({

    type: 'Box',
    position: center,
    dimensions: {
        x: 1,
        y: 1,
        z: 1
    },
    color: {
        red: 0,
        blue: 200,
        green: 255
    },
    //must be enabled to be grabbable in the physics engine
    collisionsWillMove: false,
    script: scriptURL
});

function cleanup() {
    Entities.deleteEntity(tank);
}


Script.scriptEnding.connect(cleanup);