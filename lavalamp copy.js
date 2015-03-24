//
//  lavalamp.js
//  examples
//
//  Created by Eric Levin on March 23, 2015wwwwwww
//  Copyright 2015 High Fidelity, Inc.
//
//  Creates some spheres with lights attached, that move and stretch slowly 
//  with lights attached, simulating a lava lamp
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3.0, Quat.getFront(Camera.getOrientation())));

var totalTime = 0;
var NUM_BALLS = 1; 
var properties, newPosition, newDimensions, newProperties;
var relativeBallY;
var ball, light;
balls = [];
var SCALE = 1;
var bottomHeight = center.y - (0.04 * SCALE);
var topHeight = center.y + (.16 * SCALE);
var lampRadius = 0.033
var BALL_SIZE = 0.01 * SCALE;
var lampDimensions = {x : 0.17 * SCALE, y: 0.4 * SCALE, z: 0.17 * SCALE};
var lavaColor = {red: 120, green: 20, blue: 130};


var lamp = Entities.addEntity({
  type: "Model",
  modelURL: "https://hifi-public.s3.amazonaws.com/ryan/lava2.fbx",
  position: {x: center.x, y: center.y, z: center.z},
  dimensions: lampDimensions
});

// var dimensions = {x: lampRadius * 2, y: .01, z: lampRadius * 2}
// var baseGlob = Entities.addEntity({
//   type: 'Sphere',
//   position: {x: center.x, y: bottomHeight, z: center.z},
//   dimensions: dimensions,
//   color: lavaColor
// });
// baseGlob.dimensions = dimensions;
for (var i = 0; i < NUM_BALLS; i++) {
  ball = Entities.addEntity(
        { type: "Sphere",
          position: { x: center.x + lampRadius - BALL_SIZE/2, 
                y: bottomHeight, 
                z: center.z},  
          dimensions: { x: BALL_SIZE, y: BALL_SIZE, z: BALL_SIZE }, 
          color: lavaColor,
    });
  ball.velocity = {x: 0, y: .01, z: 0};


  ball.light = Entities.addEntity({
    type : "Light",
    position: Entities.getEntityProperties(ball).position,
    dimensions: {x: 2, y: 2, z: 2},
    isSpotlight: false,
    color: {red: 120, green: 20, blue: 130},
    intensity: 5,
    quadraticAttenuation: 1
  });
  ball.originalPosition = Entities.getEntityProperties(ball).position;
  balls.push(ball);
}



function update(deltaTime) { 
  ball = balls[0];
  totalTime += deltaTime;
  position = Entities.getEntityProperties(ball).position;
  // position.y += 0.0001;
  Entities.editEntity(ball, {position: position});

  // baseGlob.dimensions.y+= 0.0001;

  Entities.editEntity(baseGlob, {dimensions: baseGlob.dimensions});


}
 

function scriptEnding() {
  Entities.deleteEntity(lamp);
  Entities.deleteEntity(baseGlob);
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
  