//
//  lavalamp.js
//  examples
//
//  Created by Eric Levin on March 23, 2015
//  Copyright 2015 High Fidelity, Inc.
//
//  Creates some spheres with lights attached, that move and stretch slowly 
//  with lights attached, simulating a lava lamp
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//




var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3.0, Quat.getFront(Camera.getOrientation())));

var totalTime = 0;

var BALL_SIZE = 0.07;
var NUM_BALLS = 3; 
var properties, newPosition, newDimensions, newProperties;
balls = [];
var base;
var baseSize = 2;
var baseHeight = center.y;

for (var i = 0; i < NUM_BALLS; i++) {
  balls.push(Entities.addEntity(
        { type: "Sphere",
          position: { x: randFloat (center.x-1, center.x +1), 
                y: baseHeight, 
                z: randFloat(center.z - 1, center.z + 1)},  
      dimensions: { x: BALL_SIZE, y: BALL_SIZE, z: BALL_SIZE }, 
          color: { red: 120, green: 20, blue: 130},
    })); 
}

//add wall
base = Entities.addEntity(
{
  type: "Box",
  position: {x: center.x, y: baseHeight, z: center.z},
  dimensions: {x: baseSize, y: .01, z: baseSize},
  color: {red: 100, green: 1, blue: 10}
});

function update(deltaTime) { 
  totalTime += deltaTime;
  properties = Entities.getEntityProperties(balls[0]);
  newPosition = properties.position;
  newDimensions = properties.dimensions
  // newPosition.y+= 0.01;
  newDimensions.y = Math.sin(totalTime* 0.1);

  newProperties = {
    position: newPosition,
    dimensions: newDimensions
  }
  Entities.editEntity(balls[0], newProperties);
}
 

function scriptEnding() {
   Entities.deleteEntity(base);
  for (var i = 0; i < NUM_BALLS; i++) {
    Entities.deleteEntity(balls[i]);
  }
}

function randFloat ( low, high ) {
    return low + Math.random() * ( high - low );
}

Script.scriptEnding.connect(scriptEnding);
Script.update.connect(update);
  