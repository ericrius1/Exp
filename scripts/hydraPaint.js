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


var DISTANCE_FROM_HAND = 1;


var BRUSH_RADIUS = .1;
var brushColor = {
  red: 200,
  green: 20,
  blue: 140
};

var minLineWidth = .02;
var maxLineWidth = .04;
var currentLineWidth = minLineWidth;
var MIN_PAINT_TRIGGER_THRESHOLD = .1;
var MAX_POINTS_PER_LINE = 80;



function controller(side) {
  this.triggerHeld = false;
  this.triggerThreshold = 0.9;
  this.side = side;
  this.palm = 2 * side;
  this.tip = 2 * side + 1;
  this.trigger = side;
  this.lines = [];
  this.isPainting = false;


  this.brush = Entities.addEntity({
    type: 'Sphere',
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    color: brushColor,
    dimensions: {
      x: BRUSH_RADIUS,
      y: BRUSH_RADIUS,
      z: BRUSH_RADIUS
    }
  });


  this.newLine = function(point) {
    this.line = Entities.addEntity({
      position: MyAvatar.position,
      type: "Line",
      color: {
        red: randInt(0, 200),
        green: randInt(0, 200),
        blue: randInt(0, 200)
      },
      dimensions: {
        x: 10,
        y: 10,
        z: 10
      },
      lineWidth: 5
    });
    this.points = [];
    if (point) {
      this.points.push(point);
    }
    this.lines.push(this.line);
  }

  this.update = function(deltaTime) {
    this.updateControllerState();
    if (this.triggerValue > MIN_PAINT_TRIGGER_THRESHOLD) {
      if(!this.isPainting){
        this.isPainting = true;
        this.newLine();
      }
      this.paint();
    } else {
      this.isPainting = false;
    }

    this.oldPalmPosition = this.palmPosition;
    this.oldTipPosition = this.tipPosition;
  }


  this.updateControllerState = function() {
    this.palmPosition = Controller.getSpatialControlPosition(this.palm);
    this.tipPosition = Controller.getSpatialControlPosition(this.tip);
    this.triggerValue = Controller.getTriggerValue(this.trigger);
  }

  this.paint = function() {
    var startPosition = this.palmPosition;
    var offsetVector = Vec3.multiply(DISTANCE_FROM_HAND, Vec3.normalize(Vec3.subtract(this.tipPosition, this.palmPosition)));
    var endPosition = Vec3.sum(startPosition, offsetVector);
    currentLineWidth = map(this.triggerValue, 0, 1, minLineWidth, maxLineWidth);
    this.points.push(endPosition);
    print("points " + this.points.length);
    Entities.editEntity(this.line, {
      linePoints: this.points
    });
    if(this.points.length > MAX_POINTS_PER_LINE){
      this.newLine(endPosition);
    }
    Entities.editEntity(this.brush, {
      position: endPosition,
      dimensions: {
        x: currentLineWidth,
        y: currentLineWidth,
        z: currentLineWidth
      }
    });

  }

  this.cleanup = function() {
    Entities.deleteEntity(this.brush);
    this.lines.forEach(function(line) {
      Entities.deleteEntity(line);
    });
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

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

function randFloat(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}


function randInt(low, high) {
  return Math.floor(randFloat(low, high));
}