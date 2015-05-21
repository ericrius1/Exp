//
//  speechControl.js
//  examples
//
//  Created by Ryan Huffman on 07/31/14.
//  Copyright 2014 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


//input text
var input;

//positions
var origX = 0;
var origY = 0;
var origZ = 0;

var modelEntity = [];

var ALL_COMMANDS = [];
var dictionary = {
    earth: {},
    sun: {},
    moon: {}
};
/*



heat
ocean

*/

var dictionary = {
    philip: {
        name: "philip",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/philip.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    avatar: {
        name: "avatar",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/avatar.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    camera: {
        name: "camera",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/camera.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    googleglass: {
        name: "googleglass",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/glass.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    maya: {
        name: "maya",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/maya.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    ryan: {
        name: "ryan",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/ryan.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    cardboard: {
        name: "cardboard",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/cardboard.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    hifi: {
        name: "hifi",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/hifi.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    metaverse: {
        name: "metaverse",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/metaverse.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    mocapsuit: {
        name: "mocapsuit",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/suit.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    domain: {
        name: "domain",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/domain.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    judas: {
        name: "judas",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/judas.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    myo: {
        name: "myo",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/myo.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    thoys: {
        name: "thoys",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/thoys.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    freddy: {
        name: "freddy",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/freddy.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    leap: {
        name: "leap",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/leap.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    oculus: {
        name: "oculus",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/oculus.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    gear: {
        name: "oculus",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/gear.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    wave: {
        name: "wave",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/wave.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    waves: {
        name: "waves",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/waves.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    shoreline: {
        name: "shoreline",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/shoreline.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    wind: {
        name: "wind",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/wind.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    heat: {
        name: "heat",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/heat.fbx",
        dimensions: { x: 1, y: 1, z: .1 }

    },
    earth: {
        name: "earth",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/earth.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    },
    sun: {
        name: "sun",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/sun.fbx",
        dimensions: { x: 1, y: 1, z: .1 }

    },
    moon: {
        name: "moon",
        modelURL: "https://hifi-public.s3.amazonaws.com/models/props/Visualizer/v1/moon1.fbx",
        dimensions: { x: 1, y: 1, z: .1 }
    }
};



function handleCommandRecognized(command) {
    print("ozan: " + command); // TODO: remove
    if (command in dictionary) {
        input = command;
        setupEntities();
        // create / move over entities

    }
}

function setup() {
    for (var key in dictionary) {
        ALL_COMMANDS.push(key);
    }

    for (var i = 0; i < ALL_COMMANDS.length; i++) {
        SpeechRecognizer.addCommand(ALL_COMMANDS[i]);
    }
}


function setupEntities() {
    //remove current model
    cleanUpEntities();

    //var input = Window.prompt();
    print ("ozan: input: " + input)

    //models[0] = getModelsFromString("earth");
    //var word = getWord();
    if(input in dictionary){
        print("ozan: " + JSON.stringify(dictionary[input]));
        print(dictionary[input].name);
        var position = Vec3.sum(MyAvatar.position,
                                Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0.3, z: -1 }));
        var properties = {
            type: "Model",
            modelURL: dictionary[input].modelURL,
            dimensions: Vec3.multiply({ x: dictionary[input].dimensions.x, 
                                        y: dictionary[input].dimensions.y, 
                                        z: dictionary[input].dimensions.z },
                                        0.2),
            rotation: MyAvatar.orientation,
            position: position   //{ x: origX, y: origY, z: origZ }      
        };  
        modelEntity[0] = Entities.addEntity(properties);

    } else {
        print("ozan: doesn't exist" )
    }
}

function cleanUpEntities() {
    print("Cleanup");
    for (var i = modelEntity.length-1; i >= 0; i--) {
        Entities.deleteEntity(modelEntity[i]);
    };
//  Entities.deleteEntity(modelEntity[0]);
}

function scriptEnding() {
    for (var i = 0; i < ALL_COMMANDS.length; i++) {
        SpeechRecognizer.removeCommand(ALL_COMMANDS[i]);
    }

    cleanUpEntities();
}

Script.scriptEnding.connect(scriptEnding);
SpeechRecognizer.commandRecognized.connect(handleCommandRecognized);

setup();