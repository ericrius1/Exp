randFloat = function(low, high) {
    return low + Math.random() * (high - low);
}

randInt = function(low, high) {
    return Math.floor(randFloat(low, high));
}

print('STARTING AC LOAD');
var HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";

var LIGHT_POSITION = {
    x: 517,
    y: 511,
    z: 507
};

var LIGHT_COLOR = {
    red: 255,
    green: 100,
    blue: 28
};

var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
};

var totalTime = 0;

var minLightIntensity = 3;
var maxLightIntensity = 11;

var minTimeFactor = 0.1;
var maxTimeFactor = 1;


var animationSettings = JSON.stringify({
    fps: 30,
    running: true,
    loop: true,
    firstFrame: 1,
    lastFrame: 10000
});


var LightMaker = {
    light: null,
    spawnLight: function() {
        print('CREATING LIGHT')
        var _t = this;
        _t.light = Entities.addEntity({
            type: "Light",
            position: LIGHT_POSITION,
            dimensions: {
                x: 10,
                y: 10,
                z: 10
            },
            color: LIGHT_COLOR
        });

    },
    spawnBox: function() {
        var _t = this;
        _t.box = Entities.addEntity({
            type: "Box",
            position: LIGHT_POSITION,
            dimensions: {
                x: 5,
                y: 5,
                z: 5
            },
            color: LIGHT_COLOR
        });
    }
}


var count = 300;
var hasSpawned = false;

function update(deltaTime) {
    if (count > 0) {
        //    print('IN UPDATE LOOP CONDITION 1')
        count--
        return
    }
    if (count === 0 && hasSpawned === false) {
        //  print('IN UPDATE LOOP CONDITION 2')
        hasSpawned = true;
        LightMaker.spawnLight();
        // LightMaker.spawnBox();

        return
    } else if (count === 0 && hasSpawned === true) {
        // print('IN UPDATE LOOP CONDITION 3' + LightMaker.light)
        totalTime += deltaTime

        var intensity = (minLightIntensity + (maxLightIntensity / 4 + (Math.sin(totalTime) * maxLightIntensity / 4)));
        intensity += randFloat(-0.3, 0.3);
        //print('intensity::: ' + intensity)
        Entities.editEntity(LightMaker.light, {
            intensity: intensity
        })
    }

}

function scriptEnding() {
    Entities.deleteEntity(LightMaker.light)

};

//LightMaker.spawnLight();
Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);