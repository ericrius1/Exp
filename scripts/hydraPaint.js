//
//  hydraPaint.js
//  examples
//
//  Created by Eric Levin on 5/14/15.
//  Copyright 2014 High Fidelity, Inc.
//
//  This script allows you to paint with the hydra!
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var RIGHT = 1;
var LASER_WIDTH = 3;
var LASER_COLOR = {
  red: 50,
  green: 150,
  blue: 200
};


var FULL_STRENGTH = 0.05;
var DISTANCE_FROM_HAND = 1;
var CLOSE_ENOUGH = 0.001;
var SPRING_RATE = 1.5;
var DAMPING_RATE = 0.8;
var SCREEN_TO_METERS = 0.001;
var DISTANCE_SCALE_FACTOR = 1000


var BRUSH_RADIUS = .1;
var brushColor = {red: 200, green: 20, blue: 140};



function controller(side) {
  this.triggerHeld = false;
  this.triggerThreshold = 0.9;
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;


  this.brush = Entities.addEntity({
    type: 'Box',
    position: {x: 0, y: 0, z:0},
    color: brushColor,
    dimensions: {x: BRUSH_RADIUS, y: BRUSH_RADIUS, z: BRUSH_RADIUS}
  });



  this.update = function(deltaTime) {
    this.updateControllerState();
    this.moveLaser();

    this.oldPalmPosition = this.palmPosition;
    this.oldTipPosition = this.tipPosition;
  }


  this.updateControllerState = function() {
    this.palmPosition = Controller.getSpatialControlPosition(this.palm);
    this.tipPosition = Controller.getSpatialControlPosition(this.tip);
    this.triggerValue = Controller.getTriggerValue(this.trigger);
  }

  this.moveLaser = function() {
    var startPosition = this.palmPosition;
    print("palm position " + JSON.stringify(this.palmPosition));
    var offsetVector = Vec3.multiply(DISTANCE_FROM_HAND, Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition)));
    var endPosition = Vec3.sum(startPosition, offsetVector);

    Entities.editEntity(this.brush, {position: endPosition});

  }

  this.cleanup = function() {
    Entities.deleteEntity(this.brush);
  }
}

function update(deltaTime) {
  rightController.update(deltaTime);
}

function scriptEnding() {
  rightController.cleanup();
}

function vectorIsZero(v) {
  return v.x === 0 && v.y === 0 && v.z === 0;
}

var rightController = new controller(RIGHT);


Script.update.connect(update);
Script.scriptEnding.connect(scriptEnding);