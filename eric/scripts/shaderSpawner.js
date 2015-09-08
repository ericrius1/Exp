var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));


var userData = {
    ProceduralEntity: {
        shaderUrl: "file:///Users/ericlevin/myhifistuff/eric/scripts/shaders/firstShader.fs",
        version: 2,

        uniforms: {
            iSpeed: 2.0,
            iSize: [1.0, 2.0, 4.0]
        }
    }
}

var whiteboard = Entities.addEntity({
    type: "Box",
    position: center,
    userData: JSON.stringify(userData),
    dimensions: {
        x: 2,
        y: 1.5,
        z: .01
    },
    rotation: orientationOf(Vec3.subtract(MyAvatar.position, center)),
    color: {
        red: 250,
        green: 250,
        blue: 250
    },
});


function orientationOf(vector) {
    var Y_AXIS = {
        x: 0,
        y: 1,
        z: 0
    };
    var X_AXIS = {
        x: 1,
        y: 0,
        z: 0
    };

    var theta = 0.0;

    var RAD_TO_DEG = 180.0 / Math.PI;
    var direction, yaw, pitch;
    direction = Vec3.normalize(vector);
    yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
    pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
    return Quat.multiply(yaw, pitch);
}


function cleanup() {
    Entities.deleteEntity(whiteboard)
}

Script.scriptEnding.connect(cleanup);