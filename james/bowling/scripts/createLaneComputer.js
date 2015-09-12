//  createLaneComputer.js
//  part of bowling
//
//  Script Type: Entity Spawner
//  Created by James B. Pollack @imgntn -- 09/11/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Loads a wand model and attaches the bubble wand behavior.
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html



Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

var laneComputerModel = 'http://hifi-public.s3.amazonaws.com/james/bubblewand/models/wand/wand.fbx?' + randInt(0, 10000);

//for local testing 
var scriptURL = "http://localhost:8080/scripts/wand.js?" + randInt(0, 10000);

//create the wand in front of the avatar
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

var wand = Entities.addEntity({
    type: "Model",
    modelURL: laneComputerModel,
    position: center,
    dimensions: {
        x: 5,
        y: 5,
        z: 5
    },
    collisionsWillMove: false,
    script: laneComputerURL
});

function cleanup() {
    Entities.deleteEntity(wand);
}


Script.scriptEnding.connect(cleanup);