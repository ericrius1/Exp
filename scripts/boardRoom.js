//
// boardRoom.js
// examples
//
//  Created by Eric Levin on April 17, 2015
//  Copyright 2015 High Fidelity, Inc.
//  
//  Spawns a bunch of chairs around a table
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var NUM_CHAIRS = 15
var chairs = [];
var seatURL = "https://hifi-public.s3.amazonaws.com/models/props/MidCenturyModernLivingRoom/Interior/Chair.fbx"
var seatManagerURL = "file:///Users/ericlevin1/MyHiFiStuff/scripts/seatManager2.js"
var center =MyAvatar.position
var radius = 10;
var defaultRotationOffset = 20
var seatFront = {x: 0, y: 0, z: -1}
var targetRotation;

for(var i = 0; i < NUM_CHAIRS; i++){
  var theta = i/ NUM_CHAIRS * Math.PI * 2;
  var x = center.x + (Math.cos(theta) * radius);
  var z = center.z + (Math.sin(theta) * radius);

  var seatRotation = Quat.fromPitchYawRollDegrees(0, defaultRotationOffset, 0);
  var seatPosition = {x: x, y:center.y, z: z};
  // var seatPosition = {x: center.x - 5, y:center.y, z: center.z};

  //seat to center vector
  var seatToCenterVector = Vec3.normalize(Vec3.subtract(center, seatPosition));
  var angle = Math.acos(Vec3.dot(seatFront, seatToCenterVector));
  // print("ANGLE   ********************" + angle)
  if(seatPosition.x < center.x){
    targetRotation = Quat.fromPitchYawRollRadians(0, -angle, 0);
  } else {
    targetRotation = Quat.fromPitchYawRollRadians(0, angle, 0);
  }
  seatRotation  = Quat.multiply(targetRotation, seatRotation);
  // print("SEAT ROTATION ********* " + JSON.stringify(seatRotation));
  print("SEAT ROTATION ********* " + JSON.stringify(Quat.safeEulerAngles(seatRotation)));


  chairs.push(Entities.addEntity({
    type: "Model",
    modelURL: seatURL,
    position: seatPosition,
    rotation: seatRotation,
    dimensions: {x: 1.39, y: 1.17, z: 1.94},
    script: seatManagerURL
  }));
}

function cleanup(){
  for(var i = 0; i < NUM_CHAIRS; i++){
    Entities.deleteEntity(chairs[i]);
  }
}

Script.scriptEnding.connect(cleanup);