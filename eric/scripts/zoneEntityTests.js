//
//  zoneEntityExample.js
//  examples
//
//  Created by Brad Hefta-Gaub on 4/16/15.
//  Copyright 2015 High Fidelity, Inc.
//
//  This is an example script that demonstrates creating and editing a entity
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";

var count = 0;
var stopAfter = 1000;

// var zoneEntityA = Entities.addEntity({
//     type: "Zone",
//     position: { x: 800, y: 800, z: 800 },
//     dimensions: { x: 10, y: 10, z: 10 },
//     keyLightColor: { red: 255, green: 0, blue: 250 },
//     stageSunModelEnabled: false,
//     keyLightDirection: { x: 0, y: -1.0, z: 0 },
//     shapeType: "sphere"
// });

// print("zoneEntityA:" + zoneEntityA);

// var zoneEntityB = Entities.addEntity({
//     type: "Zone",
//     position: { x: 5, y: 5, z: 5 },
//     dimensions: { x: 2, y: 2, z: 2 },
//     keyLightColor: { red: 0, green: 255, blue: 0 },
//     keyLightIntensity: 0.9,
//     stageLatitude: 37.777,
//     stageLongitude: 122.407,
//     stageAltitude: 0.03,
//     stageDay: 60,
//     stageHour: 12,
//     stageSunModelEnabled: true
// });

// print("zoneEntityB:" + zoneEntityB);


var zoneEntity = Entities.addEntity({
    type: "Zone",
    position: { x: 100, y: 100, z: 100 },
    dimensions: { x: 10, y: 10, z: 10 },
    keyLightColor: { red: 255, green: 0, blue: 255 },
    keyLightIntensity: 1,
    keyLightDirection: { x: 0, y: 0, z: -1 },
    stageSunModelEnabled: false,
    shapeType: "box"
});

Script.setTimeout(function(){
    Entities.editEntity(zoneEntity, {shapeType: "sphere"});

}, 2000)




Script.scriptEnding.connect(function(){
    print("YAAAA")
  Entities.deleteEntity(zoneEntity);
});



