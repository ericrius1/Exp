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

var BALL_SIZE = 0.07;
var WALL_THICKNESS = 0.10;
var SCALE = 1.0; 

var GRAVITY = -1.0;
var LIFETIME = 600;
var DAMPING = 0.50;

var TWO_PI = 2.0 * Math.PI;

var center = Vec3.sum(MyAvatar.position, Vec3.multiply(SCALE * 3.0, Quat.getFront(Camera.getOrientation())));



var NUM_BALLS = 3; 

balls = [];

for (var i = 0; i < NUM_BALLS; i++) {
  balls.push(Entities.addEntity(
        { type: "Sphere",
          position: { x: center.x + (Math.random() - 0.5) * (SCALE - BALL_SIZE - WALL_THICKNESS), 
                y: center.y + (Math.random() - 0.5) * (SCALE - BALL_SIZE - WALL_THICKNESS) , 
                z: center.z + (Math.random() - 0.5) * (SCALE - BALL_SIZE - WALL_THICKNESS) },  
      dimensions: { x: BALL_SIZE, y: BALL_SIZE, z: BALL_SIZE }, 
          color: { red: Math.random() * 255, green: Math.random() * 255, blue: Math.random() * 255 },
        })); 
}

function update(deltaTime) { 

  var newPosition = Entities.getEntityProperties(balls[0]).position;
  newPosition.y+= 0.01;
  var newProperties = {
    position: newPosition
  }
  Entities.editEntity(balls[0], newProperties);
}
 

function scriptEnding() {

  for (var i = 0; i < NUM_BALLS; i++) {
    Entities.deleteEntity(balls[i]);
  }
}

Script.scriptEnding.connect(scriptEnding);
Script.update.connect(update);
  