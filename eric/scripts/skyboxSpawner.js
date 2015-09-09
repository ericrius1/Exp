//  zoneSkyboxExample.js
//  examples
//
//  Created by Brad Hefta-Gaub on 4/16/15.
//  Copyright 2015 High Fidelity, Inc.
//
//  This is an example script that demonstrates creating a zone using the atmosphere features
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";


var userData = {
      ProceduralEntity: 
    {
        // shaderUrl: "https://s3.amazonaws.com/Oculus/shadertoys/relentlessSkybox.fs"
        shaderUrl: "file:///Users/ericlevin/myhifistuff/eric/scripts/shaders/skyboxShader.fs"
    }
}

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

var zoneEntityA = Entities.addEntity({
    type: "Zone",
    position: center, 
    dimensions: { x: 2000, y: 2000, z: 2000 },
    keyLightColor: { red: 255, green: 0, blue: 0 },
    stageSunModelEnabled: false,
    shapeType: "sphere",
    backgroundMode: "skybox",
    userData:   JSON.stringify(userData),
    skybox: {
        color: { red: 255, green: 0, blue: 255 }, 
        // url: ""
    },

});


function cleanup() {
    Entities.deleteEntity(zoneEntityA);
}

Script.scriptEnding.connect(cleanup);

