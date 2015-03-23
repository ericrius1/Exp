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
var ball;
balls = [];
var base;
var baseSize = 2;
var baseHeight = center.y;
var topHeight = center.y + 1;
var midHeight = (baseHeight + topHeight)/2;
var ballYScaleFactor = (topHeight - baseHeight)/2; //scale factor for moving ball up and down

for (var i = 0; i < NUM_BALLS; i++) {
  ball = Entities.addEntity(
        { type: "Sphere",
          position: { x: randFloat (center.x-1, center.x +1), 
                y: midHeight, 
                z: randFloat(center.z - 1, center.z + 1)},  
      dimensions: { x: BALL_SIZE, y: BALL_SIZE, z: BALL_SIZE }, 
          color: { red: 120, green: 20, blue: 130},
    });
  ball.originalPosition = Entities.getEntityProperties(ball).position;
  balls.push(ball);
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
  ball = balls[0];
  totalTime += deltaTime;
  properties = Entities.getEntityProperties(ball);
  newPosition = properties.position;
  newDimensions = properties.dimensions
  newPosition.y = ball.originalPosition.y + Math.sin(totalTime) * ballYScaleFactor;
  newDimensions.y = map(newPosition.y, baseHeight, midHeight, BALL_SIZE, BALL_SIZE * 2 );

  newProperties = {
    position: newPosition,
    dimensions: newDimensions
  }
  Entities.editEntity(ball, newProperties);
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

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

Script.scriptEnding.connect(scriptEnding);
Script.update.connect(update);
  