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

var DROP_DISTANCE = 5.0;
var DROP_COLOR = {
  red: 200,
  green: 200,
  blue: 200
};

var FULL_STRENGTH = 0.05;
var LASER_LENGTH_FACTOR = 500;
var CLOSE_ENOUGH = 0.001;
var SPRING_RATE = 1.5;
var DAMPING_RATE = 0.8;
var SCREEN_TO_METERS = 0.001;
var DISTANCE_SCALE_FACTOR = 1000


function getRayIntersection(pickRay) {
  var intersection = Entities.findRayIntersection(pickRay, true);
  return intersection;
}


function controller(side) {
  this.triggerHeld = false;
  this.triggerThreshold = 0.9;
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;

  this.laser = Overlays.addOverlay("line3d", {
    start: {
      x: 0,
      y: 0,
      z: 0
    },
    end: {
      x: 0,
      y: 0,
      z: 0
    },
    color: LASER_COLOR,
    alpha: 1,
    lineWidth: LASER_WIDTH,
    anchor: "MyAvatar"
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
    var inverseRotation = Quat.inverse(MyAvatar.orientation);
    var startPosition = Vec3.multiplyQbyV(inverseRotation, Vec3.subtract(this.palmPosition, MyAvatar.position));
    var direction = Vec3.multiplyQbyV(inverseRotation, Vec3.subtract(this.tipPosition, this.palmPosition));
    direction = Vec3.multiply(direction, LASER_LENGTH_FACTOR / (Vec3.length(direction) * MyAvatar.scale));
    var endPosition = Vec3.sum(startPosition, direction);

    Overlays.editOverlay(this.laser, {
      start: startPosition,
      end: endPosition
    });

  }

  this.cleanup = function() {
    Overlays.deleteOverlay(this.laser);
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