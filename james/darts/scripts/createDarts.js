//  createDarts.js
//  part of darts
//
//  Script Type: Entity Spawner
//  Created by James B. Pollack @imgntn -- 09/14/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Creates a lane computer in the scene near your avatar, which allows you to start the bowling game.
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

//todo --add

Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

//var dartModel = 'http://hifi-public.s3.amazonaws.com/james/bowling/models/laneComputer/computer.fbx?' + randInt(0, 10000);
var dartModel = "http://localhost:8080/models/dart/dart01.fbx?" + randInt(0, 10000);
var dartBoardModel = "http://localhost:8080/models/board/dartBoard.fbx?" + randInt(0, 10000);


//for local testing 
var dartScriptURL = "http://localhost:8080/scripts/dart.js?" + randInt(0, 10000);
var dartBoardScriptURL = "http://localhost:8080/scripts/dartBoard.js?" + randInt(0, 10000);

//create the wand in front of the avatar
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(1, Quat.getFront(Camera.getOrientation())));

var center2 = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

var NUMBER_OF_DARTS = 1;

var darts = [];

for (var i = 0; i < NUMBER_OF_DARTS; i++) {
    var dart = Entities.addEntity({
        type: "Model",
        modelURL: dartModel,
        position: center,
        dimensions: {
            x: .1,
            y: .1,
            z: .2
        },
        gravity: {
            x: 0,
            y: 0,
            z: 0
        },
        collisionsWillMove: true,
        shapeType: 'box',
        script: dartScriptURL,

    })
    darts.push(dart)
}

var dartBoard =
    Entities.addEntity({
        type: 'Box',
        color: {
            red: 255,
            blue: 0,
            green: 0
        },
        // type: "Model",
        // modelURL: dartBoardModel,
        position: center2,
        dimensions: {
            x: 2,
            y: 2,
            z: 2
        },
        collisionsWillMove: false,
        script: dartBoardScriptURL,
        visible: true
    })



function cleanup() {
    while (darts.length > 0) {
        Entities.deleteEntity(darts.pop());
    }
    Entities.deleteEntity(dartBoard);

}


Script.scriptEnding.connect(cleanup);